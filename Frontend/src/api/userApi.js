import axios from "axios";
import { getToken } from "../utils/auth";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getInbox = () => API.get("/user/inbox");
export const interactEmail = (data) => API.post("/user/interact", data);
export const getRisk = () => API.get("/user/risk");
export const getTrainingContent = () => API.get("/user/training");
export const getTraining = () => API.get("/user/training"); // alias for TrainingSidebar