import { db } from "@/drizzle/db";
import { passwordResetTokens, verificationTokens } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.email, email),
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};
