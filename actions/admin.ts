"use server";

import { USER_ROLE } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";

export const admin = async () => {
  const role = await currentRole();

  if (role === USER_ROLE.ADMIN) {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" };
};
