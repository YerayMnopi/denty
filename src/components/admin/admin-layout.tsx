import { Link, useNavigate } from '@tanstack/react-router'
import {
  CalendarDays,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { logoutFn } from '@/server/auth'

const navItems = [
  { key: 'dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { key: 'appointments', to: '/admin/appointments', icon: CalendarDays },
  { key: 'doctors', to: '/admin/doctors', icon: Stethoscope },
  { key: 'patients', to: '/admin/patients', icon: Users },
  { key: 'website', to: '/admin/website', icon: Globe },
  { key: 'settings', to: '/admin/settings', icon: Settings },
] as const

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logoutFn()
    navigate({ to: '/admin/login' })
  }

  const sidebarContent = (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-3">
        <span className="text-2xl">🦷</span>
        <span className="font-bold text-lg">{t('admin.panelTitle')}</span>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          activeProps={{
            className:
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-accent text-foreground',
          }}
        >
          <item.icon className="h-4 w-4" />
          {t(`admin.nav.${item.key}`)}
        </Link>
      ))}
      <div className="mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {t('admin.nav.logout')}
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r bg-background md:flex md:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-background">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">{t('admin.clinicName')}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
