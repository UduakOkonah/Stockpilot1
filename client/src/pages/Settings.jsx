import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  getBusinessProfile,
  updateBusinessProfile,
} from "../services/businessProfileService";
import useSettings from "../hooks/useSettings";

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function Settings() {
  const { settings, setSettings } = useSettings();

  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    email: "",
    address: "",
    currency: "NGN",
    receiptPrefix: "SP",
    showBusinessEmail: true,
    showBusinessPhone: true,
    showBusinessAddress: true,
    showThankYouMessage: true,
    lowStockAlertsEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getBusinessProfile();

        if (isMounted) {
          setForm({
            businessName: data.businessName || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            currency: data.currency || "NGN",
            receiptPrefix: data.receiptPrefix || "SP",
            showBusinessEmail: data.showBusinessEmail ?? true,
            showBusinessPhone: data.showBusinessPhone ?? true,
            showBusinessAddress: data.showBusinessAddress ?? true,
            showThankYouMessage: data.showThankYouMessage ?? true,
            lowStockAlertsEnabled:
              settings?.lowStockAlerts ??
              data.lowStockAlertsEnabled ??
              true,
          });

          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Failed to load business profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [settings?.lowStockAlerts]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleField = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    if (field === "lowStockAlertsEnabled") {
      setSettings((prev) => ({
        ...prev,
        lowStockAlerts: !prev.lowStockAlerts,
      }));
    }
  };

  const toggleAppSetting = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        lowStockAlertsEnabled: settings.lowStockAlerts,
      };

      const data = await updateBusinessProfile(payload);

      setForm({
        businessName: data.businessName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        currency: data.currency || "NGN",
        receiptPrefix: data.receiptPrefix || "SP",
        showBusinessEmail: data.showBusinessEmail ?? true,
        showBusinessPhone: data.showBusinessPhone ?? true,
        showBusinessAddress: data.showBusinessAddress ?? true,
        showThankYouMessage: data.showThankYouMessage ?? true,
        lowStockAlertsEnabled: settings.lowStockAlerts,
      });

      setMessage("Settings saved successfully.");
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Manage business identity, receipt preferences, and inventory alerts.
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading settings...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold text-white">
                Appearance
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Control how StockPilot looks and behaves.
              </p>

              <div className="mt-5 grid gap-3">
                <Toggle
                  label="Dark mode"
                  description="Switch between dark and light display mode."
                  checked={settings.darkMode}
                  onChange={() => toggleAppSetting("darkMode")}
                />

                <Toggle
                  label="Email notifications"
                  description="Prepare notification preference for future email alerts."
                  checked={settings.emailNotifications}
                  onChange={() => toggleAppSetting("emailNotifications")}
                />

                <Toggle
                  label="Auto receipt download"
                  description="Automatically download receipts after sales in future updates."
                  checked={settings.autoReceiptDownload}
                  onChange={() => toggleAppSetting("autoReceiptDownload")}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold text-white">
                Business Profile
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                These details appear on receipts and reports.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Example: Uduak Stores"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Business Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Business Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Business Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Business address..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold text-white">
                Receipt Preferences
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Control how receipts are generated.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Receipt Prefix
                  </label>
                  <input
                    type="text"
                    name="receiptPrefix"
                    value={form.receiptPrefix}
                    onChange={handleChange}
                    placeholder="SP"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <Toggle
                  label="Show business email"
                  description="Display business email on receipts."
                  checked={form.showBusinessEmail}
                  onChange={() => toggleField("showBusinessEmail")}
                />
                <Toggle
                  label="Show business phone"
                  description="Display phone number on receipts."
                  checked={form.showBusinessPhone}
                  onChange={() => toggleField("showBusinessPhone")}
                />
                <Toggle
                  label="Show business address"
                  description="Display address on receipts."
                  checked={form.showBusinessAddress}
                  onChange={() => toggleField("showBusinessAddress")}
                />
                <Toggle
                  label="Show thank-you message"
                  description="Add a thank-you message at the bottom of receipts."
                  checked={form.showThankYouMessage}
                  onChange={() => toggleField("showThankYouMessage")}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold text-white">
                Inventory Preferences
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Configure inventory behavior and alerts.
              </p>

              <div className="mt-5">
                <Toggle
                  label="Enable low-stock alerts"
                  description="Show low-stock and out-of-stock warnings on dashboard."
                  checked={settings.lowStockAlerts}
                  onChange={() => toggleField("lowStockAlertsEnabled")}
                />
              </div>
            </div>

            {message && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </section>
    </AppLayout>
  );
}

export default Settings;