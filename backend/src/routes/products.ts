import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { ObjectId } from "mongodb";

const routeProducts = Router();

routeProducts.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeTotal = req.query.includeTotal === "true" || page === 1;
    const db = await connectDB("eshop");
    
    // Projection : ne récupère que les champs nécessaires
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

    // Récupère les produits
    const products = await db
      .collection("products")
      .find({}, { projection })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Ne compte le total que pour la première page
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
    console.error("GET /products error:", err);
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
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /detail/:id doit être AVANT PUT et DELETE pour être matché en premier
routeProducts.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("=== GET /products/detail/:id ===");
    console.log("ID reçu:", id);
    
    const db = await connectDB("eshop");
    const collection = db.collection("products");
    
    // Dans Open Food Facts, _id et code sont stockés comme strings
    // Utilise find() au lieu de findOne() pour éviter les problèmes de typage
    const products = await collection.find({ _id: id as any }).limit(1).toArray();
    const product = products[0] || null;

    console.log("Produit trouvé:", product ? "OUI" : "NON");

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET /products/detail/:id error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT et DELETE après GET pour éviter les conflits
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
    console.error("PUT /products error:", err);
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
    console.error("DELETE /products error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default routeProducts;
