import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white lg:flex">
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="relative z-10 h-full w-[82vw] max-w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg border border-slate-300 p-2 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-950 dark:text-white">
              StockPilot
            </h1>

            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Smart Inventory System
            </p>
          </div>
        </div>

        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;