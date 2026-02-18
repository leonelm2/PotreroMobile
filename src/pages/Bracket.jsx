import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

const roundLabels = {
  quarterfinal: 'Cuartos de final',
  semifinal: 'Semifinales',
  final: 'Final'
}

export default function Bracket() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.isAdmin
  const [matches, setMatches] = useState([])
  const [editing, setEditing] = useState({})

  const load = async () => {
    const res = await api.get(`/championships/${id}/bracket`)
    setMatches(res.data)
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

  const grouped = matches.reduce((acc, match) => {
    acc[match.round] = acc[match.round] || []
    acc[match.round].push(match)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2">
        <div className="pill">Fase eliminatoria</div>
        <h1 className="section-title">Llaves del campeonato</h1>
        <p className="text-white/60">Carga resultados para avanzar en las llaves.</p>
      </div>

      <div className="grid gap-6 mt-8">
        {Object.keys(grouped).length === 0 && (
          <div className="card p-6 text-white/60">Todavia no hay llaves generadas.</div>
        )}
        {Object.entries(grouped).map(([round, roundMatches]) => (
          <div key={round} className="card p-5">
            <h2 className="text-2xl">{roundLabels[round] || round}</h2>
            <div className="grid gap-3 mt-4">
              {roundMatches.map(match => (
                <div key={match._id} className="card-solid p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-lg">{match.homeTeam?.name || 'Por definir'} vs {match.awayTeam?.name || 'Por definir'}</div>
                    <div className="text-sm text-white/50">Estado: {match.status}</div>
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
        ))}
      </div>
    </div>
  )
}
