import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-confirmation";
import { db } from "@/drizzle/db";
import {
  passwordResetTokens,
  twoFactorTokens,
  verificationTokens,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(twoFactorTokens)
      .where(eq(twoFactorTokens.id, existingToken.id));
  }

  const twoFactorToken = (
    await db
      .insert(twoFactorTokens)
      .values({
        id: crypto.randomUUID(),
        email,
        token,
        expires,
      })
      .returning()
  )?.[0];

  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, existingToken.id));
  }

  const passwordResetToken = (
    await db
      .insert(passwordResetTokens)
      .values({
        id: crypto.randomUUID(),
        email,
        token,
        expires,
      })
      .returning()
  )?.[0];

  return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, existingToken.id));
  }

  const verficationToken = (
    await db
      .insert(verificationTokens)
      .values({
        id: crypto.randomUUID(),
        email,
        token,
        expires,
      })
      .returning()
  )?.[0];

  return verficationToken;
};
