import { useState, useEffect } from 'react'
import { transacoesAPI } from '../services/api'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const [transacoes, setTransacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mes, setMes] = useState(new Date())

  useEffect(() => {
    carregarTransacoes()
  }, [mes])

  const carregarTransacoes = async () => {
    try {
      setCarregando(true)
      const dataInicio = startOfMonth(mes)
      const dataFim = endOfMonth(mes)
      
      const response = await transacoesAPI.listar({
        data_inicio: format(dataInicio, 'yyyy-MM-dd'),
        data_fim: format(dataFim, 'yyyy-MM-dd'),
      })
      
      setTransacoes(response.data || [])
      setErro(null)
    } catch (err) {
      console.error('Erro ao carregar transações:', err)
      setErro('Erro ao carregar dados')
      setTransacoes([])
    } finally {
      setCarregando(false)
    }
  }

  // Calcular resumo
  const resumo = transacoes.reduce(
    (acc, t) => {
      if (t.tipo === 'receita') {
        acc.receitas += t.valor
      } else {
        acc.despesas += t.valor
      }
      return acc
    },
    { receitas: 0, despesas: 0 }
  )

  const saldo = resumo.receitas - resumo.despesas

  // Dados para gráfico de receitas vs despesas
  const dadosGraficoBarras = [
    {
      mes: format(mes, 'MMM/yy', { locale: ptBR }),
      Receitas: resumo.receitas,
      Despesas: resumo.despesas,
    },
  ]

  // Dados para gráfico de pizza (despesas por categoria)
  const despesasPorCategoria = {}
  transacoes
    .filter(t => t.tipo === 'despesa')
    .forEach(t => {
      despesasPorCategoria[t.categoria_nome] = (despesasPorCategoria[t.categoria_nome] || 0) + t.valor
    })

  const dadosGraficoPizza = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
  }))

  const CORES = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1))}
            className="btn btn-secondary"
          >
            ← Anterior
          </button>
          <span className="text-lg font-semibold text-gray-700 px-4 py-2">
            {format(mes, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1))}
            className="btn btn-secondary"
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Receitas</p>
              <p className="text-3xl font-bold text-green-600">{formatarMoeda(resumo.receitas)}</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Despesas</p>
              <p className="text-3xl font-bold text-red-600">{formatarMoeda(resumo.despesas)}</p>
            </div>
            <div className="text-4xl">📉</div>
          </div>
        </div>

        <div className={`card bg-gradient-to-br ${saldo >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Saldo</p>
              <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatarMoeda(saldo)}
              </p>
            </div>
            <div className="text-4xl">{saldo >= 0 ? '✅' : '⚠️'}</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {carregando ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      ) : erro ? (
        <div className="card bg-red-50 border-red-200 text-red-700">
          <p>{erro}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Receitas vs Despesas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10b981" />
                <Bar dataKey="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza */}
          {dadosGraficoPizza.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Despesas por Categoria</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosGraficoPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatarMoeda(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosGraficoPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Últimas Transações */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Últimas Transações</h2>
        {transacoes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhuma transação neste período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.slice(0, 10).map((t, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {format(new Date(t.data_transacao), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.descricao}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.categoria_nome}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {formatarMoeda(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
