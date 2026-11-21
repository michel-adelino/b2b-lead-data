import { useMemo, useState } from 'react'
import { Button, PageHeader, TextInput } from '../components/Ui'
import { ContactTable } from '../components/ContactTable'
import { ExportDialog } from '../components/ExportDialog'
import type { ExportPlan } from '../lib/export'
import { useDemo } from '../state/demo'

export function Contacts() {
  const demo = useDemo()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [plan, setPlan] = useState<ExportPlan | null>(null)
  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return demo.contacts
      .map((contact) => {
        const company = demo.companies.find((item) => item.cvr === contact.cvr)
        return company ? { contact, company } : null
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .filter((row) => {
        if (!query) return true
        return `${row.contact.name} ${row.contact.title} ${row.company.name} ${row.company.cvr}`.toLowerCase().includes(query)
      })
  }, [demo.contacts, demo.companies, q])

  const ids = [...selected]

  return (
    <div>
      <PageHeader
        title="Contacts"
        lede="Your file, linked to a CVR number. Emails stay masked until reveal. Own data is free. A missing email starts the waterfall."
        actions={
          <Button
            variant="ghost"
            disabled={ids.length === 0}
            onClick={() => setPlan(demo.previewExport(ids, 'Selected contacts', 'felt-contacts'))}
          >
            Export selected
          </Button>
        }
      />
      <div className="mb-4 max-w-sm">
        <TextInput value={q} placeholder="Search people or companies" onChange={(event) => setQ(event.target.value)} />
      </div>
      <ContactTable
        rows={rows}
        selected={selected}
        onToggle={(id) => {
          setSelected((current) => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
        }}
        onToggleAll={() => {
          setSelected((current) => (current.size === rows.length ? new Set() : new Set(rows.map((row) => row.contact.id))))
        }}
      />
      <ExportDialog
        plan={plan}
        onClose={() => setPlan(null)}
        onConfirm={() => {
          if (ids.length) demo.commitExport(ids, 'Selected contacts', 'felt-contacts')
          setPlan(null)
        }}
      />
    </div>
  )
}
