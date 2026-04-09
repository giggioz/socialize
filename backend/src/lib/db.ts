import { Db, MongoClient } from "mongodb";

export async function createDb(mongoUri: string): Promise<Db> {
  const client = new MongoClient(mongoUri);
  await client.connect();
  return client.db();
}

