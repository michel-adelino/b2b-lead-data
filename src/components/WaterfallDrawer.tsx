import { isSuppressed } from '../lib/export'
import type { Contact, WaterStep } from '../types'
import { useDemo } from '../state/demo'
import { Button, Drawer } from './Ui'

const detail: Record<WaterStep, string> = {
  idle: 'Waiting',
  running: 'Checking…',
  hit: 'Verified',
  miss: 'No match',
  skipped: 'Not called',
}

export function WaterfallDrawer() {
  const demo = useDemo()
  const contacts = demo.focusIds
    .map((id) => demo.contacts.find((contact) => contact.id === id))
    .filter((contact): contact is Contact => Boolean(contact))

  return (
    <Drawer
      open={demo.drawerOpen && contacts.length > 0}
      title="Enrichment waterfall"
      lede="Own data, then Prospeo, then Findymail. Two credits are reserved before the first check, so a parallel request cannot spend them."
      onClose={demo.closeDrawer}
    >
      <div className="mb-4 flex items-center justify-between rounded-xl bg-paper px-3 py-2 text-sm">
        <span>{demo.available} available</span>
        <span className="text-copper-deep">{demo.held > 0 ? `${demo.held} held` : 'No open hold'}</span>
      </div>
      {demo.runNote ? <p className="mb-4 text-sm leading-relaxed text-ink-soft">{demo.runNote}</p> : null}
      <div className="space-y-3">
        {contacts.map((contact) => {
          const company = demo.companies.find((item) => item.cvr === contact.cvr)
          const opted = isSuppressed(contact.email, demo.suppression)
          const locked = company?.protected
          return (
            <article key={contact.id} className="rounded-xl border border-line p-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{contact.name}</div>
                  <div className="text-[12px] text-ink-soft">{company?.name}</div>
                </div>
                <QueueLabel queue={contact.queue} opted={opted} locked={locked} verified={contact.verified} />
              </div>
              {opted || locked ? (
                <p className="mt-2 text-[13px] text-ink-soft">
                  {opted
                    ? 'Refused before a hold. Opt-out is checked first.'
                    : 'Refused. Advertising-protected companies are not enriched.'}
                </p>
              ) : (
                <ol className="mt-3 space-y-2">
                  <Step name="Own data" state={contact.waterfall.own} cost={contact.waterfall.own === 'hit' ? '0 credits' : 'Free'} />
                  <Step
                    name="Prospeo"
                    state={contact.waterfall.prospeo}
                    cost={contact.waterfall.prospeo === 'skipped' ? 'Hold released' : contact.waterfall.prospeo === 'idle' ? 'Up to 1' : '1 credit'}
                  />
                  <Step
                    name="Findymail"
                    state={contact.waterfall.findymail}
                    cost={contact.waterfall.findymail === 'skipped' ? 'Hold released' : contact.waterfall.findymail === 'idle' ? 'Up to 1' : '1 credit'}
                  />
                </ol>
              )}
            </article>
          )
        })}
      </div>
      {demo.busy ? (
        <div className="mt-4">
          <Button variant="danger" className="w-full" onClick={() => void demo.enrich(demo.focusIds)}>
            Send a second request
          </Button>
          <p className="mt-2 text-center text-[12px] text-ink-soft">It should be refused while this hold is open.</p>
        </div>
      ) : null}
    </Drawer>
  )
}

function QueueLabel({
  queue,
  opted,
  locked,
  verified,
}: {
  queue: Contact['queue']
  opted: boolean
  locked?: boolean
  verified: boolean
}) {
  const text = opted ? 'Opted out' : locked ? 'Protected' : queue === 'stopped' ? 'Not touched' : queue === 'running' ? 'In flight' : queue === 'done' ? (verified ? 'Verified' : 'No email') : queue === 'queued' ? 'Queued' : 'Waiting'
  return <span className="text-[11px] tracking-wide text-ink-soft uppercase">{text}</span>
}

function Step({ name, state, cost }: { name: string; state: WaterStep; cost: string }) {
  return (
    <li className="flex items-center justify-between gap-3 text-[13px]">
      <span className="flex items-center gap-2">
        <Dot state={state} />
        <span className={state === 'skipped' ? 'text-ink-soft' : ''}>{name}</span>
        <span className="text-ink-soft">{detail[state]}</span>
      </span>
      <span className="text-ink-soft">{cost}</span>
    </li>
  )
}

function Dot({ state }: { state: WaterStep }) {
  const color =
    state === 'hit' ? 'bg-moss' : state === 'running' ? 'bg-copper felt-pulse' : state === 'miss' ? 'bg-[#c4b8a8]' : 'border border-line bg-white'
  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
}
