import { useState } from "react";
import AuthContext from "./auth-context";
import { getCurrentUser, logout } from "../services/authService";

function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

    const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = "/login";
    };

  return (
    <AuthContext.Provider value={{ user, setUser, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;