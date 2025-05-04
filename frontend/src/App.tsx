// src/App.tsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'

function App() {
  const [role, setRole] = useState('')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage setRole={setRole} />} />
      </Routes>
    </Router>
  )
}

export default App
