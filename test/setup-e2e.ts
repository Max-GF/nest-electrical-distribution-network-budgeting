import { config } from "dotenv";
import { Redis } from "ioredis";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "prisma/generated/client";
import { DomainEvents } from "src/core/events/domain-events";
import { envSchema } from "src/infra/env/env";

config({ path: ".env", override: true });
config({ path: ".env.test", override: true });

const env = envSchema.parse(process.env);
const prisma = new PrismaClient();
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
});
const schemaId = randomUUID();

function generateUniqueDataBaseURL(schemaId: string): string {
  if (!env.DATABASE_URL) {
    throw new Error("Please provide a DATABASE_URL environment variable");
  }
  const url = new URL(env.DATABASE_URL);
  url.searchParams.set("schema", schemaId);
  return url.toString();
}
beforeAll(async () => {
  const databaseURL = generateUniqueDataBaseURL(schemaId);
  console.log(
    `Running e2e tests on the following database schemaId: ${schemaId}`,
  );
  process.env.DATABASE_URL = databaseURL;
  DomainEvents.shouldRun = false; // Disable domain events for all tests, remember to enable them in the test that needs them
  await redis.flushdb();

  execSync("pnpm prisma migrate deploy"); // Only performs migrations, doesn't recognize changes
});
afterAll(async () => {
  console.log(`Dropping database with schema: ${schemaId}`);
  // const currentSchema = await prisma.$queryRawUnsafe('SELECT current_schema()')
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
