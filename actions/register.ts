"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { RegisterSchema } from "@/schemas";

import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.insert(users).values({
    id: crypto.randomUUID(),
    name,
    email,
    password: hashedPassword,
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
};
