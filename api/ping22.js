// /api/ping22.js
// Serverless handler — proxies Growx "check_home_ins_buyers" ping (Home Insurance LN).
export default async function handler(req, res) {
  try {
    const {
      trackdrive_number,
      traffic_source_id,
      caller_id,
      first_name,
      last_name,
      email,
      city,
      state,
      zip,
      dob,
      gender,
      age,
      ip_address,
      jornaya_leadid,
    } = req.query;

    const td = trackdrive_number || process.env.TRACKDRIVE_NUMBER_22 || "+18445093147";
    const ts = traffic_source_id || process.env.TRAFFIC_SOURCE_ID_22 || "1000";

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
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/ping/check_home_ins_buyers" +
      `?trackdrive_number=${encodeURIComponent(td)}` +
      `&traffic_source_id=${encodeURIComponent(ts)}` +
      `&caller_id=${encodeURIComponent(normalizedCallerId)}`;

    if (first_name) apiUrl += `&first_name=${encodeURIComponent(first_name)}`;
    if (last_name) apiUrl += `&last_name=${encodeURIComponent(last_name)}`;
    if (email) apiUrl += `&email=${encodeURIComponent(email)}`;
    if (city) apiUrl += `&city=${encodeURIComponent(city)}`;
    if (state) apiUrl += `&state=${encodeURIComponent(state)}`;
    if (zip) apiUrl += `&zip=${encodeURIComponent(zip)}`;
    if (dob) apiUrl += `&dob=${encodeURIComponent(dob)}`;
    if (gender) apiUrl += `&gender=${encodeURIComponent(gender)}`;
    if (age) apiUrl += `&age=${encodeURIComponent(age)}`;
    if (ip_address) apiUrl += `&ip_address=${encodeURIComponent(ip_address)}`;
    if (jornaya_leadid) apiUrl += `&jornaya_leadid=${encodeURIComponent(jornaya_leadid)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error in ping22 API:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + error.message],
    });
  }
}
