import { useState, useEffect } from 'react'
import { categoriasAPI } from '../services/api'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrando, setMostrando] = useState('listar')
  const [formulario, setFormulario] = useState({
    nome: '',
    tipo: 'despesa',
  })

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      setCarregando(true)
      const response = await categoriasAPI.listar()
      setCategorias(response.data || [])
      setErro(null)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
      setErro('Erro ao carregar categorias')
    } finally {
      setCarregando(false)
    }
  }

  const handleAdicionarCategoria = async (e) => {
    e.preventDefault()
    if (!formulario.nome.trim()) {
      alert('Digite o nome da categoria')
      return
    }

    try {
      await categoriasAPI.criar(formulario)
      setFormulario({ nome: '', tipo: 'despesa' })
      setMostrando('listar')
      carregarCategorias()
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err)
      alert('Erro ao adicionar categoria')
    }
  }

  const handleDeletarCategoria = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return

    try {
      await categoriasAPI.deletar(id)
      carregarCategorias()
    } catch (err) {
      console.error('Erro ao deletar categoria:', err)
      alert('Erro ao deletar categoria')
    }
  }

  const receitas = categorias.filter(c => c.tipo === 'receita')
  const despesas = categorias.filter(c => c.tipo === 'despesa')

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Categorias</h1>
        <button
          onClick={() => setMostrando(mostrando === 'listar' ? 'adicionar' : 'listar')}
          className="btn btn-primary"
        >
          {mostrando === 'listar' ? '+ Adicionar Categoria' : 'Voltar'}
        </button>
      </div>

      {mostrando === 'adicionar' && (
        <div className="card max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Categoria</h2>
          <form onSubmit={handleAdicionarCategoria} className="space-y-4">
            <div>
              <label className="label">Nome *</label>
              <input
                type="text"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                className="input"
                placeholder="Ex: Alimentação"
                required
              />
            </div>

            <div>
              <label className="label">Tipo *</label>
              <select
                value={formulario.tipo}
                onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                className="input"
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setMostrando('listar')}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {mostrando === 'listar' && (
        <>
          {carregando ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : erro ? (
            <div className="card bg-red-50 border-red-200 text-red-700">
              <p>{erro}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Receitas */}
              <div className="card">
                <h2 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
                  <span>📈</span> Receitas
                </h2>
                {receitas.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Nenhuma categoria de receita</p>
                ) : (
                  <div className="space-y-3">
                    {receitas.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                        <span className="font-medium text-gray-800">{cat.nome}</span>
                        <button
                          onClick={() => handleDeletarCategoria(cat.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Deletar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Despesas */}
              <div className="card">
                <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                  <span>📉</span> Despesas
                </h2>
                {despesas.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Nenhuma categoria de despesa</p>
                ) : (
                  <div className="space-y-3">
                    {despesas.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-200">
                        <span className="font-medium text-gray-800">{cat.nome}</span>
                        <button
                          onClick={() => handleDeletarCategoria(cat.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Deletar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
