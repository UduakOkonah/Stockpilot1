import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PackageCheck,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { register } from "../services/authService";
import useAuth from "../hooks/useAuth";

const inputWrapperClasses =
  "mb-2 flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 dark:bg-slate-950";

const inputClasses =
  "w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const nextErrors = {};

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name) {
      nextErrors.name = "Full name is required.";
    } else if (name.length < 3) {
      nextErrors.name = "Full name must be at least 3 characters.";
    }

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getFriendlyErrorMessage = (err) => {
    const backendMessage = err?.response?.data?.message;

    if (!backendMessage) {
      return "Registration failed. Please check your internet connection and try again.";
    }

    const lowerMessage = backendMessage.toLowerCase();

    if (
      lowerMessage.includes("already exists") ||
      lowerMessage.includes("duplicate") ||
      lowerMessage.includes("email")
    ) {
      return "This email already has a StockPilot account. Please sign in instead.";
    }

    return backendMessage;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setSubmitting(true);

    const loadingToast = toast.loading("Creating your account...");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const data = await register(payload);

      setUser(data);

      toast.success("Account created successfully!", {
        id: loadingToast,
      });

      navigate("/dashboard");
    } catch (err) {
      const message = getFriendlyErrorMessage(err);

      setGeneralError(message);

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength =
    form.password.length >= 8
      ? "Strong"
      : form.password.length >= 6
      ? "Good"
      : form.password.length > 0
      ? "Weak"
      : "";

  const passwordStrengthClasses =
    passwordStrength === "Strong"
      ? "text-emerald-600 dark:text-emerald-300"
      : passwordStrength === "Good"
      ? "text-cyan-600 dark:text-cyan-300"
      : "text-amber-600 dark:text-amber-300";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950">
              <PackageCheck size={28} />
            </div>

            <h2 className="mt-8 text-3xl font-black leading-tight">
              Start tracking your stock like a serious business.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Create invoices, monitor products, track profits, and keep your
              small business organized from one dashboard.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="mb-3 text-cyan-300" size={22} />
              <p className="font-semibold">Secure account access</p>
              <p className="mt-1 text-sm text-slate-400">
                Your business workspace starts with a protected login.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <CheckCircle2 className="mb-3 text-emerald-300" size={22} />
              <p className="font-semibold">Built for small vendors</p>
              <p className="mt-1 text-sm text-slate-400">
                Simple enough to use daily, powerful enough to grow with you.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
              <User size={26} />
            </div>

            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              Create account
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
              Start managing your inventory with StockPilot.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Full Name
            </label>

            <div
              className={`${inputWrapperClasses} ${
                errors.name
                  ? "border-red-400"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <User size={18} className="text-slate-500" />

              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClasses}
              />
            </div>

            {errors.name && (
              <p className="mb-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}

            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Email
            </label>

            <div
              className={`${inputWrapperClasses} ${
                errors.email
                  ? "border-red-400"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <Mail size={18} className="text-slate-500" />

              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClasses}
              />
            </div>

            {errors.email && (
              <p className="mb-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}

            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Password
            </label>

            <div
              className={`${inputWrapperClasses} ${
                errors.password
                  ? "border-red-400"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              <Lock size={18} className="text-slate-500" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={inputClasses}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {form.password && !errors.password && (
              <p
                className={`mb-4 flex items-center gap-2 text-xs ${passwordStrengthClasses}`}
              >
                <CheckCircle2 size={14} />
                Password strength: {passwordStrength}
              </p>
            )}

            {errors.password && (
              <p className="mb-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}

            {generalError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {generalError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;