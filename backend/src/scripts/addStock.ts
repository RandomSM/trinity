import { connectDB } from "../lib/mongodb";

/**
 * Script pour ajouter un stock aléatoire aux produits
 * Génère une quantité en stock entre 0 et 100
 * Exécuter avec: npx ts-node src/scripts/addStock.ts
 */
async function addStock() {
  try {
    const db = await connectDB("eshop");
    const collection = db.collection("products");

    console.log("Récupération des produits...");

    // Récupère tous les produits
    const products = await collection.find({}).toArray();

    console.log(`${products.length} produits trouvés`);

    if (products.length === 0) {
      console.log("Aucun produit dans la base de données !");
      process.exit(0);
    }

    let updated = 0;

    // Traitement par lots de 1000 pour optimiser
    const batchSize = 1000;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const bulkOps = batch.map((product) => {
        const stock = Math.floor(Math.random() * 101); // 0 à 100
        
        return {
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { stock: stock } }
          }
        };
      });

      await collection.bulkWrite(bulkOps);
      updated += batch.length;
      
      console.log(`Progression: ${updated}/${products.length} produits mis à jour`);
    }

    console.log("\n=== Résumé ===");
    console.log(`Produits mis à jour avec stock: ${updated}`);
    console.log("Stock généré: entre 0 et 100 unités par produit");

    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'ajout du stock:", error);
    process.exit(1);
  }
}

addStock();
