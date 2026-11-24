// /api/ping23.js
// Serverless handler — proxies Growx "check_for_available_auto_ins_buyers" ping (Auto LN).
export default async function handler(req, res) {
  try {
    const {
      trackdrive_number,
      traffic_source_id,
      caller_id,
      first_name,
      last_name,
      city,
      state,
      zip,
      dob,
      marital_status,
      gender,
      residence_status,
      vehicle1_year,
      vehicle1_make,
      vehicle1_model,
      ip_address,
      jornaya_leadid,
      trusted_form_cert_url,
      age,
    } = req.query;

    const td = trackdrive_number || process.env.TRACKDRIVE_NUMBER_23 || "+18446163653";
    const ts = traffic_source_id || process.env.TRAFFIC_SOURCE_ID_23 || "1000";

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
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/ping/check_for_available_auto_ins_buyers" +
      `?trackdrive_number=${encodeURIComponent(td)}` +
      `&traffic_source_id=${encodeURIComponent(ts)}` +
      `&caller_id=${encodeURIComponent(normalizedCallerId)}`;

    if (first_name) apiUrl += `&first_name=${encodeURIComponent(first_name)}`;
    if (last_name) apiUrl += `&last_name=${encodeURIComponent(last_name)}`;
    if (city) apiUrl += `&city=${encodeURIComponent(city)}`;
    if (state) apiUrl += `&state=${encodeURIComponent(state)}`;
    if (zip) apiUrl += `&zip=${encodeURIComponent(zip)}`;
    if (dob) apiUrl += `&dob=${encodeURIComponent(dob)}`;
    if (marital_status) apiUrl += `&marital_status=${encodeURIComponent(marital_status)}`;
    if (gender) apiUrl += `&gender=${encodeURIComponent(gender)}`;
    if (residence_status) apiUrl += `&residence_status=${encodeURIComponent(residence_status)}`;
    if (vehicle1_year) apiUrl += `&vehicle1_year=${encodeURIComponent(vehicle1_year)}`;
    if (vehicle1_make) apiUrl += `&vehicle1_make=${encodeURIComponent(vehicle1_make)}`;
    if (vehicle1_model) apiUrl += `&vehicle1_model=${encodeURIComponent(vehicle1_model)}`;
    if (ip_address) apiUrl += `&ip_address=${encodeURIComponent(ip_address)}`;
    if (jornaya_leadid) apiUrl += `&jornaya_leadid=${encodeURIComponent(jornaya_leadid)}`;
    if (trusted_form_cert_url) {
      apiUrl += `&trusted_form_cert_url=${encodeURIComponent(trusted_form_cert_url)}`;
    }
    if (age) apiUrl += `&age=${encodeURIComponent(age)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error in ping23 API:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + error.message],
    });
  }
}
