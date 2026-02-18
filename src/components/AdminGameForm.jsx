// frontend/src/components/AdminGameForm.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminGameForm({ gameId, onSaved }) {
  const { token } = useAuth();

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    platform: ""
  });
  const [imageFile, setImageFile] = useState(null);

  // Cargar los datos del juego si estamos editando
  const loadGame = async () => {
    if (!gameId) return;
    try {
      const res = await axios.get(`/api/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData({
        name: res.data.name || "",
        description: res.data.description || "",
        price: res.data.price || "",
        category: res.data.category || "",
        platform: res.data.platform || ""
      });
    } catch (err) {
      console.error('Error cargando juego', err);
    }
  };

  useEffect(() => {
    loadGame();
  }, [gameId]);

  // Enviar formulario
  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (gameId) {
        // Editar juego
        await axios.put(`/api/games/${gameId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Crear juego
        await axios.post(`/api/games`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Limpiar formulario
      setData({ name: "", description: "", price: "", category: "", platform: "" });
      setImageFile(null);

      // Callback al padre
      onSaved();
    } catch (err) {
      console.error('Error guardando juego', err);
      alert(err.response?.data?.msg || 'Error guardando juego');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-neutral-900 rounded-lg shadow-md">
      <h2 className="text-xl font-bold">{gameId ? "Editar juego" : "Agregar juego"}</h2>

      <input
        className="input"
        placeholder="Nombre..."
        value={data.name}
        onChange={e => setData({ ...data, name: e.target.value })}
      />
      <input
        className="input"
        type="file"
        onChange={e => setImageFile(e.target.files[0])}
      />
      <input
        className="input"
        placeholder="Categoría"
        value={data.category}
        onChange={e => setData({ ...data, category: e.target.value })}
      />
      <input
        className="input"
        placeholder="Plataforma"
        value={data.platform}
        onChange={e => setData({ ...data, platform: e.target.value })}
      />
      <input
        className="input"
        type="number"
        placeholder="Precio"
        value={data.price}
        onChange={e => setData({ ...data, price: e.target.value })}
      />
      <textarea
        className="input"
        placeholder="Descripción"
        value={data.description}
        onChange={e => setData({ ...data, description: e.target.value })}
      />

      <button className="btn-primary w-full">
        {gameId ? "Guardar cambios" : "Crear juego"}
      </button>
    </form>
  );
}
