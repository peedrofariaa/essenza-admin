import Link from 'next/link'

const links = [
  { href: '/', label: '📊 Overview' },
  { href: '/products', label: '📦 Produtos' },
  { href: '/customers', label: '👥 Clientes' },
  { href: '/orders', label: '🛒 Pedidos' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col p-6 gap-2">
      <h1 className="text-xl font-bold mb-6">🕯️ Essenza Admin</h1>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </aside>
  )
}
