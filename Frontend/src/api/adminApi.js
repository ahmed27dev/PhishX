import axios from "axios";
import { getToken } from "../utils/auth";

const API = axios.create({ baseURL: "http://localhost:8000" });

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createUser = (data) => API.post("/admin/create-user", data);
export const bulkUploadUsers = (formData) =>
  API.post("/admin/bulk-upload-users", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
export const getUsers = () => API.get("/admin/users");
export const updateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getUserRisk = (id) => API.get(`/admin/users/${id}/risk`);

export const createCampaign = (data) => API.post("/admin/create-campaign", data);
export const activateCampaign = (id) => API.post(`/admin/activate-campaign/${id}`);
export const deactivateCampaign = (id) => API.post(`/admin/deactivate-campaign/${id}`);
export const getCampaigns = () => API.get("/admin/campaigns");
export const getCampaignDetail = (id) => API.get(`/admin/campaigns/${id}/detail`);

export const uploadOrgStyle = (formData) =>
  API.post("/admin/upload-org-style", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
export const getOrgStyle = () => API.get("/admin/org-style");

export const getTrainingContent = () => API.get("/admin/training");

export const addTrainingContent = (data) => API.post("/admin/training", data);
export const deleteTrainingContent = (id) => API.delete(`/admin/training/${id}`);

export const getAuditLogs = () => API.get("/admin/audit-logs");
export const uploadTrainingFile = (formData) =>
  API.post("/admin/training/upload-file", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });