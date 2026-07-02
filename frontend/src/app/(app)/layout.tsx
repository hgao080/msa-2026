import { NavBar } from '@/components/NavBar'
import { getUser } from '@/lib/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  return (
    <div className="min-h-screen bg-bg">
      <NavBar username={user?.username} />
      {children}
    </div>
  )
}
