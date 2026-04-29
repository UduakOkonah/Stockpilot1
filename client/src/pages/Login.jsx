import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { login } from "../services/authService";
import useAuth from "../hooks/useAuth";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(form);
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <Lock size={26} />
          </div>

          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your StockPilot workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Email Address
          </label>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus-within:border-cyan-400">
            <Mail size={18} className="text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus-within:border-cyan-400">
            <Lock size={18} className="text-slate-500" />
            <input
              type="password"
              placeholder="Enter password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-cyan-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;