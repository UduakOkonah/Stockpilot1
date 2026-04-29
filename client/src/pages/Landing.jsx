import { Link } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  FileText,
  HelpCircle,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  Zap,
} from "lucide-react";

function Landing() {
  const features = [
    {
      icon: Boxes,
      title: "Manage products",
      text: "Add, edit, delete, and track product quantities with cost price, selling price, and reorder levels.",
    },
    {
      icon: BarChart3,
      title: "Track sales and profit",
      text: "Record stock-out sales and automatically calculate revenue, cost, and profit.",
    },
    {
      icon: ReceiptText,
      title: "Generate receipts",
      text: "Create clean branded receipts using your business profile, prefix, and receipt preferences.",
    },
    {
      icon: ShieldCheck,
      title: "Private dashboard",
      text: "Every user gets their own secure business dashboard with separate inventory data.",
    },
    {
      icon: TrendingUp,
      title: "Smart analytics",
      text: "View revenue trends, profit trends, stock movement, and most moved products.",
    },
    {
      icon: FileText,
      title: "Export reports",
      text: "Download transaction reports as CSV and PDF for business records and decision-making.",
    },
  ];

  const workflow = [
    "Create your business account",
    "Add products with cost and selling price",
    "Record stock-in and sales",
    "Track profit, receipts, and reports",
  ];

  const faqs = [
    {
      question: "Who is StockPilot for?",
      answer:
        "StockPilot is built for small shops, vendors, mini-marts, student businesses, and local business owners who need a simple way to manage inventory and sales.",
    },
    {
      question: "Can multiple users use it?",
      answer:
        "Yes. Each registered user has a private dashboard and their own business data.",
    },
    {
      question: "Does it calculate profit?",
      answer:
        "Yes. Once you add cost price and selling price, StockPilot calculates profit when sales are recorded.",
    },
    {
      question: "Can I generate receipts?",
      answer:
        "Yes. You can generate branded PDF receipts for sale transactions.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between gap-4">
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

            <div className="mt-8 grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                No spreadsheet stress
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                Profit tracking
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                Receipt-ready
              </div>
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

      <section className="border-y border-slate-800 bg-slate-900/40 px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-5 text-center sm:grid-cols-3">
          <div>
            <p className="text-3xl font-black text-cyan-300">100%</p>
            <p className="mt-2 text-sm text-slate-400">Private user data</p>
          </div>
          <div>
            <p className="text-3xl font-black text-cyan-300">PDF/CSV</p>
            <p className="mt-2 text-sm text-slate-400">Reports and receipts</p>
          </div>
          <div>
            <p className="text-3xl font-black text-cyan-300">Real-time</p>
            <p className="mt-2 text-sm text-slate-400">Inventory insights</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold">What StockPilot helps you do</h2>
            <p className="mt-3 text-slate-400">
              A simple but powerful tool for business owners who want better
              visibility without complicated software.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
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

      <section className="border-y border-slate-800 bg-slate-900/40 px-6 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
              Built around real shop workflow
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              From product entry to receipt generation in minutes.
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              StockPilot follows a simple business flow: add product, record
              stock movement, sell product, calculate profit, generate receipt,
              and export reports.
            </p>
          </div>

          <div className="space-y-4">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-sm font-bold text-slate-950">
                  {index + 1}
                </div>
                <p className="font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold">Built for everyday sellers</h2>
            <p className="mt-3 text-slate-400">
              Whether you run a mini-store, provision shop, student business, or
              local retail setup, StockPilot helps you make better decisions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Store,
                title: "Small shops",
                text: "Track fast-moving products and know when to restock.",
              },
              {
                icon: PackageCheck,
                title: "Vendors",
                text: "Record sales and monitor product movement clearly.",
              },
              {
                icon: Star,
                title: "Student businesses",
                text: "Manage simple business operations without complex tools.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >
                  <Icon className="text-cyan-300" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Simple pricing for early users
          </h2>
          <p className="mt-3 text-slate-400">
            Start managing your inventory today. More business tools can be
            added as the platform grows.
          </p>

          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 text-left">
            <p className="text-sm font-semibold text-cyan-300">Starter</p>
            <h3 className="mt-3 text-4xl font-black">Free</h3>
            <p className="mt-2 text-sm text-slate-400">
              Perfect for testing StockPilot with your business.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Product management",
                "Sales and profit tracking",
                "Receipt generation",
                "PDF and CSV reports",
                "Private dashboard",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={17} className="text-green-400" />
                  {item}
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="mt-8 block rounded-xl bg-cyan-500 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Frequently asked questions</h2>
            <p className="mt-3 text-slate-400">
              Quick answers for business owners trying StockPilot.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-1 shrink-0 text-cyan-300" />
                  <div>
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to stop guessing your stock and profit?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Create your free StockPilot account and start tracking your business
            with confidence.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} StockPilot. All rights reserved.</p>
          <p>Built for small businesses, vendors, and growing shops.</p>
        </div>
      </footer>
    </main>
  );
}

export default Landing;