import { NavBar } from '../components/NavBar'

export function ApplicationBoardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Board</h1>
        <p className="text-gray-500 dark:text-gray-400">Board coming soon</p>
      </main>
    </div>
  )
}
