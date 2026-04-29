import { useEffect, useState } from "react";
import SettingsContext from "./settings-context";

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("stockpilot-settings");

    return saved
      ? JSON.parse(saved)
      : {
          lowStockAlerts: true,
          darkMode: true,
          emailNotifications: false,
          autoReceiptDownload: true,
        };
  });

  useEffect(() => {
    localStorage.setItem("stockpilot-settings", JSON.stringify(settings));

    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-slate-950", "text-white");
      document.body.classList.remove("bg-slate-100", "text-slate-950");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-slate-950", "text-white");
      document.body.classList.add("bg-slate-100", "text-slate-950");
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;