import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/drizzle/db";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [GitHub],
  adapter: DrizzleAdapter(db),
} satisfies NextAuthConfig;
