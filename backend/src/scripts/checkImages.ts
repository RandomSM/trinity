import { connectDB } from "../lib/mongodb";

/**
 * Script pour vérifier si les images des produits sont accessibles
 * Supprime les produits dont l'image n'est pas disponible
 * Exécuter avec: npx ts-node src/scripts/checkImages.ts
 */

function getOpenFoodFactsImageUrl(barcode: string) {
  if (!barcode || barcode.length < 13) return "";
  const part1 = barcode.slice(0, 3);
  const part2 = barcode.slice(3, 6);
  const part3 = barcode.slice(6, 9);
  const part4 = barcode.slice(9);
  return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
}

async function checkImageUrl(url: string): Promise<boolean> {
  if (!url || url === "") return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout
    
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok; // true si status 200-299
  } catch (error) {
    return false;
  }
}

async function checkImages() {
  try {
    const db = await connectDB("eshop");
    const collection = db.collection("products");

    console.log("Récupération du nombre total de produits...");
    const total = await collection.countDocuments();
    console.log(`${total} produits à vérifier`);

    const batchSize = 100;
    let checked = 0;
    let deleted = 0;

    while (checked < total) {
      const products = await collection
        .find({})
        .skip(checked)
        .limit(batchSize)
        .toArray();

      if (products.length === 0) break;

      for (let i = 0; i < products.length; i += 10) {
        const batch = products.slice(i, i + 10);
        
        const checks = await Promise.all(
          batch.map(async (product) => {
            const barcode = product.code || product._id;
            const imageUrl = getOpenFoodFactsImageUrl(barcode);
            const isAvailable = await checkImageUrl(imageUrl);
            
            return {
              _id: product._id,
              code: product.code,
              name: product.product_name,
              imageUrl,
              isAvailable,
            };
          })
        );

        // Supprime les produits avec images non disponibles
        for (const check of checks) {
          if (!check.isAvailable) {
            await collection.deleteOne({ _id: check._id });
            deleted++;
            console.log(`❌ Supprimé: ${check.name} (${check.code}) - Image: ${check.imageUrl}`);
          }
        }
      }

      checked += products.length;
      console.log(`Progression: ${checked}/${total} produits vérifiés (${deleted} supprimés)`);
    }

    console.log("\n✅ Vérification terminée !");
    console.log(`Total vérifié: ${checked}`);
    console.log(`Total supprimé: ${deleted}`);
    console.log(`Restants: ${checked - deleted}`);

    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
}

checkImages();
