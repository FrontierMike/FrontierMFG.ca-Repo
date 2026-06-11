// worker/index.js
// Cloudflare Worker entry point for the Frontier MFG site.
// - Serves the static Astro build (the `dist` folder) via the ASSETS binding.
// - Handles POST /api/contact: validates, logs to Notion, emails via Resend.

const NOTION_API = "https://api.notion.com/v1/pages";
const NOTION_VERSION = "2022-06-28";
const RESEND_API = "https://api.resend.com/emails";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed." }, 405);
      }
      return handleContact(request, env);
    }

    // Everything else: serve the static site (and its own 404 handling).
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  // Honeypot: real users never fill this. If present, fake success and stop.
  if (data["company-website"]) {
    return json({ ok: true });
  }

  const firstName = (data["first-name"] || "").trim();
  const lastName  = (data["last-name"]  || "").trim();
  const email     = (data["email"]      || "").trim();
  const company   = (data["company"]    || "").trim();
  const service   = (data["service"]    || "").trim() || "Not specified";
  const message   = (data["message"]    || "").trim();

  // Validation
  if (!firstName || !lastName || !email || !message) {
    return json({ ok: false, error: "Please fill in all required fields." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  const fullName = `${firstName} ${lastName}`;

  // 1) Log to Notion (non-fatal: a failure here must not lose the email lead)
  let notionOk = true;
  try {
    const res = await fetch(NOTION_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: env.NOTION_DATABASE_ID },
        properties: {
          "Name":    { title: [{ text: { content: fullName } }] },
          "Email":   { email: email },
          "Company": { rich_text: [{ text: { content: company } }] },
          "Service": { select: { name: service } },
          "Message": { rich_text: [{ text: { content: message } }] },
          "Status":  { select: { name: "New" } },
        },
      }),
    });
    if (!res.ok) {
      notionOk = false;
      console.error("Notion write failed:", res.status, await res.text());
    }
  } catch (err) {
    notionOk = false;
    console.error("Notion write error:", err);
  }

  // 2) Email via Resend (fatal: this is the lead notification)
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Frontier MFG Website <noreply@frontiermfg.ca>",
        to: ["info@frontiermfg.ca"],
        reply_to: email,
        subject: `New consultation request — ${service}`,
        text:
          `Name: ${fullName}\n` +
          `Email: ${email}\n` +
          `Company: ${company || "Not specified"}\n` +
          `Service: ${service}\n\n` +
          `Message:\n${message}\n` +
          (notionOk ? "" : "\n[Note: Notion logging failed for this submission — check Worker logs.]"),
      }),
    });
    if (!res.ok) {
      console.error("Resend send failed:", res.status, await res.text());
      return json(
        { ok: false, error: "Could not send your message. Please email info@frontiermfg.ca directly." },
        502
      );
    }
  } catch (err) {
    console.error("Resend send error:", err);
    return json(
      { ok: false, error: "Could not send your message. Please email info@frontiermfg.ca directly." },
      502
    );
  }

  return json({ ok: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
