import fs from "node:fs";
import https from "node:https";
import { connectDB } from "../lib/mongodb";

async function downloadDump(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        if (response.headers.location) {
          downloadDump(response.headers.location, destination).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Échec du téléchargement: ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalSize > 0) {
          const percent = ((downloaded / totalSize) * 100).toFixed(2);
          process.stdout.write(`\rTéléchargement: ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)} MB)`);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\n✓ Téléchargement terminé');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

async function importDump() {
  try {
    console.log("Démarrage de l'import...");

    const db = await connectDB("eshop");
    const collection = db.collection("products");

    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`Base de données déjà remplie (${existingCount} produits). Import annulé.`);
      process.exit(0);
    }

    const dumpUrl = "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv";
    const filePath = "./openfoodfacts-dump.csv";
    
    console.log("Téléchargement du dump OpenFoodFacts...");
    console.log(`URL: ${dumpUrl}`);
    
    if (!fs.existsSync(filePath)) {
      await downloadDump(dumpUrl, filePath);
    } else {
      console.log("✓ Fichier dump déjà présent");
    }

    console.log(`Lecture du fichier: ${filePath}`);
    const rawData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(rawData);

    if (!Array.isArray(products) || products.length === 0) {
      console.error("Le fichier ne contient pas de produits valides");
      process.exit(1);
    }

    console.log(`${products.length} produits trouvés dans le fichier`);

    const formatted = products
      .filter((p: any) => p.code && p.product_name)
      .map((p: any) => ({
        _id: p.code || p._id,
        code: p.code,
        product_name: p.product_name,
        brands: p.brands || "",
        quantity: p.quantity || "",
        image_front_url: p.image_front_url || "",
        nutriscore_grade: p.nutriscore_grade || "",
        price: p.price || Math.random() * 20 + 1,
        last_modified_t: p.last_modified_t,
      }));

    console.log(`${formatted.length} produits valides à importer`);

    if (formatted.length === 0) {
      console.error("Aucun produit valide à importer");
      process.exit(1);
    }

    const batchSize = 1000;
    let imported = 0;

    for (let i = 0; i < formatted.length; i += batchSize) {
      const batch = formatted.slice(i, i + batchSize);
      await collection.insertMany(batch, { ordered: false });
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

(async () => {
  await importDump();
})();
