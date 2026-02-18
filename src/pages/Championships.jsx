import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Championships() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.isAdmin
  const [disciplines, setDisciplines] = useState([])
  const [teams, setTeams] = useState([])
  const [championships, setChampionships] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    discipline: '',
    teams: [],
    groupCount: 2,
    qualifiersPerGroup: 2
  })
  const [error, setError] = useState('')

  const load = async () => {
    const [disc, team, champ] = await Promise.all([
      api.get('/disciplines'),
      api.get('/teams'),
      api.get('/championships')
    ])
    setDisciplines(disc.data)
    setTeams(team.data)
    setChampionships(champ.data)
  }

  useEffect(() => {
    load()
  }, [])

  const filteredTeams = useMemo(() => {
    if (!form.discipline) return []
    return teams.filter(team => team.discipline?._id === form.discipline)
  }, [teams, form.discipline])

  const toggleTeam = (id) => {
    setForm((prev) => {
      const exists = prev.teams.includes(id)
      return { ...prev, teams: exists ? prev.teams.filter(t => t !== id) : [...prev.teams, id] }
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await api.put(`/championships/${editingId}`, form)
      } else {
        await api.post('/championships', form)
      }
      setForm({ name: '', discipline: '', teams: [], groupCount: 2, qualifiersPerGroup: 2 })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al crear campeonato')
    }
  }

  const generateGroups = async (id) => {
    await api.post(`/championships/${id}/generate-groups`)
    load()
  }

  const generateBracket = async (id) => {
    await api.post(`/championships/${id}/generate-bracket`)
    load()
  }

  const advanceBracket = async (id) => {
    try {
      await api.post(`/championships/${id}/advance-knockout`)
      load()
    } catch (err) {
      alert(err.response?.data?.msg || 'No se pudo avanzar la llave')
    }
  }

  const startEdit = (champ) => {
    setEditingId(champ._id)
    setForm({
      name: champ.name,
      discipline: champ.discipline?._id || champ.discipline,
      teams: champ.teams || [],
      groupCount: champ.groupCount || 2,
      qualifiersPerGroup: champ.qualifiersPerGroup || 2
    })
  }

  const deleteChampionship = async (id) => {
    if (!confirm('Eliminar torneo?')) return
    await api.delete(`/championships/${id}`)
    load()
  }

  const finalizeChampionship = async (id) => {
    await api.put(`/championships/${id}`, { status: 'completed' })
    load()
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="pill">Organizacion</div>
        <h1 className="section-title">Gestion de campeonatos</h1>
        <p className="text-white/60 max-w-2xl">Crea campeonatos, genera grupos y administra las llaves eliminatorias.</p>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-[1.2fr_1.8fr]">
        {isAdmin ? (
          <form onSubmit={submit} className="card p-6 space-y-4">
            <h2 className="text-2xl">{editingId ? 'Editar torneo' : 'Nuevo torneo'}</h2>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del campeonato"
              className="input"
            />
            <select
              value={form.discipline}
              onChange={(e) => setForm({ ...form, discipline: e.target.value, teams: [] })}
              className="select"
            >
              <option value="">Selecciona disciplina</option>
              {disciplines.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.groupCount}
                onChange={(e) => setForm({ ...form, groupCount: Number(e.target.value) })}
                type="number"
                min="2"
                className="input"
                placeholder="Cantidad de grupos"
              />
              <input
                value={form.qualifiersPerGroup}
                onChange={(e) => setForm({ ...form, qualifiersPerGroup: Number(e.target.value) })}
                type="number"
                min="1"
                className="input"
                placeholder="Clasificados por grupo"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-white/70">Equipos disponibles</div>
              <div className="grid gap-2">
                {filteredTeams.length === 0 && (
                  <div className="text-white/50 text-sm">Selecciona una disciplina para ver equipos.</div>
                )}
                {filteredTeams.map(team => (
                  <label key={team._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.teams.includes(team._id)}
                      onChange={() => toggleTeam(team._id)}
                    />
                    <span>{team.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="flex gap-3">
              <button className="btn-primary" type="submit">Crear torneo</button>
              {editingId && (
                <button
                  className="btn-outline"
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({ name: '', discipline: '', teams: [], groupCount: 2, qualifiersPerGroup: 2 })
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="card p-6 text-white/60">
            Solo el administrador puede crear o editar torneos.
          </div>
        )}

        <div className="space-y-4">
          {championships.length === 0 && (
            <div className="card p-6 text-white/60">No hay campeonatos creados.</div>
          )}
          {championships.map(champ => (
            <div key={champ._id} className="card p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xl">{champ.name}</div>
                  <div className="text-sm text-white/60">{champ.discipline?.name} · {champ.teams?.length || 0} equipos</div>
                </div>
                <div className="text-sm text-white/60">Estado: {champ.status}</div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {isAdmin && (
                  <>
                    <button className="btn-ghost" onClick={() => generateGroups(champ._id)}>Generar grupos</button>
                    <button className="btn-ghost" onClick={() => generateBracket(champ._id)}>Generar llaves</button>
                    <button className="btn-ghost" onClick={() => advanceBracket(champ._id)}>Avanzar fase</button>
                    <button className="btn-ghost" onClick={() => startEdit(champ)}>Editar torneo</button>
                    <button className="btn-ghost" onClick={() => finalizeChampionship(champ._id)}>Finalizar torneo</button>
                    <button className="btn-outline" onClick={() => deleteChampionship(champ._id)}>Eliminar torneo</button>
                  </>
                )}
                <Link className="btn-outline" to={`/championships/${champ._id}/teams`}>Ver equipos</Link>
                <Link className="btn-outline" to={`/championships/${champ._id}/standings`}>Ver tabla</Link>
                <Link className="btn-outline" to={`/championships/${champ._id}/bracket`}>Ver llaves</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
