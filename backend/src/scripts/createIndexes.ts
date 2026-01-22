import { connectDB } from "../lib/mongodb";

async function createIndexes() {
  try {
    const db = await connectDB("eshop");
    const collection = db.collection("products");
    
    console.log("Création des index...");

    const existingIndexes = await collection.listIndexes().toArray();
    console.log(`Index existants: ${existingIndexes.length}`);

    await collection.createIndex(
      { product_name: "text", brands: "text" },
      { name: "text_search_index" }
    );
    console.log("Index de recherche textuelle créé");
    
    await collection.createIndex(
      { price: 1 },
      { name: "price_index" }
    );
    console.log("Index sur le prix créé");

    await collection.createIndex(
      { nutriscore_grade: 1 },
      { name: "nutriscore_index" }
    );
    console.log("Index sur le nutriscore créé");

    await collection.createIndex(
      { _id: 1, price: 1 },
      { name: "pagination_index" }
    );
    console.log("Index de pagination créé");

    const finalIndexes = await collection.listIndexes().toArray();
    console.log(`Total des index: ${finalIndexes.length}`);
    finalIndexes.forEach(idx => console.log(`  - ${idx.name}`));

    console.log("Index créés avec succès!");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la création des index:", error);
    process.exit(1);
  }
}

createIndexes();
