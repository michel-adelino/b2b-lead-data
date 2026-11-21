import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ageBand, num, sizeBand } from '../lib/format'
import { AGES, FORMS, INDUSTRIES, REGIONS, SIZES, STATUSES } from '../types'
import type { Company } from '../types'
import { Banner, Button, Modal, PageHeader, Pill, TextInput } from '../components/Ui'
import { ring } from '../components/Ui'
import { ExportDialog } from '../components/ExportDialog'
import type { ExportPlan } from '../lib/export'
import { useDemo } from '../state/demo'

type Filters = {
  q: string
  industries: string[]
  sizes: string[]
  regions: string[]
  forms: string[]
  statuses: string[]
  ages: string[]
  includeProtected: boolean
}

const initialFilters = (): Filters => ({
  q: '',
  industries: [],
  sizes: [],
  regions: [],
  forms: [],
  statuses: ['Active'],
  ages: [],
  includeProtected: false,
})

function toggle(list: string[], value: string, all: readonly string[]) {
  if (list.length === 0) return [value]
  const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  if (next.length === 0 || next.length === all.length) return []
  return next
}

function match(company: Company, filters: Filters) {
  if (!filters.includeProtected && company.protected) return false
  if (filters.statuses.length && !filters.statuses.includes(company.status)) return false
  if (filters.industries.length && !filters.industries.includes(company.industry)) return false
  if (filters.sizes.length && !filters.sizes.includes(sizeBand(company.employees))) return false
  if (filters.regions.length && !filters.regions.includes(company.region)) return false
  if (filters.forms.length && !filters.forms.includes(company.form)) return false
  if (filters.ages.length && !filters.ages.includes(ageBand(company.founded))) return false
  const q = filters.q.trim().toLowerCase()
  if (q && !`${company.name} ${company.cvr} ${company.city} ${company.industry}`.toLowerCase().includes(q)) return false
  return true
}

