/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price_in_cents: number
  stock: number
  active: boolean
}

type ProductVariant = {
  id: string
  label: string
  aroma?: string
  color?: string
  stock: number
  active: boolean
}

type ProductImage = {
  id: string
  url: string
  alt?: string
  position: number
}

const CATEGORIES = [
  "VELAS",
  "CORPO_BANHO",
  "DECORACAO",
  "AROMATIZADORES"
]

const EMPTY_IMAGE = { url: '', alt: '', position: 0 }

const EMPTY_VARIANT = { label: '', aroma: '', color: '', stock: 0 }

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVariant, setNewVariant] = useState(EMPTY_VARIANT)
  const [addingVariant, setAddingVariant] = useState(false)
  const [images, setImages] = useState<ProductImage[]>([])
  const [newImage, setNewImage] = useState(EMPTY_IMAGE)
  const [form, setForm] = useState<Partial<Product>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          category: data.category,
          price_in_cents: data.price_in_cents,
          stock: data.stock,
          active: data.active,
        })
        setVariants(data.variants || [])
        setImages(data.images || [])
      })
      .finally(() => setLoading(false))
  }, [slug])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'price_in_cents' || name === 'stock'
        ? Number(value)
        : value,
    }))
  }

  async function handleAddVariant() {
    if (!newVariant.label.trim()) return
    setAddingVariant(true)
    const token = localStorage.getItem('admin_token')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${form.id}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newVariant),
    })

    if (res.ok) {
      const created = await res.json()
      setVariants((prev) => [...prev, created])
      setNewVariant(EMPTY_VARIANT)
    }
    setAddingVariant(false)
  }


  function handleVariantChange(index: number, field: keyof ProductVariant, value: any) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, [field]: field === 'stock' ? Number(value) : value } : v
      )
    )
  }

  async function handleRemoveImage(imageId: string) {
    const token = localStorage.getItem('admin_token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${form.id}/images/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  async function handleAddImage() {
    if (!newImage.url.trim()) return
    const token = localStorage.getItem('admin_token')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${form.id}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newImage),
    })

    if (res.ok) {
      const created = await res.json()
      setImages((prev) => [...prev, created])
      setNewImage(EMPTY_IMAGE)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const token = localStorage.getItem('admin_token')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, variants }),
      })

      if (!res.ok) throw new Error('Erro ao salvar')

      setSuccess(true)
      setTimeout(() => router.push(`/products/${form.slug}`), 1000)
    } catch {
      setError('Erro ao salvar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400 py-12 text-center">Carregando...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/products/${slug}`} className="text-sm text-amber-600 hover:text-amber-700">
          ← Voltar para detalhes
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Editar produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Dados principais */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700">Dados principais</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nome</label>
            <input
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug || ''}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoria</label>
            <select
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Preço (em centavos)</label>
              <input
                name="price_in_cents"
                type="number"
                value={form.price_in_cents || 0}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                = R$ {((form.price_in_cents || 0) / 100).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Estoque</label>
              <input
                name="stock"
                type="number"
                value={form.stock || 0}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={form.active ?? true}
              onChange={handleChange}
              className="accent-amber-600"
            />
            <label htmlFor="active" className="text-sm text-gray-600">Produto ativo</label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Descrição</h2>
          <textarea
            name="description"
            value={form.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Imagens</h2>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-5">
              {images.map((img) => (
                <div key={img.id} className="flex flex-col items-center gap-1">
                  <div className="relative w-24 h-24 group">
                    <Image
                      src={img.url}
                      alt={img.alt || ''}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">pos. {img.position}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border border-dashed border-gray-200 rounded-lg p-4 flex flex-col gap-3">
            <p className="text-sm text-gray-500 font-medium">Adicionar imagem</p>
            <input
              placeholder="URL da imagem (R2/CDN)"
              value={newImage.url}
              onChange={(e) => setNewImage((prev) => ({ ...prev, url: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Alt text"
                value={newImage.alt}
                onChange={(e) => setNewImage((prev) => ({ ...prev, alt: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="number"
                placeholder="Posição (0, 1, 2...)"
                value={newImage.position}
                onChange={(e) => setNewImage((prev) => ({ ...prev, position: Number(e.target.value) }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="button"
              onClick={handleAddImage}
              disabled={!newImage.url.trim()}
              className="self-start bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 cursor-pointer transition-colors disabled:opacity-40"
            >
              + Adicionar imagem
            </button>
          </div>
        </div>

        {/* Variantes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Variantes</h2>
          <div className="flex flex-col gap-4">
            {variants.map((v, i) => (
              <div key={v.id} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">{v.id.slice(0, 8)}...</span>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={v.active}
                      onChange={(e) => handleVariantChange(i, 'active', e.target.checked)}
                      className="accent-amber-600"
                    />
                    Ativa
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Label</label>
                    <input
                      value={v.label}
                      onChange={(e) => handleVariantChange(i, 'label', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Estoque</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Aroma</label>
                    <input
                      value={v.aroma || ''}
                      onChange={(e) => handleVariantChange(i, 'aroma', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cor</label>
                    <input
                      value={v.color || ''}
                      onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="border border-dashed border-gray-200 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-sm text-gray-500 font-medium">Adicionar variante</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label *</label>
                  <input
                    placeholder="ex: Mostarda"
                    value={newVariant.label}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, label: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estoque</label>
                  <input
                    type="number"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Aroma</label>
                  <input
                    placeholder="ex: Lavanda"
                    value={newVariant.aroma}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, aroma: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cor</label>
                  <input
                    placeholder="ex: Branca"
                    value={newVariant.color}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                disabled={!newVariant.label.trim() || addingVariant}
                className="self-start bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 cursor-pointer transition-colors disabled:opacity-40"
              >
                {addingVariant ? 'Adicionando...' : '+ Adicionar variante'}
              </button>
            </div>
          </div>
        </div>


        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Produto salvo! Redirecionando...</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-amber-700 cursor-pointer transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <Link
            href={`/products/${slug}`}
            className="px-6 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
