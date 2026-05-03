import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Download,
  Mail,
  Moon,
  Receipt,
  Save,
  Settings2,
  Sun,
  Wallet,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import {
  getBusinessProfile,
  updateBusinessProfile,
} from "../services/businessProfileService";
import useSettings from "../hooks/useSettings";

const cardClasses =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const labelClasses =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

function Toggle({ label, description, checked, onChange, icon: Icon }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300">
            <Icon size={18} />
          </div>
        )}

        <div>
          <p className="font-medium text-slate-950 dark:text-white">{label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${
          checked ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? "left-7" : "left-1"
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

        if (!isMounted) return;

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
            settings?.lowStockAlerts ?? data.lowStockAlertsEnabled ?? true,
        });

        setError("");
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
      <section className="min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Manage business identity, receipt preferences, display mode, and
              inventory alerts.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Settings2 size={18} />
            System Preferences
          </div>
        </div>

        {loading ? (
          <div className={cardClasses}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading settings...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={cardClasses}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Appearance
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Control how StockPilot looks and behaves.
                </p>
              </div>

              <div className="grid gap-3">
                <Toggle
                  label="Dark mode"
                  description="Switch between dark and light display mode."
                  checked={settings.darkMode}
                  onChange={() => toggleAppSetting("darkMode")}
                  icon={settings.darkMode ? Moon : Sun}
                />

                <Toggle
                  label="Email notifications"
                  description="Prepare notification preference for future email alerts."
                  checked={settings.emailNotifications}
                  onChange={() => toggleAppSetting("emailNotifications")}
                  icon={Mail}
                />

                <Toggle
                  label="Auto receipt download"
                  description="Automatically download receipts after sales in future updates."
                  checked={settings.autoReceiptDownload}
                  onChange={() => toggleAppSetting("autoReceiptDownload")}
                  icon={Download}
                />
              </div>
            </div>

            <div className={cardClasses}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Business Profile
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  These details appear on receipts and reports.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Example: Uduak Stores"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Business Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234..."
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className={labelClasses}>Business Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    className={inputClasses}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>Business Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Business address..."
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div className={cardClasses}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Receipt Preferences
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Control how receipts are generated.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClasses}>Currency</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Receipt Prefix</label>
                  <input
                    type="text"
                    name="receiptPrefix"
                    value={form.receiptPrefix}
                    onChange={handleChange}
                    placeholder="SP"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <Toggle
                  label="Show business email"
                  description="Display business email on receipts."
                  checked={form.showBusinessEmail}
                  onChange={() => toggleField("showBusinessEmail")}
                  icon={Mail}
                />

                <Toggle
                  label="Show business phone"
                  description="Display phone number on receipts."
                  checked={form.showBusinessPhone}
                  onChange={() => toggleField("showBusinessPhone")}
                  icon={Building2}
                />

                <Toggle
                  label="Show business address"
                  description="Display address on receipts."
                  checked={form.showBusinessAddress}
                  onChange={() => toggleField("showBusinessAddress")}
                  icon={Building2}
                />

                <Toggle
                  label="Show thank-you message"
                  description="Add a thank-you message at the bottom of receipts."
                  checked={form.showThankYouMessage}
                  onChange={() => toggleField("showThankYouMessage")}
                  icon={Receipt}
                />
              </div>
            </div>

            <div className={cardClasses}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Inventory Preferences
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure inventory behavior and alerts.
                </p>
              </div>

              <Toggle
                label="Enable low-stock alerts"
                description="Show low-stock and out-of-stock warnings on dashboard."
                checked={settings.lowStockAlerts}
                onChange={() => toggleField("lowStockAlertsEnabled")}
                icon={Bell}
              />
            </div>

            <div className={cardClasses}>
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Business Preview
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick preview of how your business identity will appear.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-950 dark:text-white">
                      {form.businessName || "StockPilot Business"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Receipt Prefix: {form.receiptPrefix || "SP"}
                    </p>
                  </div>

                  <div className="w-fit rounded-xl bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                    {form.currency}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-slate-500 dark:text-slate-400">Email</p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {form.showBusinessEmail
                        ? form.email || "Not set"
                        : "Hidden"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {form.showBusinessPhone
                        ? form.phone || "Not set"
                        : "Hidden"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-slate-500 dark:text-slate-400">
                      Address
                    </p>
                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {form.showBusinessAddress
                        ? form.address || "Not set"
                        : "Hidden"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                <Save size={18} />
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