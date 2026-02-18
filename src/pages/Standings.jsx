import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Standings() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.isAdmin
  const [championship, setChampionship] = useState(null)
  const [standings, setStandings] = useState([])
  const [matches, setMatches] = useState([])
  const [editing, setEditing] = useState({})

  const load = async () => {
    const [champ, table, matchRes] = await Promise.all([
      api.get(`/championships/${id}`),
      api.get(`/championships/${id}/standings`),
      api.get('/matches', { params: { championship: id, phase: 'group' } })
    ])
    setChampionship(champ.data)
    setStandings(table.data.standings || [])
    setMatches(matchRes.data)
  }

  useEffect(() => {
    load()
  }, [id])

  const updateScore = (matchId, field, value) => {
    setEditing(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value }
    }))
  }

  const saveResult = async (matchId) => {
    const payload = editing[matchId]
    if (!payload) return
    await api.put(`/matches/${matchId}/result`, payload)
    setEditing(prev => ({ ...prev, [matchId]: undefined }))
    load()
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="pill">Tabla de posiciones</div>
        <h1 className="section-title">{championship?.name || 'Campeonato'}</h1>
        <p className="text-white/60">Consulta los puntos y resultados de la fase de grupos.</p>
      </div>

      <div className="grid gap-6 mt-8">
        {standings.map(group => (
          <div key={group.name} className="card p-5">
            <h2 className="text-2xl">{group.name}</h2>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm">
                <thead className="text-white/60">
                  <tr>
                    <th className="text-left py-2">Equipo</th>
                    <th>PJ</th>
                    <th>G</th>
                    <th>E</th>
                    <th>P</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map(row => (
                    <tr key={row.teamId} className="border-t border-white/10">
                      <td className="py-2 text-left">{row.teamName}</td>
                      <td className="text-center">{row.played}</td>
                      <td className="text-center">{row.wins}</td>
                      <td className="text-center">{row.draws}</td>
                      <td className="text-center">{row.losses}</td>
                      <td className="text-center">{row.goalsFor}</td>
                      <td className="text-center">{row.goalsAgainst}</td>
                      <td className="text-center">{row.goalDiff}</td>
                      <td className="text-center font-semibold">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl">Partidos de grupo</h2>
        <div className="grid gap-3 mt-4">
          {matches.map(match => (
            <div key={match._id} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-white/60">{match.groupName}</div>
                <div className="text-lg">{match.homeTeam?.name} vs {match.awayTeam?.name}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 md:mt-0">
                <input
                  type="number"
                  className="input w-20"
                  placeholder="0"
                  value={editing[match._id]?.homeScore ?? match.homeScore ?? ''}
                  onChange={(e) => updateScore(match._id, 'homeScore', Number(e.target.value))}
                  disabled={!isAdmin}
                />
                <span className="text-white/60">-</span>
                <input
                  type="number"
                  className="input w-20"
                  placeholder="0"
                  value={editing[match._id]?.awayScore ?? match.awayScore ?? ''}
                  onChange={(e) => updateScore(match._id, 'awayScore', Number(e.target.value))}
                  disabled={!isAdmin}
                />
                {isAdmin && (
                  <button className="btn-outline" onClick={() => saveResult(match._id)}>Guardar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
