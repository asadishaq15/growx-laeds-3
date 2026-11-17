import { useEffect, useState } from "react";

const LEADS_URL = "https://assured-health.trackdrive.com/api/v1/leads";
const LEAD_TOKEN = "1f5d31beefb34b328dcd009b58cf3c7e";
const TRAFFIC_SOURCE_ID = "3200";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District Of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const INITIAL_FORM = {
  lead_token: LEAD_TOKEN,
  traffic_source_id: TRAFFIC_SOURCE_ID,
  caller_id: "",
  first_name: "",
  last_name: "",
  email: "",
  address: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  ip_address: "",
  age: "",
  trusted_form_cert_url: "",
};

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;

function isValidIpAddress(value) {
  const ip = value?.trim();
  if (!ip) return false;
  // Reject placeholders agents sometimes type (e.g. "Na", "N/A")
  if (/^(na|n\/?a|none|null|undefined)$/i.test(ip)) return false;
  return IPV4_REGEX.test(ip);
}

function isTrustedFormCertUrl(value) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.hostname !== "cert.trustedform.com") return false;
    // Real certificates look like /<40 hex chars>
    return /^\/[a-f0-9]{40}\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function getTrustedFormCertUrlFromDom() {
  // Hidden fields injected by the TrustedForm script (when present)
  const selectors = [
    'input[name="xxTrustedFormCertUrl"]',
    'input[id="xxTrustedFormCertUrl"]',
  ];

  for (const selector of selectors) {
    const input = document.querySelector(selector);
    const value = input?.value?.trim();
    if (value && isTrustedFormCertUrl(value)) return value;
  }

  return "";
}

function resolveTrustedFormCertUrl(formValue) {
  const fromDom = getTrustedFormCertUrlFromDom();
  if (fromDom) return fromDom;

  const manual = formValue?.trim() || "";
  if (manual && isTrustedFormCertUrl(manual)) return manual;

  return "";
}

function formatApiErrors(result, fallback) {
  const errors = result.errors;
  if (Array.isArray(errors) && errors.length) {
    return errors.map(String).join(", ");
  }
  if (errors && typeof errors === "object") {
    return Object.entries(errors)
      .map(([key, value]) =>
        `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`
      )
      .join("; ");
  }
  return result.message || result.error || result.status || fallback;
}

export default function GrowxSsdiCpaPyNewForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const syncTrustedFormCertUrl = () => {
      const trustedFormCertUrl = getTrustedFormCertUrlFromDom();
      if (!trustedFormCertUrl) return;

      setFormData((prev) =>
        prev.trusted_form_cert_url === trustedFormCertUrl
          ? prev
          : { ...prev, trusted_form_cert_url: trustedFormCertUrl }
      );
    };

    syncTrustedFormCertUrl();
    const intervalId = window.setInterval(syncTrustedFormCertUrl, 500);
    const timeoutId = window.setTimeout(() => window.clearInterval(intervalId), 15000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith("+") && input.length > 0) input = "+" + input;
    const value = input.replace(/(?!^\+)\D/g, "").slice(0, 12);
    setFormData((prev) => ({ ...prev, caller_id: value }));
    setError(null);
    setSuccess(null);
  };

  const handleZipChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setFormData((prev) => ({ ...prev, zip: value }));
    setError(null);
    setSuccess(null);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setFormData((prev) => ({ ...prev, age: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const callerId = formData.caller_id.trim();

      if (!/^\+1\d{10}$/.test(callerId)) {
        throw new Error("Please enter a valid US phone number in format: +1XXXXXXXXXX.");
      }

      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error("First name and last name are required.");
      }

      const email = formData.email.trim();
      if (!EMAIL_REGEX.test(email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (!formData.address.trim()) {
        throw new Error("Address is required.");
      }

      if (!formData.city.trim()) {
        throw new Error("City is required.");
      }

      if (!formData.state) {
        throw new Error("Please select a state.");
      }

      if (!/^\d{5}$/.test(formData.zip)) {
        throw new Error("Please enter a valid 5-digit ZIP code.");
      }

      if (formData.age) {
        const ageNum = Number(formData.age);
        if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          throw new Error("Age must be between 1 and 120.");
        }
      }

      const ipAddress = formData.ip_address.trim();
      if (!isValidIpAddress(ipAddress)) {
        throw new Error("Please enter a valid IPv4 address (e.g. 103.131.212.217).");
      }

      const trustedFormCertUrl = resolveTrustedFormCertUrl(
        formData.trusted_form_cert_url
      );

      if (!trustedFormCertUrl) {
        throw new Error(
          "A valid Trusted Form certificate URL is required (https://cert.trustedform.com/...)."
        );
      }

      const params = new URLSearchParams({
        lead_token: LEAD_TOKEN,
        traffic_source_id: TRAFFIC_SOURCE_ID,
        caller_id: callerId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        zip: formData.zip,
        ip_address: ipAddress,
        trusted_form_cert_url: trustedFormCertUrl,
      });

      if (formData.address2.trim()) params.set("address2", formData.address2.trim());
      if (formData.age.trim()) params.set("age", formData.age.trim());

      const url = `${LEADS_URL}?${params.toString()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Lead submitted successfully.");
        setFormData(INITIAL_FORM);
      } else {
        throw new Error(formatApiErrors(result, "Failed to submit lead. Please try again."));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-5">
          <h2 className="text-center text-2xl font-extrabold text-white px-4">
            SSDI CPA PY NEW
          </h2>
        </div>

        {error && (
          <div className="mx-4 mt-6 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-4 mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="ml-3 text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:py-8" autoComplete="off">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Caller ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="caller_id"
                value={formData.caller_id}
                onChange={handlePhoneChange}
                required
                placeholder="+17194451111"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="first-and-last-name@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="123 Fake Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address 2
              </label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className={inputClass}
                placeholder="Apartment, suite, unit"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Boulder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleZipChange}
                  required
                  maxLength={5}
                  className={inputClass}
                  placeholder="80301"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select State</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleAgeChange}
                  inputMode="numeric"
                  maxLength={3}
                  className={inputClass}
                  placeholder="35"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="103.131.212.217"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trusted Form URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="trusted_form_cert_url"
                value={formData.trusted_form_cert_url}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="https://cert.trustedform.com/abc123..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be a real certificate URL from cert.trustedform.com
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition duration-150`}
            >
              {isSubmitting ? "Submitting..." : "Submit Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
