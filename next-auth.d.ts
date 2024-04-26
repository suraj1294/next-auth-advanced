import NextAuth, { type DefaultSession } from "next-auth";
import { USER_ROLE } from "./drizzle/schema";

export type ExtendedUser = DefaultSession["user"] & {
  role: USER_ROLE;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "@auth/core" {
  interface Session {
    user: ExtendedUser;
  }
}
