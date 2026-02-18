import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Obtener la URL del backend desde las variables de entorno
// En Expo, las variables de entorno se acceden con process.env.EXPO_PUBLIC_*
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.36:5000') + '/api';

const api = axios.create({ 
  baseURL: BASE_URL 
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('potrero_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
