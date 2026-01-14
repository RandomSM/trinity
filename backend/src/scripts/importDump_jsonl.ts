import fs from "fs";
import readline from "readline";
import { connectDB } from "../lib/mongodb";

/**
 * Script pour importer des produits depuis un fichier JSONL (une ligne = un produit)
 * Vérifie la disponibilité des images avant l'import
 * Exécuter avec: npx ts-node src/scripts/importDump_jsonl.ts
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
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 secondes timeout
    
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function importDump() {
  try {
    console.log("Démarrage de l'import JSONL...");

    const db = await connectDB("eshop");
    const collection = db.collection("products");

    // Chemin vers le fichier JSONL
    const filePath = "\\\\TRUENAS\\Video_telephone\\openfoodfacts-products.jsonl";
    
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier introuvable: ${filePath}`);
      process.exit(1);
    }

    console.log(`Lecture du fichier JSONL: ${filePath}`);

    // Créer un stream pour lire ligne par ligne
    const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let batch: any[] = [];
    const batchSize = 1000;
    const imageCheckBatchSize = 50; // Vérifie 50 images en parallèle
    let lineCount = 0;
    let imported = 0;
    let skipped = 0;

    for await (const line of rl) {
      lineCount++;
      
      if (!line.trim()) continue; // Ignore les lignes vides
      
      try {
        const product = JSON.parse(line);
        
        // Filtre les produits invalides (tous ces champs sont obligatoires)
        if (!product.code && !product._id) {
          skipped++;
          continue;
        }
        
        if (!product.product_name) {
          skipped++;
          continue;
        }

        if (!product.brands) {
          skipped++;
          continue;
        }

        if (!product.quantity) {
          skipped++;
          continue;
        }

        if (!product.nutriscore_grade) {
          skipped++;
          continue;
        }

        // Formate le produit (sans générer de prix/stock aléatoires)
        const formatted = {
          _id: product.code || product._id,
          code: product.code || product._id,
          product_name: product.product_name,
          brands: product.brands,
          quantity: product.quantity,
          image_front_url: product.image_front_url || product.image_url || "",
          image_url: product.image_url || "",
          nutriscore_grade: product.nutriscore_grade,
          categories_tags: product.categories_tags || [],
          categories: product.categories || "",
          ingredients_text: product.ingredients_text || "",
          allergens: product.allergens || "",
          price: product.price || null,
          stock: product.stock || null,
          last_modified_t: product.last_modified_t,
        };

        batch.push(formatted);

        // Importer par lots après vérification des images
        if (batch.length >= batchSize) {
          // Vérifie les images par lots de 50 en parallèle
          const validProducts: any[] = [];
          
          for (let i = 0; i < batch.length; i += imageCheckBatchSize) {
            const chunk = batch.slice(i, i + imageCheckBatchSize);
            
            const results = await Promise.all(
              chunk.map(async (prod) => {
                const imageUrl = getOpenFoodFactsImageUrl(prod.code);
                const isValid = await checkImageUrl(imageUrl);
                return { product: prod, isValid };
              })
            );
            
            for (const result of results) {
              if (result.isValid) {
                validProducts.push(result.product);
              } else {
                skipped++;
              }
            }
          }
          
          // Importe uniquement les produits avec images valides
          if (validProducts.length > 0) {
            try {
              await collection.insertMany(validProducts, { ordered: false });
              imported += validProducts.length;
              console.log(`Progression: ${imported} produits importés (${skipped} ignorés, ligne ${lineCount})`);
            } catch (err: any) {
              // Ignore les erreurs de doublons
              if (err.code !== 11000) {
                console.error("Erreur lors de l'insertion:", err.message);
              }
              imported += validProducts.length;
            }
          }
          batch = [];
        }
      } catch (err) {
        skipped++;
        // Ignore les lignes JSON invalides
      }
    }

    // Importer le dernier lot
    if (batch.length > 0) {
      const validProducts: any[] = [];
      
      for (let i = 0; i < batch.length; i += imageCheckBatchSize) {
        const chunk = batch.slice(i, i + imageCheckBatchSize);
        
        const results = await Promise.all(
          chunk.map(async (prod) => {
            const imageUrl = getOpenFoodFactsImageUrl(prod.code);
            const isValid = await checkImageUrl(imageUrl);
            return { product: prod, isValid };
          })
        );
        
        for (const result of results) {
          if (result.isValid) {
            validProducts.push(result.product);
          } else {
            skipped++;
          }
        }
      }
      
      if (validProducts.length > 0) {
        try {
          await collection.insertMany(validProducts, { ordered: false });
          imported += validProducts.length;
        } catch (err: any) {
          if (err.code !== 11000) {
            console.error("Erreur lors de l'insertion finale:", err.message);
          }
          imported += validProducts.length;
        }
      }
    }

    const totalCount = await collection.countDocuments();
    console.log(`\nImport terminé!`);
    console.log(`Lignes lues: ${lineCount}`);
    console.log(`Produits importés: ${imported}`);
    console.log(`Produits ignorés: ${skipped}`);
    console.log(`Total dans la base: ${totalCount} produits`);
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    process.exit(1);
  }
}

importDump();
