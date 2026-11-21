import { num } from '../lib/format'
import type { ExportPlan } from '../lib/export'
import { Button, Modal } from './Ui'

export function ExportDialog({
  plan,
  onClose,
  onConfirm,
}: {
  plan: ExportPlan | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!plan) return null
  const blocked = plan.reason !== 'ok'
  return (
    <Modal
      open
      title={blocked ? 'Export stopped' : 'Export CSV'}
      lede={plan.title}
      onClose={onClose}
    >
      <dl className="space-y-2 text-sm">
        <Row label="Requested" value={num(plan.requested)} />
        <Row label="Advertising-protected" value={num(plan.protected)} />
        <Row label="Opted out" value={num(plan.suppressed)} />
        <Row label="Not revealed" value={num(plan.unrevealed)} />
        <Row label="Would write" value={num(plan.exportable)} />
        <Row label="Exports left this month" value={num(plan.remaining)} />
      </dl>
      {plan.reason === 'fair-use' ? (
        <p className="mt-4 rounded-xl bg-stop-wash px-3 py-3 text-sm leading-relaxed text-stop">
          {num(plan.exportable)} rows would pass the cap of what you have left. Felt stops the whole export. There is no partial file and no overage charge.
        </p>
      ) : null}
      {plan.reason === 'empty' ? (
        <p className="mt-4 rounded-xl bg-amber-wash px-3 py-3 text-sm leading-relaxed text-amber">
          Nothing can be written yet. Reveal a verified email first. Opted-out and protected rows never enter the file.
        </p>
      ) : null}
      {plan.reason === 'ok' ? (
        <p className="mt-4 text-sm text-ink-soft">The file includes revealed emails only. Fair use counts every row in it.</p>
      ) : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button variant={blocked ? 'danger' : 'primary'} data-tour="confirm-export" onClick={onConfirm}>
          {plan.reason === 'ok' ? 'Download CSV' : 'Nothing exported'}
        </Button>
      </div>
    </Modal>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-1.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
