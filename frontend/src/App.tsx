import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { ApplicationBoardPage } from './pages/ApplicationBoardPage'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { SeasonHistoryPage } from './pages/SeasonHistoryPage'
import { NewSeasonPage } from './pages/NewSeasonPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/board" element={<ProtectedRoute><ApplicationBoardPage /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
        <Route path="/seasons" element={<ProtectedRoute><SeasonHistoryPage /></ProtectedRoute>} />
        <Route path="/seasons/new" element={<ProtectedRoute><NewSeasonPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
