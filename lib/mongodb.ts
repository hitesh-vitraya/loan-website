import { Collection, Db, Document, MongoClient } from "mongodb";

declare global {
  var __loanOptionsMongoClientPromise: Promise<MongoClient> | undefined;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getMongoDbName() {
  return getRequiredEnv("MONGODB_DB");
}

function getMongoUri() {
  return getRequiredEnv("MONGODB_URI");
}

export function getMongoClient() {
  if (!global.__loanOptionsMongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    global.__loanOptionsMongoClientPromise = client.connect();
  }

  return global.__loanOptionsMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getMongoDbName());
}

export async function getMongoCollection<TSchema extends Document = Document>(
  collectionName: string
): Promise<Collection<TSchema>> {
  const db = await getMongoDb();
  return db.collection<TSchema>(collectionName);
}
