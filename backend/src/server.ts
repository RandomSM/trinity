import { connectDB } from './lib/mongodb';
import dotenv from 'dotenv';
import app from './app';

dotenv.config({path:".env.development"});

const PORT = process.env.PORT || 4000;

// Start server first, then connect to DB
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Connect to MongoDB asynchronously
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));
