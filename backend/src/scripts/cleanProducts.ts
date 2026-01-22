import { connectDB } from "../lib/mongodb";

async function cleanProducts() {
  try {
    const db = await connectDB("eshop");
    const collection = db.collection("products");

    console.log("Vérification des produits avec nutriscore invalide...");

    const count = await collection.countDocuments({
      $and: [
        { nutriscore_grade: { $exists: true } },
        { nutriscore_grade: { $ne: null } },
        { nutriscore_grade: { $ne: "" } },
        { nutriscore_grade: { $nin: ["a", "b", "c", "d", "e", "A", "B", "C", "D", "E"] } }
      ]
    });

    console.log(`${count} produits avec nutriscore invalide trouvés`);

    if (count === 0) {
      console.log("Aucun produit à supprimer !");
      process.exit(0);
    }

    const result = await collection.deleteMany({
      $and: [
        { nutriscore_grade: { $exists: true } },
        { nutriscore_grade: { $ne: null } },
        { nutriscore_grade: { $ne: "" } },
        { nutriscore_grade: { $nin: ["a", "b", "c", "d", "e", "A", "B", "C", "D", "E"] } }
      ]
    });

    console.log(`Supprimé ${result.deletedCount} produits avec nutriscore invalide`);
    
    const remaining = await collection.countDocuments();
    console.log(`Produits restants : ${remaining}`);
  } catch (err) {
    console.error("Erreur lors du nettoyage des produits:", err);
  } finally {
    process.exit();
  }
}

await cleanProducts();
