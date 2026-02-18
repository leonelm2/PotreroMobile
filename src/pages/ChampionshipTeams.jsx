import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function ChampionshipTeams() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.isAdmin
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [editingTeam, setEditingTeam] = useState(null)
  const [teamName, setTeamName] = useState('')

  const load = async () => {
    try {
      const res = await api.get(`/championships/${id}/teams`)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.msg || 'No se pudieron cargar los equipos')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const startEditPlayer = (player) => {
    setEditingPlayer(player._id)
    setPlayerName(player.name)
  }

  const savePlayer = async () => {
    if (!editingPlayer) return
    await api.put(`/players/${editingPlayer}`, { name: playerName })
    setEditingPlayer(null)
    setPlayerName('')
    load()
  }

  const startEditTeam = (team) => {
    setEditingTeam(team._id)
    setTeamName(team.name)
  }

  const saveTeam = async () => {
    if (!editingTeam) return
    await api.put(`/teams/${editingTeam}`, { name: teamName })
    setEditingTeam(null)
    setTeamName('')
    load()
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="card p-6 text-red-300">{error}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="pill">Equipos y jugadores</div>
        <h1 className="section-title">{data?.championship?.name || 'Campeonato'}</h1>
        <p className="text-white/60">Disciplina: {data?.championship?.discipline?.name || '-'}</p>
      </div>

      <div className="grid gap-4 mt-8">
        {data?.teams?.length === 0 && (
          <div className="card p-6 text-white/60">No hay equipos cargados para este torneo.</div>
        )}
        {data?.teams?.map(team => (
          <div key={team._id} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                {editingTeam === team._id ? (
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input"
                  />
                ) : (
                  <div className="text-xl">{team.name}</div>
                )}
                <div className="text-sm text-white/60">{team.discipline?.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="pill">{team.players.length} jugadores</div>
                {isAdmin && (
                  editingTeam === team._id ? (
                    <button className="btn-outline" onClick={saveTeam}>Guardar</button>
                  ) : (
                    <button className="btn-ghost" onClick={() => startEditTeam(team)}>Editar equipo</button>
                  )
                )}
              </div>
            </div>
            <div className="grid gap-2 mt-4 md:grid-cols-2">
              {team.players.map(player => (
                <div key={player._id} className="card-solid p-3 flex items-center justify-between gap-3">
                  <div>
                    {editingPlayer === player._id ? (
                      <input
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="input"
                      />
                    ) : (
                      <div className="font-semibold">{player.name}</div>
                    )}
                    <div className="text-xs text-white/60">{player.position || 'Sin posicion'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-white/70">#{player.number || '-'}</div>
                    {isAdmin && (
                      editingPlayer === player._id ? (
                        <button className="btn-outline" onClick={savePlayer}>Guardar</button>
                      ) : (
                        <button className="btn-ghost" onClick={() => startEditPlayer(player)}>Editar</button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
