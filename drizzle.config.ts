import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./drizzle/schema.ts",
  driver: "turso",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
  verbose: true,
  strict: true,
});

// export default defineConfig({
//   schema: "./drizzle/schema.ts",
//   driver: "pg",
//   out: "./drizzle/migrations",
//   dbCredentials: {
//     connectionString: process.env.DATABASE_URL!,
//   },
//   verbose: true,
//   strict: true,
// });
