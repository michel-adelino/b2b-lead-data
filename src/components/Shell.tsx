import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Bot,
  Building,
  ChevronDown,
  CreditCard,
  FileUp,
  LayoutDashboard,
  ListChecks,
  LogOut,
  RotateCcw,
  Settings,
  Shield,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react'
import { num } from '../lib/format'
import { useDemo } from '../state/demo'
import { cx, ring } from './Ui'
import { Walkthrough } from './Walkthrough'
import { Toasts } from './Toasts'
import { WaterfallDrawer } from './WaterfallDrawer'

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/companies', label: 'Companies', icon: Building, end: false },
  { to: '/contacts', label: 'Contacts', icon: Users, end: false },
  { to: '/lists', label: 'Lists', icon: ListChecks, end: false },
  { to: '/import', label: 'Import', icon: FileUp, end: false },
]

const ACCOUNT = [
  { to: '/wallet', label: 'Wallet', icon: Wallet, end: false, tour: 'wallet' as const },
  { to: '/billing', label: 'Billing', icon: CreditCard, end: false, tour: null },
  { to: '/settings', label: 'Settings', icon: Settings, end: false, tour: 'settings' as const },
]

const CONNECT = [
  { to: '/hubspot', label: 'HubSpot', icon: Workflow, end: false, tour: null },
  { to: '/mcp', label: 'MCP', icon: Bot, end: false, tour: 'mcp' as const },
]

