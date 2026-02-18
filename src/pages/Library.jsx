import { useEffect, useState } from 'react'
import api from '../api'

const API_URL = "http://localhost:5000"

export default function Library() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/purchases/library/me')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl mb-6">Mi Biblioteca</h1>

      {orders.length === 0 && (
        <p className="text-gray-400">Aún no compraste ningún juego</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map(order => (
          <div key={order._id} className="bg-gray-800 p-4 rounded">
            <img
              src={
                order.image
                  ? `${API_URL}${order.image}`
                  : '/placeholder.png'
              }
              className="w-full h-40 object-cover rounded"
            />

            <h2 className="mt-3 font-semibold">
              {order.name}
            </h2>

            <p className="mt-2 text-gray-300">{order.description}</p>
            <strong className="block mt-2">${order.price}</strong>

            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token")

                  const res = await api.get(
                    `/purchases/${order._id}/download`,
                    {
                      responseType: 'blob',
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  )

                  const url = window.URL.createObjectURL(
                    new Blob([res.data])
                  )

                  const link = document.createElement('a')
                  link.href = url
                  const contentDisposition = res.headers['content-disposition'];
                  let fileName = 'juego.txt';

                  if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                    if (fileNameMatch.length === 2) {
                      fileName = fileNameMatch[1];
                    }
                  }

                  link.setAttribute('download', fileName);

                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                } catch (err) {
                  alert("No se pudo descargar el archivo")
                }
              }}
              className="mt-3 w-full bg-blue-600 py-2 rounded"
            >
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
