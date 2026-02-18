import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'


export default function Login() {
const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
const [error, setError] = useState('')
const { login } = useAuth()
const nav = useNavigate()


const handle = async (e) => {
e.preventDefault()
try {
await login(form.usernameOrEmail, form.password)
nav('/')
} catch (err) {
setError(err.response?.data?.msg || 'Error al iniciar sesión')
}
}


return (
<div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
	<div className="card p-8 w-full max-w-md">
		<div className="pill">Acceso</div>
		<h2 className="section-title mt-3">Bienvenido a POTRERO</h2>
		<p className="text-white/60 text-sm">Inicia sesion para gestionar tus torneos.</p>
		<form onSubmit={handle} className="space-y-4 mt-6">
			<input
				value={form.usernameOrEmail}
				onChange={e => setForm({ ...form, usernameOrEmail: e.target.value })}
				placeholder="Usuario o email"
				className="input"
			/>
			<input
				type="password"
				value={form.password}
				onChange={e => setForm({ ...form, password: e.target.value })}
				placeholder="Contrasena"
				className="input"
			/>
			{error && <div className="text-red-400 text-sm">{error}</div>}
			<button className="btn-primary w-full" type="submit">Entrar</button>
		</form>
	</div>
</div>
)
}