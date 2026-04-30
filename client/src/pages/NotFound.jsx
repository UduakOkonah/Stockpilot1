import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 text-red-400">
          <AlertTriangle size={48} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          404 Error
        </p>

        <h1 className="mt-4 text-5xl font-black sm:text-6xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
          The page you’re looking for does not exist, was moved,
          or the link may be broken.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Need help? Return to the dashboard or login page to continue using
            StockPilot.
          </p>
        </div>
      </div>
    </main>
  );
}

export default NotFound;