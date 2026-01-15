import { connectDB } from './lib/mongodb';
import dotenv from 'dotenv';
import app from './app';
import logger from './lib/logger';

dotenv.config({path:".env.development"});

const PORT = process.env.PORT || 4000;

// Start server first, then connect to DB
app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
});

// Connect to MongoDB asynchronously
connectDB()
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));
