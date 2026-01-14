import { MongoClient, Db } from "mongodb";
declare let client: MongoClient;
declare global {
    var _mongoClient: MongoClient | undefined;
    var _db: Db | undefined;
}
export declare const connectDB: (dbName?: string) => Promise<Db>;
export default client;
//# sourceMappingURL=mongodb.d.ts.map