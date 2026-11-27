// /api/post22.js
// Serverless handler — proxies Growx "check_home_ins_buyers" post (Home Insurance LN).
export default async function handler(req, res) {
  try {
    const body = req.body || {};

    const required = [
      "ping_id",
      "caller_id",
      "email",
      "first_name",
      "last_name",
      "city",
      "state",
      "zip",
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
      email: String(body.email).trim(),
      city: String(body.city).trim(),
      state: String(body.state).trim(),
      zip,
      trackdrive_number: body.trackdrive_number || process.env.TRACKDRIVE_NUMBER_22 || "+18445093147",
      traffic_source_id: body.traffic_source_id || process.env.TRAFFIC_SOURCE_ID_22 || "1000",
    };

    const optional = ["dob", "gender", "age", "ip_address", "jornaya_leadid", "original_lead_submit_date"];
    for (const key of optional) {
      if (body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== "") {
        payload[key] = String(body[key]).trim();
      }
    }

    const apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/post/check_home_ins_buyers";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error in post22 API:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + error.message],
    });
  }
}
