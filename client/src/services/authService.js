import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth`;

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);

  if (res.data.token) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }

  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);

  if (res.data.token) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }

  return res.data;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};