import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth/authorization";
import { getUsers } from "@/modules/users/user.service";

export async function GET() {
  try {
    const session = await requireApiRole("ADMIN");
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const users = await getUsers();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      { status: 500 },
    );
  }
}