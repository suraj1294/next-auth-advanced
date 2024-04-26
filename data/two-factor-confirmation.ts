import { db } from "@/drizzle/db";
import { twoFactorConfirmations, twoFactorTokens } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
  try {
    const twoFactorConfirmation =
      await db.query.twoFactorConfirmations.findFirst({
        where: eq(twoFactorConfirmations.id, userId),
      });

    return twoFactorConfirmation;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await db.query.twoFactorTokens.findFirst({
      where: eq(twoFactorTokens.email, email),
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};
