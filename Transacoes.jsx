import { useState, useEffect } from 'react'
import { transacoesAPI, categoriasAPI } from '../services/api'
import { format } from 'date-fns'

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrando, setMostrando] = useState('listar')
  const [filtro, setFiltro] = useState({
    categoria_id: '',
    tipo: '',
  })

  const [formulario, setFormulario] = useState({
    categoria_id: '',
    descricao: '',
    valor: '',
    tipo: 'despesa',
    data_transacao: format(new Date(), 'yyyy-MM-dd'),
    status: 'pago',
  })

  useEffect(() => {
    carregarDados()
  }, [filtro])

  const carregarDados = async () => {
    try {
      setCarregando(true)
      const [resTransacoes, resCategorias] = await Promise.all([
        transacoesAPI.listar(filtro),
        categoriasAPI.listar(),
      ])
      setTransacoes(resTransacoes.data || [])
      setCategorias(resCategorias.data || [])
      setErro(null)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setErro('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  const handleAdicionarTransacao = async (e) => {
    e.preventDefault()
    if (!formulario.categoria_id || !formulario.descricao || !formulario.valor) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      await transacoesAPI.criar({
        ...formulario,
        valor: parseFloat(formulario.valor),
        categoria_id: parseInt(formulario.categoria_id),
      })
      setFormulario({
        categoria_id: '',
        descricao: '',
        valor: '',
        tipo: 'despesa',
        data_transacao: format(new Date(), 'yyyy-MM-dd'),
        status: 'pago',
      })
      setMostrando('listar')
      carregarDados()
    } catch (err) {
      console.error('Erro ao adicionar transação:', err)
      alert('Erro ao adicionar transação')
    }
  }

  const handleDeletarTransacao = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta transação?')) return

    try {
      await transacoesAPI.deletar(id)
      carregarDados()
    } catch (err) {
      console.error('Erro ao deletar transação:', err)
      alert('Erro ao deletar transação')
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const categoriaSelecionada = categorias.find(c => c.id === parseInt(formulario.categoria_id))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Transações</h1>
        <button
          onClick={() => setMostrando(mostrando === 'listar' ? 'adicionar' : 'listar')}
          className="btn btn-primary"
        >
          {mostrando === 'listar' ? '+ Adicionar Transação' : 'Voltar'}
        </button>
      </div>

      {mostrando === 'adicionar' && (
        <div className="card max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Transação</h2>
          <form onSubmit={handleAdicionarTransacao} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="label">Categoria *</label>
                <select
                  value={formulario.categoria_id}
                  onChange={(e) => setFormulario({ ...formulario, categoria_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias
                    .filter(c => c.tipo === formulario.tipo)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Descrição *</label>
              <input
                type="text"
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                className="input"
                placeholder="Ex: Compra no supermercado"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.valor}
                  onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="label">Data *</label>
                <input
                  type="date"
                  value={formulario.data_transacao}
                  onChange={(e) => setFormulario({ ...formulario, data_transacao: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={formulario.status}
                onChange={(e) => setFormulario({ ...formulario, status: e.target.value })}
                className="input"
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Adicionar Transação
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
          {/* Filtros */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Tipo</label>
                <select
                  value={filtro.tipo}
                  onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
                  className="input"
                >
                  <option value="">Todos</option>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              <div>
                <label className="label">Categoria</label>
                <select
                  value={filtro.categoria_id}
                  onChange={(e) => setFiltro({ ...filtro, categoria_id: e.target.value })}
                  className="input"
                >
                  <option value="">Todas</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFiltro({ categoria_id: '', tipo: '' })}
                  className="btn btn-secondary w-full"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Transações */}
          <div className="card">
            {carregando ? (
              <p className="text-center py-8 text-gray-600">Carregando...</p>
            ) : transacoes.length === 0 ? (
              <p className="text-center py-8 text-gray-600">Nenhuma transação encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((t, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {format(new Date(t.data_transacao), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.descricao}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{t.categoria_nome}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {t.tipo}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold text-right ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.tipo === 'receita' ? '+' : '-'} {formatarMoeda(t.valor)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeletarTransacao(t.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
