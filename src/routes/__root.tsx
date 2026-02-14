import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ChatWidget } from '../components/chat-widget'
import { Footer } from '../components/layout/footer'

import { Header } from '../components/layout/header'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import '../i18n/config'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Denty - Book your dental appointment online',
      },
      {
        name: 'description',
        content:
          'Find dental clinics, choose the best professional, and book your appointment in just a few clicks.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function useClinicSlugFromPath(): string | undefined {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const clinicMatch = pathname.match(/^\/clinics\/([^/]+)$/)
  const bookMatch = pathname.match(/^\/book\/([^/]+)/)
  return clinicMatch?.[1] || bookMatch?.[1] || undefined
}

function RootComponent() {
  const clinicSlug = useClinicSlugFromPath()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget clinicSlug={clinicSlug} />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
