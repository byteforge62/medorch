
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL;

  if (!appUrl) {
    throw new Error("NEXTAUTH_URL is not configured.");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error("EMAIL_FROM is not configured.");
  }

  const verificationUrl = new URL(
    "/verify-email",
    appUrl,
  );

  verificationUrl.searchParams.set("token", token);
  verificationUrl.searchParams.set("email", email);

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Verify your MedOrch email address",
    text: [
      `Hello ${name},`,
      "",
      "Verify your email address using the link below:",
      verificationUrl.toString(),
      "",
      "This link expires in 30 minutes and can only be used once.",
      "If you did not request this account, you can ignore this email.",
    ].join("\n"),
  });

  if (error) {
    console.error("Failed to send verification email:", error.message);
    throw new Error("Unable to send verification email.");
  }
}
