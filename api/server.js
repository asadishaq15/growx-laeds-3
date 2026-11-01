// api/server.js (ESM) — SSDI CPA CS ping/post + optional static serve
import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const CORS_ORIGIN = "*";
const PORT = 5001;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "200kb" }));

async function axiosWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const source = axios.CancelToken.source();
  const timer = setTimeout(() => {
    source.cancel(`Timeout after ${timeoutMs}ms`);
  }, timeoutMs);

  try {
    const response = await axios({
      url,
      cancelToken: source.token,
      ...opts,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ------------ SSDI CPA CS (GrowxSsdiCpaCsForm) ping and post endpoints -------------
const TRACKDRIVE_NUMBER_18 = "+18777991582";
const TRAFFIC_SOURCE_ID_18 = "1000";
const CENTER_CODE_18 = "LISA136";

// GET /api/ping18 — proxies check_for_available_buyers ping (SSDI CPA CS)
app.get("/api/ping18", async (req, res) => {
  try {
    if (!TRACKDRIVE_NUMBER_18 || !TRAFFIC_SOURCE_ID_18) {
      console.error("Missing TRACKDRIVE_NUMBER_18 or TRAFFIC_SOURCE_ID_18");
      return res.status(500).json({
        success: false,
        status: "error",
        errors: ["Server misconfiguration"],
      });
    }

    const {
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
    } = req.query;

    if (!caller_id || !/^\+1\d{10}$/.test(String(caller_id))) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid or missing caller_id. Expected +1XXXXXXXXXX"],
      });
    }

    let apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/ping/check_for_available_buyers" +
      `?trackdrive_number=${encodeURIComponent(TRACKDRIVE_NUMBER_18)}` +
      `&traffic_source_id=${encodeURIComponent(TRAFFIC_SOURCE_ID_18)}` +
      `&caller_id=${encodeURIComponent(caller_id)}`;

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
    apiUrl += `&center_code=${encodeURIComponent(CENTER_CODE_18)}`;

    console.log("Ping18 upstream URL:", apiUrl);
    const upstream = await axiosWithTimeout(apiUrl, { method: "GET" }, 8000);
    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    console.error("Ping18 upstream error:", err.message || err);

    if (axios.isCancel(err)) {
      return res.status(504).json({
        success: false,
        status: "timeout",
        errors: ["Upstream request timed out"],
      });
    }

    if (err.response) {
      let errors;
      if (typeof err.response.data?.errors === "object" && !Array.isArray(err.response.data?.errors)) {
        errors = Object.entries(err.response.data.errors).map(([key, messages]) =>
          Array.isArray(messages) ? `${key}: ${messages.join(", ")}` : `${key}: ${messages}`
        );
      } else {
        errors = err.response.data?.errors || [`Upstream status ${err.response.status}`];
      }
      return res.status(err.response.status || 502).json({
        success: false,
        status: "upstream_error",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + (err.message || "unknown")],
    });
  }
});

// POST /api/post18 — proxies check_for_available_buyers post (SSDI CPA CS)
app.post("/api/post18", async (req, res) => {
  if (!TRACKDRIVE_NUMBER_18 || !TRAFFIC_SOURCE_ID_18) {
    console.error("Missing TRACKDRIVE_NUMBER_18 or TRAFFIC_SOURCE_ID_18");
    return res.status(500).json({ success: false, status: "error", errors: ["Server misconfiguration"] });
  }

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
      trackdrive_number: TRACKDRIVE_NUMBER_18,
      traffic_source_id: TRAFFIC_SOURCE_ID_18,
      center_code: CENTER_CODE_18,
    };

    if (body.address2 && String(body.address2).trim()) {
      payload.address2 = String(body.address2).trim();
    }

    if (body.trusted_form_cert_url) {
      payload.trusted_form_cert_url = String(body.trusted_form_cert_url).trim();
    }

    const apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/post/check_for_available_buyers";

    console.log("Post18 upstream URL:", apiUrl);
    const upstream = await axiosWithTimeout(
      apiUrl,
      { method: "POST", headers: { "Content-Type": "application/json" }, data: JSON.stringify(payload) },
      10000
    );

    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    console.error("Post18 upstream error:", err.message || err);
    if (axios.isCancel(err)) {
      return res.status(504).json({ success: false, status: "timeout", errors: ["Upstream request timed out"] });
    }
    if (err.response) {
      let errors;
      if (typeof err.response.data?.errors === "object" && !Array.isArray(err.response.data?.errors)) {
        errors = Object.entries(err.response.data.errors).map(([key, messages]) =>
          Array.isArray(messages) ? `${key}: ${messages.join(", ")}` : `${key}: ${messages}`
        );
      } else {
        errors = err.response.data?.errors || [`Upstream status ${err.response.status}`];
      }
      return res.status(err.response.status || 502).json({ success: false, status: "upstream_error", errors });
    }
    return res.status(500).json({ success: false, status: "error", errors: ["Server error: " + (err.message || "unknown")] });
  }
});

