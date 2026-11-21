import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cell, parseCsv } from '../lib/csv'
import { reviewImport } from '../lib/import'
import type { MappedRow, ReviewedRow } from '../lib/import'
import { sampleCsv } from '../data/seed'
import { Banner, Button, PageHeader, Pill } from '../components/Ui'
import { useDemo } from '../state/demo'

const FIELDS = ['name', 'title', 'email', 'phone', 'cvr'] as const

export function ImportPage() {
  const demo = useDemo()
  const [headers, setHeaders] = useState<string[]>([])
  const [matrix, setMatrix] = useState<string[][]>([])
  const [map, setMap] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'source' | 'map' | 'review' | 'done'>('source')
  const [counts, setCounts] = useState<{ added: number; suppressed: number; unmatched: number; duplicate: number; protected: number; incomplete: number } | null>(null)

  function load(text: string) {
    const parsed = parseCsv(text)
    const nextMap: Record<string, string> = {}
    for (const field of FIELDS) {
      const hit = parsed.headers.find((header) => header === field || header.includes(field))
      if (hit) nextMap[field] = hit
    }
    setHeaders(parsed.headers)
    setMatrix(parsed.rows)
    setMap(nextMap)
    setStep('map')
  }

  const mapped: MappedRow[] = useMemo(
    () =>
      matrix.map((row) => ({
        name: cell(headers, row, map.name ?? ''),
        title: cell(headers, row, map.title ?? ''),
        email: cell(headers, row, map.email ?? ''),
        phone: cell(headers, row, map.phone ?? ''),
        cvr: cell(headers, row, map.cvr ?? ''),
      })),
    [headers, matrix, map],
  )

  const reviewed = useMemo(
    () => reviewImport(mapped, demo.companies, demo.contacts, demo.suppression),
    [mapped, demo.companies, demo.contacts, demo.suppression],
  )

  return (
    <div>
      <PageHeader
        title="Import"
        lede="Match a spreadsheet to the register on CVR. Opt-outs and advertising-protected companies are excluded before they enter the workspace."
      />
      <ol className="mb-6 flex gap-4 text-sm text-ink-soft">
        {['Source', 'Map', 'Review'].map((label, index) => (
          <li key={label} className={stepIndex(step) === index ? 'font-medium text-ink' : ''}>
            0{index + 1} {label}
          </li>
        ))}
      </ol>

      {step === 'source' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            data-tour="sample-import"
            onClick={() => load(sampleCsv)}
            className="rounded-2xl border border-line bg-card p-5 text-left hover:border-copper"
          >
            <div className="text-sm font-medium">Use the sample spreadsheet</div>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Five rows: a new person at Havn, Freja’s opt-out, an unknown CVR, a COO at Vindholm, and a domain on the suppression list.
            </p>
          </button>
          <label className="rounded-2xl border border-dashed border-line bg-card p-5 text-sm">
            <div className="font-medium">Upload a CSV</div>
            <p className="mt-2 text-ink-soft">Comma or semicolon. Nothing leaves the browser.</p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-4 block text-sm"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                load(await file.text())
              }}
            />
          </label>
        </div>
      ) : null}

      {step === 'map' ? (
        <div className="max-w-xl space-y-3">
          {FIELDS.map((field) => (
            <label key={field} className="grid grid-cols-[120px_1fr] items-center gap-3 text-sm">
              <span className="uppercase text-[12px] tracking-wide text-ink-soft">{field}</span>
              <select
                value={map[field] ?? ''}
                onChange={(event) => setMap((current) => ({ ...current, [field]: event.target.value }))}
                className="h-10 rounded-xl border border-line bg-white px-3"
              >
                <option value="">Not mapped</option>
                {headers.map((header) => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
            </label>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setStep('source')}>Back</Button>
            <Button variant="primary" onClick={() => setStep('review')}>Review matches</Button>
          </div>
        </div>
      ) : null}

      {step === 'review' ? (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Pill tone="good">{reviewed.filter((row) => row.status === 'ready').length} ready</Pill>
            <Pill tone="stop">{reviewed.filter((row) => row.status === 'suppressed').length} opted out</Pill>
            <Pill tone="warn">{reviewed.filter((row) => row.status === 'protected').length} protected</Pill>
            <Pill>{reviewed.filter((row) => row.status === 'unmatched').length} unmatched CVR</Pill>
            <Pill>{reviewed.filter((row) => row.status === 'duplicate').length} duplicates</Pill>
          </div>
          <ReviewTable rows={reviewed} />
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setStep('map')}>Back</Button>
            <Button
              variant="primary"
              onClick={() => {
                const result = demo.importRows(mapped)
                setCounts(result)
                setStep('done')
              }}
            >
              Import ready rows
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'done' && counts ? (
        <div>
          <Banner tone="good">
            Imported {counts.added}. Excluded {counts.suppressed} opted out, {counts.protected} protected, {counts.unmatched} unmatched, {counts.duplicate} duplicates.
          </Banner>
          <Link to="/contacts" className="text-sm font-medium text-copper-deep">View contacts</Link>
        </div>
      ) : null}
    </div>
  )
}

function stepIndex(step: string) {
  if (step === 'source') return 0
  if (step === 'map') return 1
  return 2
}

function ReviewTable({ rows }: { rows: ReviewedRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] tracking-wide text-ink-soft uppercase">
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="px-3 py-3 font-medium">Email</th>
            <th className="px-3 py-3 font-medium">CVR</th>
            <th className="px-3 py-3 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.email}-${index}`} className="border-b border-line last:border-0">
              <td className="px-3 py-3">{row.name || '—'}</td>
              <td className="px-3 py-3 font-mono text-[13px]">{row.email || '—'}</td>
              <td className="px-3 py-3">
                <div className="font-mono text-[13px]">{row.cvr || '—'}</div>
                <div className="text-[12px] text-ink-soft">{row.companyName ?? 'No company'}</div>
              </td>
              <td className="px-3 py-3">
                <Pill tone={row.status === 'ready' ? 'good' : row.status === 'suppressed' || row.status === 'protected' ? 'stop' : 'neutral'}>
                  {label(row.status)}
                </Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function label(status: ReviewedRow['status']) {
  if (status === 'ready') return 'Will import'
  if (status === 'suppressed') return 'Opted out'
  if (status === 'protected') return 'Protected'
  if (status === 'duplicate') return 'Already in file'
  if (status === 'incomplete') return 'Missing fields'
  return 'CVR not in preview'
}
