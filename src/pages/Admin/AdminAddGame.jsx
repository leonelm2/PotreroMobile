import { useState } from "react"
import api from "../../api"

export default function AdminAddGame() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("price", form.price)
      formData.append("description", form.description)

      if (form.image) {
        formData.append("image", form.image)
      }

      await api.post("/games", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      alert("¡Juego agregado!")
      setForm({
        name: "",
        description: "",
        price: "",
        image: null
      })
    } catch (err) {
      console.error(err)
      alert("Error al agregar el juego")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 text-white max-w-xl">
      <h2 className="text-2xl font-bold">Agregar Nuevo Juego</h2>

      <input
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        className="input"
      />

      <input
        name="price"
        placeholder="Precio"
        type="number"
        value={form.price}
        onChange={handleChange}
        className="input"
      />

      <textarea
        name="description"
        placeholder="Descripción"
        value={form.description}
        onChange={handleChange}
        className="textarea"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
        className="input"
      />

      <button type="submit" className="btn-primary">
        Subir juego
      </button>
    </form>
  )
}
