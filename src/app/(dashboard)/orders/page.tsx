'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Order = {
  id: string
  status: string
  total_cents: number
  paymentMethod: string | null
  createdAt: string
  user: { id: number; name: string; email: string }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pago',
  PROCESSING: 'Em processamento',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const ALL_STATUSES = Object.keys(STATUS_LABEL)

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = filter ? `?status=${filter}` : ''
    const token = localStorage.getItem('admin_token')

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        setOrders(res.data || [])
        setTotal(res.meta?.total || 0)
      })
      .finally(() => setLoading(false))
  }, [filter])

  async function handleStatusChange(orderId: string, newStatus: string) {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">{total} pedidos no total</p>
        </div>

        {/* Filtro de status */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Todos os status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/orders/${o.id}`} className="font-mono text-xs text-amber-600 hover:text-amber-700">
                    {o.id.slice(0, 8)}...
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{o.user.name}</p>
                  <p className="text-xs text-gray-400">{o.user.email}</p>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  R$ {(o.total_cents / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${STATUS_COLOR[o.status]}`}
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
