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

type Order = {
  id: string
  status: string
  total_cents: number
  paymentMethod: string | null
  createdAt: string
}

type Customer = {
  id: number
  name: string
  email: string
  cpf: string
  birth: string
  criadoEm: string
  orders: Order[]
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setCustomer)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-400 py-12 text-center">Carregando...</div>
  if (!customer) return <div className="text-center py-12 text-gray-400">Cliente não encontrado.</div>

  const totalGasto = customer.orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + o.total_cents, 0)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/customers" className="text-sm text-amber-600 hover:text-amber-700">
          ← Voltar para clientes
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">{customer.name}</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Dados */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Dados do cliente</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-500">CPF</p>
              <p className="font-medium text-gray-800 font-mono">{customer.cpf}</p>
            </div>
            <div>
              <p className="text-gray-500">Data de nascimento</p>
              <p className="font-medium text-gray-800">
                {new Date(customer.birth).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Cliente desde</p>
              <p className="font-medium text-gray-800">
                {new Date(customer.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{customer.orders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pedidos</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {customer.orders.filter((o) => o.status === 'DELIVERED').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Entregues</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              R$ {(totalGasto / 100).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total gasto</p>
          </div>
        </div>

        {/* Pedidos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Histórico de pedidos ({customer.orders.length})
          </h2>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum pedido ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {customer.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-gray-400">{o.id.slice(0, 8)}...</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                    {o.paymentMethod && (
                      <span className="text-gray-500 text-xs">{o.paymentMethod}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-800">
                      R$ {(o.total_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <Link href={`/orders/${o.id}`} className="text-amber-600 hover:text-amber-700 text-xs font-medium">
                      Ver →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