// ------------ SSDI CPA TJ (GrowxSsdiCpaTjForm) ping and post endpoints -------------
const TRACKDRIVE_NUMBER_19 = "+18778581849";
const TRAFFIC_SOURCE_ID_19 = "1000";

// GET /api/ping19 — proxies check_for_available_buyers ping (SSDI CPA TJ)
app.get("/api/ping19", async (req, res) => {
  try {
    if (!TRACKDRIVE_NUMBER_19 || !TRAFFIC_SOURCE_ID_19) {
      console.error("Missing TRACKDRIVE_NUMBER_19 or TRAFFIC_SOURCE_ID_19");
      return res.status(500).json({
        success: false,
        status: "error",
        errors: ["Server misconfiguration"],
      });
    }

    const {
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
    } = req.query;

    if (!caller_id || !/^\+1\d{10}$/.test(String(caller_id))) {
      return res.status(400).json({
        success: false,
        status: "error",
        errors: ["Invalid or missing caller_id. Expected +1XXXXXXXXXX"],
      });
    }

    let apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/ping/check_for_available_buyers" +
      `?trackdrive_number=${encodeURIComponent(TRACKDRIVE_NUMBER_19)}` +
      `&traffic_source_id=${encodeURIComponent(TRAFFIC_SOURCE_ID_19)}` +
      `&caller_id=${encodeURIComponent(caller_id)}`;

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

    console.log("Ping19 upstream URL:", apiUrl);
    const upstream = await axiosWithTimeout(apiUrl, { method: "GET" }, 8000);
    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    console.error("Ping19 upstream error:", err.message || err);

    if (axios.isCancel(err)) {
      return res.status(504).json({
        success: false,
        status: "timeout",
        errors: ["Upstream request timed out"],
      });
    }

    if (err.response) {
      let errors;
      if (typeof err.response.data?.errors === "object" && !Array.isArray(err.response.data?.errors)) {
        errors = Object.entries(err.response.data.errors).map(([key, messages]) =>
          Array.isArray(messages) ? `${key}: ${messages.join(", ")}` : `${key}: ${messages}`
        );
      } else {
        errors = err.response.data?.errors || [`Upstream status ${err.response.status}`];
      }
      return res.status(err.response.status || 502).json({
        success: false,
        status: "upstream_error",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      status: "error",
      errors: ["Server error: " + (err.message || "unknown")],
    });
  }
});

// POST /api/post19 — proxies check_for_available_buyers post (SSDI CPA TJ)
app.post("/api/post19", async (req, res) => {
  if (!TRACKDRIVE_NUMBER_19 || !TRAFFIC_SOURCE_ID_19) {
    console.error("Missing TRACKDRIVE_NUMBER_19 or TRAFFIC_SOURCE_ID_19");
    return res.status(500).json({ success: false, status: "error", errors: ["Server misconfiguration"] });
  }

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
      trackdrive_number: TRACKDRIVE_NUMBER_19,
      traffic_source_id: TRAFFIC_SOURCE_ID_19,
    };

    if (body.address2 && String(body.address2).trim()) {
      payload.address2 = String(body.address2).trim();
    }

    if (body.trusted_form_cert_url) {
      payload.trusted_form_cert_url = String(body.trusted_form_cert_url).trim();
    }

    const apiUrl =
      "https://growxmarketingservices.trackdrive.com/api/v1/inbound_webhooks/post/check_for_available_buyers";

    console.log("Post19 upstream URL:", apiUrl);
    const upstream = await axiosWithTimeout(
      apiUrl,
      { method: "POST", headers: { "Content-Type": "application/json" }, data: JSON.stringify(payload) },
      10000
    );

    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    console.error("Post19 upstream error:", err.message || err);
    if (axios.isCancel(err)) {
      return res.status(504).json({ success: false, status: "timeout", errors: ["Upstream request timed out"] });
    }
    if (err.response) {
      let errors;
      if (typeof err.response.data?.errors === "object" && !Array.isArray(err.response.data?.errors)) {
        errors = Object.entries(err.response.data.errors).map(([key, messages]) =>
          Array.isArray(messages) ? `${key}: ${messages.join(", ")}` : `${key}: ${messages}`
        );
      } else {
        errors = err.response.data?.errors || [`Upstream status ${err.response.status}`];
      }
      return res.status(err.response.status || 502).json({ success: false, status: "upstream_error", errors });
    }
    return res.status(500).json({ success: false, status: "error", errors: ["Server error: " + (err.message || "unknown")] });
  }
});

// ----- Serve built frontend in production -----
const distPath = path.join(__dirname, "..", "dist");

if (fs.existsSync(distPath)) {
  console.log("Serving static files from:", distPath);
  app.use(express.static(distPath));

  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("Dist folder not found; skipping static file serving (dev mode).");
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
