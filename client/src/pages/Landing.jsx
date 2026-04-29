import { Link } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  FileText,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

function Landing() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">StockPilot</h1>
            <p className="text-sm text-slate-400">Smart Inventory System</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              Built for small businesses, shops, and vendors
            </div>

            <h2 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Know your stock, sales, and profit without guesswork.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              StockPilot helps business owners track products, monitor stock
              levels, record sales, calculate profit, generate receipts, and
              export reports from one clean dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="rounded-xl bg-cyan-500 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Start Free
              </Link>

              <Link
                to="/login"
                className="rounded-xl border border-slate-700 px-6 py-3 text-center font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today’s Revenue</p>
                  <h3 className="mt-2 text-3xl font-bold text-cyan-300">
                    ₦45,500
                  </h3>
                </div>

                <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                  <TrendingUp />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs text-slate-500">Products</p>
                  <p className="mt-2 text-xl font-bold">128</p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs text-slate-500">Low Stock</p>
                  <p className="mt-2 text-xl font-bold text-amber-300">9</p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs text-slate-500">Profit</p>
                  <p className="mt-2 text-xl font-bold text-green-400">
                    ₦12,800
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {["Cowbell Milk", "Golden Morn", "Peak Milk"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
                    >
                      <div>
                        <p className="font-semibold">{item}</p>
                        <p className="text-xs text-slate-500">
                          SKU: SP00{index + 1}
                        </p>
                      </div>

                      <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                        In Stock
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold">What StockPilot helps you do</h2>
            <p className="mt-3 text-slate-400">
              A simple but powerful tool for business owners who want better
              visibility without complicated software.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                icon: Boxes,
                title: "Manage products",
                text: "Add, edit, delete, and track product quantities with reorder levels.",
              },
              {
                icon: BarChart3,
                title: "Track sales and profit",
                text: "Record stock-out sales and automatically calculate revenue and profit.",
              },
              {
                icon: FileText,
                title: "Generate receipts",
                text: "Create branded receipts using your business profile and settings.",
              },
              {
                icon: ShieldCheck,
                title: "Private business dashboard",
                text: "Each user gets a separate dashboard and private business data.",
              },
              {
                icon: TrendingUp,
                title: "Insights and charts",
                text: "View revenue, profit trends, stock movement, and recent activity.",
              },
              {
                icon: Zap,
                title: "Export reports",
                text: "Download transaction reports as CSV and PDF for business records.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-cyan-500/15 p-3 text-cyan-300">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;