import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { ObjectId } from "mongodb";
import { authenticateToken, requireOwnerOrAdmin, AuthRequest } from "../middleware/auth";
import logger from "../lib/logger";

const invoiceRoutes = Router();

invoiceRoutes.post("/:id", authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { items, shipping } = req.body;

    if (!id) return res.status(400).json({ error: "userId requis dans l'URL" });
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items requis" });

    const db = await connectDB();

    const newInvoice = {
        userId: new ObjectId(id),
        items: items.map((item: any) => ({
            productId: new ObjectId(item.productId),
            barcode: item.barcode || item.productId, // Store barcode for image display
            name: item.name,
            quantity: item.quantity,
            price: item.price || 0,
        })),
        shipping: shipping || null, // ⚡ stocke l’adresse de PayPal
        status: "payée",
        deliveryStatus: "en préparation",
        paypalCaptureId: req.body.paypalCaptureId || null,
        createdAt: new Date(),
    };


    const result = await db.collection("invoices").insertOne(newInvoice);

    res.status(201).json({ message: "Facture créée", invoiceId: result.insertedId });
  } catch (err) {
    logger.error("POST /invoice/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

invoiceRoutes.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = await connectDB();
    const invoices = await db.collection("invoices").find().toArray();
    res.json(invoices);
  } catch (err) {
    logger.error("GET /invoice error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

invoiceRoutes.get("/user/:id", authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    
    const db = await connectDB();

    const invoices = await db
      .collection("invoices")
      .find({ 
        $or: [
          { userId: new ObjectId(id) },
          { userId: id } // userId stocké comme string
        ]
      })
      .toArray();

    res.json(invoices);
  } catch (err) {
    logger.error("GET /invoice/user/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

invoiceRoutes.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const invoice = await db
      .collection("invoices")
      .findOne({ _id: new ObjectId(id) });

    if (!invoice) return res.status(404).json({ error: "Facture non trouvée" });

    res.json(invoice);
  } catch (err) {
    logger.error("GET /invoice/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

invoiceRoutes.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, items, deliveryStatus } = req.body;

    const db = await connectDB();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (items) updateData.items = items;
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    const result = await db
      .collection("invoices")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Facture non trouvée" });

    res.json({ message: "Facture mise à jour avec succès" });
  } catch (err) {
    logger.error("PUT /invoice/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

invoiceRoutes.post("/:id/refund", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { itemsToRefund } = req.body; // Array of {index: number, quantity: number}
    const db = await connectDB("eshop");

    // Récupère la facture
    const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(id) });

    if (!invoice) {
      return res.status(404).json({ error: "Facture non trouvée" });
    }


    if (invoice.deliveryStatus !== "en préparation") {
      return res.status(400).json({ 
        error: "Le remboursement n'est possible que pour les commandes en préparation" 
      });
    }


    if (!invoice.paypalCaptureId) {
      return res.status(400).json({ error: "Aucun ID de capture PayPal trouvé" });
    }

    const productIds = invoice.items.map((item: any) => String(item.productId));
    const products = await db.collection("products").find({
      _id: { $in: productIds }
    }).toArray();

    const priceMap = new Map();
    products.forEach((product: any) => {
      priceMap.set(String(product._id), product.price || 0);
    });

    let refundAmount = 0;
    let isFullRefund = false;

    if (itemsToRefund && Array.isArray(itemsToRefund) && itemsToRefund.length > 0) {
      itemsToRefund.forEach((refundItem: { index: number, quantity: number }) => {
        const item = invoice.items[refundItem.index];
        if (item) {
          const productId = String(item.productId);
          const price = priceMap.get(productId) || 0;
          const qtyToRefund = Math.min(refundItem.quantity, item.quantity);
          refundAmount += price * qtyToRefund;
        }
      });
      
      isFullRefund = invoice.items.every((item: any, idx: number) => {
        const refundItem = itemsToRefund.find((r: any) => r.index === idx);
        return refundItem && refundItem.quantity === item.quantity;
      }) && itemsToRefund.length === invoice.items.length;
    } else {
      invoice.items.forEach((item: any) => {
        const productId = String(item.productId);
        const price = priceMap.get(productId) || 0;
        refundAmount += price * item.quantity;
      });
      isFullRefund = true;
    }

    refundAmount = parseFloat(refundAmount.toFixed(2));

    if (refundAmount <= 0) {
      return res.status(400).json({ error: "Montant du remboursement invalide" });
    }

    const paypalAuth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const refundResponse = await fetch(
      `https://api-m.sandbox.paypal.com/v2/payments/captures/${invoice.paypalCaptureId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${paypalAuth}`,
        },
        body: JSON.stringify({
          amount: {
            value: refundAmount.toString(),
            currency_code: "EUR"
          }
        }),
      }
    );

    if (!refundResponse.ok) {
      const errorData = await refundResponse.json();
      logger.error("PayPal refund error:", JSON.stringify(errorData, null, 2));
      return res.status(400).json({ error: "Erreur lors du remboursement PayPal", details: errorData });
    }

    const refundData = await refundResponse.json();
    logger.info(`PayPal refund successful! Refund ID: ${refundData.id}`);
    logger.info(`Check the BUYER's PayPal Sandbox account to see the refund`);
    logger.info(`Full refund response:`, JSON.stringify(refundData, null, 2));

    const updateData: any = {
      refundId: refundData.id,
      refundedAt: new Date(),
      refundAmount: refundAmount
    };

    if (isFullRefund) {
      updateData.status = "remboursée";
      updateData.deliveryStatus = "annulée";
    } else {
      updateData.status = "partiellement remboursée";
      updateData.refundedItems = itemsToRefund;
      
      const updatedItems = invoice.items.map((item: any, idx: number) => {
        const refundItem = itemsToRefund.find((r: any) => r.index === idx);
        if (refundItem) {
          const newQuantity = item.quantity - refundItem.quantity;
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      });
      updateData.items = updatedItems;
    }

    await db.collection("invoices").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json({ 
      message: isFullRefund ? "Remboursement complet effectué" : "Remboursement partiel effectué", 
      refund: refundData,
      refundAmount 
    });
  } catch (err) {
    logger.error("POST /invoice/:id/refund error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

invoiceRoutes.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const result = await db
      .collection("invoices")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Facture non trouvée" });

    res.json({ message: "Facture supprimée avec succès" });
  } catch (err) {
    logger.error("DELETE /invoice/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default invoiceRoutes;
