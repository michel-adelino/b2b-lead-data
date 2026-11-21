import { Link, useParams } from 'react-router-dom'
import { ageBand, num, sizeBand } from '../lib/format'
import { Banner, Card, PageHeader, Pill } from '../components/Ui'
import { ContactTable } from '../components/ContactTable'
import { useDemo } from '../state/demo'
import { useState } from 'react'

export function CompanyDetail() {
  const { cvr = '' } = useParams()
  const demo = useDemo()
  const company = demo.companies.find((item) => item.cvr === cvr)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  if (!company) {
    return (
      <PageHeader title="Company not in the preview" lede="The full register is larger than this sample." />
    )
  }
  const rows = demo.contacts
    .filter((contact) => contact.cvr === company.cvr)
    .map((contact) => ({ contact, company }))

  return (
    <div>
      <Link to="/companies" className="text-sm text-copper-deep">Back to companies</Link>
      <div className="mt-3">
        <PageHeader
          title={company.name}
          lede={`${company.address} · NACE ${company.nace}`}
          actions={<Pill tone={company.protected ? 'warn' : company.status === 'Active' ? 'good' : 'neutral'}>{company.protected ? 'Advertising-protected' : company.status}</Pill>}
        />
      </div>
      {company.protected ? (
        <Banner tone="warn">
          This company is flagged reklamebeskyttelse. Felt will not add it to a list, enrich its people, or include it in an export.
        </Banner>
      ) : null}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="CVR" value={company.cvr} />
        <Fact label="Form" value={company.form} />
        <Fact label="Employees" value={`${num(company.employees)} · ${sizeBand(company.employees)}`} />
        <Fact label="Age" value={`${ageBand(company.founded)} · ${company.founded}`} />
        <Fact label="Industry" value={company.industry} />
        <Fact label="Region" value={`${company.city}, ${company.region}`} />
        <Fact label="Status" value={company.status} />
        <Fact label="Domain" value={company.domain} />
      </div>
      <h2 className="mb-3 text-sm font-medium">People linked by CVR</h2>
      <ContactTable
        rows={rows}
        selected={selected}
        aiColumns={[]}
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
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-4 py-3">
      <div className="text-[11px] tracking-wide text-ink-soft uppercase">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </Card>
  )
}
