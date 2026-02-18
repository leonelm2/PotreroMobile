import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Disciplines from './pages/Disciplines'
import Teams from './pages/Teams'
import Championships from './pages/Championships'
import Standings from './pages/Standings'
import Bracket from './pages/Bracket'
import ChampionshipTeams from './pages/ChampionshipTeams'
import { useAuth } from './auth/AuthProvider'



function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  const isAdmin = user.role === 'admin' || user.isAdmin
  return isAdmin ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <div className="min-h-screen bg-ash text-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/disciplines" element={
          <AdminRoute>
            <Disciplines />
          </AdminRoute>
        } />

        <Route path="/teams" element={
          <PrivateRoute>
            <Teams />
          </PrivateRoute>
        } />

        <Route path="/championships" element={
          <PrivateRoute>
            <Championships />
          </PrivateRoute>
        } />

        <Route path="/championships/:id/standings" element={
          <PrivateRoute>
            <Standings />
          </PrivateRoute>
        } />

        <Route path="/championships/:id/bracket" element={
          <PrivateRoute>
            <Bracket />
          </PrivateRoute>
        } />

        <Route path="/championships/:id/teams" element={
          <PrivateRoute>
            <ChampionshipTeams />
          </PrivateRoute>
        } />
      </Routes>

    </div>
  )
}
