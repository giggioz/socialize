import env from "@fastify/env";
import Fastify from "fastify";
import argon2 from "argon2";
import { z } from "zod";
import { createDb } from "../lib/db.js";
import { collections } from "../lib/collections.js";

const app = Fastify({ logger: true });

await app.register(env, {
  dotenv: true,
  schema: {
    type: "object",
    required: ["MONGODB_URI"],
    properties: {
      MONGODB_URI: { type: "string" },
    },
  },
});

const argsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function parseArgs(argv: string[]) {
  const argMap: Record<string, string> = {};
  for (const part of argv) {
    const re = /^--([^=]+)=(.*)$/;
    const m = re.exec(part);
    if (m) argMap[m[1]] = m[2];
  }
  return argMap;
}

const argMap = parseArgs(process.argv.slice(2));
const username = argMap.username ?? process.env.SEED_USERNAME ?? "";
const password = argMap.password ?? process.env.SEED_PASSWORD ?? "";
const { username: u, password: p } = argsSchema.parse({ username, password });

const mongoUri = process.env.MONGODB_URI ?? app.config.MONGODB_URI;
const db = await createDb(mongoUri);
const { users } = collections(db);

const passwordHash = await argon2.hash(p);

const res = await users.updateOne(
  { username: u },
  { $set: { passwordHash }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true },
);

app.log.info({ matched: res.matchedCount, upserted: res.upsertedCount }, "seed user complete");
process.exit(0);

