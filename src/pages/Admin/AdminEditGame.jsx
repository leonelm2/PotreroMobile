import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

export default function AdminEditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: null
  });

  useEffect(() => {
    api.get(`/games/${id}`)
      .then(res => {
        setGame({
          name: res.data.name,
          price: res.data.price,
          description: res.data.description,
          category: res.data.category,
          image: null
        });
      })
      .catch(err => console.error("ERROR GET:", err));
  }, [id]);

  const handleChange = (e) => {
    setGame({ ...game, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setGame({ ...game, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", game.name);
    formData.append("price", game.price);
    formData.append("description", game.description);
    formData.append("category", game.category);

    if (game.image) {
      formData.append("image", game.image);
    }

    try {
      await api.put(`/games/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Juego actualizado!");
      navigate("/admin/games");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el juego");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 text-white">
      <h2 className="text-2xl font-bold">Editar Juego</h2>

      <input
        name="name"
        value={game.name}
        onChange={handleChange}
        placeholder="Nombre"
        className="input"
      />

      <input
        name="price"
        value={game.price}
        onChange={handleChange}
        placeholder="Precio"
        className="input"
      />

      <textarea
        name="description"
        value={game.description}
        onChange={handleChange}
        placeholder="Descripción"
        className="textarea"
      />

      <input
        type="file"
        onChange={handleImage}
        className="input"
      />

      <button type="submit" className="btn-primary">
        Actualizar juego
      </button>
    </form>
  );
}
