import { useState, useEffect } from 'react'
import { transacoesAPI } from '../services/api'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function Relatorios() {
  const [transacoes, setTransacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [periodo, setPeriodo] = useState('mes')
  const [ano, setAno] = useState(new Date().getFullYear())

  useEffect(() => {
    carregarTransacoes()
  }, [periodo, ano])

  const carregarTransacoes = async () => {
    try {
      setCarregando(true)
      let dataInicio, dataFim

      if (periodo === 'mes') {
        const hoje = new Date()
        dataInicio = startOfMonth(hoje)
        dataFim = endOfMonth(hoje)
      } else if (periodo === 'ano') {
        dataInicio = startOfYear(new Date(ano, 0, 1))
        dataFim = endOfYear(new Date(ano, 11, 31))
      }

      const response = await transacoesAPI.listar({
        data_inicio: format(dataInicio, 'yyyy-MM-dd'),
        data_fim: format(dataFim, 'yyyy-MM-dd'),
      })

      setTransacoes(response.data || [])
    } catch (err) {
      console.error('Erro ao carregar transações:', err)
    } finally {
      setCarregando(false)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  // Agrupar por mês
  const dadosPorMes = {}
  transacoes.forEach(t => {
    const mes = format(new Date(t.data_transacao), 'MMM/yy', { locale: ptBR })
    if (!dadosPorMes[mes]) {
      dadosPorMes[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 }
    }
    if (t.tipo === 'receita') {
      dadosPorMes[mes].receitas += t.valor
    } else {
      dadosPorMes[mes].despesas += t.valor
    }
    dadosPorMes[mes].saldo = dadosPorMes[mes].receitas - dadosPorMes[mes].despesas
  })

  const dadosGrafico = Object.values(dadosPorMes)

  // Resumo por categoria
  const resumoPorCategoria = {}
  transacoes.forEach(t => {
    if (!resumoPorCategoria[t.categoria_nome]) {
      resumoPorCategoria[t.categoria_nome] = { receitas: 0, despesas: 0 }
    }
    if (t.tipo === 'receita') {
      resumoPorCategoria[t.categoria_nome].receitas += t.valor
    } else {
      resumoPorCategoria[t.categoria_nome].despesas += t.valor
    }
  })

  // Totais
  const totais = transacoes.reduce(
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

  const saldo = totais.receitas - totais.despesas

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Relatórios</h1>

        {/* Controles */}
        <div className="card bg-gray-50 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="label">Período</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="input"
              >
                <option value="mes">Mês Atual</option>
                <option value="ano">Ano</option>
              </select>
            </div>

            {periodo === 'ano' && (
              <div>
                <label className="label">Ano</label>
                <input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(parseInt(e.target.value))}
                  className="input"
                  min="2020"
                  max={new Date().getFullYear()}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-gray-600 font-medium mb-2">Total de Receitas</p>
          <p className="text-3xl font-bold text-green-600">{formatarMoeda(totais.receitas)}</p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm text-gray-600 font-medium mb-2">Total de Despesas</p>
          <p className="text-3xl font-bold text-red-600">{formatarMoeda(totais.despesas)}</p>
        </div>

        <div className={`card bg-gradient-to-br ${saldo >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <p className="text-sm text-gray-600 font-medium mb-2">Saldo</p>
          <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      {carregando ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      ) : dadosGrafico.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhuma transação neste período</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Evolução Mensal</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Legend />
                <Area type="monotone" dataKey="receitas" fill="#10b981" stroke="#10b981" />
                <Area type="monotone" dataKey="despesas" fill="#ef4444" stroke="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Resumo por Categoria */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo por Categoria</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Receitas</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Despesas</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resumoPorCategoria).map(([categoria, valores], idx) => {
                    const saldoCategoria = valores.receitas - valores.despesas
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{categoria}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                          {formatarMoeda(valores.receitas)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                          {formatarMoeda(valores.despesas)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${saldoCategoria >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatarMoeda(saldoCategoria)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
