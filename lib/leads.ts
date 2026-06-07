export interface Lead {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryResult {
  ok: boolean;
  /** `false` when no delivery provider is configured yet (env vars unset).
   *  The UI uses this to offer a direct-email fallback instead of pretending
   *  the message was sent — so a lead is never silently dropped. */
  configured: boolean;
}

/**
 * Delivers a contact lead via Mailgun's REST API. Activation is purely
 * environment-driven: once MAILGUN_API_KEY, MAILGUN_DOMAIN and CONTACT_TO_EMAIL
 * are set (e.g. in Vercel project env), delivery goes live with zero code
 * changes. Until then it reports `configured: false`.
 *
 * Mailgun region: US is https://api.mailgun.net (default); EU accounts must set
 * MAILGUN_API_BASE=https://api.eu.mailgun.net.
 */
export async function deliverLead(lead: Lead): Promise<DeliveryResult> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL ??
    (domain ? `Triolla Website <noreply@${domain}>` : undefined);
  const base = process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net";

  if (!apiKey || !domain || !to || !from) {
    return { ok: false, configured: false };
  }

  const body = new URLSearchParams({
    from,
    to,
    "h:Reply-To": lead.email,
    subject: `New website enquiry — ${lead.name}`,
    text: [
      `Name:  ${lead.name}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone || "—"}`,
    ].join("\n"),
  });

  try {
    const res = await fetch(`${base}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
    return { ok: res.ok, configured: true };
  } catch {
    return { ok: false, configured: true };
  }
}
