import { useState } from 'react'
import { SEAT_LIMIT, useDemo } from '../state/demo'
import { Button, Card, Field, PageHeader, Pill, TextInput } from '../components/Ui'
import { ring } from '../components/Ui'
import type { TeamMember } from '../types'

export function Settings() {
  const demo = useDemo()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamMember['role']>('Member')
  const [kind, setKind] = useState<'email' | 'domain'>('email')
  const [value, setValue] = useState('')
  const [prospeo, setProspeo] = useState('')
  const [findy, setFindy] = useState('')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        lede="Team seats, provider keys, and the opt-out list. Keys are shown as the last four characters only."
      />

      <section id="team">
        <h2 className="mb-3 text-lg font-medium tracking-tight">Team</h2>
        <Card className="divide-y divide-line">
          {demo.team.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div>
                <div className="text-sm font-medium">{member.name}</div>
                <div className="text-[12px] text-ink-soft">{member.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {member.pending ? <Pill tone="warn">Invited</Pill> : null}
                <Pill>{member.role}</Pill>
              </div>
            </div>
          ))}
        </Card>
        <form
          className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            demo.invite(name, email, role)
            setName('')
            setEmail('')
          }}
        >
          <TextInput value={name} placeholder="Name" onChange={(event) => setName(event.target.value)} />
          <TextInput value={email} placeholder="Work email" onChange={(event) => setEmail(event.target.value)} />
          <select value={role} onChange={(event) => setRole(event.target.value as TeamMember['role'])} className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option>Member</option>
            <option>Admin</option>
          </select>
          <Button type="submit" variant="ink">Invite · {demo.team.length}/{SEAT_LIMIT}</Button>
        </form>
      </section>

      <section id="keys" className={ring(demo.tour === 'rest' && !demo.seen.settings)}>
        <h2 className="mb-3 text-lg font-medium tracking-tight">Provider keys</h2>
        <p className="mb-3 max-w-xl text-sm text-ink-soft">
          Nordlys supplies its own Prospeo and Findymail keys. Felt encrypts them and never shows the full value again.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <KeyCard
            name="Prospeo"
            last4={demo.keys.prospeo?.last4}
            added={demo.keys.prospeo?.addedAt}
            value={prospeo}
            onChange={setProspeo}
            onSave={() => {
              demo.saveKey('prospeo', prospeo)
              setProspeo('')
            }}
          />
          <KeyCard
            name="Findymail"
            last4={demo.keys.findymail?.last4}
            added={demo.keys.findymail?.addedAt}
            value={findy}
            onChange={setFindy}
            onSave={() => {
              demo.saveKey('findymail', findy)
              setFindy('')
            }}
          />
        </div>
      </section>

      <section id="suppression">
        <h2 className="mb-3 text-lg font-medium tracking-tight">Suppression</h2>
        <p className="mb-3 max-w-xl text-sm text-ink-soft">
          Checked on import, reveal, and export. A match is refused before a credit is reserved.
        </p>
        <form
          className="mb-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            demo.addSuppression(kind, value)
            setValue('')
          }}
        >
          <select value={kind} onChange={(event) => setKind(event.target.value as 'email' | 'domain')} className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option value="email">Email</option>
            <option value="domain">Domain</option>
          </select>
          <TextInput value={value} placeholder={kind === 'email' ? 'name@company.dk' : 'company.dk'} onChange={(event) => setValue(event.target.value)} className="max-w-xs" />
          <Button type="submit" variant="ink">Add</Button>
        </form>
        <Card className="divide-y divide-line">
          {demo.suppression.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <span className="font-mono">{item.value}</span>
                <span className="ml-2 text-[12px] text-ink-soft">{item.kind} · {item.addedAt}</span>
              </div>
              <button type="button" className="text-sm text-copper-deep" onClick={() => demo.removeSuppression(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </Card>
      </section>
    </div>
  )
}

function KeyCard({
  name,
  last4,
  added,
  value,
  onChange,
  onSave,
}: {
  name: string
  last4?: string
  added?: string
  value: string
  onChange: (value: string) => void
  onSave: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{name}</div>
        {last4 ? <Pill tone="good">Stored</Pill> : <Pill>Missing</Pill>}
      </div>
      <p className="mt-2 font-mono text-sm">{last4 ? `•••• •••• •••• ${last4}` : 'No key yet'}</p>
      {added ? <p className="text-[12px] text-ink-soft">Added {added}</p> : null}
      <Field label={last4 ? 'Replace key' : 'Add key'}>
        <TextInput type="password" value={value} placeholder="Paste key" onChange={(event) => onChange(event.target.value)} autoComplete="off" />
      </Field>
      <Button className="mt-3" variant="ghost" onClick={onSave}>Store encrypted</Button>
    </Card>
  )
}
