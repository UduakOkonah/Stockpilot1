import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import useAuth from "../../hooks/useAuth";

function Topbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const navigate = useNavigate();

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const displayName = user?.name || "StockPilot User";
  const displayEmail = user?.email || "No email available";

  const openLogoutModal = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    if (logout) logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h2>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
            Manage stock, products, and inventory health.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:gap-3 sm:px-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 font-bold text-slate-950">
              {userInitial}
            </span>

            <span className="hidden max-w-32 truncate font-medium sm:inline">
              {displayName}
            </span>

            <ChevronDown size={16} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                <p className="font-semibold text-slate-950 dark:text-white">
                  {displayName}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {displayEmail}
                </p>
              </div>

              <div className="p-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <UserCircle size={18} />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Settings size={18} />
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={openLogoutModal}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              Log out?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Are you sure you want to log out of your StockPilot dashboard?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;