'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type ProductImage = { id: string; url: string; alt?: string; position: number }
type ProductVariant = { id: string; label: string; aroma?: string; color?: string; stock: number; active: boolean }
type Product = {
  id: string
  name: string
  slug: string
  price_in_cents: number
  stock: number
  description: string
  category: string
  active: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  createdAt: string
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`)
      .then((r) => r.json())
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [slug])

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    const token = localStorage.getItem('admin_token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${product!.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    router.push('/products')
  }

  if (loading) return <div className="text-gray-400 py-12 text-center">Carregando...</div>
  if (!product) return <div className="text-center py-12 text-gray-400">Produto não encontrado.</div>

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/products" className="text-sm text-amber-600 hover:text-amber-700">
            ← Voltar para produtos
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{product.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.slug}/edit`}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors"
          >
            Editar produto
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
              confirmDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-red-300 text-red-500 hover:bg-red-50'
            }`}
          >
            {deleting ? 'Deletando...' : confirmDelete ? 'Confirmar exclusão' : 'Deletar'}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-red-600">Tem certeza? Esta ação não pode ser desfeita.</p>
          <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Imagens */}
        {product.images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Imagens</h2>
            <div className="flex gap-3 flex-wrap">
              {product.images.map((img) => (
                <div key={img.id} className="flex flex-col items-center gap-1">
                  <div className="relative w-24 h-24">
                    <Image src={img.url} alt={img.alt || product.name} fill className="object-cover rounded-lg" />
                  </div>
                  <span className="text-xs text-gray-400">{img.alt || `pos. ${img.position}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dados principais */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Dados principais</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Preço</p>
              <p className="font-medium text-gray-800">R$ {(product.price_in_cents / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Estoque geral</p>
              <p className={`font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                {product.stock} {product.stock <= 5 && '⚠️'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Categoria</p>
              <p className="font-medium text-gray-800">{product.category.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Slug</p>
              <p className="font-medium text-gray-800 font-mono text-xs">{product.slug}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-2">Descrição</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Variantes */}
        {product.variants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Variantes ({product.variants.length})</h2>
            <div className="flex flex-col gap-2">
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-800">{v.label}</span>
                    {v.aroma && <span className="text-gray-500">🌸 {v.aroma}</span>}
                    {v.color && <span className="text-gray-500">🎨 {v.color}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={v.stock <= 5 ? 'text-red-500 font-medium' : 'text-gray-600'}>
                      Estoque: {v.stock} {v.stock <= 5 && '⚠️'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {v.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
