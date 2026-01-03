import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transacoes from './pages/Transacoes'
import Categorias from './pages/Categorias'
import Relatorios from './pages/Relatorios'
import './App.css'

function App() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="container flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Finança Pessoal</h1>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Dashboard
              </Link>
              <Link to="/transacoes" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Transações
              </Link>
              <Link to="/categorias" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Categorias
              </Link>
              <Link to="/relatorios" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Relatórios
              </Link>
            </nav>

            {/* Menu Mobile */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Menu Mobile Dropdown */}
          {menuAberto && (
            <nav className="md:hidden bg-gray-50 border-t border-gray-200 py-4">
              <div className="container flex flex-col gap-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/transacoes" className="text-gray-700 hover:text-blue-600 font-medium">
                  Transações
                </Link>
                <Link to="/categorias" className="text-gray-700 hover:text-blue-600 font-medium">
                  Categorias
                </Link>
                <Link to="/relatorios" className="text-gray-700 hover:text-blue-600 font-medium">
                  Relatórios
                </Link>
              </div>
            </nav>
          )}
        </header>

        {/* Main Content */}
        <main className="container py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transacoes" element={<Transacoes />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container py-8 text-center text-gray-600">
            <p>&copy; 2025 Controle Financeiro Pessoal. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
