import { dkk, num } from '../lib/format'
import { Card, PageHeader, Pill } from '../components/Ui'
import { useDemo } from '../state/demo'

export function Billing() {
  const demo = useDemo()
  const meter = Math.min(100, Math.round((demo.fairUse.used / demo.fairUse.cap) * 100))
  return (
    <div>
      <PageHeader
        title="Billing"
        lede="Register Annual is a fixed subscription for the company base. Credits are prepaid on top. Neither one can run past its limit."
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">Current plan</div>
            <Pill tone="good">Active</Pill>
          </div>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">Register Annual</h2>
          <p className="mt-2 text-sm text-ink-soft">{dkk(48000)} per year · renews 12 March 2027</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>Full CVR company base, synced daily</li>
            <li>Advertising protection enforced on save, enrich, and export</li>
            <li>5 seats · {demo.team.length} in use</li>
            <li>{num(demo.fairUse.cap)} exports a month, then a hard stop</li>
          </ul>
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-[12px] text-ink-soft">
              <span>Exports this month</span>
              <span>{num(demo.fairUse.used)} / {num(demo.fairUse.cap)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div className="h-full bg-ink" style={{ width: `${meter}%` }} />
            </div>
            <p className="mt-2 text-[12px] text-ink-soft">{num(demo.fairLeft)} left. Crossing the cap cancels the whole file.</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">Payment method</div>
          <p className="mt-3 text-sm">Visa ···· 4242</p>
          <p className="text-sm text-ink-soft">Via Stripe · billed to Nordlys ApS</p>
          <div className="mt-6 border-t border-line pt-4">
            <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">Invoices</div>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex justify-between"><span>12 Mar 2026</span><span>{dkk(48000)} · Paid</span></li>
              <li className="flex justify-between"><span>12 Mar 2025</span><span>{dkk(48000)} · Paid</span></li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
