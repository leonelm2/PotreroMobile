import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Disciplines() {
  const [disciplines, setDisciplines] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/disciplines')
    setDisciplines(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.put(`/disciplines/${editing}`, form)
      } else {
        await api.post('/disciplines', form)
      }
      setForm({ name: '', description: '' })
      setEditing(null)
      load()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar')
    }
  }

  const startEdit = (discipline) => {
    setEditing(discipline._id)
    setForm({ name: discipline.name, description: discipline.description || '' })
  }

  const remove = async (id) => {
    if (!confirm('Eliminar disciplina?')) return
    await api.delete(`/disciplines/${id}`)
    load()
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="pill">Gestion central</div>
        <h1 className="section-title">Disciplinas deportivas</h1>
        <p className="text-white/60 max-w-2xl">Define el catalogo de deportes disponibles para los campeonatos.</p>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-[1.1fr_1.9fr]">
        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="text-2xl">{editing ? 'Editar disciplina' : 'Nueva disciplina'}</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre de la disciplina"
            className="input"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripcion breve"
            className="textarea"
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Guardar</button>
            {editing && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setEditing(null)
                  setForm({ name: '', description: '' })
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          {disciplines.length === 0 && (
            <div className="card p-6 text-white/60">No hay disciplinas registradas.</div>
          )}
          {disciplines.map(discipline => (
            <div key={discipline._id} className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl">{discipline.name}</div>
                <div className="text-sm text-white/60">{discipline.description || 'Sin descripcion'}</div>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                <button className="btn-ghost" onClick={() => startEdit(discipline)}>Editar</button>
                <button className="btn-outline" onClick={() => remove(discipline._id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
