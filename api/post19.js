// /api/post19.js
// Serverless handler — proxies Growx "check_for_available_buyers" post (SSDI CPA TJ).
export default async function handler(req, res) {
  try {
    const body = req.body || {};

    const required = [
      "ping_id",
      "caller_id",
      "first_name",
      "last_name",
      "address",
      "city",
      "zip",
      "state",
      "email",
    ];
    const missing = required.filter(
      (k) => body[k] === undefined || body[k] === null || String(body[k]).trim() === ""
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Missing required fields: " + missing.join(", ")],
      });
    }

    const callerId = String(body.caller_id).trim();
    if (!/^\+1\d{10}$/.test(callerId)) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid caller_id. Expected +1XXXXXXXXXX"],
      });
    }

    const zip = String(body.zip).trim();
    if (!/^\d{5}$/.test(zip)) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid zip. Expected 5-digit US ZIP code"],
      });
    }

    const payload = {
      ping_id: String(body.ping_id).trim(),
      caller_id: callerId,
      first_name: String(body.first_name).trim(),
      last_name: String(body.last_name).trim(),
      address: String(body.address).trim(),
      city: String(body.city).trim(),
      zip,
      state: String(body.state).trim(),
      email: String(body.email).trim(),
      trackdrive_number: body.trackdrive_number || process.env.TRACKDRIVE_NUMBER_19 || "+18778581849",
      traffic_source_id: body.traffic_source_id || process.env.TRAFFIC_SOURCE_ID_19 || "1000",
    };

    if (body.address2 && String(body.address2).trim()) {
      payload.address2 = String(body.address2).trim();
    }

    if (body.trusted_form_cert_url) {
      payload.trusted_form_cert_url = String(body.trusted_form_cert_url).trim();
    }

    const apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/post/check_for_available_buyers";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error in post19 API:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + error.message],
    });
  }
}
