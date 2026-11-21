import { Link } from 'react-router-dom'
import { isSuppressed } from '../lib/export'
import { num } from '../lib/format'
import { REGISTER_SYNC, REGISTER_UPDATED } from '../data/seed'
import { REGISTER_TOTAL } from '../lib/export'
import { Card, PageHeader, Pill } from '../components/Ui'
import { useDemo } from '../state/demo'

export function Home() {
  const demo = useDemo()
  const revealed = demo.contacts.filter((contact) => contact.revealed && contact.email && !isSuppressed(contact.email, demo.suppression))
  const opted = demo.contacts.filter((contact) => isSuppressed(contact.email, demo.suppression)).length
  const own = demo.contacts.filter((contact) => contact.source === 'own' && !isSuppressed(contact.email, demo.suppression)).length
  const prospeo = demo.contacts.filter((contact) => contact.source === 'prospeo').length
  const findy = demo.contacts.filter((contact) => contact.source === 'findymail').length
  const missing = demo.contacts.filter((contact) => !contact.verified && !isSuppressed(contact.email, demo.suppression)).length
  const total = Math.max(own + prospeo + findy + missing + opted, 1)
  const segments = [
    { label: 'Your file', value: own, color: 'bg-ink' },
    { label: 'Prospeo', value: prospeo, color: 'bg-copper' },
    { label: 'Findymail', value: findy, color: 'bg-[#d7a07a]' },
    { label: 'Still missing', value: missing, color: 'bg-[#d9d1c3]' },
    { label: 'Opted out', value: opted, color: 'bg-[#e7b2a8]' },
  ]

  return (
    <div>
      <PageHeader
        title="Good morning, Ane"
        lede="The register synced this morning. Your file covers a slice of the preview. Everything else is a reserved credit away."
      />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">CVR sync</div>
          <div className="mt-2 text-3xl font-medium tracking-tight">{REGISTER_SYNC}</div>
          <p className="mt-2 text-sm text-ink-soft">
            {num(REGISTER_UPDATED)} companies updated · {num(REGISTER_TOTAL)} active in the full register.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Meta label="Advertising protection" value="Honoured" />
            <Meta label="Next run" value="Tomorrow, 06:10" />
            <Meta label="Preview sample" value={`${demo.companies.length} companies`} />
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">Wallet</div>
            <Link to="/wallet" className="text-sm text-copper-deep">Ledger</Link>
          </div>
          <div className="mt-2 text-4xl font-medium tracking-tight">{num(demo.available)}</div>
          <p className="text-sm text-ink-soft">{demo.held > 0 ? `${demo.held} held by an open reservation` : 'No open reservation'}</p>
          <ul className="mt-4 space-y-2">
            {demo.ledger.slice(0, 3).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate text-ink-soft">{entry.note}</span>
                <span>{entry.kind === 'capture' ? '−' : entry.kind === 'topup' ? '+' : ''}{entry.kind === 'release' || entry.kind === 'reserve' || entry.kind === 'stop' ? '' : entry.amount}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Contacts on file" value={num(demo.contacts.length)} />
        <Stat label="Revealed" value={num(revealed.length)} />
        <Stat label="Exports left" value={num(demo.fairLeft)} hint={`of ${num(demo.fairUse.cap)} · hard stop`} />
        <Stat label="Suppression rules" value={num(demo.suppression.length)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="text-sm font-medium">Where emails come from</div>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-paper">
            {segments.map((segment) => (
              <div key={segment.label} className={segment.color} style={{ width: `${(segment.value / total) * 100}%` }} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-ink-soft">
            {segments.map((segment) => (
              <span key={segment.label}>{segment.label} · {segment.value}</span>
            ))}
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Lists</div>
            <Link to="/lists" className="text-sm text-copper-deep">All</Link>
          </div>
          <ul className="space-y-3">
            {demo.lists.slice(0, 3).map((list) => (
              <li key={list.id}>
                <Link to={`/lists/${list.id}`} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-sm font-medium">{list.name}</span>
                    <span className="text-[12px] text-ink-soft">{list.createdAt}</span>
                  </span>
                  <Pill>{list.contactIds.length}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-ink-soft uppercase">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] tracking-wide text-ink-soft uppercase">{label}</div>
      <div className="mt-2 text-2xl font-medium tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-[12px] text-ink-soft">{hint}</div> : null}
    </Card>
  )
}
