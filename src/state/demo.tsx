import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { writeAi } from '../lib/ai'
import { downloadCsv, safeFilename } from '../lib/csv'
import { buildExport, isSuppressed, REGISTER_TOTAL } from '../lib/export'
import type { ExportPlan } from '../lib/export'
import { stamp } from '../lib/format'
import { reviewImport } from '../lib/import'
import type { MappedRow } from '../lib/import'
import {
  AI_PRESETS,
  contacts as seedContacts,
  companies as seedCompanies,
  FAIR_CAP,
  FAIR_USED,
  hubFields,
  ledgerSeed,
  lists as seedLists,
  OPENING_CREDITS,
  PACKS,
  SEAT_LIMIT,
  suppressionSeed,
  teamSeed,
} from '../data/seed'
import type {
  Contact,
  LedgerEntry,
  LedgerKind,
  SavedList,
  TeamMember,
  Toast,
  ToastTone,
  WalkKey,
} from '../types'

export { AI_PRESETS, PACKS, SEAT_LIMIT }

type Done = {
  login: boolean
  search: boolean
  list: boolean
  enrich: boolean
  suppress: boolean
  exportOk: boolean
  exportBlocked: boolean
  ai: boolean
  hubspot: boolean
}

type Seen = {
  wallet: boolean
  settings: boolean
  mcp: boolean
  admin: boolean
}

type Reservation = {
  id: string
  amount: number
  label: string
}

export type DemoState = {
  signedIn: boolean
  role: 'member' | 'admin'
  companies: typeof seedCompanies
  contacts: Contact[]
  lists: SavedList[]
  ledger: LedgerEntry[]
  settled: number
  reservation: Reservation | null
  busy: boolean
  suppression: typeof suppressionSeed
  keys: {
    prospeo: { last4: string; addedAt: string } | null
    findymail: { last4: string; addedAt: string } | null
  }
  team: TeamMember[]
  hubspot: {
    connected: boolean
    portal: string
    fields: { id: string; label: string; hubspot: string; on: boolean }[]
    log: {
      id: string
      at: string
      listName: string
      pushed: number
      skippedSuppressed: number
      skippedNoEmail: number
      skippedProtected: number
    }[]
  }
  fairUse: { cap: number; used: number }
  toasts: Toast[]
  walkHidden: boolean
  done: Done
  seen: Seen
  drawerOpen: boolean
  focusIds: string[]
  runNote: string | null
  aiCursor: { columnId: string; contactId: string } | null
}

let sequence = 5000
function uid(prefix: string) {
  sequence += 1
  return `${prefix}-${sequence}`
}

function cloneContact(contact: Contact): Contact {
  return {
    ...contact,
    script: { ...contact.script },
    waterfall: { ...contact.waterfall },
    ai: { ...contact.ai },
  }
}

function createInitial(): DemoState {
  return {
    signedIn: false,
    role: 'member',
    companies: seedCompanies.map((company) => ({ ...company })),
    contacts: seedContacts.map(cloneContact),
    lists: seedLists.map((list) => ({
      ...list,
      contactIds: [...list.contactIds],
      aiColumns: list.aiColumns.map((column) => ({ ...column })),
    })),
    ledger: ledgerSeed.map((entry) => ({ ...entry })),
    settled: OPENING_CREDITS,
    reservation: null,
    busy: false,
    suppression: suppressionSeed.map((item) => ({ ...item })),
    keys: {
      prospeo: { last4: '9f3a', addedAt: '2 Oct 2026' },
      findymail: null,
    },
    team: teamSeed.map((member) => ({ ...member })),
    hubspot: {
      connected: false,
      portal: 'Nordlys (184429)',
      fields: hubFields.map((field) => ({ ...field })),
      log: [],
    },
    fairUse: { cap: FAIR_CAP, used: FAIR_USED },
    toasts: [],
    walkHidden: false,
    done: {
      login: false,
      search: false,
      list: false,
      enrich: false,
      suppress: false,
      exportOk: false,
      exportBlocked: false,
      ai: false,
      hubspot: false,
    },
    seen: { wallet: false, settings: false, mcp: false, admin: false },
    drawerOpen: false,
    focusIds: [],
    runNote: null,
    aiCursor: null,
  }
}

function blankWaterfall(): Contact['waterfall'] {
  return { own: 'idle', prospeo: 'idle', findymail: 'idle' }
}

function withLedger(state: DemoState, kind: LedgerKind, amount: number, note: string): DemoState {
  const entry: LedgerEntry = { id: uid('led'), at: stamp(), kind, amount, note }
  return { ...state, ledger: [entry, ...state.ledger] }
}

