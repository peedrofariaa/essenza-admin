/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const CATEGORIES = ['VELAS', 'CORPO_BANHO', 'DECORACAO', 'AROMATIZADORES']

type ImageField = { url: string; alt: string; position: number }
type VariantField = { label: string; aroma: string; color: string; stock: number }

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'VELAS',
    price_in_cents: '',
    stock: '0',
    active: true,
  })

  const [images, setImages] = useState<ImageField[]>([
    { url: '', alt: '', position: 0 },
  ])

  const [variants, setVariants] = useState<VariantField[]>([
    { label: '', aroma: '', color: '', stock: 0 },
  ])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && {
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }),
    }))
  }

  // --- Imagens ---
  function handleImageChange(index: number, field: keyof ImageField, value: string | number) {
    setImages((prev) => prev.map((img, i) => i === index ? { ...img, [field]: value } : img))
  }

  function addImage() {
    setImages((prev) => [...prev, { url: '', alt: '', position: prev.length }])
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i })))
  }

  // --- Variantes ---
  function handleVariantChange(index: number, field: keyof VariantField, value: string | number) {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  function addVariant() {
    setVariants((prev) => [...prev, { label: '', aroma: '', color: '', stock: 0 }])
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('admin_token')

      const res = await fetch('http://localhost:3001/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price_in_cents: Number(form.price_in_cents),
          stock: Number(form.stock),
          images: images.filter((img) => img.url.trim() !== ''),
          variants: variants.filter((v) => v.label.trim() !== ''),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar produto')

      router.push('/products' as any)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Novo Produto</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha os dados do produto</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* DADOS PRINCIPAIS */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700">Dados principais</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ex: Vela Aromática Lavanda" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} required
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-500"
              placeholder="gerado automaticamente" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Descreva o produto..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Preço (em centavos)</label>
              <input name="price_in_cents" type="number" value={form.price_in_cents} onChange={handleChange} required min={0}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ex: 2990 = R$ 29,90" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Estoque geral</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} min={0}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600" />
                <span className="text-sm font-medium text-gray-700">Produto ativo</span>
              </label>
            </div>
          </div>
        </div>

        {/* IMAGENS */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Imagens</h2>
            <button type="button" onClick={addImage}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Adicionar imagem
            </button>
          </div>

          {images.map((img, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 border border-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Imagem {index + 1}</span>
                {images.length > 1 && (
                  <button type="button" onClick={() => removeImage(index)}
                    className="text-xs text-red-400 hover:text-red-600">
                    Remover
                  </button>
                )}
              </div>

              <input value={img.url} onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="URL da imagem (ex: https://cdn.essenzame.com.br/...)" />

              <div className="grid grid-cols-2 gap-2">
                <input value={img.alt} onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Alt / cor (ex: Verde)" />
                <input type="number" value={img.position} min={0}
                  onChange={(e) => handleImageChange(index, 'position', Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Posição (0, 1, 2...)" />
              </div>

              {img.url && (
                <div className="relative w-20 h-20 mt-1">
                  <Image
                    src={img.url}
                    alt={img.alt || 'preview'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* VARIANTES */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Variantes (aromas / cores)</h2>
            <button type="button" onClick={addVariant}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Adicionar variante
            </button>
          </div>

          {variants.map((v, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 border border-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Variante {index + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(index)}
                    className="text-xs text-red-400 hover:text-red-600">
                    Remover
                  </button>
                )}
              </div>

              <input value={v.label} onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Label (ex: Verde/Bamboo)" />

              <div className="grid grid-cols-3 gap-2">
                <input value={v.aroma} onChange={(e) => handleVariantChange(index, 'aroma', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Aroma (ex: Bamboo)" />
                <input value={v.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Cor (ex: Verde)" />
                <input type="number" value={v.stock} min={0}
                  onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Estoque" />
              </div>
            </div>
          ))}
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/products' as any)}
            className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
            {loading ? 'Salvando...' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
