import { USER_ROLE } from "@/drizzle/schema";
import { currentRole } from "@/lib/auth";

import { NextResponse } from "next/server";

export async function GET() {
  const role = await currentRole();

  if (role === USER_ROLE.ADMIN) {
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 403 });
}
