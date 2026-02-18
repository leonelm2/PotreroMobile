import React, { useEffect, useState } from 'react'
import api from '../api'
import GameCard from '../components/GameCard'


export default function Shop() {
const [games, setGames] = useState([])
const [loading, setLoading] = useState(true)


useEffect(() => { (async () => { try { const res = await api.get('/games'); setGames(res.data); } catch (err) { console.error(err) } finally { setLoading(false) } })() }, [])


return (
<div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
{loading ? <div>Cargando...</div> : games.map(g => <GameCard key={g._id} game={g} />)}
</div>
)
}