import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI || "";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("connected to MongoDB");

    const db = client.db("all");
} catch (e) {
    console.error("MongoDB connection error:", e);
}

let db = client.db("all");

export default db;