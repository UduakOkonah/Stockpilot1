import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  LayoutDashboard,
} from "lucide-react";

function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-6 py-10 dark:bg-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute right-10 top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 dark:text-red-400">
            <AlertTriangle size={48} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">
            404 Error
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl">
            Page Not Found
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-400 dark:text-slate-400 sm:text-lg">
            The page you’re looking for does not exist, may have been moved, or
            the link might be broken.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Home size={18} />
              Home
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 dark:text-slate-400">
              Need help? Return to your dashboard or login page to continue
              using StockPilot Smart Inventory System.
            </p>
          </div>

          <div className="mt-8 text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
            StockPilot • Smart Inventory System
          </div>
        </div>
      </div>
    </main>
  );
}

export default NotFound;