function reserve(state: DemoState, amount: number, label: string, note: string): DemoState {
  return withLedger(
    { ...state, reservation: { id: uid('hold'), amount, label } },
    'reserve',
    amount,
    note,
  )
}

function capture(state: DemoState, amount: number, note: string): DemoState {
  const settled = state.settled - amount
  if (settled < 0) return state
  const held = Math.max(0, (state.reservation?.amount ?? 0) - amount)
  return withLedger(
    {
      ...state,
      settled,
      reservation: held > 0 && state.reservation ? { ...state.reservation, amount: held } : null,
    },
    'capture',
    amount,
    note,
  )
}

function release(state: DemoState, amount: number, note: string): DemoState {
  const held = Math.max(0, (state.reservation?.amount ?? 0) - amount)
  return withLedger(
    {
      ...state,
      reservation: held > 0 && state.reservation ? { ...state.reservation, amount: held } : null,
    },
    'release',
    amount,
    note,
  )
}

function mapContact(state: DemoState, id: string, recipe: (contact: Contact) => Contact): DemoState {
  return {
    ...state,
    contacts: state.contacts.map((contact) => (contact.id === id ? recipe(contact) : contact)),
  }
}

function tourFor(state: DemoState): WalkKey | 'done' {
  if (!state.done.login) return 'login'
  if (!state.done.search) return 'search'
  if (!state.done.list) return 'list'
  if (!state.done.enrich) return 'enrich'
  if (!state.done.suppress) return 'suppress'
  if (!(state.done.exportOk && state.done.exportBlocked)) return 'export'
  if (!state.done.ai) return 'ai'
  if (!state.done.hubspot) return 'hubspot'
  if (!(state.seen.wallet && state.seen.settings && state.seen.mcp && state.seen.admin)) return 'rest'
  return 'done'
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export type DemoValue = DemoState & {
  available: number
  held: number
  fairLeft: number
  tour: WalkKey | 'done'
  signIn: () => void
  signOut: () => void
  setRole: (role: 'member' | 'admin') => void
  reset: () => void
  dismissWalk: () => void
  showWalk: () => void
  markSearch: () => void
  see: (key: keyof Seen) => void
  createList: (name: string, cvrs: string[]) => string | null
  reveal: (id: string) => void
  enrich: (ids: string[]) => Promise<void>
  previewExport: (target: string[] | 'register', title: string, filename: string) => ExportPlan
  commitExport: (target: string[] | 'register', title: string, filename: string) => ExportPlan
  addAiColumn: (listId: string, name: string, prompt: string) => string
  runAi: (listId: string, columnId: string, ids: string[]) => Promise<void>
  buyCredits: (packId: string) => void
  addSuppression: (kind: 'email' | 'domain', value: string) => void
  removeSuppression: (id: string) => void
  saveKey: (provider: 'prospeo' | 'findymail', raw: string) => void
  invite: (name: string, email: string, role: TeamMember['role']) => void
  connectHubspot: () => Promise<void>
  toggleHubField: (id: string) => void
  pushHubspot: (listId: string) => boolean
  importRows: (rows: MappedRow[]) => { added: number; suppressed: number; unmatched: number; duplicate: number; protected: number; incomplete: number }
  closeDrawer: () => void
  dismissToast: (id: string) => void
}

const Ctx = createContext<DemoValue | null>(null)

export function useDemo() {
  const value = useContext(Ctx)
  if (!value) throw new Error('useDemo must be used inside DemoProvider')
  return value
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitial)
  const stateRef = useRef(state)
  const busyRef = useRef(false)
  const generation = useRef(0)
  const enrichRef = useRef<(ids: string[]) => Promise<void>>(async () => {})

  const patch = useCallback((recipe: (current: DemoState) => DemoState) => {
    const next = recipe(stateRef.current)
    stateRef.current = next
    setState(next)
  }, [])

  const pushToast = useCallback(
    (tone: ToastTone, title: string, body?: string) => {
      const id = uid('toast')
      patch((current) => ({
        ...current,
        toasts: [...current.toasts.slice(-3), { id, tone, title, body }],
      }))
      window.setTimeout(() => {
        patch((current) => ({ ...current, toasts: current.toasts.filter((toast) => toast.id !== id) }))
      }, 5200)
    },
    [patch],
  )

  const mark = useCallback(
    (key: keyof Done) => {
      if (stateRef.current.done[key]) return
      patch((current) => ({ ...current, done: { ...current.done, [key]: true } }))
    },
    [patch],
  )

  const signIn = useCallback(() => {
    patch((current) => ({ ...current, signedIn: true, done: { ...current.done, login: true } }))
  }, [patch])

  const signOut = useCallback(() => {
    patch((current) => ({ ...current, signedIn: false }))
  }, [patch])

  const setRole = useCallback(
    (role: 'member' | 'admin') => {
      patch((current) => ({ ...current, role }))
    },
    [patch],
  )

  const reset = useCallback(() => {
    generation.current += 1
    busyRef.current = false
    const next = createInitial()
    stateRef.current = next
    setState(next)
  }, [])

  const dismissWalk = useCallback(() => {
    patch((current) => ({ ...current, walkHidden: true }))
  }, [patch])

  const showWalk = useCallback(() => {
    patch((current) => ({ ...current, walkHidden: false }))
  }, [patch])

  const markSearch = useCallback(() => {
    mark('search')
  }, [mark])

  const see = useCallback(
    (key: keyof Seen) => {
      if (stateRef.current.seen[key]) return
      patch((current) => ({ ...current, seen: { ...current.seen, [key]: true } }))
    },
    [patch],
  )

  const closeDrawer = useCallback(() => {
    patch((current) => ({ ...current, drawerOpen: false }))
  }, [patch])

  const dismissToast = useCallback(
    (id: string) => {
      patch((current) => ({ ...current, toasts: current.toasts.filter((toast) => toast.id !== id) }))
    },
    [patch],
  )

  const createList = useCallback(
    (name: string, cvrs: string[]) => {
      const trimmed = name.trim()
      if (!trimmed) {
        pushToast('warn', 'Name the list')
        return null
      }
      const current = stateRef.current
      let skipped = 0
      const ids: string[] = []
      for (const cvr of cvrs) {
        const company = current.companies.find((item) => item.cvr === cvr)
        if (!company) continue
        if (company.protected) {
          skipped += 1
          continue
        }
        for (const contact of current.contacts) {
          if (contact.cvr === cvr) ids.push(contact.id)
        }
      }
      if (ids.length === 0) {
        pushToast(
          'stop',
          skipped ? 'Protected companies stay out of lists' : 'No contacts for that selection',
          skipped
            ? 'Advertising-protected companies cannot be saved, enriched, or exported.'
            : 'Pick companies that have people linked by CVR.',
        )
        return null
      }
      const id = uid('list')
      patch((prev) => ({
        ...prev,
        done: { ...prev.done, list: true },
        lists: [
          { id, name: trimmed, contactIds: ids, createdAt: stamp(), aiColumns: [] },
          ...prev.lists,
        ],
      }))
      pushToast(
        'ok',
        `Saved ${ids.length} contacts`,
        skipped ? `${skipped} advertising-protected ${skipped === 1 ? 'company was' : 'companies were'} left out.` : undefined,
      )
      return id
    },
    [patch, pushToast],
  )

  const enrich = useCallback(
    async (ids: string[]) => {
      if (busyRef.current) {
        pushToast(
          'stop',
          'Reservation already open',
          'A second batch was refused. Simultaneous requests cannot spend the same credits.',
        )
        return
      }
      const gen = generation.current
      const alive = () => generation.current === gen
      busyRef.current = true
      try {
        const start = stateRef.current
        const unique = [...new Set(ids)]
        const chosen = unique
          .map((id) => start.contacts.find((contact) => contact.id === id))
          .filter((contact): contact is Contact => Boolean(contact))
        if (chosen.length === 0) {
          pushToast('warn', 'Select contacts to enrich')
          return
        }
        const companyOf = (cvr: string) => start.companies.find((company) => company.cvr === cvr)
        const blockedSuppress = chosen.filter((contact) => isSuppressed(contact.email, start.suppression))
        const blockedProtect = chosen.filter((contact) => {
          if (blockedSuppress.some((item) => item.id === contact.id)) return false
          return Boolean(companyOf(contact.cvr)?.protected)
        })
        const ready = chosen.filter((contact) => {
          if (blockedSuppress.some((item) => item.id === contact.id)) return false
          if (companyOf(contact.cvr)?.protected) return false
          if (contact.revealed && contact.verified) return false
          return true
        })
        const already = chosen.filter(
          (contact) =>
            contact.revealed &&
            contact.verified &&
            !blockedSuppress.some((item) => item.id === contact.id) &&
            !companyOf(contact.cvr)?.protected,
        )

        if (blockedSuppress.length) {
          mark('suppress')
          pushToast(
            'stop',
            blockedSuppress.length === 1 ? `${blockedSuppress[0].name} is opted out` : `${blockedSuppress.length} opted-out contacts refused`,
            'Suppression is checked before a credit is reserved.',
          )
        }
        if (blockedProtect.length) {
          pushToast(
            'stop',
            'Advertising-protected',
            'Reklamebeskyttelse blocks enrich. Those companies were not touched.',
          )
        }

        if (ready.length === 0) {
          if (already.length && blockedSuppress.length === 0 && blockedProtect.length === 0) {
            pushToast('ok', 'Already in your file', 'Reveal is free. No credit was reserved.')
          } else if (!blockedSuppress.length && !blockedProtect.length) {
            pushToast('warn', 'Nothing to enrich')
          }
          return
        }

        const readyIds = new Set(ready.map((contact) => contact.id))
        const cinematic = ready.length <= 4
        const stepMs = cinematic ? 700 : 90
        patch((current) => ({
          ...current,
          busy: true,
          drawerOpen: true,
          focusIds: chosen.map((contact) => contact.id),
          runNote: null,
          contacts: current.contacts.map((contact) =>
            readyIds.has(contact.id)
              ? { ...contact, queue: 'queued', waterfall: blankWaterfall() }
              : contact,
          ),
        }))

        let processed = 0
        let capturedCredits = 0
        let stopped = 0

        for (let index = 0; index < ready.length; index += 1) {
          if (!alive()) return
          const person = ready[index]
          const available =
            stateRef.current.settled - (stateRef.current.reservation?.amount ?? 0)
          if (available < 2) {
            stopped = ready.length - index
            const untouched = ready.slice(index).map((contact) => contact.id)
            patch((current) => {
              const noted = withLedger(
                current,
                'stop',
                2,
                `Stopped · ${person.name}. Not enough available credits to reserve 2. Later rows were not touched.`,
              )
              return {
                ...noted,
                runNote: `Stopped on ${person.name}. A reserve of 2 credits would have taken the balance negative, so this row and ${Math.max(stopped - 1, 0)} after it were not touched.`,
                contacts: noted.contacts.map((contact) =>
                  untouched.includes(contact.id) ? { ...contact, queue: 'stopped' } : contact,
                ),
              }
            })
            break
          }

          patch((current) => {
            let next = reserve(
              current,
              2,
              person.name,
              `Reserved 2 · ${person.name}. Worst case is held before own data is checked.`,
            )
            next = mapContact(next, person.id, (contact) => ({
              ...contact,
              queue: 'running',
              waterfall: { own: 'running', prospeo: 'idle', findymail: 'idle' },
            }))
            return next
          })
          await wait(stepMs)
          if (!alive()) return

          if (person.script.own === 'hit' && person.email) {
            patch((current) => {
              let next = mapContact(current, person.id, (contact) => ({
                ...contact,
                revealed: true,
                verified: true,
                source: 'own',
                queue: 'done',
                waterfall: { own: 'hit', prospeo: 'skipped', findymail: 'skipped' },
              }))
              next = release(next, 2, `Released 2 · ${person.name}. Own data verified. Providers were not called.`)
              return next
            })
            processed += 1
            continue
          }

          patch((current) =>
            mapContact(current, person.id, (contact) => ({
              ...contact,
              waterfall: { own: 'miss', prospeo: 'running', findymail: 'idle' },
            })),
          )
          await wait(stepMs)
          if (!alive()) return

          if (person.script.prospeo === 'hit' && person.script.foundEmail) {
            const found = person.script.foundEmail
            const optedOut = isSuppressed(found, stateRef.current.suppression)
            patch((current) => {
              let next = mapContact(current, person.id, (contact) => ({
                ...contact,
                email: optedOut ? contact.email : found,
                phone: optedOut ? contact.phone : person.script.foundPhone,
                revealed: optedOut ? contact.revealed : true,
                verified: optedOut ? contact.verified : true,
                source: optedOut ? contact.source : 'prospeo',
                queue: 'done',
                waterfall: { own: 'miss', prospeo: 'hit', findymail: 'skipped' },
              }))
              next = capture(
                next,
                1,
                optedOut
                  ? `Captured 1 · Prospeo returned an opted-out address for ${person.name}. It was not stored.`
                  : `Captured 1 · Prospeo verified ${person.name}.`,
              )
              next = release(next, 1, `Released 1 · Findymail was not called for ${person.name}.`)
              return next
            })
            if (optedOut) mark('suppress')
            capturedCredits += 1
            processed += 1
            continue
          }

          patch((current) => {
            let next = mapContact(current, person.id, (contact) => ({
              ...contact,
              waterfall: { own: 'miss', prospeo: 'miss', findymail: 'running' },
            }))
            next = capture(next, 1, `Captured 1 · Prospeo had no verified email for ${person.name}.`)
            return next
          })
          capturedCredits += 1
          await wait(stepMs)
          if (!alive()) return

          const found = person.script.foundEmail
          const hit = person.script.findymail === 'hit' && Boolean(found)
          const optedOut = hit && isSuppressed(found, stateRef.current.suppression)
          patch((current) => {
            let next = mapContact(current, person.id, (contact) => ({
              ...contact,
              email: hit && !optedOut ? found : contact.email,
              phone: hit && !optedOut ? person.script.foundPhone : contact.phone,
              revealed: hit && !optedOut ? true : contact.revealed,
              verified: hit && !optedOut ? true : contact.verified,
              source: hit && !optedOut ? 'findymail' : contact.source,
              queue: 'done',
              waterfall: { own: 'miss', prospeo: 'miss', findymail: hit ? 'hit' : 'miss' },
            }))
            next = capture(
              next,
              1,
              hit
                ? optedOut
                  ? `Captured 1 · Findymail returned an opted-out address for ${person.name}. It was not stored.`
                  : `Captured 1 · Findymail verified ${person.name}.`
                : `Captured 1 · Findymail had no verified email for ${person.name}.`,
            )
            return next
          })
          if (optedOut) mark('suppress')
          capturedCredits += 1
          processed += 1
        }

        if (!alive()) return
        if (processed > 0) mark('enrich')
        if (stopped === 0) {
          patch((current) => ({
            ...current,
            runNote: `Finished ${processed} ${processed === 1 ? 'contact' : 'contacts'}. Captured ${capturedCredits} ${capturedCredits === 1 ? 'credit' : 'credits'}. Unused holds were released.`,
          }))
          pushToast(
            'ok',
            'Waterfall finished',
            `Captured ${capturedCredits}. Own-data hits cost nothing, and skipped providers released their hold.`,
          )
        } else {
          pushToast(
            'stop',
            'Batch stopped on a reservation',
            `${processed} finished. ${stopped} were not touched. The balance never went negative.`,
          )
        }
      } finally {
        if (alive()) {
          busyRef.current = false
          patch((current) => {
            const cleared = current.reservation
              ? release(current, current.reservation.amount, 'Hold released')
              : current
            return { ...cleared, busy: false, aiCursor: null }
          })
        }
      }
    },
    [mark, patch, pushToast],
  )
  enrichRef.current = enrich

  const reveal = useCallback(
    (id: string) => {
      const current = stateRef.current
      const contact = current.contacts.find((item) => item.id === id)
      if (!contact) return
      const company = current.companies.find((item) => item.cvr === contact.cvr)
      if (isSuppressed(contact.email, current.suppression)) {
        mark('suppress')
        pushToast(
          'stop',
          `${contact.name} is on the opt-out list`,
          'Reveal, import, and export all refuse this person. No credit was reserved.',
        )
        return
      }
      if (company?.protected) {
        pushToast(
          'stop',
          'Advertising-protected company',
          `${company.name} is flagged reklamebeskyttelse and cannot be used for outreach.`,
        )
        return
      }
      if (contact.verified && contact.email) {
        patch((prev) => mapContact(prev, id, (item) => ({ ...item, revealed: true })))
        pushToast('ok', 'Revealed from your file', 'Own data is free. No credit was reserved.')
        return
      }
      void enrichRef.current([id])
    },
    [mark, patch, pushToast],
  )

  const planFor = useCallback((target: string[] | 'register', title: string, filename: string) => {
    const current = stateRef.current
    const remaining = current.fairUse.cap - current.fairUse.used
    if (target === 'register') {
      return buildExport({
        title,
        filename,
        requested: REGISTER_TOTAL,
        contacts: [],
        companies: current.companies,
        suppression: current.suppression,
        remaining,
        register: true,
      })
    }
    const contacts = target
      .map((id) => current.contacts.find((contact) => contact.id === id))
      .filter((contact): contact is Contact => Boolean(contact))
    return buildExport({
      title,
      filename,
      requested: contacts.length,
      contacts,
      companies: current.companies,
      suppression: current.suppression,
      remaining,
    })
  }, [])

  const previewExport = planFor

  const commitExport = useCallback(
    (target: string[] | 'register', title: string, filename: string) => {
      const plan = planFor(target, title, filename)
      if (plan.reason === 'fair-use') {
        mark('exportBlocked')
        pushToast(
          'stop',
          'Export stopped at the fair-use cap',
          `${plan.exportable.toLocaleString('en-GB')} rows would cross the cap. You have ${plan.remaining} left. Nothing was written. No partial file, no overage.`,
        )
        return plan
      }
      if (plan.reason === 'empty') {
        pushToast(
          'warn',
          'Nothing to export',
          'Reveal a verified email first. Opted-out and advertising-protected rows are left out.',
        )
        return plan
      }
      downloadCsv(`${safeFilename(filename)}.csv`, plan.rows)
      const written = Math.max(plan.rows.length - 1, 0)
      patch((current) => ({
        ...current,
        fairUse: { ...current.fairUse, used: current.fairUse.used + written },
        done: {
          ...current.done,
          exportOk: true,
          suppress: current.done.suppress || plan.suppressed > 0,
        },
      }))
      pushToast(
        'ok',
        `Exported ${written} rows`,
        plan.suppressed
          ? `${plan.suppressed} opted-out ${plan.suppressed === 1 ? 'contact was' : 'contacts were'} left out of the file.`
          : 'Fair use counted the whole file. It stopped only if the cap would have been crossed.',
      )
      return plan
    },
    [mark, patch, planFor, pushToast],
  )

  const addAiColumn = useCallback(
    (listId: string, name: string, prompt: string) => {
      const id = uid('col')
      patch((current) => ({
        ...current,
        lists: current.lists.map((list) =>
          list.id === listId
            ? { ...list, aiColumns: [...list.aiColumns, { id, name: name.trim(), prompt: prompt.trim() }] }
            : list,
        ),
      }))
      return id
    },
    [patch],
  )

  const runAi = useCallback(
    async (listId: string, columnId: string, ids: string[]) => {
      if (busyRef.current) {
        pushToast(
          'stop',
          'Reservation already open',
          'A second batch was refused. Simultaneous requests cannot spend the same credits.',
        )
        return
      }
      const gen = generation.current
      const alive = () => generation.current === gen
      busyRef.current = true
      try {
        const start = stateRef.current
        const list = start.lists.find((item) => item.id === listId)
        const column = list?.aiColumns.find((item) => item.id === columnId)
        if (!column) {
          pushToast('warn', 'Add a column first')
          return
        }
        const chosen = [...new Set(ids)]
          .map((id) => start.contacts.find((contact) => contact.id === id))
          .filter((contact): contact is Contact => Boolean(contact))
        if (chosen.length === 0) {
          pushToast('warn', 'Select rows to run')
          return
        }
        patch((current) => ({ ...current, busy: true }))
        let written = 0
        let stopped = 0
        const stepMs = chosen.length > 6 ? 80 : 380
        for (let index = 0; index < chosen.length; index += 1) {
          if (!alive()) return
          const person = chosen[index]
          const company = stateRef.current.companies.find((item) => item.cvr === person.cvr)
          if (!company) continue
          if (company.protected || isSuppressed(person.email, stateRef.current.suppression)) {
            if (isSuppressed(person.email, stateRef.current.suppression)) mark('suppress')
            continue
          }
          if (person.ai[columnId]) continue
          const available = stateRef.current.settled - (stateRef.current.reservation?.amount ?? 0)
          if (available < 1) {
            stopped = chosen.length - index
            patch((current) =>
              withLedger(
                current,
                'stop',
                1,
                `Stopped · ${column.name} on ${person.name}. Not enough credits to reserve 1.`,
              ),
            )
            break
          }
          patch((current) => {
            const held = reserve(current, 1, person.name, `Reserved 1 · ${column.name} · ${person.name}`)
            return { ...held, aiCursor: { columnId, contactId: person.id } }
          })
          await wait(stepMs)
          if (!alive()) return
          const text = writeAi(column.name, person, company)
          patch((current) => {
            let next = mapContact(current, person.id, (contact) => ({
              ...contact,
              ai: { ...contact.ai, [columnId]: text },
            }))
            next = capture(next, 1, `Captured 1 · ${column.name} · ${person.name}`)
            return { ...next, aiCursor: null }
          })
          written += 1
        }
        if (!alive()) return
        if (written > 0) mark('ai')
        if (stopped > 0) {
          pushToast('stop', 'AI column stopped', `${written} cells written. ${stopped} were not touched.`)
        } else if (written > 0) {
          pushToast('ok', `${column.name} filled`, `${written} ${written === 1 ? 'cell' : 'cells'} · ${written} credits captured.`)
        } else {
          pushToast('warn', 'No cells to write', 'Opted-out rows are skipped and are not charged.')
        }
      } finally {
        if (alive()) {
          busyRef.current = false
          patch((current) => {
            const cleared = current.reservation
              ? release(current, current.reservation.amount, 'Hold released')
              : current
            return { ...cleared, busy: false, aiCursor: null }
          })
        }
      }
    },
    [mark, patch, pushToast],
  )

  const buyCredits = useCallback(
    (packId: string) => {
      const pack = PACKS.find((item) => item.id === packId)
      if (!pack) return
      patch((current) =>
        withLedger(
          { ...current, settled: current.settled + pack.credits },
          'topup',
          pack.credits,
          `Prepaid pack · ${pack.credits} credits · ${pack.dkk} DKK`,
        ),
      )
      pushToast('ok', `${pack.credits} credits added`, 'The wallet cannot go negative. This only adds a prepaid balance.')
    },
    [patch, pushToast],
  )

  const addSuppression = useCallback(
    (kind: 'email' | 'domain', value: string) => {
      const cleaned = value.trim().toLowerCase().replace(/^@/, '')
      if (!cleaned || (kind === 'email' && !cleaned.includes('@'))) {
        pushToast('warn', kind === 'email' ? 'Enter a full email' : 'Enter a domain')
        return
      }
      if (stateRef.current.suppression.some((item) => item.kind === kind && item.value === cleaned)) {
        pushToast('warn', 'Already on the list')
        return
      }
      patch((current) => ({
        ...current,
        suppression: [
          { id: uid('sup'), kind, value: cleaned, addedAt: stamp() },
          ...current.suppression,
        ],
      }))
      pushToast('ok', 'Added to suppression', 'Import, reveal, and export will refuse this match.')
    },
    [patch, pushToast],
  )

  const removeSuppression = useCallback(
    (id: string) => {
      patch((current) => ({
        ...current,
        suppression: current.suppression.filter((item) => item.id !== id),
      }))
    },
    [patch],
  )

  const saveKey = useCallback(
    (provider: 'prospeo' | 'findymail', raw: string) => {
      const cleaned = raw.trim()
      if (cleaned.length < 12) {
        pushToast('warn', 'That key looks too short')
        return
      }
      const last4 = cleaned.slice(-4)
      patch((current) => ({
        ...current,
        keys: { ...current.keys, [provider]: { last4, addedAt: stamp() } },
      }))
      pushToast('ok', 'Key stored encrypted', 'The full key is not shown again. Only the last four characters remain.')
    },
    [patch, pushToast],
  )

  const invite = useCallback(
    (name: string, email: string, role: TeamMember['role']) => {
      if (!name.trim() || !email.includes('@')) {
        pushToast('warn', 'Name and a work email are required')
        return
      }
      if (stateRef.current.team.length >= SEAT_LIMIT) {
        pushToast(
          'stop',
          'Seat limit reached',
          'Register Annual includes 5 seats. The invite was not sent. There is no overage.',
        )
        return
      }
      patch((current) => ({
        ...current,
        team: [
          ...current.team,
          { id: uid('tm'), name: name.trim(), email: email.trim(), role, pending: true },
        ],
      }))
      pushToast('ok', `Invite sent to ${email.trim()}`)
    },
    [patch, pushToast],
  )

  const connectHubspot = useCallback(async () => {
    const gen = generation.current
    await wait(800)
    if (generation.current !== gen) return
    patch((current) => ({ ...current, hubspot: { ...current.hubspot, connected: true } }))
    pushToast('ok', 'HubSpot connected', 'Portal Nordlys (184429). Suppressed rows will be skipped on push.')
  }, [patch, pushToast])

  const toggleHubField = useCallback(
    (id: string) => {
      patch((current) => ({
        ...current,
        hubspot: {
          ...current.hubspot,
          fields: current.hubspot.fields.map((field) =>
            field.id === id ? { ...field, on: !field.on } : field,
          ),
        },
      }))
    },
    [patch],
  )

  const pushHubspot = useCallback(
    (listId: string) => {
      const current = stateRef.current
      if (!current.hubspot.connected) {
        pushToast('warn', 'Connect HubSpot first', 'The push stays in Felt until the portal is connected.')
        return false
      }
      const list = current.lists.find((item) => item.id === listId)
      if (!list) return false
      let pushed = 0
      let skippedSuppressed = 0
      let skippedNoEmail = 0
      let skippedProtected = 0
      for (const id of list.contactIds) {
        const contact = current.contacts.find((item) => item.id === id)
        if (!contact) continue
        const company = current.companies.find((item) => item.cvr === contact.cvr)
        if (company?.protected) {
          skippedProtected += 1
          continue
        }
        if (isSuppressed(contact.email, current.suppression)) {
          skippedSuppressed += 1
          continue
        }
        if (!contact.revealed || !contact.email) {
          skippedNoEmail += 1
          continue
        }
        pushed += 1
      }
      patch((prev) => ({
        ...prev,
        done: {
          ...prev.done,
          hubspot: true,
          suppress: prev.done.suppress || skippedSuppressed > 0,
        },
        hubspot: {
          ...prev.hubspot,
          log: [
            {
              id: uid('hub'),
              at: stamp(),
              listName: list.name,
              pushed,
              skippedSuppressed,
              skippedNoEmail,
              skippedProtected,
            },
            ...prev.hubspot.log,
          ],
        },
      }))
      pushToast(
        'ok',
        `Pushed ${pushed} to HubSpot`,
        skippedSuppressed ? `${skippedSuppressed} opted-out rows were skipped.` : undefined,
      )
      return true
    },
    [patch, pushToast],
  )

  const importRows = useCallback(
    (rows: MappedRow[]) => {
      const current = stateRef.current
      const reviewed = reviewImport(rows, current.companies, current.contacts, current.suppression)
      const counts = {
        added: 0,
        suppressed: 0,
        unmatched: 0,
        duplicate: 0,
        protected: 0,
        incomplete: 0,
      }
      const additions: Contact[] = []
      for (const row of reviewed) {
        if (row.status === 'suppressed') counts.suppressed += 1
        else if (row.status === 'unmatched') counts.unmatched += 1
        else if (row.status === 'duplicate') counts.duplicate += 1
        else if (row.status === 'protected') counts.protected += 1
        else if (row.status === 'incomplete') counts.incomplete += 1
        else {
          counts.added += 1
          additions.push({
            id: uid('c'),
            cvr: row.cvr.trim(),
            name: row.name.trim(),
            title: row.title.trim() || 'Contact',
            email: row.email.trim(),
            phone: row.phone.trim() || null,
            revealed: false,
            source: 'own',
            verified: true,
            script: {
              own: 'hit',
              prospeo: 'miss',
              findymail: 'miss',
              foundEmail: null,
              foundPhone: null,
            },
            waterfall: blankWaterfall(),
            queue: 'idle',
            ai: {},
          })
        }
      }
      if (counts.suppressed > 0) mark('suppress')
      patch((prev) => ({ ...prev, contacts: [...additions, ...prev.contacts] }))
      pushToast(
        counts.added ? 'ok' : 'warn',
        counts.added ? `Imported ${counts.added}` : 'Nothing imported',
        counts.suppressed
          ? `${counts.suppressed} opted-out rows were excluded before they entered the workspace.`
          : 'Emails from your file stay masked until reveal. Reveal is free.',
      )
      return counts
    },
    [mark, patch, pushToast],
  )

  const available = state.settled - (state.reservation?.amount ?? 0)
  const held = state.reservation?.amount ?? 0
  const fairLeft = state.fairUse.cap - state.fairUse.used
  const tour = tourFor(state)

  const value = useMemo<DemoValue>(
    () => ({
      ...state,
      available,
      held,
      fairLeft,
      tour,
      signIn,
      signOut,
      setRole,
      reset,
      dismissWalk,
      showWalk,
      markSearch,
      see,
      createList,
      reveal,
      enrich,
      previewExport,
      commitExport,
      addAiColumn,
      runAi,
      buyCredits,
      addSuppression,
      removeSuppression,
      saveKey,
      invite,
      connectHubspot,
      toggleHubField,
      pushHubspot,
      importRows,
      closeDrawer,
      dismissToast,
    }),
    [
      state,
      available,
      held,
      fairLeft,
      tour,
      signIn,
      signOut,
      setRole,
      reset,
      dismissWalk,
      showWalk,
      markSearch,
      see,
      createList,
      reveal,
      enrich,
      previewExport,
      commitExport,
      addAiColumn,
      runAi,
      buyCredits,
      addSuppression,
      removeSuppression,
      saveKey,
      invite,
      connectHubspot,
      toggleHubField,
      pushHubspot,
      importRows,
      closeDrawer,
      dismissToast,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
