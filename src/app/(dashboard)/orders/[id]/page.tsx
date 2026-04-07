/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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

type OrderItem = {
  productId: string
  variantId?: string
  variantLabel?: string
  name: string
  quantity: number
  price_in_cents: number
}

type Order = {
  id: string
  status: string
  items: OrderItem[]
  subtotal_cents: number
  shipping_cents: number
  total_cents: number
  paymentMethod: string | null
  paymentId: string | null
  shippingAddress: any
  shippingService: string | null
  shippingDays: number | null
  createdAt: string
  user: { id: number; name: string; email: string; cpf: string }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus: string) {
    setSaving(true)
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) setOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
    setSaving(false)
  }

  if (loading) return <div className="text-gray-400 py-12 text-center">Carregando...</div>
  if (!order) return <div className="text-center py-12 text-gray-400">Pedido não encontrado.</div>

  const address = order.shippingAddress as any

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-amber-600 hover:text-amber-700">
          ← Voltar para pedidos
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-bold text-gray-800">Pedido</h1>
          <span className="font-mono text-sm text-gray-400">{order.id.slice(0, 8)}...</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Status do pedido</h2>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLOR[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={saving}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            {saving && <span className="text-xs text-gray-400">Salvando...</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Cliente</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nome</p>
              <Link href={`/customers/${order.user.id}`} className="font-medium text-amber-600 hover:text-amber-700">
                {order.user.name}
              </Link>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{order.user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">CPF</p>
              <p className="font-medium text-gray-800 font-mono">{order.user.cpf}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Itens ({order.items.length})</h2>
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-amber-600 font-medium">{item.variantLabel}</p>  
                  )}
                  <p className="text-xs text-gray-400">Qtd: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-800">
                  R$ {((item.price_in_cents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>R$ {(order.subtotal_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Frete {order.shippingService && `(${order.shippingService})`}</span>
              <span>R$ {(order.shipping_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 text-base mt-1">
              <span>Total</span>
              <span>R$ {(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Pagamento</h2>
            <div className="text-sm flex flex-col gap-2">
              <div>
                <p className="text-gray-500">Método</p>
                <p className="font-medium text-gray-800">{order.paymentMethod || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">ID MP</p>
                <p className="font-mono text-xs text-gray-600">{order.paymentId || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Data</p>
                <p className="font-medium text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Entrega</h2>
            <div className="text-sm flex flex-col gap-2">
              <div>
                <p className="text-gray-500">Endereço</p>
                <p className="font-medium text-gray-800">
                  {address?.address}, {address?.number}
                  {address?.complement ? `, ${address.complement}` : ''}
                </p>
                <p className="text-xs text-gray-400">
                {address?.neighborhood} — {address?.city}/{address?.state} — CEP {address?.cep}
                </p>
                <p className="text-xs text-gray-400">
                {address?.firstName} {address?.lastName} · {address?.phone}
                </p>
              </div>
              {order.shippingDays && (
                <div>
                  <p className="text-gray-500">Prazo</p>
                  <p className="font-medium text-gray-800">{order.shippingDays} dias úteis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
