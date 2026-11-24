// /api/post23.js
// Serverless handler — proxies Growx "check_for_available_auto_ins_buyers" post (Auto LN).
export default async function handler(req, res) {
  try {
    const body = req.body || {};

    const required = ["ping_id", "caller_id", "first_name", "last_name", "city", "state", "zip"];
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
      city: String(body.city).trim(),
      state: String(body.state).trim(),
      zip,
      trackdrive_number: body.trackdrive_number || process.env.TRACKDRIVE_NUMBER_23 || "+18446163653",
      traffic_source_id: body.traffic_source_id || process.env.TRAFFIC_SOURCE_ID_23 || "1000",
    };

    const optional = [
      "dob",
      "marital_status",
      "gender",
      "residence_status",
      "vehicle1_year",
      "vehicle1_make",
      "vehicle1_model",
      "ip_address",
      "jornaya_leadid",
      "trusted_form_cert_url",
      "age",
    ];
    for (const key of optional) {
      if (body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== "") {
        payload[key] = String(body[key]).trim();
      }
    }

    const apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/post/check_for_available_auto_ins_buyers";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error in post23 API:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + error.message],
    });
  }
}
