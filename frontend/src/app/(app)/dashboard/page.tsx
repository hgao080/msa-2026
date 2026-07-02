import { getSeasons } from '@/lib/seasons'

export default async function DashboardPage() {
  const seasons = await getSeasons()
  const activeSeason = seasons.find(s => s.status === 'Active')

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {activeSeason?.name ?? 'Dashboard'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">Dashboard coming soon</p>
    </main>
  )
}
