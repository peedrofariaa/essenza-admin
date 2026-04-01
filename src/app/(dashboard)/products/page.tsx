/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { fetchApi } from '@/lib/api'

type ProductImage = { url: string; position: number }

type Product = {
  id: string
  name: string
  slug: string
  price_in_cents: number
  stock: number
  category: string
  active: boolean
  images: ProductImage[]
  variants: { label: string; stock: number }[]
}

type ProductsResponse = {
  data: Product[]
  meta: { total: number; page: number; per_page: number }
}

type Props = {
  searchParams: Promise<{ page?: string; per_page?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { page: pageParam, per_page: perPageParam } = await searchParams

  const page = Number(pageParam ?? '1')
  const perPage = Number(perPageParam ?? '20')

  let products: Product[] = []
  let total = 0
  let totalPages = 1

  try {
    const res = await fetchApi<ProductsResponse>(
      `/products?page=${page}&per_page=${perPage}`
    )
    products = res.data
    total = res.meta.total
    totalPages = Math.ceil(total / perPage)
  } catch {
    // backend offline, mostra vazio
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">{total} produtos cadastrados</p>
        </div>
        <Link
          href="/products/new"
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          + Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            Nenhum produto encontrado. Verifique se o backend está rodando.
          </p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Produto</th>
                  <th className="px-6 py-3 text-left">Categoria</th>
                  <th className="px-6 py-3 text-left">Preço</th>
                  <th className="px-6 py-3 text-left">Estoque</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <Link
                          href={`/products/${product.slug}` as any}
                          className="font-medium text-gray-800 hover:text-amber-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 text-gray-800">
                      {`R$ ${(product.price_in_cents / 100).toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>
                        {product.stock}
                        {product.stock <= 5 && (
                          <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                            baixo
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/products/${product.slug}/edit`}
                        className="text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/products?page=${page - 1}&per_page=${perPage}`}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      ← Anterior
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/products?page=${page + 1}&per_page=${perPage}`}
                      className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      Próxima →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
