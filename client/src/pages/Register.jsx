import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import { register } from "../services/authService";
import useAuth from "../hooks/useAuth";

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <User size={26} />
          </div>

          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Start managing your inventory with StockPilot.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="mb-2 block text-sm text-slate-300">
            Full Name
          </label>
          <div
            className={`mb-2 flex items-center gap-3 rounded-xl border bg-slate-950 px-4 py-3 ${
              errors.name
                ? "border-red-500/60"
                : "border-slate-700 focus-within:border-cyan-400"
            }`}
          >
            <User size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />
          </div>
          {errors.name && (
            <p className="mb-4 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle size={14} />
              {errors.name}
            </p>
          )}

          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <div
            className={`mb-2 flex items-center gap-3 rounded-xl border bg-slate-950 px-4 py-3 ${
              errors.email
                ? "border-red-500/60"
                : "border-slate-700 focus-within:border-cyan-400"
            }`}
          >
            <Mail size={18} className="text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />
          </div>
          {errors.email && (
            <p className="mb-4 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle size={14} />
              {errors.email}
            </p>
          )}

          <label className="mb-2 block text-sm text-slate-300">
            Password
          </label>
          <div
            className={`mb-2 flex items-center gap-3 rounded-xl border bg-slate-950 px-4 py-3 ${
              errors.password
                ? "border-red-500/60"
                : "border-slate-700 focus-within:border-cyan-400"
            }`}
          >
            <Lock size={18} className="text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-500 transition hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {form.password && !errors.password && (
            <p
              className={`mb-4 flex items-center gap-2 text-xs ${
                passwordStrength === "Strong"
                  ? "text-green-300"
                  : passwordStrength === "Good"
                  ? "text-cyan-300"
                  : "text-amber-300"
              }`}
            >
              <CheckCircle2 size={14} />
              Password strength: {passwordStrength}
            </p>
          )}

          {errors.password && (
            <p className="mb-4 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle size={14} />
              {errors.password}
            </p>
          )}

          {generalError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;