export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-gray-500 dark:text-gray-400">Application {id} detail coming soon</p>
    </main>
  )
}
