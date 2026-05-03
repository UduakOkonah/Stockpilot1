import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import useAuth from "../hooks/useAuth";

const inputWrapperClasses =
  "mb-4 flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 dark:bg-slate-950";

const inputClasses =
  "w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    const loadingToast = toast.loading("Signing you in...");

    try {
      const data = await login(form);

      setUser(data);

      toast.success("Welcome back!", {
        id: loadingToast,
      });

      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Login failed. Please try again.";

      setError(message);

      toast.error(message, {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950">
              <PackageCheck size={28} />
            </div>

            <h2 className="mt-8 text-3xl font-black leading-tight">
              Welcome back to StockPilot.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Access your inventory dashboard, monitor products, generate
              invoices, and manage your business from one place.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="mb-3 text-cyan-300" size={22} />
              <p className="font-semibold">Secure business access</p>
              <p className="mt-1 text-sm text-slate-400">
                Your inventory and business data stay protected.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <PackageCheck className="mb-3 text-emerald-300" size={22} />
              <p className="font-semibold">Smart inventory tracking</p>
              <p className="mt-1 text-sm text-slate-400">
                Manage stock, sales, invoices, and reports with ease.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
              <Lock size={26} />
            </div>

            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Sign in to manage your StockPilot workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>

            <div
              className={`${inputWrapperClasses} border-slate-300 dark:border-slate-700`}
            >
              <Mail size={18} className="text-slate-500" />

              <input
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className={inputClasses}
              />
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>

            <div
              className={`${inputWrapperClasses} border-slate-300 dark:border-slate-700`}
            >
              <Lock size={18} className="text-slate-500" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={inputClasses}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;