export function Companies() {
  const demo = useDemo()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [naming, setNaming] = useState(false)
  const [listName, setListName] = useState('Hovedstaden software')
  const [plan, setPlan] = useState<ExportPlan | null>(null)

  const visible = useMemo(
    () => demo.companies.filter((company) => match(company, filters)),
    [demo.companies, filters],
  )
  const hiddenProtected = useMemo(
    () => demo.companies.filter((company) => match(company, { ...filters, includeProtected: true }) && company.protected && !filters.includeProtected).length,
    [demo.companies, filters],
  )

  function setInclude(value: boolean) {
    setFilters((current) => ({ ...current, includeProtected: value }))
    if (value) demo.markSearch()
    setSelected(new Set())
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        lede="A preview slice of the daily CVR sync. Filters match the register: industry, size, region, form, status, and age."
        actions={
          <Button variant="ghost" data-tour="export-register" onClick={() => setPlan(demo.previewExport('register', 'Full CVR extract', 'felt-full-register'))}>
            Export full register
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <aside className="space-y-5">
          <TextInput
            value={filters.q}
            placeholder="Name, CVR, city"
            onChange={(event) => {
              setFilters((current) => ({ ...current, q: event.target.value }))
              setSelected(new Set())
            }}
          />
          <label className={`flex items-start gap-2 rounded-xl border border-line bg-card p-3 text-sm ${ring(demo.tour === 'search')}`}>
            <input
              type="checkbox"
              className="mt-1"
              data-tour="protect-toggle"
              checked={filters.includeProtected}
              onChange={(event) => setInclude(event.target.checked)}
            />
            <span>
              <span className="block font-medium">Include advertising-protected</span>
              <span className="mt-1 block text-[12px] leading-relaxed text-ink-soft">Reklamebeskyttelse. They can be viewed, not saved, enriched, or exported.</span>
            </span>
          </label>
          <Group label="Industry" options={INDUSTRIES} selected={filters.industries} onToggle={(value) => setFilters((f) => ({ ...f, industries: toggle(f.industries, value, INDUSTRIES) }))} />
          <Group label="Size" options={SIZES} selected={filters.sizes} onToggle={(value) => setFilters((f) => ({ ...f, sizes: toggle(f.sizes, value, SIZES) }))} />
          <Group label="Region" options={REGIONS} selected={filters.regions} onToggle={(value) => setFilters((f) => ({ ...f, regions: toggle(f.regions, value, REGIONS) }))} />
          <Group label="Form" options={FORMS} selected={filters.forms} onToggle={(value) => setFilters((f) => ({ ...f, forms: toggle(f.forms, value, FORMS) }))} />
          <Group label="Status" options={STATUSES} selected={filters.statuses} onToggle={(value) => setFilters((f) => ({ ...f, statuses: toggle(f.statuses, value, STATUSES) }))} />
          <Group label="Age" options={AGES} selected={filters.ages} onToggle={(value) => setFilters((f) => ({ ...f, ages: toggle(f.ages, value, AGES) }))} />
          <button type="button" className="text-sm text-copper-deep" onClick={() => { setFilters(initialFilters()); setSelected(new Set()) }}>
            Reset filters
          </button>
        </aside>
        <div>
          {filters.includeProtected ? (
            <Banner tone="warn">
              Advertising-protected companies are visible for the register, and blocked for lists, enrichment, and export.
            </Banner>
          ) : null}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              {visible.length} in this preview
              {hiddenProtected ? ` · ${hiddenProtected} protected hidden` : ''}
            </p>
            <Button
              data-tour="save-list"
              className={ring(demo.tour === 'list')}
              disabled={selected.size === 0}
              onClick={() => setNaming(true)}
            >
              {selected.size ? `Save ${selected.size} as list` : 'Save as list'}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] tracking-wide text-ink-soft uppercase">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">Company</th>
                  <th className="px-3 py-3 font-medium">CVR</th>
                  <th className="px-3 py-3 font-medium">Industry</th>
                  <th className="px-3 py-3 font-medium">Where</th>
                  <th className="px-3 py-3 font-medium">People</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((company) => {
                  const people = demo.contacts.filter((contact) => contact.cvr === company.cvr).length
                  return (
                    <tr key={company.cvr} className={`border-b border-line last:border-0 ${company.protected ? 'bg-amber-wash/50' : ''}`}>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(company.cvr)}
                          aria-label={`Select ${company.name}`}
                          data-tour={`company-${company.cvr}`}
                          onChange={() => {
                            setSelected((current) => {
                              const next = new Set(current)
                              if (next.has(company.cvr)) next.delete(company.cvr)
                              else next.add(company.cvr)
                              return next
                            })
                          }}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Link to={`/companies/${company.cvr}`} className="font-medium hover:text-copper-deep">{company.name}</Link>
                        <div className="text-[12px] text-ink-soft">{company.form} · est. {company.founded}</div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[13px]">{company.cvr}</td>
                      <td className="px-3 py-3">
                        <div>{company.industry}</div>
                        <div className="text-[12px] text-ink-soft">NACE {company.nace}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div>{company.city}</div>
                        <div className="text-[12px] text-ink-soft">{company.region}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div>{num(company.employees)}</div>
                        <div className="text-[12px] text-ink-soft">{sizeBand(company.employees)} · {people} contacts</div>
                      </td>
                      <td className="px-3 py-3">
                        <Pill tone={company.protected ? 'warn' : company.status === 'Active' ? 'good' : company.status === 'Bankrupt' ? 'stop' : 'neutral'}>
                          {company.protected ? 'Protected' : company.status}
                        </Pill>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal open={naming} title="Save a list" lede="People linked to the selected CVR numbers. Protected companies are left out." onClose={() => setNaming(false)}>
        <TextInput value={listName} onChange={(event) => setListName(event.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setNaming(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              const id = demo.createList(listName, [...selected])
              setNaming(false)
              if (id) navigate(`/lists/${id}`)
            }}
          >
            Save list
          </Button>
        </div>
      </Modal>
      <ExportDialog
        plan={plan}
        onClose={() => setPlan(null)}
        onConfirm={() => {
          demo.commitExport('register', 'Full CVR extract', 'felt-full-register')
          setPlan(null)
        }}
      />
    </div>
  )
}

function Group({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] tracking-[0.14em] text-ink-soft uppercase">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = selected.length > 0 && selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full px-2.5 py-1 text-[12px] ${on ? 'bg-ink text-[#f4efe6]' : 'bg-card text-ink-soft ring-1 ring-line'}`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
