export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Receita do Mês', value: 'R$ 0,00' },
          { label: 'Pedidos', value: '0' },
          { label: 'Clientes', value: '0' },
          { label: 'Ticket Médio', value: 'R$ 0,00' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder do gráfico */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Vendas por período</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Gráfico em breve...
        </div>
      </div>
    </div>
  )
}
