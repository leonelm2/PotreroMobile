import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'


export default function Register() {
const [form, setForm] = useState({ username: '', email: '', password: '' })
const [error, setError] = useState('')
const { register } = useAuth()
const nav = useNavigate()


const submit = async (e) => {
e.preventDefault()
try {
await register(form.username, form.email, form.password)
nav('/')
} catch (err) {
setError(err.response?.data?.msg || 'Error al registrar')
}
}


return (
<div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
	<div className="card p-8 w-full max-w-md">
		<div className="pill">Registro</div>
		<h2 className="section-title mt-3">Crear cuenta</h2>
		<p className="text-white/60 text-sm">Registrate como entrenador para gestionar tus equipos.</p>
		<form onSubmit={submit} className="space-y-4 mt-6">
			<input
				value={form.username}
				onChange={e => setForm({ ...form, username: e.target.value })}
				placeholder="Usuario"
				className="input"
			/>
			<input
				value={form.email}
				onChange={e => setForm({ ...form, email: e.target.value })}
				placeholder="Email"
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
			<button className="btn-primary w-full" type="submit">Crear cuenta</button>
		</form>
	</div>
</div>
)
}