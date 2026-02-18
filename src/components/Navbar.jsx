// --- frontend/src/components/Navbar.jsx ---
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const isAdmin = user?.role === 'admin' || user?.isAdmin

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-3 text-white">
          <span className="h-10 w-10 rounded-xl bg-red-600 text-xl font-black grid place-items-center">P</span>
          <div>
            <div className="text-2xl tracking-widest">POTRERO</div>
            <div className="text-xs uppercase text-white/60">Gestion de torneos</div>
          </div>
        </Link>

        {user && (
          <div className="hidden items-center gap-4 md:flex">
            <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
            <Link to="/teams" className="btn-ghost">Equipos</Link>
            <Link to="/championships" className="btn-ghost">Campeonatos</Link>
            {isAdmin && <Link to="/disciplines" className="btn-ghost">Disciplinas</Link>}
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold">{user.username}</div>
                <div className="text-xs text-white/60">{isAdmin ? 'Administrador' : 'Entrenador'}</div>
              </div>
              <button
                onClick={() => {
                  logout()
                  nav('/login')
                }}
                className="btn-outline"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Ingresar</Link>
              <Link to="/register" className="btn-primary">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}