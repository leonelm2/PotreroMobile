// frontend/src/pages/AdminGameManager.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminGameForm from '../components/AdminGameForm';

export default function AdminGameManager() {
  const { token } = useAuth();
  const [games, setGames] = useState([]);
  const [editing, setEditing] = useState(null);

  const loadGames = async () => {
    const res = await axios.get('/api/games', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGames(res.data);
  };

  const deleteGame = async (id) => {
    await axios.delete(`/api/games/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadGames();
  };

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Administrar Juegos</h1>

      <AdminGameForm
        gameId={editing}
        onSaved={() => {
          setEditing(null);
          loadGames();
        }}
      />

      <ul className="space-y-3">
        {games.map(g => (
          <li
            key={g._id}
            className="p-3 bg-neutral-800 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{g.name}</p>
              <p className="text-sm opacity-70">
                {g.platform} - ${g.price}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => setEditing(g._id)}>
                Editar
              </button>
              <button className="btn-danger" onClick={() => deleteGame(g._id)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
