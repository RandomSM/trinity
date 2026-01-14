import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config({path:".env.development"});

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (!dbName) {
  throw new Error("Please add your MongoDB DB name to .env");
}

let client: MongoClient;
let db: Db;

// Hot reload pour le dev (utile si on utilise nodemon)
declare global {
  var _mongoClient: MongoClient | undefined;
  var _db: Db | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    client = new MongoClient(uri);
    global._mongoClient = client;
    global._db = client.db(dbName);
  }
  client = global._mongoClient;
  db = global._db!;
} else {
  client = new MongoClient(uri);
  db = client.db(dbName);
}

export const connectDB = async (dbName?: string): Promise<Db> => {
  await client.connect();
  return client.db(dbName || process.env.MONGODB_DB!);
};

export default client;
