import axios from "axios";

// Obtener la URL del backend desde las variables de entorno
// En Expo, las variables de entorno se acceden con process.env.EXPO_PUBLIC_*
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.36:5000";

const api = axios.create({
  baseURL: BASE_URL + "/api"
});

export default api;