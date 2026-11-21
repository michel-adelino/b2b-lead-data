import { useState } from 'react'
import { dkk, num } from '../lib/format'
import { PACKS, useDemo } from '../state/demo'
import { Card, PageHeader, Pill } from '../components/Ui'
import { Checkout } from '../components/Checkout'

const kindLabel: Record<string, string> = {
  topup: 'Top-up',
  capture: 'Captured',
  release: 'Released',
  reserve: 'Reserved',
  stop: 'Stopped',
}

export function Wallet() {
  const demo = useDemo()
  const [packId, setPackId] = useState<string | null>(null)
  return (
    <div>
      <PageHeader
        title="Wallet"
        lede="Prepaid credits. A hold is taken before a provider or an AI cell runs. A miss of a later step releases what was not used. The balance cannot go below zero."
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="p-5">
          <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">Available</div>
          <div className="mt-2 text-5xl font-medium tracking-tight">{num(demo.available)}</div>
          <p className="mt-2 text-sm text-ink-soft">
            Settled {num(demo.settled)}
            {demo.held ? ` · ${demo.held} held` : ''}
          </p>
          {demo.reservation ? (
            <p className="mt-3 text-sm text-copper-deep">Open hold · {demo.reservation.label}</p>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">No open hold. A second batch can reserve.</p>
          )}
        </Card>
        <div className="grid gap-3 sm:grid-cols-3">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              data-tour={`pack-${pack.id}`}
              onClick={() => setPackId(pack.id)}
              className="rounded-2xl border border-line bg-card p-4 text-left hover:border-copper"
            >
              <div className="text-sm font-medium">{pack.name}</div>
              <div className="mt-2 text-2xl font-medium tracking-tight">{dkk(pack.dkk)}</div>
              <div className="mt-1 text-[12px] text-ink-soft">{pack.detail}</div>
            </button>
          ))}
        </div>
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-line px-5 py-3 text-sm font-medium">Ledger</div>
        <ul>
          {demo.ledger.map((entry) => (
            <li key={entry.id} className="grid grid-cols-[88px_92px_1fr_auto] items-center gap-3 border-b border-line px-5 py-3 text-sm last:border-0">
              <span className="text-[12px] text-ink-soft">{entry.at}</span>
              <Pill tone={entry.kind === 'stop' ? 'stop' : entry.kind === 'capture' ? 'copper' : entry.kind === 'topup' ? 'good' : 'neutral'}>
                {kindLabel[entry.kind]}
              </Pill>
              <span className="text-ink-soft">{entry.note}</span>
              <span className="font-medium">
                {entry.kind === 'topup' ? `+${entry.amount}` : entry.kind === 'capture' ? `−${entry.amount}` : entry.kind === 'reserve' ? `hold ${entry.amount}` : entry.kind === 'release' ? `free ${entry.amount}` : '—'}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <Checkout packId={packId} onClose={() => setPackId(null)} />
    </div>
  )
}
