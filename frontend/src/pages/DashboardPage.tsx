import { NavBar } from '../components/NavBar'
import { useSeasonStore } from '../store/seasonStore'

export function DashboardPage() {
  const { activeSeason } = useSeasonStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {activeSeason?.name ?? 'Dashboard'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Dashboard coming soon</p>
      </main>
    </div>
  )
}
