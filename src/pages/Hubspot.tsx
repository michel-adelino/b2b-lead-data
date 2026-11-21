import { useState } from 'react'
import { Button, Card, PageHeader, Pill } from '../components/Ui'
import { ring } from '../components/Ui'
import { useDemo } from '../state/demo'

export function Hubspot() {
  const demo = useDemo()
  const [connecting, setConnecting] = useState(false)

  return (
    <div>
      <PageHeader
        title="HubSpot"
        lede="Push a revealed list into the Nordlys portal. Opted-out, protected, and unrevealed rows are skipped and written to the log."
      />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Portal</div>
            <Pill tone={demo.hubspot.connected ? 'good' : 'neutral'}>{demo.hubspot.connected ? 'Connected' : 'Not connected'}</Pill>
          </div>
          <p className="mt-3 text-2xl font-medium tracking-tight">{demo.hubspot.connected ? demo.hubspot.portal : 'No portal yet'}</p>
          <p className="mt-2 text-sm text-ink-soft">OAuth stays in this preview. The connection is simulated.</p>
          {demo.hubspot.connected ? null : (
            <Button
              className={`mt-5 ${ring(demo.tour === 'hubspot')}`}
              data-tour="connect-hubspot"
              variant="primary"
              disabled={connecting}
              onClick={() => {
                setConnecting(true)
                void demo.connectHubspot().finally(() => setConnecting(false))
              }}
            >
              {connecting ? 'Connecting…' : 'Connect HubSpot'}
            </Button>
          )}
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium">Field map</div>
          <ul className="mt-3 divide-y divide-line">
            {demo.hubspot.fields.map((field) => (
              <li key={field.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{field.label}</span>
                <span className="text-ink-soft">{field.hubspot}</span>
                <button
                  type="button"
                  onClick={() => demo.toggleHubField(field.id)}
                  className={`rounded-full px-2 py-0.5 text-[12px] ${field.on ? 'bg-moss-wash text-moss' : 'bg-paper text-ink-soft'}`}
                >
                  {field.on ? 'On' : 'Off'}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="mt-4 p-5">
        <div className="text-sm font-medium">Push log</div>
        {demo.hubspot.log.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No pushes yet. Push from a list after emails are revealed.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {demo.hubspot.log.map((entry) => (
              <li key={entry.id} className="text-sm">
                <div className="font-medium">{entry.listName}</div>
                <div className="text-ink-soft">
                  {entry.at} · {entry.pushed} pushed · {entry.skippedSuppressed} opted out · {entry.skippedNoEmail} not revealed · {entry.skippedProtected} protected
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
