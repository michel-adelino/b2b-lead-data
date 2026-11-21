import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AI_PRESETS, useDemo } from '../state/demo'
import { Button, Field, Modal, PageHeader, TextArea, TextInput } from '../components/Ui'
import { ring } from '../components/Ui'
import { ContactTable } from '../components/ContactTable'
import { ExportDialog } from '../components/ExportDialog'
import type { ExportPlan } from '../lib/export'

export function ListDetail() {
  const { id = '' } = useParams()
  const demo = useDemo()
  const list = demo.lists.find((item) => item.id === id)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [plan, setPlan] = useState<ExportPlan | null>(null)
  const [exportKind, setExportKind] = useState<'list' | 'register'>('list')
  const [aiOpen, setAiOpen] = useState(false)
  const [preset, setPreset] = useState(0)
  const [columnName, setColumnName] = useState<string>(AI_PRESETS[0].name)
  const [prompt, setPrompt] = useState<string>(AI_PRESETS[0].prompt)
  const [columnId, setColumnId] = useState<string | null>(null)

  if (!list) {
    return <PageHeader title="List not found" lede="It may have been cleared when the preview was reset." />
  }

  const rows = list.contactIds
    .map((contactId) => {
      const contact = demo.contacts.find((item) => item.id === contactId)
      const company = contact ? demo.companies.find((item) => item.cvr === contact.cvr) : undefined
      return contact && company ? { contact, company } : null
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  const chosen = selected.size ? [...selected] : rows.map((row) => row.contact.id)

  function openExport(kind: 'list' | 'register') {
    setExportKind(kind)
    setPlan(
      kind === 'register'
        ? demo.previewExport('register', 'Full CVR extract', 'felt-full-register')
        : demo.previewExport(chosen, list!.name, `felt-${list!.name}`),
    )
  }

  return (
    <div>
      <Link to="/lists" className="text-sm text-copper-deep">All lists</Link>
      <div className="mt-3">
        <PageHeader
          title={list.name}
          lede={`${rows.length} people · worst case is 2 credits per missing email, reserved before any provider is called.`}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          data-tour="enrich"
          className={ring(demo.tour === 'enrich')}
          disabled={demo.busy}
          onClick={() => void demo.enrich(chosen)}
        >
          Enrich {selected.size || rows.length}
        </Button>
        <Button variant="ghost" data-tour="export-list" className={ring(demo.tour === 'export')} onClick={() => openExport('list')}>
          Export CSV
        </Button>
        <Button variant="ghost" data-tour="export-register" onClick={() => openExport('register')}>
          Export full register
        </Button>
        <Button
          variant="ghost"
          data-tour="add-ai"
          className={ring(demo.tour === 'ai')}
          onClick={() => setAiOpen(true)}
        >
          Add AI column
        </Button>
        <Button
          variant="ghost"
          data-tour="run-ai"
          disabled={!columnId || demo.busy}
          onClick={() => columnId && void demo.runAi(list.id, columnId, chosen)}
        >
          Run AI column
        </Button>
        <Button
          variant="ink"
          data-tour="push-hubspot"
          className={ring(demo.tour === 'hubspot')}
          onClick={() => {
            if (!demo.hubspot.connected) {
              void demo.connectHubspot().then(() => demo.pushHubspot(list.id))
              return
            }
            demo.pushHubspot(list.id)
          }}
        >
          {demo.hubspot.connected ? 'Push to HubSpot' : 'Connect and push'}
        </Button>
      </div>
      <ContactTable
        rows={rows}
        selected={selected}
        aiColumns={list.aiColumns}
        onToggle={(contactId) => {
          setSelected((current) => {
            const next = new Set(current)
            if (next.has(contactId)) next.delete(contactId)
            else next.add(contactId)
            return next
          })
        }}
        onToggleAll={() => {
          setSelected((current) => (current.size === rows.length ? new Set() : new Set(rows.map((row) => row.contact.id))))
        }}
      />

      <Modal open={aiOpen} title="AI column" lede="One credit per cell, reserved before the cell is written." onClose={() => setAiOpen(false)}>
        <div className="mb-3 flex flex-wrap gap-2">
          {AI_PRESETS.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={`rounded-full px-3 py-1 text-[12px] ${preset === index ? 'bg-ink text-[#f4efe6]' : 'bg-paper text-ink-soft'}`}
              onClick={() => {
                setPreset(index)
                setColumnName(item.name)
                setPrompt(item.prompt)
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Field label="Column name">
            <TextInput value={columnName} onChange={(event) => setColumnName(event.target.value)} />
          </Field>
          <Field label="Prompt">
            <TextArea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAiOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!columnName.trim()) return
              const created = demo.addAiColumn(list.id, columnName, prompt)
              setColumnId(created)
              setAiOpen(false)
              void demo.runAi(list.id, created, chosen)
            }}
          >
            Add and run
          </Button>
        </div>
      </Modal>

      <ExportDialog
        plan={plan}
        onClose={() => setPlan(null)}
        onConfirm={() => {
          if (exportKind === 'register') demo.commitExport('register', 'Full CVR extract', 'felt-full-register')
          else demo.commitExport(chosen, list.name, `felt-${list.name}`)
          setPlan(null)
        }}
      />
    </div>
  )
}
