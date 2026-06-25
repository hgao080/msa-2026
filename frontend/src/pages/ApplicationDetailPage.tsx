import { NavBar } from '../components/NavBar'
import { useParams } from 'react-router-dom'

export function ApplicationDetailPage() {
  const { id } = useParams()
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500 dark:text-gray-400">Application {id} detail coming soon</p>
      </main>
    </div>
  )
}
