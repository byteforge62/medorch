
import "server-only";
import nodemailer from "nodemailer";

const PASSWORD_RESET_EXPIRY_MINUTES = 15;

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM;
  const appUrl = process.env.NEXTAUTH_URL;

  if (!smtpUser || !smtpPassword || !emailFrom || !appUrl) {
    throw new Error("Email configuration is incomplete.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const resetUrl = new URL("/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);

  await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: "Reset your MedOrch password",
    text: [
      `Hello ${name},`,
      "",
      "We received a request to reset your MedOrch password.",
      `Reset your password using this link: ${resetUrl.toString()}`,
      "",
      `This link expires in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes.`,
      "If you did not request this reset, you can ignore this email.",
    ].join("\n"),
  });
}
