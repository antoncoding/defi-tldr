import { Entry } from '@/types/database'

async function getEntries() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/entries`, {
    cache: 'no-store'
  })
  
  if (!res.ok) {
    console.error('Error fetching entries:', await res.text())
    return []
  }

  return res.json() as Promise<Entry[]>
}

export default async function Home() {
  const entries = await getEntries()

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">My Entries</h1>
      <div className="grid gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>
            <p className="text-gray-600">{entry.content}</p>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(entry.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
