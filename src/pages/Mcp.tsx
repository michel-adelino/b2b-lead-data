import { useState } from 'react'
import { num } from '../lib/format'
import { Button, Card, PageHeader } from '../components/Ui'
import { ring } from '../components/Ui'
import { useDemo } from '../state/demo'

const TOOLS = [
  {
    name: 'search_companies',
    detail: 'Filter the CVR sample by industry, size, region, form, status, and age. Advertising-protected rows stay hidden unless asked for, and are marked unusable.',
  },
  {
    name: 'reveal_contact',
    detail: 'Reserve the worst case, try own data, then Prospeo, then Findymail. Refuse if the hold would take the balance negative.',
  },
  {
    name: 'export_list',
    detail: 'Write a CSV of revealed emails. Refuse the whole file if it would cross the monthly fair-use cap.',
  },
]

export function Mcp() {
  const demo = useDemo()
  const [copied, setCopied] = useState(false)
  const endpoint = 'https://mcp.felt.dk/nordlys'

  return (
    <div>
      <PageHeader
        title="MCP"
        lede="An agent can search the register, reveal a contact, and export a list. It spends the same wallet, with the same reservation rule."
      />
      <Card className={`p-5 ${ring(demo.tour === 'rest' && !demo.seen.mcp)}`}>
        <div className="text-[11px] tracking-[0.14em] text-ink-soft uppercase">Server</div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <code className="text-sm">{endpoint}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(endpoint).then(
                () => setCopied(true),
                () => setCopied(true),
              )
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="mt-2 text-sm text-ink-soft">Workspace Nordlys · {num(demo.available)} credits available{demo.held ? ` · ${demo.held} held` : ''}.</p>
      </Card>
      <div className="mt-4 grid gap-3">
        {TOOLS.map((tool) => (
          <Card key={tool.name} className="px-5 py-4">
            <code className="text-sm font-medium">{tool.name}</code>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{tool.detail}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-4 overflow-hidden bg-ink text-[#e7e1d6]">
        <div className="border-b border-white/10 px-5 py-3 text-[11px] tracking-[0.14em] text-[#b7c0b4] uppercase">Agent transcript</div>
        <div className="space-y-4 px-5 py-4 text-sm leading-relaxed">
          <p><span className="text-[#d7a07a]">User</span> · Find active software companies in Hovedstaden with 11–50 people, and reveal a verified email for the first match.</p>
          <p><span className="text-[#9dbaa8]">search_companies</span> · 3 companies. Advertising-protected rows were not included.</p>
          <p>
            <span className="text-[#9dbaa8]">reveal_contact</span> · Reserved 2 before the call. Own data missed. Prospeo verified. Captured 1, released 1. Available now {num(demo.available)}.
          </p>
          <p className="text-[#b7c0b4]">A second reveal in the same moment would see the hold and refuse if 2 credits were no longer free.</p>
        </div>
      </Card>
    </div>
  )
}
