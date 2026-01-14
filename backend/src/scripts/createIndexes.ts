import { connectDB } from "../lib/mongodb";

/**
 * Script pour créer des index MongoDB et améliorer les performances
 * Exécuter avec: npx ts-node src/scripts/createIndexes.ts
 */
async function createIndexes() {
  try {
    const db = await connectDB("eshop");
    const collection = db.collection("products");
    
    console.log("Création des index...");

    // Vérifie les index existants
    const existingIndexes = await collection.listIndexes().toArray();
    console.log(`Index existants: ${existingIndexes.length}`);

    // Index pour les recherches textuelles (product_name et brands)
    await collection.createIndex(
      { product_name: "text", brands: "text" },
      { name: "text_search_index" }
    );
    console.log("Index de recherche textuelle créé");
    
    // Index pour filtrer/trier par prix
    await collection.createIndex(
      { price: 1 },
      { name: "price_index" }
    );
    console.log("Index sur le prix créé");

    // Index pour filtrer par nutriscore
    await collection.createIndex(
      { nutriscore_grade: 1 },
      { name: "nutriscore_index" }
    );
    console.log("Index sur le nutriscore créé");

    // Index composé pour pagination optimisée
    await collection.createIndex(
      { _id: 1, price: 1 },
      { name: "pagination_index" }
    );
    console.log("Index de pagination créé");

    // Affiche tous les index
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
