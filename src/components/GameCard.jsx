// --- frontend/src/components/GameCard.jsx ---
import React from 'react'
import { Link } from 'react-router-dom'

const API_URL = "http://localhost:5000";

export default function GameCard({ game }) {
  return (
    <div className="bg-gray-800 p-4 rounded shadow-md">
      <img 
        src={
          game.image 
            ? `${API_URL}${game.image}` 
            : '/placeholder.png'
        } 
        alt={game.name} 
        className="w-full h-40 object-cover rounded" 
      />

      <h3 className="mt-2 font-semibold">{game.name}</h3>
      <p className="text-sm text-gray-300">
        {game.genre} • {game.platform}
      </p>

      <div className="flex items-center justify-between mt-3">
        <span className="font-bold">${game.price}</span>
        <Link 
          to={`/games/${game._id}`} 
          className="px-2 py-1 bg-blue-600 rounded text-sm"
        >
          Ver
        </Link>
      </div>
    </div>
  )
}
    