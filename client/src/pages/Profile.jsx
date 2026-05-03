import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import useAuth from "../hooks/useAuth";

function Profile() {
  const { user } = useAuth();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const profileItems = [
    {
      label: "Full Name",
      value: user?.name || "Not available",
      icon: User,
    },
    {
      label: "Email Address",
      value: user?.email || "Not available",
      icon: Mail,
    },
    {
      label: "Account Role",
      value: user?.role || "Business Owner",
      icon: ShieldCheck,
    },
    {
      label: "Business",
      value: user?.businessName || "StockPilot Business",
      icon: Building2,
    },
  ];

  return (
    <AppLayout>
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Manage your StockPilot account identity, business access, and user
            information.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-cyan-500 text-4xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
                  {userInitial}
                </div>

                <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-emerald-500 p-1.5 text-white dark:border-slate-900">
                  <BadgeCheck size={18} />
                </div>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                {user?.name || "StockPilot User"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {user?.email || "No email available"}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  Active Account
                </span>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Verified User
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Account Summary
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    Status
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    Plan
                  </span>
                  <span className="font-semibold text-slate-950 dark:text-white">
                    Starter
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    Access
                  </span>
                  <span className="font-semibold text-slate-950 dark:text-white">
                    Owner
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Your basic account details.
                  </p>
                </div>

                <div className="hidden rounded-xl bg-cyan-500/10 p-3 text-cyan-600 dark:text-cyan-300 sm:block">
                  <User size={22} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {profileItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300">
                        <Icon size={18} />
                      </div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {item.label}
                      </p>

                      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Account Activity
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick overview of your account access.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <CalendarDays className="mb-3 text-cyan-600 dark:text-cyan-300" size={22} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Joined
                  </p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                    Recently
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <ShieldCheck className="mb-3 text-cyan-600 dark:text-cyan-300" size={22} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Security
                  </p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                    Protected
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <Building2 className="mb-3 text-cyan-600 dark:text-cyan-300" size={22} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Workspace
                  </p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                    StockPilot
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

export default Profile;