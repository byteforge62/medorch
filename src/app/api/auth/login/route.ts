import { NextResponse } from "next/server";

import { signIn } from "@/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password.",
      },
      { status: 401 }
    );
  }
}