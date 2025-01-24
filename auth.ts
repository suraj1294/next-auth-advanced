import NextAuth, { Session, type DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./drizzle/db";
import {
  accounts,
  twoFactorConfirmations,
  USER_ROLE,
  users,
} from "./drizzle/schema";
import { eq } from "drizzle-orm";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";

export type ExtendedUser = DefaultSession["user"] & {
  role: USER_ROLE;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db
        .update(users)
        .set({
          emailVerified: new Date(),
        })
        .where(eq(users.id, user.id ?? ""))
        .returning();
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, user.id ?? ""),
      });

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db
          .delete(twoFactorConfirmations)
          .where(eq(twoFactorConfirmations.id, twoFactorConfirmation.id));
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as USER_ROLE;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email ?? "";
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, token.sub),
      });

      if (!existingUser) return token;

      const existingAccount = await db.query.accounts.findFirst({
        where: eq(accounts.userId, existingUser.id),
      });

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
  },
  adapter: DrizzleAdapter(db),
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  ...authConfig,
});
