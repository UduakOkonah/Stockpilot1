import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useAuth from "../../hooks/useAuth";

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white lg:flex">
      {/* Desktop Sidebar */}
    <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 lg:block">
      <Sidebar />
    </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/80"
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="relative z-10 h-full w-[82vw] max-w-72 border-r border-slate-800 bg-slate-950">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={20} />
            </button>

            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white">
                StockPilot
              </h1>
              <p className="truncate text-xs text-slate-400">
                Smart Inventory System
              </p>
            </div>
          </div>

          {/* Mobile User + Logout */}
          <button
            onClick={logout}
            className="rounded-lg border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Topbar (Desktop Header) */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
            <div>
              <h1 className="text-lg font-semibold text-white">
                StockPilot
              </h1>
              <p className="text-xs text-slate-400">
                Smart Inventory System
              </p>
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden bg-slate-950 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;