function Item({
  to,
  label,
  icon: Icon,
  end,
  highlight,
  tour,
}: {
  to: string
  label: string
  icon: typeof Building
  end?: boolean
  highlight?: boolean
  tour?: string | null
}) {
  return (
    <NavLink
      to={to}
      end={end}
      data-tour={tour}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
          isActive ? 'bg-[#efe7d8] text-ink' : 'text-[#d9d3c7] hover:bg-white/6',
          highlight && !isActive && 'ring-2 ring-copper',
        )
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

export function Shell() {
  const demo = useDemo()
  const location = useLocation()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    if (location.pathname.startsWith('/wallet')) demo.see('wallet')
    if (location.pathname.startsWith('/settings')) demo.see('settings')
    if (location.pathname.startsWith('/mcp')) demo.see('mcp')
    if (location.pathname.startsWith('/admin') && demo.role === 'admin') demo.see('admin')
  }, [location.pathname, demo])

  useEffect(() => {
    const names: Record<string, string> = {
      '/': 'Home',
      '/companies': 'Companies',
      '/contacts': 'Contacts',
      '/lists': 'Lists',
      '/import': 'Import',
      '/wallet': 'Wallet',
      '/billing': 'Billing',
      '/settings': 'Settings',
      '/hubspot': 'HubSpot',
      '/mcp': 'MCP',
      '/admin': 'Admin',
    }
    const match = Object.keys(names).find((path) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
    )
    document.title = `${match ? names[match] : 'Felt'} · Felt`
  }, [location.pathname])

  const meter = Math.min(100, Math.round((demo.fairUse.used / demo.fairUse.cap) * 100))

  return (
    <div className="flex min-h-full bg-paper text-ink">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col bg-ink text-[#e7e1d6]">
        <Link to="/" className="flex items-center gap-2.5 px-4 py-5">
          <FieldMark />
          <span>
            <span className="block text-[17px] leading-none font-semibold tracking-tight text-white">Felt</span>
            <span className="mt-1 block text-[11px] text-[#b7c0b4]">Nordlys ApS</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-5 overflow-auto px-3 pb-4">
          <Group label="Workspace">
            {NAV.map((item) => (
              <Item key={item.to} {...item} />
            ))}
          </Group>
          <Group label="Account">
            {ACCOUNT.map((item) => (
              <Item
                key={item.to}
                {...item}
                highlight={demo.tour === 'rest' && item.tour !== null && !demo.seen[item.tour]}
              />
            ))}
          </Group>
          <Group label="Connect">
            {CONNECT.map((item) => (
              <Item
                key={item.to}
                {...item}
                highlight={demo.tour === 'rest' && item.tour === 'mcp' && !demo.seen.mcp}
              />
            ))}
          </Group>
          {demo.role === 'admin' ? (
            <Group label="Platform">
              <Item
                to="/admin"
                label="Admin"
                icon={Shield}
                tour="nav-admin"
                highlight={demo.tour === 'rest' && !demo.seen.admin}
              />
            </Group>
          ) : null}
        </nav>
        <div className="relative border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setMenu((open) => !open)}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-white/6"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#efe7d8] text-xs font-semibold text-ink">AM</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">Ane Møller</span>
              <span className="block text-[11px] text-[#b7c0b4]">{demo.role === 'admin' ? 'Platform admin' : 'Owner'}</span>
            </span>
            <ChevronDown size={14} />
          </button>
          {menu ? (
            <div className="absolute right-3 bottom-16 left-3 z-20 rounded-xl border border-white/10 bg-[#1c3126] p-1 text-sm shadow-xl">
              <button
                type="button"
                data-tour="role-admin"
                className={cx('block w-full rounded-lg px-3 py-2 text-left hover:bg-white/8', ring(demo.tour === 'rest' && demo.role !== 'admin'))}
                onClick={() => {
                  const next = demo.role === 'admin' ? 'member' : 'admin'
                  demo.setRole(next)
                  setMenu(false)
                  navigate(next === 'admin' ? '/admin' : '/')
                }}
              >
                {demo.role === 'admin' ? 'Back to workspace' : 'View as platform admin'}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/8"
                onClick={() => {
                  demo.reset()
                  setMenu(false)
                  navigate('/login')
                }}
              >
                <RotateCcw size={14} /> Reset preview
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/8"
                onClick={() => {
                  demo.signOut()
                  setMenu(false)
                  navigate('/login')
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : null}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-paper/90 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <span className="rounded-full bg-paper-2 px-2 py-1">Interactive preview · simulated data</span>
            {demo.role === 'admin' ? <span className="rounded-full bg-[#f8e6da] px-2 py-1 text-copper-deep">Platform admin</span> : null}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/billing" className="hidden items-center gap-2 sm:flex">
              <span className="text-[11px] text-ink-soft">{num(demo.fairLeft)} exports left</span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-2">
                <span className="block h-full bg-ink" style={{ width: `${meter}%` }} />
              </span>
            </Link>
            <Link
              to="/wallet"
              className="rounded-full border border-line bg-card px-3 py-1.5 text-sm"
            >
              <span className="font-medium">{num(demo.available)}</span>
              <span className="text-ink-soft"> available</span>
              {demo.held > 0 ? <span className="text-copper-deep"> · {demo.held} held</span> : null}
            </Link>
            {demo.walkHidden ? (
              <button type="button" className="text-sm text-copper-deep" onClick={demo.showWalk}>
                Walkthrough
              </button>
            ) : null}
          </div>
        </header>
        <Walkthrough />
        <main className="flex-1 px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toasts />
      <WaterfallDrawer />
    </div>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="px-3 pb-1.5 text-[10px] tracking-[0.16em] text-[#8e9a90] uppercase">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export function FieldMark({ light = false }: { light?: boolean }) {
  const paper = light ? '#14241c' : '#f3efe6'
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={light ? '#efe7d8' : '#24382c'} />
      <rect x="6.5" y="6.5" width="8" height="8" rx="1.5" fill={paper} />
      <rect x="17.5" y="6.5" width="8" height="8" rx="1.5" fill={paper} />
      <rect x="6.5" y="17.5" width="8" height="8" rx="1.5" fill={paper} />
      <rect x="17.5" y="17.5" width="8" height="8" rx="1.5" fill="#c4622d" />
    </svg>
  )
}
