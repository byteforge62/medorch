
import { NextResponse } from "next/server";
import { verifyPatientEmailToken } from "@/modules/users/user.service";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("token" in body) ||
    typeof body.token !== "string"
  ) {
    return NextResponse.json(
      { message: "A verification token is required." },
      { status: 400 }
    );
  }

  try {
    const result = await verifyPatientEmailToken(body.token);

    if (!result.verified) {
      return NextResponse.json(
        { message: "This verification link is invalid or expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message:
        "Email verified successfully. Your account is awaiting administrator approval.",
    });
  } catch (error) {
    console.error("Email verification failed:", error);

    return NextResponse.json(
      { message: "Email verification could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
