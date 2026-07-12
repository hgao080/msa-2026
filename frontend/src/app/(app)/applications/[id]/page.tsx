import { getApplication } from '@/lib/applications'
import { ApplicationDetail } from '@/components/application/ApplicationDetail'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const app = await getApplication(id)

  return <ApplicationDetail app={app} />
}
