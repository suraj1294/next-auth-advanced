"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { unstable_update } from "@/auth";

import { SettingsSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { db } from "@/drizzle/db";

import { USER_ROLE, users } from "@/drizzle/schema";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { eq } from "drizzle-orm";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await db.query.users.findFirst({
    where: (u) => eq(u.id, user.id ?? ""),
  });

  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, values.email),
    });

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Verification email sent!" };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password
    );

    if (!passwordsMatch) {
      return { error: "Incorrect password!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updatedUser = (
    await db
      .update(users)
      .set({
        ...values,
      })
      .where(eq(users.id, dbUser.id))
      .returning()
  )?.[0];

  unstable_update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: !!updatedUser.isTwoFactorEnabled,
      role: updatedUser.role as USER_ROLE,
    },
  });

  return { success: "Settings Updated!" };
};
