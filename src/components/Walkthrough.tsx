import { Link } from 'react-router-dom'
import type { WalkKey } from '../types'
import { useDemo } from '../state/demo'

const STEPS: { key: WalkKey; title: string; body: string; href: string }[] = [
  {
    key: 'login',
    title: 'Sign in',
    body: 'Open the Nordlys workspace. This preview signs you in on this machine only.',
    href: '/login',
  },
  {
    key: 'search',
    title: 'Search the register',
    body: 'Filter industry, size, region, form, status, and age. Then include advertising-protected companies — they stay out of outreach.',
    href: '/companies',
  },
  {
    key: 'list',
    title: 'Save a list',
    body: 'Select a few companies and save the people linked by CVR.',
    href: '/companies',
  },
  {
    key: 'enrich',
    title: 'Enrich with the waterfall',
    body: 'Open Software decision-makers. Select Maja, Emil, and Ida, then enrich. Own data, then Prospeo, then Findymail.',
    href: '/lists/list-saas',
  },
  {
    key: 'suppress',
    title: 'Honour an opt-out',
    body: 'Try to reveal Freja Lind. Suppression blocks reveal, and the same check runs on import and export.',
    href: '/lists/list-saas',
  },
  {
    key: 'export',
    title: 'Export a CSV',
    body: 'Download the list. Then try Export full register — the whole file is refused, with no partial and no overage.',
    href: '/lists/list-saas',
  },
  {
    key: 'ai',
    title: 'Add an AI column',
    body: 'Add Icebreaker and run it on the selected rows. Each cell reserves one credit.',
    href: '/lists/list-saas',
  },
  {
    key: 'hubspot',
    title: 'Push to HubSpot',
    body: 'Connect the portal and push the list. Opted-out rows are skipped.',
    href: '/lists/list-saas',
  },
  {
    key: 'rest',
    title: 'Wallet, keys, MCP, admin',
    body: 'Open the wallet ledger, the encrypted provider keys, the MCP server, and switch to platform admin.',
    href: '/wallet',
  },
]

export function Walkthrough() {
  const demo = useDemo()
  if (demo.walkHidden || demo.tour === 'done') {
    if (demo.tour === 'done' && !demo.walkHidden) {
      return (
        <div className="border-b border-line bg-card px-6 py-3 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">
              <span className="font-medium">That’s the product.</span>{' '}
              <span className="text-ink-soft">Register, own file, waterfall, hard limits, HubSpot, MCP, admin.</span>
            </p>
            <button type="button" className="text-sm text-ink-soft" onClick={demo.dismissWalk}>
              Hide
            </button>
          </div>
        </div>
      )
    }
    return null
  }
  const index = STEPS.findIndex((step) => step.key === demo.tour)
  const step = STEPS[index]
  return (
    <div className="border-b border-[#ead7ae] bg-amber-wash px-6 py-3 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <div className="text-[11px] font-medium tracking-[0.14em] text-amber uppercase">
            Step {index + 1} of {STEPS.length} · {step.title}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink">{step.body}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={step.href} className="text-sm font-medium text-copper-deep">
            Go there
          </Link>
          <button type="button" className="text-sm text-ink-soft" onClick={demo.dismissWalk}>
            Hide
          </button>
        </div>
      </div>
    </div>
  )
}

export function LoginWalk() {
  return <Walkthrough />
}
