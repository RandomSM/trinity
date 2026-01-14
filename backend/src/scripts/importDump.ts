import fs from "fs";
import path from "path";
import { connectDB } from "../lib/mongodb";

/**
 * Script pour importer des produits depuis un fichier JSON (products.json)
 * Exécuter avec: npx ts-node src/scripts/importDump.ts
 */
async function importDump() {
  try {
    console.log("Démarrage de l'import...");

    const db = await connectDB("eshop");
    const collection = db.collection("products");

    // Vérifie si le fichier existe
    // Modifiez ce chemin pour pointer vers votre disque réseau
    const filePath = "\\TRUENAS\Video_telephone\openfoodfacts-products.jsonl"; // Exemple: \\\\NAS\\data\\products.json
    // Ou utilisez le chemin par défaut dans le projet:
    // const filePath = path.join(process.cwd(), "products.json");
    
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier introuvable: ${filePath}`);
      process.exit(1);
    }

    console.log(`Lecture du fichier: ${filePath}`);
    const rawData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(rawData);

    if (!Array.isArray(products) || products.length === 0) {
      console.error("Le fichier ne contient pas de produits valides");
      process.exit(1);
    }

    console.log(`${products.length} produits trouvés dans le fichier`);

    // Transforme les produits avec validation
    const formatted = products
      .filter((p: any) => p.code && p.product_name) // Filtre les produits invalides
      .map((p: any) => ({
        _id: p.code || p._id,
        code: p.code,
        product_name: p.product_name,
        brands: p.brands || "",
        quantity: p.quantity || "",
        image_front_url: p.image_front_url || "",
        nutriscore_grade: p.nutriscore_grade || "",
        price: p.price || Math.random() * 20 + 1, // Prix aléatoire si manquant
        last_modified_t: p.last_modified_t,
      }));

    console.log(`${formatted.length} produits valides à importer`);

    if (formatted.length === 0) {
      console.error("Aucun produit valide à importer");
      process.exit(1);
    }

    // Import par lots de 1000 pour éviter les dépassements de mémoire
    const batchSize = 1000;
    let imported = 0;

    for (let i = 0; i < formatted.length; i += batchSize) {
      const batch = formatted.slice(i, i + batchSize);
      await collection.insertMany(batch, { ordered: false }); // ordered:false continue même si erreurs
      imported += batch.length;
      console.log(`Progression: ${imported}/${formatted.length} produits importés`);
    }

    const totalCount = await collection.countDocuments();
    console.log(`Import terminé: ${imported} produits insérés`);
    console.log(`Total dans la base: ${totalCount} produits`);
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    process.exit(1);
  }
}

importDump();
