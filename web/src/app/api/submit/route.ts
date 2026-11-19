import { isAbstractClosed } from "@/lib/abstract-rules";
import { createRateLimiter } from "@/lib/rate-limit";
import { formatEmail, validateSubmission } from "@/lib/submission";

export const runtime = "nodejs";

/** 3 MB file as base64 is about 4 MB. Leave room for the other fields. */
const MAX_BODY_BYTES = 4.6 * 1024 * 1024;
const RESEND_URL = "https://api.resend.com/emails";

/** 5 submissions per IP every 10 minutes. */
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

const json = (status: number, body: Record<string, unknown>, headers?: HeadersInit) =>
  Response.json(body, { status, headers });

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (!limiter.allow(clientKey(request))) {
    return json(
      429,
      { error: "Too many submissions. Please wait a few minutes and try again." },
      { "Retry-After": "600" },
    );
  }

  // The form is covered after the deadline, but anyone can POST directly. Refuse here too.
  if (isAbstractClosed(Date.now())) {
    return json(410, { error: "Abstract registration is closed." });
  }

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json(413, { error: "The submission is too large." });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES)
      return json(413, { error: "The submission is too large." });
    body = JSON.parse(text);
  } catch {
    return json(400, { error: "Invalid registration data." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json(400, { error: "Invalid registration data." });
  }

  const result = validateSubmission(body as Record<string, unknown>);
  if ("spam" in result) return json(200, { success: true });
  if ("error" in result) return json(400, { error: result.error });
  const { submission } = result;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.REGISTRATION_EMAIL;
  if (!apiKey || !from || !to) {
    console.error(
      "Email configuration missing: set REGISTRATION_EMAIL, RESEND_API_KEY and RESEND_FROM_EMAIL.",
    );
    return json(503, {
      error: "Email delivery is not configured. Please contact the organizer.",
    });
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: submission.members[0].email,
        subject: `SANKALP 2026 registration: ${submission.teamName}`,
        text: formatEmail(submission),
        attachments: [submission.attachment],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      // Log the status only. The provider body can echo submitted data.
      console.error("Email provider rejected registration:", response.status);
      return json(502, {
        error: "The email provider rejected the submission. Please try again later.",
      });
    }
    return json(200, { success: true });
  } catch (error) {
    console.error(
      "Email provider request failed:",
      error instanceof Error ? error.name : error,
    );
    return json(502, { error: "Could not reach the email provider. Please retry." });
  }
}
