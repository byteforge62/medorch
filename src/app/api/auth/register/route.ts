import { NextResponse } from "next/server";
import { patientRegistrationSchema } from "@/modules/users/user.validation";
import { registerPatient } from "@/modules/users/user.service";
import { createHash } from "node:crypto";
import { recordVerificationEmailRequest } from "@/modules/users/user.repository";

const REGISTRATION_MESSAGE =
  "If registration can be completed, a verification email will be sent to the provided address.";

function isDuplicateEmailError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "P2002";
}

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

  const validation = patientRegistrationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const email = validation.data.email.trim().toLowerCase();

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip")?.trim();

  const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp;

  const emailHash = createHash("sha256")
    .update(email)
    .digest("hex");

  const ipHash = createHash("sha256")
    .update(clientIp || `unavailable:${email}`)
    .digest("hex");

  const allowed = await recordVerificationEmailRequest(
    emailHash,
    ipHash,
    "REGISTRATION",
  );

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": "900" },
      },
    );
  }

  try {
    await registerPatient(validation.data);

    return NextResponse.json(
      { message: REGISTRATION_MESSAGE },
      { status: 202 }
    );
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      // Avoid disclosing whether an email is already registered.
      return NextResponse.json(
        { message: REGISTRATION_MESSAGE },
        { status: 202 }
      );
    }

    console.error("Patient registration failed:", error);

    return NextResponse.json(
      { message: "Registration could not be completed. Please try again later." },
      { status: 500 }
    );
  }
}
