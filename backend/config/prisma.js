import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pgPkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });


const { PrismaClient } = pkg;
const { Pool } = pgPkg;

const user = process.env.USER || "postgres";
const password = process.env.PASSWORD || "";
const host = process.env.HOST || "localhost";
const port = process.env.DB_PORT || 5432;
const database = process.env.DATABASE || "yuktiprep";
const connectionString = process.env.DATABASE_URL || `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;

