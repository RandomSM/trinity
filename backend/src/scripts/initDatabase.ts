import { connectDB } from "../lib/mongodb";
import { spawn } from "child_process";
import path from "path";

async function runScript(scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Exécution de ${scriptName} ===`);
    const scriptPath = path.join(__dirname, scriptName);
    const process = spawn("npx", ["ts-node", scriptPath], {
      stdio: "inherit",
      shell: true,
    });

    process.on("close", (code) => {
      if (code === 0) {
        console.log(`✓ ${scriptName} terminé avec succès`);
        resolve();
      } else {
        console.error(`✗ ${scriptName} a échoué (code: ${code})`);
        reject(new Error(`Script ${scriptName} failed`));
      }
    });
  });
}

async function initDatabase() {
  try {
    console.log("=== Initialisation de la base de données ===");
    
    const db = await connectDB("eshop");
    const productsCollection = db.collection("products");
    
    const productCount = await productsCollection.countDocuments();
    console.log(`Nombre de produits existants: ${productCount}`);

    if (productCount === 0) {
      console.log("\n📦 Base de données vide, lancement de l'import...");
      await runScript("importDump_jsonl.ts");
      
      console.log("\n🧹 Nettoyage des produits invalides...");
      await runScript("cleanProducts.ts");
      
      console.log("\n🖼️ Vérification des images...");
      await runScript("checkImages.ts");
      
      console.log("\n📊 Création des index...");
      await runScript("createIndexes.ts");
      
      console.log("\n📦 Ajout du stock...");
      await runScript("addStock.ts");
      
      console.log("\n💰 Récupération des prix...");
      await runScript("fetchPrices.ts");
      
      console.log("\n✅ Initialisation complète terminée !");
    } else {
      console.log("✓ Base de données déjà initialisée");
      
      const hasStock = await productsCollection.countDocuments({ stock: { $exists: true, $ne: null } });
      if (hasStock === 0) {
        console.log("\n📦 Ajout du stock manquant...");
        await runScript("addStock.ts");
      }
      
      const hasPrice = await productsCollection.countDocuments({ price: { $exists: true, $gt: 0 } });
      if (hasPrice === 0) {
        console.log("\n💰 Ajout des prix manquants...");
        await runScript("fetchPrices.ts");
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
    process.exit(1);
  }
}

initDatabase();
