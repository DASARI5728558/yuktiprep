import type { D1Database } from "@cloudflare/workers-types";

declare module "cloudflare:workers" {
  export const env: Env;
}

declare global {
  interface Env {
    DB: D1Database;
    [key: string]: any;
  }
}
