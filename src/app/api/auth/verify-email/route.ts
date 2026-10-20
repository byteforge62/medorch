import { createHash } from "node:crypto";
import { recordVerificationEmailRequest } from "@/modules/users/user.repository";
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

  const token = body.token.trim();

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.json(
      { message: "This verification link is invalid or expired." },
      { status: 400 },
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip")?.trim();
  const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const ipHash = createHash("sha256")
    .update(clientIp)
    .digest("hex");

  const allowed = await recordVerificationEmailRequest(
    tokenHash,
    ipHash,
    "EMAIL_VERIFICATION_TOKEN",
  );

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many verification attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": "900" },
      },
    );
  }

  try {
    const result = await verifyPatientEmailToken(token);
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
