import { LayoutDashboard, Package, ReceiptText, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({ onNavigate }) {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-cyan-500/15 text-cyan-300"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="flex h-full w-full flex-col bg-slate-950 px-4 py-6">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-white">StockPilot</h1>
        <p className="mt-1 text-sm text-slate-400">Smart Inventory System</p>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink to="/" onClick={onNavigate} className={linkClasses}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/products" onClick={onNavigate} className={linkClasses}>
          <Package size={18} />
          Products
        </NavLink>

        <NavLink to="/transactions" onClick={onNavigate} className={linkClasses}>
          <ReceiptText size={18} />
          Transactions
        </NavLink>

        {/* NEW: Settings */}
        <NavLink to="/settings" onClick={onNavigate} className={linkClasses}>
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;