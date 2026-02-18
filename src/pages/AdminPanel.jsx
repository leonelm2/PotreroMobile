import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import api from '../api'

export default function AdminPanel() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [games, setGames] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.isAdmin) return

    (async () => {
      try {
        const u = await api.get('/admin/users')
        setUsers(u.data)

        const g = await api.get('/games')
        setGames(g.data)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [user])

  const deleteUser = async (id) => {
    if (!confirm('Eliminar usuario?')) return

    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(s => s.filter(x => x._id !== id))
    } catch (err) {
      alert('Error al eliminar usuario')
    }
  }

  const deleteGame = async (id) => {
    if (!confirm('Eliminar juego?')) return

    try {
      await api.delete(`/games/${id}`)
      setGames(gs => gs.filter(x => x._id !== id))
    } catch (err) {
      alert('Error al eliminar juego')
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Panel Admin</h1>

      {/* ================= USUARIOS ================= */}
      <section className="mb-6">
        <h2 className="text-xl">Usuarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {users.map(u => (
            <div key={u._id} className="bg-gray-800 p-3 rounded">
              <div className="font-semibold">{u.username}</div>
              <div className="text-sm text-gray-400">{u.email}</div>
              <div className="mt-2">
                <button
                  onClick={() => deleteUser(u._id)}
                  className="px-2 py-1 bg-red-600 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= JUEGOS ================= */}
      <section>
        <h2 className="text-xl">Juegos (CRUD básico)</h2>

        {/* BOTÓN CREAR JUEGO */}
        <div className="mt-3 mb-4">
          <button
            onClick={() => navigate('/admin/add')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Crear juego
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map(g => (
            <div key={g._id} className="bg-gray-800 p-3 rounded">
              <div className="font-semibold">{g.name}</div>
              <div className="text-sm text-gray-400">${g.price}</div>

              <div className="mt-2">
                <button
                  onClick={() => navigate(`/admin/edit/${g._id}`)}
                  className="px-2 py-1 bg-yellow-600 rounded text-sm mr-2"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteGame(g._id)}
                  className="px-2 py-1 bg-red-600 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
