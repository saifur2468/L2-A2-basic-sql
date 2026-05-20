

import { Pool } from "pg";
import type { QueryResult } from "pg";

import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const query = async (
  text: string,
  params?: unknown[]
): Promise<QueryResult> => {
  return pool.query(text, params);
};