const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  console.log('fetchApi chamando:', url)
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`)
  return res.json()
}
