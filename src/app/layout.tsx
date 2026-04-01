import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Essenza Admin',
  description: 'Painel administrativo Essenza',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className} suppressHydrationWarning>
          <main className="flex-1 p-8 bg-gray-100 min-h-screen">
            {children}
          </main>
      </body>
    </html>
  )
}
