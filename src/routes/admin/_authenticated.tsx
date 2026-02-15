import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '@/server/auth'

export const Route = createFileRoute('/admin/_authenticated')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) {
      throw redirect({ to: '/admin/login' })
    }
    return { session }
  },
  component: () => <Outlet />,
})
