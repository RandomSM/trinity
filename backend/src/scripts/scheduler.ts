import { connectDB } from "../lib/mongodb";
import { spawn } from "child_process";
import path from "path";
import logger from "../lib/logger";

async function runScript(scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info(`Exécution planifiée de ${scriptName}`);
    const scriptPath = path.join(__dirname, scriptName);
    const process = spawn("npx", ["ts-node", scriptPath], {
      stdio: "inherit",
      shell: true,
    });

    process.on("close", (code) => {
      if (code === 0) {
        logger.info(`${scriptName} terminé avec succès`);
        resolve();
      } else {
        logger.error(`${scriptName} a échoué (code: ${code})`);
        reject(new Error(`Script ${scriptName} failed`));
      }
    });
  });
}

async function checkAndRunStockUpdate() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  if (dayOfWeek === 1) {
    const db = await connectDB("eshop");
    const metaCollection = db.collection("meta");
    
    const lastRun = await metaCollection.findOne({ task: "stockUpdate" });
    const today = new Date().toDateString();
    
    if (!lastRun || lastRun.lastRun !== today) {
      logger.info("📦 Mise à jour hebdomadaire du stock (lundi)");
      await runScript("addStock.ts");
      
      await metaCollection.updateOne(
        { task: "stockUpdate" },
        { $set: { lastRun: today, lastExecuted: new Date() } },
        { upsert: true }
      );
    }
  }
}

async function checkAndRunPriceUpdate() {
  const db = await connectDB("eshop");
  const metaCollection = db.collection("meta");
  
  const lastRun = await metaCollection.findOne({ task: "priceUpdate" });
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  if (!lastRun || new Date(lastRun.lastExecuted) < oneMonthAgo) {
    logger.info("💰 Mise à jour mensuelle des prix");
    await runScript("fetchPrices.ts");
    
    await metaCollection.updateOne(
      { task: "priceUpdate" },
      { $set: { lastRun: now.toDateString(), lastExecuted: now } },
      { upsert: true }
    );
  }
}

async function runScheduler() {
  logger.info("=== Démarrage du scheduler ===");
  
  setInterval(async () => {
    try {
      await checkAndRunStockUpdate();
      await checkAndRunPriceUpdate();
    } catch (error) {
      logger.error("Erreur dans le scheduler:", error);
    }
  }, 60 * 60 * 1000);
  
  logger.info("Scheduler actif - Vérification toutes les heures");
  
  try {
    await checkAndRunStockUpdate();
    await checkAndRunPriceUpdate();
  } catch (error) {
    logger.error("Erreur lors de la vérification initiale:", error);
  }
}

runScheduler();
