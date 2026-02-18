// --- frontend/src/pages/GameDetails.jsx ---
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth/AuthProvider'

const API_URL = "http://localhost:5000"

export default function GameDetails() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const nav = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/games/${id}`)
        setGame(res.data)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [id])

  const handleBuy = async () => {
    if (!user) return nav('/login')

    try {
      const res = await api.post(`/purchases/${id}`)
      nav(`/purchase/${res.data._id}`)
    } catch (err) {
      alert(err.response?.data?.msg || 'Error al crear orden')
    }
  }

  if (!game) return <div className="p-6">Cargando...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <img
        src={
          game.image 
            ? `${API_URL}${game.image}` 
            : "/placeholder.png"
        }
        alt={game.name}
        className="w-full h-64 object-cover rounded"
      />

      <h1 className="text-3xl mt-4">{game.name}</h1>
      <p className="mt-2 text-gray-300">{game.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-2xl font-bold">${game.price}</span>
        <button 
          onClick={handleBuy} 
          className="px-4 py-2 bg-green-600 rounded"
        >
          Comprar
        </button>
      </div>
    </div>
  )
}
