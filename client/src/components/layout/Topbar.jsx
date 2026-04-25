function Topbar() {
  return (
    <header className="hidden items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 lg:flex">
      <div>
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="text-sm text-slate-400">
          Manage stock, products, and inventory health.
        </p>
      </div>

      <div className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
        Admin
      </div>
    </header>
  );
}


export default Topbar;