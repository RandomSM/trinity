import { connectDB } from './lib/mongodb';
import dotenv from 'dotenv';
import app from './app';
import logger from './lib/logger';
import { spawn } from 'child_process';
import path from 'path';

dotenv.config({path:".env.development"});

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDB();
    logger.info('MongoDB connected');
    
    logger.info('Vérification de l\'initialisation de la base de données...');
    
    const isProduction = process.env.NODE_ENV === 'production';
    const scriptPath = isProduction 
      ? path.join(__dirname, 'scripts', 'initDatabase.js')
      : path.join(__dirname, 'scripts', 'initDatabase.ts');
    
    const command = isProduction ? 'node' : 'npx';
    const args = isProduction ? [scriptPath] : ['ts-node', scriptPath];
    
    const initScript = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    initScript.on('close', (code) => {
      if (code === 0) {
        logger.info('Base de données initialisée avec succès');
        
        logger.info('Démarrage du scheduler...');
        const schedulerPath = isProduction
          ? path.join(__dirname, 'scripts', 'scheduler.js')
          : path.join(__dirname, 'scripts', 'scheduler.ts');
        const schedulerArgs = isProduction ? [schedulerPath] : ['ts-node', schedulerPath];
        
        spawn(command, schedulerArgs, {
          detached: true,
          stdio: 'ignore',
          shell: true
        }).unref();
        
        logger.info('Scheduler démarré en arrière-plan');
      } else {
        logger.warn('Initialisation de la base terminée avec des avertissements');
      }
    });

    app.listen(PORT, () => {
      logger.info(`Backend running on port ${PORT}`);
    });
  } catch (err: any) {
    logger.error(`Erreur de démarrage: ${err.message}`);
    process.exit(1);
  }
}

startServer();
