import {
  FileBarChart,
  FilePlus2,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  UserCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({ onNavigate }) {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  return (
    <aside className="flex h-full w-full flex-col bg-white px-4 py-6 dark:bg-slate-950">
      <div className="mb-8 border-b border-slate-200 px-2 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="/stockpilotlogo.png"
            alt="StockPilot Logo"
            className="h-12 w-auto rounded-[60px] object-contain"
          />

          <div>
            <h1 className="text-xl font-black leading-none tracking-tight text-slate-950 dark:text-white">
              StockPilot
            </h1>

            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
              Smart Inventory System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          className={linkClasses}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/products"
          onClick={onNavigate}
          className={linkClasses}
        >
          <Package size={18} />
          Products
        </NavLink>

        <NavLink
          to="/transactions"
          onClick={onNavigate}
          className={linkClasses}
        >
          <ReceiptText size={18} />
          Transactions
        </NavLink>

        <NavLink
          to="/reports"
          onClick={onNavigate}
          className={linkClasses}
        >
          <FileBarChart size={18} />
          Reports
        </NavLink>

        <NavLink
          to="/invoice-builder"
          onClick={onNavigate}
          className={linkClasses}
        >
          <FilePlus2 size={18} />
          Invoice Builder
        </NavLink>

        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={linkClasses}
        >
          <UserCircle size={18} />
          Profile
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={linkClasses}
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;