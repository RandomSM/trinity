import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { ObjectId } from "mongodb";
import logger from "../lib/logger";

const routeProducts = Router();

routeProducts.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeTotal = req.query.includeTotal === "true" || page === 1;
    const db = await connectDB("eshop");
    
    const projection = {
      _id: 1,
      product_name: 1,
      brands: 1,
      quantity: 1,
      nutriscore_grade: 1,
      price: 1,
      image_front_url: 1,
      image_url: 1,
      categories_tags: 1,
      categories: 1,
      stock: 1,
    };

    const products = await db
      .collection("products")
      .find({}, { projection })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = includeTotal
      ? await db.collection("products").estimatedDocumentCount()
      : 0;

    res.json({
      products,
      total,
      page,
      limit,
      hasMore: products.length === limit,
    });
  } catch (err) {
    logger.error("GET /products error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

routeProducts.post("/", async (req, res) => {
  try {
    const body = req.body;

    const db = await connectDB();
    const result = await db.collection("products").insertOne(body);

    res.status(201).json(result);
  } catch (err) {
    logger.error("POST /products error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

routeProducts.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    logger.info("GET /products/detail/:id");
    logger.info("ID recu:", id);
    
    const db = await connectDB("eshop");
    const collection = db.collection("products");
    
    const products = await collection.find({ _id: id as any }).limit(1).toArray();
    const product = products[0] ?? null;

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(product);
  } catch (err) {
    logger.error("GET /products/detail/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

routeProducts.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {...updateData } = req.body;

    const db = await connectDB();
    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    res.json(result);
  } catch (err) {
    logger.error("PUT /products error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

routeProducts.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const db = await connectDB();
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) });

    res.json(result);
  } catch (err) {
    logger.error("DELETE /products error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default routeProducts;
