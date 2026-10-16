import type { APIRoute } from "astro";
import { env } from "node:process";

export const prerender = false;

const json = (body: Record<string, string | boolean>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const requiredFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "company",
  "role",
  "reason",
  "help",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json") && !contentType.includes("application/x-www-form-urlencoded")) {
    return json({ error: "Unsupported request format." }, 415);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (error) {
    console.error("Unable to read contact form request.", error);
    return json({ error: "Could not read the enquiry. Please try again." }, 400);
  }

  if (rawBody.length > 32_768) {
    return json({ error: "The enquiry is too large." }, 413);
  }

  let data: unknown;
  try {
    data = contentType.includes("application/json")
      ? JSON.parse(rawBody)
      : Object.fromEntries(new URLSearchParams(rawBody));
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (!isRecord(data)) return json({ error: "Invalid request." }, 400);

  if (stringValue(data.website)) return json({ ok: true });

  const values: Record<string, string | boolean> = {
    firstName: stringValue(data.firstName),
    lastName: stringValue(data.lastName),
    email: stringValue(data.email),
    phone: stringValue(data.phone),
    company: stringValue(data.company),
    revenue: stringValue(data.revenue),
    role: stringValue(data.role),
    businessType: stringValue(data.businessType),
    reason: stringValue(data.reason),
    help: stringValue(data.help),
    source: stringValue(data.source),
    message: stringValue(data.message),
    marketingConsent: data.marketingConsent === true || data.marketingConsent === "true" || data.marketingConsent === "yes",
    pageUrl: stringValue(data.pageUrl),
    submittedAt: stringValue(data.submittedAt),
  };

  if (requiredFields.some((field) => !values[field])) {
    return json({ error: "Please fill all required fields." }, 400);
  }
  if (!emailPattern.test(String(values.email))) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  const digits = String(values.phone).replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15 || !/^[\d\s()+\-.]+$/.test(String(values.phone))) {
    return json({ error: "Please enter a valid phone number." }, 400);
  }

  const webhookUrl = env.CONTACT_WEBHOOK_URL ?? import.meta.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({ error: "The contact form is not configured yet. Please try again later." }, 503);
  }

  let parsedWebhookUrl: URL;
  try {
    parsedWebhookUrl = new URL(webhookUrl);
  } catch {
    console.error("CONTACT_WEBHOOK_URL must be a valid HTTP or HTTPS URL.");
    return json({ error: "The contact form is not configured correctly." }, 500);
  }
  if (parsedWebhookUrl.protocol !== "https:" && parsedWebhookUrl.protocol !== "http:") {
    console.error("CONTACT_WEBHOOK_URL must use HTTP or HTTPS.");
    return json({ error: "The contact form is not configured correctly." }, 500);
  }

  let webhookResponse: Response;
  try {
    webhookResponse = await fetch(parsedWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(values),
    });
  } catch (error) {
    console.error("Unable to deliver contact form enquiry to the configured webhook.", error);
    return json({ error: "Could not send your enquiry. Please try again." }, 502);
  }

  if (!webhookResponse.ok) {
    console.error(`Contact form webhook returned HTTP ${webhookResponse.status}.`);
    return json({ error: "Could not send your enquiry. Please try again." }, 502);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/contact?sent=1#contact" },
    });
  }
  return json({ ok: true });
};
