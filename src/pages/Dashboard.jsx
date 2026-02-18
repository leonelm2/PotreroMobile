import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.isAdmin
  const [stats, setStats] = useState({ disciplines: 0, teams: 0, championships: 0 })
  const [championships, setChampionships] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [disc, team, champ] = await Promise.all([
          api.get('/disciplines'),
          api.get('/teams'),
          api.get('/championships')
        ])
        setStats({
          disciplines: disc.data.length,
          teams: team.data.length,
          championships: champ.data.length
        })
        setChampionships(champ.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="pill">Temporada 2026</div>
          <h1 className="section-title mt-3">Panel principal</h1>
          <p className="text-white/70 max-w-xl">
            Administra disciplinas, equipos y campeonatos desde un mismo lugar. Lleva los resultados al instante.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/teams" className="btn-outline">Ver equipos</Link>
          {isAdmin && <Link to="/championships" className="btn-primary">Nuevo campeonato</Link>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <div className="card p-5">
          <div className="text-sm text-white/60">Disciplinas</div>
          <div className="text-3xl mt-2 font-bold">{stats.disciplines}</div>
          <p className="text-white/60 text-sm mt-2">Control total de deportes y formatos.</p>
        </div>
        <div className="card p-5">
          <div className="text-sm text-white/60">Equipos</div>
          <div className="text-3xl mt-2 font-bold">{stats.teams}</div>
          <p className="text-white/60 text-sm mt-2">Registro de planteles y entrenadores.</p>
        </div>
        <div className="card p-5">
          <div className="text-sm text-white/60">Campeonatos</div>
          <div className="text-3xl mt-2 font-bold">{stats.championships}</div>
          <p className="text-white/60 text-sm mt-2">Competencias activas y en planificacion.</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl">Campeonatos recientes</h2>
        <div className="grid gap-4 mt-4">
          {championships.length === 0 && (
            <div className="card p-6 text-white/60">No hay campeonatos creados.</div>
          )}
          {championships.map(champ => (
            <div key={champ._id} className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl">{champ.name}</div>
                <div className="text-sm text-white/60">{champ.discipline?.name} · Estado: {champ.status}</div>
              </div>
              <div className="flex gap-3 mt-3 md:mt-0">
                <Link to={`/championships/${champ._id}/standings`} className="btn-ghost">Tabla</Link>
                <Link to={`/championships/${champ._id}/bracket`} className="btn-ghost">Llaves</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
