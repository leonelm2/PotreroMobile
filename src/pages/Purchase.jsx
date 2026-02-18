import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'


export default function Purchase() {
const { id } = useParams()
const [order, setOrder] = useState(null)
const [form, setForm] = useState({ cardHolder: '', cardNumber: '' })
const nav = useNavigate()


useEffect(() => { (async () => { try { const res = await api.get(`/purchases`); const o = res.data.find(x => x._id === id); if (!o) return nav('/'); setOrder(o); } catch (err) { console.error(err) } })() }, [id])


const pay = async (e) => {
e.preventDefault()
try {
const res = await api.post(`/purchases/${id}/pay`, form)
alert('Pago realizado con exito.')
nav('/')
} catch (err) {
alert(err.response?.data?.msg || 'Error en pago')
}
}


if (!order) return <div className="p-6">Cargando orden...</div>


return (
<div className="max-w-md mx-auto p-6">
<h2 className="text-2xl mb-4">Pago {order.game.name}</h2>
<p className="mb-4">Monto: <strong>${order.price}</strong></p>
<form onSubmit={pay} className="space-y-3">
<input value={form.cardHolder} onChange={e => setForm({ ...form, cardHolder: e.target.value })} placeholder="Titular" className="w-full p-2 rounded bg-gray-700" />
<input value={form.cardNumber} onChange={e => setForm({ ...form, cardNumber: e.target.value })} placeholder="Número tarjeta" className="w-full p-2 rounded bg-gray-700" />
<input value={form.cardCodigo} onChange={e => setForm({ ...form, carCodigo: e.target.value })} placeholder="Codigo" className="w-full p-2 rounded bg-gray-700" />
<input value={form.cardProvincia} onChange={e => setForm({ ...form, cardProvincia: e.target.value })} placeholder="Provincia" className="w-full p-2 rounded bg-gray-700" />
<input value={form.cardDepartamento} onChange={e => setForm({ ...form, cardDepartamento: e.target.value })} placeholder="Departamento" className="w-full p-2 rounded bg-gray-700" />
<input value={form.cardDireccion} onChange={e => setForm({ ...form, cardDireccion: e.target.value })} placeholder="Direccion de destino" className="w-full p-2 rounded bg-gray-700" />
<button className="w-full py-2 bg-blue-600 rounded">Pagar</button>
</form>
</div>
)
}