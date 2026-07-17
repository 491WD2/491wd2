import { NavLink, Outlet } from 'react-router-dom'
import { getDataMode } from '../../lib/supabase'

const links = [
  { to: '/', label: 'AdminUX', end: true },
  { to: '/chores', label: 'Chores' },
  { to: '/builder', label: 'UI Builder' },
  { to: '/help', label: 'Help' },
]

export function AppShell() {
  const dataMode = getDataMode()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="animate-fade flex items-baseline gap-3">
            <span className="font-display text-2xl font-extrabold tracking-tight text-lime sm:text-3xl">
              491WD2
            </span>
            <span className="hidden text-sm text-muted sm:inline">Family Hub</span>
          </div>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-lime/15 text-lime'
                      : 'text-mist/80 hover:bg-white/5 hover:text-foam',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <span
            className="rounded-md border border-white/10 px-2 py-1 text-xs text-muted"
            title="Data source"
          >
            {dataMode === 'supabase' ? 'Supabase' : 'Local seed'}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
