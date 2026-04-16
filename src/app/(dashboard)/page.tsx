/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface OverviewData {
  revenue: number
  orders: number
  clients: number
  avgTicket: number
  salesChart: { date: string; total: number }[]
}

interface ManualOrderForm {
  clientName: string
  clientEmail: string
  total_cents: number
  description: string
  createdAt: string
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

function formatBRL(value: number | undefined | null) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ManualOrderForm>({
    clientName: '',
    clientEmail: '',
    total_cents: 0,
    description: '',
    createdAt: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  async function fetchOverview() {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API}/dashboard/overview`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${API}/dashboard/manual-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      setShowModal(false)
      setForm({
        clientName: '',
        clientEmail: '',
        total_cents: 0,
        description: '',
        createdAt: new Date().toISOString().slice(0, 10),
      })
      fetchOverview()
    } finally {
      setSaving(false)
    }
  }

  const cards = [
    { label: 'Receita do Mês', value: data ? formatBRL(data.revenue) : '—' },
    { label: 'Pedidos', value: data ? String(data.orders) : '—' },
    { label: 'Clientes', value: data ? String(data.clients) : '—' },
    { label: 'Ticket Médio', value: data ? formatBRL(data.avgTicket) : '—' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition"
        >
          + Lançar Venda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold text-gray-800 mt-1 ${loading ? 'animate-pulse' : ''}`}>
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Vendas — últimos 30 dias</h2>
        {loading || !data ? (
          <div className="h-48 flex items-center justify-center text-gray-400 animate-pulse">
            Carregando...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.salesChart} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tickFormatter={(v) => `R$${v}`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={((value: unknown) => [formatBRL(Number(value ?? 0)), 'Vendas']) as any}
                labelFormatter={(label) => {
                  const [y, m, d] = (label as string).split('-')
                  return `${d}/${m}/${y}`
                }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 13 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#111827"
                strokeWidth={2}
                fill="url(#colorTotal)"
                dot={false}
                activeDot={{ r: 4, fill: '#111827' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Lançar Venda Manual</h2>
            <form onSubmit={handleSaveManual} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nome do cliente</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email do cliente</label>
                <input
                  required
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Valor total (em reais)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  value={form.total_cents / 100 || ''}
                  onChange={(e) =>
                    setForm({ ...form, total_cents: Math.round(parseFloat(e.target.value) * 100) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Descrição do pedido</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Ex: Vela aromática + difusor"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Data da venda</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  value={form.createdAt}
                  onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2 text-sm cursor-pointer hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 cursor-pointer transition disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}