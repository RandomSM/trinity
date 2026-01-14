import { connectDB } from "../lib/mongodb";

/**
 * Script pour récupérer les prix depuis l'API prices.openfoodfacts.org
 * Ne récupère que les prix en euros (EUR)
 * Exécuter avec: npx ts-node src/scripts/fetchPrices.ts
 */

interface PriceData {
  id: number;
  product_id: number;
  price: number;
  currency: string;
  date: string;
  location_osm_id?: number;
  location_osm_type?: string;
}

interface PriceTagData {
  id: number;
  price_id: number;
  predictions: Array<{
    data: {
      price: number;
      unit?: string;
      barcode?: string;
    };
  }>;
}

interface ProductData {
  id: number;
  code: string;
  price_count?: number;
}

async function convertCurrency(amount: number, fromCurrency: string): Promise<number | null> {
  try {
    if (fromCurrency === 'EUR') {
      return amount;
    }

    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.rates && data.rates.EUR) {
      return amount * data.rates.EUR;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function fetchPriceForProduct(barcode: string): Promise<number | null> {
  try {
    console.log(`    Code utilisé: ${barcode}`);
    
    // Interroger directement l'API prices avec le code produit (toutes devises)
    const url = `https://prices.openfoodfacts.org/api/v1/prices?product_code=${barcode}`;
    console.log(`    URL: ${url}`);
    
    const pricesResponse = await fetch(url);
    
    console.log(`    Status HTTP: ${pricesResponse.status}`);

    if (!pricesResponse.ok) {
      return null;
    }

    const pricesData = await pricesResponse.json();
    console.log(`    Données reçues:`, JSON.stringify(pricesData, null, 2));
    
    // L'API retourne un objet avec items
    if (pricesData.items && pricesData.items.length > 0) {
      const priceData: PriceData = pricesData.items[0];
      console.log(`    Prix trouvé: ${priceData.price} ${priceData.currency}`);
      
      // Si le prix est déjà en EUR, le retourner directement
      if (priceData.currency === 'EUR') {
        return priceData.price;
      }
      
      // Sinon, convertir vers EUR
      console.log(`    Conversion de ${priceData.price} ${priceData.currency} vers EUR...`);
      const convertedPrice = await convertCurrency(priceData.price, priceData.currency);
      if (convertedPrice !== null) {
        console.log(`    Prix converti: ${convertedPrice.toFixed(2)} EUR`);
      }
      return convertedPrice;
    } else {
      console.log(`    Aucun prix dans items`);
    }

    return null;
  } catch (error) {
    console.error(`    Erreur:`, error);
    return null;
  }
}

async function fetchPrices() {
  try {
    const db = await connectDB("eshop");
    const collection = db.collection("products");

    // Test avec un produit spécifique
    console.log("=== TEST DE RÉCUPÉRATION DE PRIX ===");
    console.log("Test avec le produit: 0016000122222\n");
    
    const testPrice = await fetchPriceForProduct("0016000122222");
    
    if (testPrice !== null && testPrice > 0) {
      console.log(`\n✓ Test réussi: Prix récupéré et converti: ${testPrice.toFixed(2)} EUR`);
      console.log("Le script fonctionne correctement!\n");
    } else {
      console.log("\n✗ Test échoué: Aucun prix trouvé pour ce produit");
      console.log("Le script va quand même continuer avec les autres produits...\n");
    }
    
    console.log("=== FIN DU TEST ===\n");
    console.log("Appuyez sur Ctrl+C pour arrêter ou attendez 3 secondes pour continuer...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("\nRécupération des produits sans prix...");

    // Récupère les produits qui n'ont pas de prix ou prix = 0
    const products = await collection
      .find({
        $or: [
          { price: { $exists: false } },
          { price: 0 },
          { price: null }
        ],
        code: { $exists: true, $nin: [null, ""] }
      } as any)
      .limit(1000) // Limite à 1000 produits
      .toArray();

    console.log(`${products.length} produits trouvés sans prix`);

    if (products.length === 0) {
      console.log("Tous les produits ont déjà un prix !");
      process.exit(0);
    }

    let updated = 0;
    let deleted = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product) continue;
      
      const barcode = product.code || product._id;

      if (!barcode) {
        console.log(`[${i + 1}/${products.length}] Produit sans code, ignoré`);
        continue;
      }

      console.log(`[${i + 1}/${products.length}] Recherche du prix pour ${barcode}...`);

      const priceResult = await fetchPriceForProduct(barcode.toString());

      if (priceResult !== null && priceResult > 0) {
        const stock = Math.floor(Math.random() * 101); // Stock aléatoire entre 0 et 100
        await collection.updateOne(
          { _id: product._id },
          { $set: { price: priceResult, stock: stock } }
        );
        console.log(`  Prix trouvé: ${priceResult.toFixed(2)} EUR, Stock: ${stock}`);
        updated++;
      } else {
        await collection.deleteOne({ _id: product._id });
        console.log(`  Prix non trouvé, produit supprimé`);
        deleted++;
      }

      // Pause de 500ms entre chaque requête pour respecter l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("\n=== Résumé ===");
    console.log(`Prix récupérés depuis l'API: ${updated}`);
    console.log(`Produits supprimés (sans prix): ${deleted}`);
    console.log(`Total traité: ${products.length}`);
    
    // Compte final
    const totalWithPrice = await collection.countDocuments({
      price: { $exists: true, $ne: null, $gt: 0 }
    });
    const totalWithoutPrice = await collection.countDocuments({
      $or: [
        { price: { $exists: false } },
        { price: null },
        { price: 0 }
      ]
    });
    console.log(`\nProduits avec prix: ${totalWithPrice}`);
    console.log(`Produits sans prix: ${totalWithoutPrice}`);

    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la récupération des prix:", error);
    process.exit(1);
  }
}

fetchPrices();
