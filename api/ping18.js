// /api/ping18.js
// Serverless handler — proxies Growx "check_for_available_buyers" ping (SSDI CPA CS).
export default async function handler(req, res) {
  try {
    const {
      trackdrive_number,
      traffic_source_id,
      caller_id,
      first_name,
      last_name,
      address,
      address2,
      city,
      zip,
      state,
      email,
      trusted_form_cert_url,
      center_code,
    } = req.query;

    const td = trackdrive_number || process.env.TRACKDRIVE_NUMBER_18 || "+18777991582";
    const ts = traffic_source_id || process.env.TRAFFIC_SOURCE_ID_18 || "1000";
    const centerCode = center_code || "LISA136";

    if (!caller_id) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Missing required parameter: caller_id"],
      });
    }

    const normalizedCallerId = String(caller_id).replace(/(?!^\+)\D/g, "");
    if (!/^\+1\d{10}$/.test(normalizedCallerId)) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid caller_id. Expected +1XXXXXXXXXX"],
      });
    }

    let apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/ping/check_for_available_buyers" +
      `?trackdrive_number=${encodeURIComponent(td)}` +
      `&traffic_source_id=${encodeURIComponent(ts)}` +
      `&caller_id=${encodeURIComponent(normalizedCallerId)}`;

    if (first_name) apiUrl += `&first_name=${encodeURIComponent(first_name)}`;
    if (last_name) apiUrl += `&last_name=${encodeURIComponent(last_name)}`;
    if (address) apiUrl += `&address=${encodeURIComponent(address)}`;
    if (address2) apiUrl += `&address2=${encodeURIComponent(address2)}`;
    if (city) apiUrl += `&city=${encodeURIComponent(city)}`;
    if (zip) apiUrl += `&zip=${encodeURIComponent(zip)}`;
    if (state) apiUrl += `&state=${encodeURIComponent(state)}`;
    if (email) apiUrl += `&email=${encodeURIComponent(email)}`;
    if (trusted_form_cert_url) {
      apiUrl += `&trusted_form_cert_url=${encodeURIComponent(trusted_form_cert_url)}`;
    }
    apiUrl += `&center_code=${encodeURIComponent(centerCode)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error in ping18 API:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + error.message],
    });
  }
}
