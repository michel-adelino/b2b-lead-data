import { isSuppressed } from '../lib/export'
import { maskEmail, maskPhone, sourceLabel } from '../lib/format'
import type { AiColumn, Company, Contact } from '../types'
import { useDemo } from '../state/demo'
import { cx, Pill } from './Ui'

export function ContactTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  aiColumns = [],
}: {
  rows: { contact: Contact; company: Company }[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  aiColumns?: AiColumn[]
}) {
  const demo = useDemo()
  const allOn = rows.length > 0 && rows.every((row) => selected.has(row.contact.id))
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] tracking-wide text-ink-soft uppercase">
            <th className="w-10 px-3 py-3">
              <input type="checkbox" checked={allOn} onChange={onToggleAll} aria-label="Select all" />
            </th>
            <th className="px-3 py-3 font-medium">Person</th>
            <th className="px-3 py-3 font-medium">Company</th>
            <th className="px-3 py-3 font-medium">Email</th>
            <th className="px-3 py-3 font-medium">Phone</th>
            <th className="px-3 py-3 font-medium">Source</th>
            {aiColumns.map((column) => (
              <th key={column.id} className="px-3 py-3 font-medium">{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ contact, company }) => {
            const opted = isSuppressed(contact.email, demo.suppression)
            const writing = demo.aiCursor?.contactId === contact.id
            return (
              <tr key={contact.id} className={cx('border-b border-line last:border-0', opted && 'bg-stop-wash/40')}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(contact.id)}
                    onChange={() => onToggle(contact.id)}
                    aria-label={`Select ${contact.name}`}
                    data-tour={`select-${contact.id}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-[12px] text-ink-soft">{contact.title}</div>
                </td>
                <td className="px-3 py-3">
                  <div>{company.name}</div>
                  <div className="font-mono text-[12px] text-ink-soft">{company.cvr}</div>
                </td>
                <td className="px-3 py-3">
                  <EmailCell contact={contact} opted={opted || company.protected} />
                </td>
                <td className="px-3 py-3 text-ink-soft">
                  {contact.phone ? (contact.revealed && !opted ? contact.phone : maskPhone(contact.phone)) : '—'}
                </td>
                <td className="px-3 py-3">
                  {opted ? <Pill tone="stop">Opted out</Pill> : company.protected ? <Pill tone="warn">Protected</Pill> : <Pill tone={contact.verified ? 'good' : 'neutral'}>{sourceLabel(contact.source)}</Pill>}
                </td>
                {aiColumns.map((column) => (
                  <td key={column.id} className="max-w-[240px] px-3 py-3 text-[13px] leading-snug text-ink-soft">
                    {writing && demo.aiCursor?.columnId === column.id ? (
                      <span className="felt-pulse text-copper-deep">Writing…</span>
                    ) : (
                      contact.ai[column.id] ?? '—'
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="px-4 py-8 text-sm text-ink-soft">No contacts in this view.</p> : null}
    </div>
  )
}

function EmailCell({ contact, opted }: { contact: Contact; opted: boolean }) {
  const demo = useDemo()
  if (opted && isSuppressed(contact.email, demo.suppression)) {
    return (
      <button
        type="button"
        data-tour={`reveal-${contact.id}`}
        className={cx('text-left text-stop', demo.tour === 'suppress' && contact.id === 'c-freja' && 'rounded-md ring-2 ring-copper ring-offset-2')}
        onClick={() => demo.reveal(contact.id)}
      >
        Opted out · reveal
      </button>
    )
  }
  if (!contact.email) {
    return (
      <button type="button" className="text-copper-deep" onClick={() => demo.reveal(contact.id)}>
        Not on file · enrich
      </button>
    )
  }
  if (!contact.revealed) {
    return (
      <button type="button" className="text-left" onClick={() => demo.reveal(contact.id)}>
        <span className="font-mono text-[13px]">{maskEmail(contact.email)}</span>
        <span className="mt-0.5 block text-[11px] text-copper-deep">Reveal · free</span>
      </button>
    )
  }
  return <span className="font-mono text-[13px]">{contact.email}</span>
}
