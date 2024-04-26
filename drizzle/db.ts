import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});
export const db = drizzle(client, { schema });

// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
// import * as schema from "./schema";
// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle(sql, { schema });

export async function GetUsers() {
  const users = await db.query.users.findMany();
  console.log(users);
}
