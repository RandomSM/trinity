import { Router } from "express";
import { paypalClient } from "../lib/paypalClient";
import paypal from "@paypal/checkout-server-sdk";
import { connectDB } from "../lib/mongodb";
import { ObjectId } from "mongodb";
import logger from "../lib/logger";

const routerPaypal = Router();

routerPaypal.post("/create-order", async (req, res) => {
  const { total, returnUrl, cancelUrl } = req.body;

  logger.info("PayPal create-order");
  logger.info("Total recu:", total, "Type:", typeof total);
  logger.info("Return URL:", returnUrl);
  logger.info("Cancel URL:", cancelUrl);

  if (!total || isNaN(total) || total <= 0) {
    return res.status(400).json({ error: "Total invalide ou manquant" });
  }

  const backendBaseUrl = "https://presystolic-uninterruptedly-wren.ngrok-free.dev/api/paypal";
  const finalReturnUrl = returnUrl 
    ? `${backendBaseUrl}/success?returnUrl=${encodeURIComponent(returnUrl)}`
    : `${backendBaseUrl}/success`;
  const finalCancelUrl = cancelUrl 
    ? `${backendBaseUrl}/cancel?cancelUrl=${encodeURIComponent(cancelUrl)}`
    : `${backendBaseUrl}/cancel`;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: parseFloat(total).toFixed(2),
        },
      },
    ],
    application_context: {
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: finalReturnUrl,
      cancel_url: finalCancelUrl,
    },
  });

  try {
    const order = await paypalClient.execute(request);
    logger.info("Commande PayPal creee:", order.result.id);
    res.json(order.result);
  } catch (err: any) {
    logger.error("Erreur PayPal create-order:", err.message || err);
    res.status(500).json({ error: "Erreur création commande PayPal", details: err.message });
  }
});


routerPaypal.post("/capture-order", async (req, res) => {
  const { orderId, userId, items } = req.body;

  if (!orderId || !userId || !items)
    return res.status(400).json({ error: "orderId, userId et items requis" });

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({} as any);

  try {
    const capture = await paypalClient.execute(request);
    const shipping = capture.result.purchase_units?.[0]?.shipping;
    const captureId = capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    const db = await connectDB("eshop");

    const productIds = items.map((item: any) => String(item.productId));
    const products = await db.collection("products").find({
      _id: { $in: productIds }
    }).toArray();

    const priceMap = new Map();
    products.forEach((product: any) => {
      priceMap.set(String(product._id), product.price || 0);
    });

    const invoiceItems = items.map((item: any) => {
      const productId = String(item.productId);
      const price = priceMap.get(productId) || 0;
      return {
        productId,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(price.toFixed(2)),
      };
    });

    const total = invoiceItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );

    const newInvoice = {
      userId: String(userId),
      items: invoiceItems,
      total: parseFloat(total.toFixed(2)),
      shipping: shipping || null,
      status: "payée",
      deliveryStatus: "en préparation",
      paypalCaptureId: captureId || null,
      createdAt: new Date(),
    };

    const result = await db.collection("invoices").insertOne(newInvoice);

    const stockUpdatePromises = invoiceItems.map((item: any) => {
      return db.collection("products").updateOne(
        { _id: item.productId },
        { 
          $inc: { stock: -item.quantity },
          $set: { lastModified: new Date() }
        }
      );
    });

    await Promise.all(stockUpdatePromises);
    logger.info(`Stock mis a jour pour ${invoiceItems.length} produits`);

    res.json({
      capture: capture.result,
      invoice: result.insertedId,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Erreur capture PayPal ou création facture" });
  }
});

routerPaypal.get("/success", (req, res) => {
  logger.info("PayPal success redirect hit");
  
  const returnUrl = req.query.returnUrl as string || 'trinitymobile://paypal/success';
  logger.info("Return URL:", returnUrl);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Paiement réussi</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #52B46B 0%, #3d8a52 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 20px;
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 1s ease infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        p {
          margin: 10px 0 30px 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          background: white;
          color: #52B46B;
          padding: 18px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .button:active {
          transform: scale(0.95);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✅</div>
        <h1>Paiement réussi !</h1>
        <p>Cliquez sur le bouton pour retourner à l'application</p>
        <a href="${returnUrl}" class="button">
          Retourner à l'app
        </a>
      </div>
      <script>
        window.location.href = '${returnUrl}';
        
        setTimeout(function() {
          window.close();
        }, 100);
      </script>
    </body>
    </html>
  `);
});

routerPaypal.get("/cancel", (req, res) => {
  logger.warn("PayPal cancel redirect hit");
  
  const cancelUrl = req.query.cancelUrl as string || 'trinitymobile://paypal/cancel';
  logger.info("Cancel URL:", cancelUrl);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Paiement annulé</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 20px;
        }
        .icon {
          font-size: 60px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0 0 10px 0;
        }
        p {
          margin: 10px 0;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">❌</div>
        <h1>Paiement annulé</h1>
        <p>Redirection vers l'application...</p>
      </div>
      <script>
        window.location.href = '${cancelUrl}';
        
        setTimeout(function() {
          window.close();
        }, 100);
      </script>
    </body>
    </html>
  `);
});

export default routerPaypal;
