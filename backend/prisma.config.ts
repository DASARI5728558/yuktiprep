import "dotenv/config";
import { defineConfig } from "prisma/config";

const user = process.env.USER || "postgres";
const password = process.env.PASSWORD || "";
const host = process.env.HOST || "localhost";
const port = process.env.DB_PORT || 5432;
const database = process.env.DATABASE || "yuktiprep";

const databaseUrl = process.env.DATABASE_URL || `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
  seed: {
    run: {
      command: "node prisma/seed.js",
    },
  },
});
