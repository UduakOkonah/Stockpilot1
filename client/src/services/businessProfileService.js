import api from "./api";

export const getBusinessProfile = async () => {
  const response = await api.get("/business-profile");
  return response.data;
};

export const updateBusinessProfile = async (profileData) => {
  const response = await api.put("/business-profile", profileData);
  return response.data;
};