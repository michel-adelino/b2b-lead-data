import { num } from '../lib/format'
import { adminAccounts, providerMonth } from '../data/seed'
import { Button, Card, PageHeader } from '../components/Ui'
import { useDemo } from '../state/demo'

export function Admin() {
  const demo = useDemo()
  if (demo.role !== 'admin') {
    return (
      <div>
        <PageHeader title="Platform admin" lede="Accounts, plans, usage, and what the providers actually cost." />
        <Card className="max-w-lg p-6">
          <p className="text-sm leading-relaxed text-ink-soft">This view is for Felt operators, not the Nordlys workspace.</p>
          <Button
            className="mt-4"
            data-tour="role-admin"
            onClick={() => demo.setRole('admin')}
          >
            Switch to admin view
          </Button>
        </Card>
      </div>
    )
  }

  const calls = providerMonth.reduce((sum, row) => sum + row.calls, 0)
  const cost = providerMonth.reduce((sum, row) => sum + row.calls * row.unitDkk, 0)
  const revenue = calls * 4.9

  return (
    <div>
      <PageHeader
        title="Admin"
        lede="Every workspace is a tenant. Nordlys in this preview is live — the other accounts are the shape of the book."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-[11px] tracking-wide text-ink-soft uppercase">Provider cost</div>
          <div className="mt-2 text-2xl font-medium">{dkk0(cost)}</div>
          <div className="text-[12px] text-ink-soft">This month · all customers</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] tracking-wide text-ink-soft uppercase">Credits sold</div>
          <div className="mt-2 text-2xl font-medium">{dkk0(revenue)}</div>
          <div className="text-[12px] text-ink-soft">{num(calls)} credits at 4.90 DKK</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] tracking-wide text-ink-soft uppercase">Gross margin</div>
          <div className="mt-2 text-2xl font-medium">{dkk0(revenue - cost)}</div>
          <div className="text-[12px] text-ink-soft">Before the annual subscription</div>
        </Card>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] tracking-wide text-ink-soft uppercase">
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Seats</th>
              <th className="px-4 py-3 font-medium">Exports</th>
              <th className="px-4 py-3 font-medium">Credits</th>
            </tr>
          </thead>
          <tbody>
            {adminAccounts.map((account) => (
              <tr key={account.name} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{account.name}</td>
                <td className="px-4 py-3">{account.plan}</td>
                <td className="px-4 py-3">{account.name === 'Nordlys ApS' ? `${demo.team.length} / 5` : account.seats}</td>
                <td className="px-4 py-3">{account.live ? `${num(demo.fairUse.used)} / ${num(demo.fairUse.cap)}` : account.exports}</td>
                <td className="px-4 py-3">{account.live ? num(demo.settled) : num(account.credits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] tracking-wide text-ink-soft uppercase">
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Calls</th>
              <th className="px-4 py-3 font-medium">Unit cost</th>
              <th className="px-4 py-3 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {providerMonth.map((row) => (
              <tr key={row.provider} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{row.provider}</td>
                <td className="px-4 py-3">{num(row.calls)}</td>
                <td className="px-4 py-3">{row.unitDkk.toFixed(2)} DKK</td>
                <td className="px-4 py-3">{dkk0(row.calls * row.unitDkk)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function dkk0(value: number) {
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(value)
}
