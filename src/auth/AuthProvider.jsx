// --- frontend/src/auth/AuthProvider.jsx ---
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api'


const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)


useEffect(() => {
const token = localStorage.getItem('potrero_token')
const userJson = localStorage.getItem('potrero_user')
if (token && userJson) setUser(JSON.parse(userJson))
setLoading(false)
}, [])


const login = async (usernameOrEmail, password) => {
	const res = await api.post('/autenticacion/iniciar-sesion', { usernameOrEmail, password })
localStorage.setItem('potrero_token', res.data.token)
localStorage.setItem('potrero_user', JSON.stringify(res.data.user))
setUser(res.data.user)
return res.data
}


const register = async (username, email, password) => {
	const res = await api.post('/autenticacion/registro', { username, email, password })
localStorage.setItem('potrero_token', res.data.token)
localStorage.setItem('potrero_user', JSON.stringify(res.data.user))
setUser(res.data.user)
return res.data
}


const logout = () => {
localStorage.removeItem('potrero_token')
localStorage.removeItem('potrero_user')
setUser(null)
}


return (
<AuthContext.Provider value={{ user, loading, login, register, logout }}>
{children}
</AuthContext.Provider>
)
}


export const useAuth = () => useContext(AuthContext)