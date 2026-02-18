import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ✔ RUTA CORRECTA SEGÚN TU ESTRUCTURA REAL

export default function AdminGameList() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  const loadGames = async () => {
    try {
      const res = await api.get("/games");
      setGames(res.data);
    } catch (err) {
      console.error("Error al cargar juegos:", err);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`); // ✔ Esto lleva a tu pantalla AdminEditGame.jsx
  };

  const deleteGame = async (id) => {
      if (!window.confirm("¿Seguro deseas eliminar este juego?")) return;

      try {
        await api.delete(`/admin/delete-game/${id}`);
        loadGames();
      } catch (err) {
        console.error("Error al eliminar juego:", err);
      }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Administrar Juegos</h1>

      <button
        className="bg-green-600 px-4 py-2 rounded text-white mb-4"
        onClick={() => navigate("/admin/add")}
      >
        Crear Juego
      </button>

      <ul className="space-y-4">
        {games.map((game) => (
          <li
            key={game._id}
            className="bg-neutral-800 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="text-xl font-bold">{game.name}</p>
              <p className="opacity-70">${game.price}</p>
            </div>

            <div className="flex gap-3">
              <button
                className="bg-blue-600 px-3 py-1 rounded text-white"
                onClick={() => handleEdit(game._id)}
              >
                Editar
              </button>

              <button
                className="bg-red-600 px-3 py-1 rounded text-white"
                onClick={() => deleteGame(game._id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
