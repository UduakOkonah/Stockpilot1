import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { register } from "../services/authService";
import useAuth from "../hooks/useAuth";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await register(form);
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <User size={26} />
          </div>

          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Start managing your inventory with StockPilot.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <label className="mb-2 block text-sm text-slate-300">
            Full Name
          </label>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus-within:border-cyan-400">
            <User size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Your name"
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full bg-transparent text-white outline-none"
            />
          </div>

          {/* Email */}
          <label className="mb-2 block text-sm text-slate-300">
            Email
          </label>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus-within:border-cyan-400">
            <Mail size={18} className="text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full bg-transparent text-white outline-none"
            />
          </div>

          {/* Password */}
          <label className="mb-2 block text-sm text-slate-300">
            Password
          </label>
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus-within:border-cyan-400">
            <Lock size={18} className="text-slate-500" />
            <input
              type="password"
              placeholder="Create password"
              required
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full bg-transparent text-white outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <button className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;