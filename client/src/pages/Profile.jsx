import AppLayout from "../components/layout/AppLayout";
import useAuth from "../hooks/useAuth";

function Profile() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            View your StockPilot account information.
          </p>
        </div>

        <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-2xl font-bold text-slate-950">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                {user?.name || "StockPilot User"}
              </h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500">Full Name</p>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                {user?.name || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500">Email Address</p>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                {user?.email || "Not available"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

export default Profile;