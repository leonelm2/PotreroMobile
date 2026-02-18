// --- frontend/src/api.js ---
import axios from 'axios'


const api = axios.create({ baseURL: '/api' })


// añadir interceptor para Authorization
api.interceptors.request.use((config) => {
const token = localStorage.getItem('potrero_token')
if (token) config.headers.Authorization = `Bearer ${token}`
return config
})


export default api