"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";

import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/token";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { users } from "@/drizzle/schema";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset email sent!" };
};
