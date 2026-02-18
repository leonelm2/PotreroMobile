import React, { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Teams() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.isAdmin
  const [disciplines, setDisciplines] = useState([])
  const [teams, setTeams] = useState([])
  const [form, setForm] = useState({ name: '', discipline: '', logoUrl: '' })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [players, setPlayers] = useState([])
  const [playerForm, setPlayerForm] = useState({ name: '', team: '', number: '', position: '', age: '' })
  const [playerError, setPlayerError] = useState('')

  const load = async () => {
    const disc = await api.get('/disciplines')
    setDisciplines(disc.data)
    const teamRes = await api.get('/teams')
    setTeams(teamRes.data)
    const playerRes = await api.get('/players')
    setPlayers(playerRes.data)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.put(`/teams/${editing}`, form)
      } else {
        await api.post('/teams', form)
      }
      setForm({ name: '', discipline: '', logoUrl: '' })
      setEditing(null)
      load()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar')
    }
  }

  const remove = async (id) => {
    if (!confirm('Eliminar equipo?')) return
    await api.delete(`/teams/${id}`)
    load()
  }

  const addPlayer = async (e) => {
    e.preventDefault()
    setPlayerError('')
    try {
      await api.post('/players', playerForm)
      setPlayerForm({ name: '', team: '', number: '', position: '', age: '' })
      load()
    } catch (err) {
      setPlayerError(err.response?.data?.msg || 'Error al agregar jugador')
    }
  }

  const playersByTeam = players.reduce((acc, player) => {
    const teamId = player.team?._id || player.team
    if (!teamId) return acc
    acc[teamId] = acc[teamId] || []
    acc[teamId].push(player)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="pill">Planteles</div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="section-title">Gestion de equipos</h1>
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null)
              setForm({ name: '', discipline: '', logoUrl: '' })
            }}
          >
            Agregar equipo
          </button>
        </div>
        <p className="text-white/60 max-w-2xl">Crea equipos y asocialos a una disciplina deportiva.</p>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-[1.1fr_1.9fr]">
        <div className="space-y-6">
          <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="text-2xl">{editing ? 'Editar equipo' : 'Nuevo equipo'}</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre del equipo"
            className="input"
          />
          <select
            value={form.discipline}
            onChange={(e) => setForm({ ...form, discipline: e.target.value })}
            className="select"
          >
            <option value="">Selecciona disciplina</option>
            {disciplines.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <input
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="URL del logo (opcional)"
            className="input"
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button className="btn-primary" type="submit">Guardar</button>
            {editing && (
              <button
                className="btn-outline"
                type="button"
                onClick={() => {
                  setEditing(null)
                  setForm({ name: '', discipline: '', logoUrl: '' })
                }}
              >
                Cancelar
              </button>
            )}
          </div>
          </form>

          <form onSubmit={addPlayer} className="card p-6 space-y-4">
            <h2 className="text-2xl">Agregar jugador</h2>
            <input
              value={playerForm.name}
              onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
              placeholder="Nombre del jugador"
              className="input"
            />
            <select
              value={playerForm.team}
              onChange={(e) => setPlayerForm({ ...playerForm, team: e.target.value })}
              className="select"
            >
              <option value="">Selecciona equipo</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={playerForm.number}
                onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                placeholder="Numero"
                type="number"
                className="input"
              />
              <input
                value={playerForm.age}
                onChange={(e) => setPlayerForm({ ...playerForm, age: e.target.value })}
                placeholder="Edad"
                type="number"
                className="input"
              />
            </div>
            <input
              value={playerForm.position}
              onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
              placeholder="Posicion"
              className="input"
            />
            {playerError && <div className="text-red-400 text-sm">{playerError}</div>}
            <button className="btn-primary" type="submit">Agregar jugador</button>
          </form>
        </div>

        <div className="space-y-4">
          {teams.length === 0 && (
            <div className="card p-6 text-white/60">No hay equipos registrados.</div>
          )}
          {teams.map(team => (
            <div key={team._id} className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 grid place-items-center text-lg">{team.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="text-xl">{team.name}</div>
                  <div className="text-sm text-white/60">
                    {team.discipline?.name} · {playersByTeam[team._id]?.length || 0} jugadores
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setEditing(team._id)
                    setForm({
                      name: team.name,
                      discipline: team.discipline?._id || '',
                      logoUrl: team.logoUrl || ''
                    })
                  }}
                >
                  Editar
                </button>
                <button className="btn-outline" onClick={() => remove(team._id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
