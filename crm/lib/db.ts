import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let _db: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!_db) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    _db = new PrismaClient({ adapter }) as PrismaClient;
  }
  return _db;
}
