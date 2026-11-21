export const INDUSTRIES = [
  'Software',
  'Renewable energy',
  'Food & beverage',
  'Freight & logistics',
  'Medtech',
  'Architecture',
  'Consulting',
  'Retail',
  'Finance',
  'Manufacturing',
] as const

export const REGIONS = [
  'Hovedstaden',
  'Sjælland',
  'Syddanmark',
  'Midtjylland',
  'Nordjylland',
] as const

export const FORMS = ['ApS', 'A/S', 'P/S', 'IVS', 'Enkeltmandsvirksomhed'] as const

export const STATUSES = ['Active', 'Bankrupt', 'Under liquidation', 'Ceased'] as const

export const SIZES = ['1–10', '11–50', '51–200', '201–1,000', '1,000+'] as const

export const AGES = ['Under 3 years', '3–10 years', 'Over 10 years'] as const

export type Industry = (typeof INDUSTRIES)[number]
export type Region = (typeof REGIONS)[number]
export type CompanyForm = (typeof FORMS)[number]
export type CompanyStatus = (typeof STATUSES)[number]
export type SizeBand = (typeof SIZES)[number]
export type AgeBand = (typeof AGES)[number]

export type Company = {
  cvr: string
  name: string
  industry: Industry
  nace: string
  employees: number
  region: Region
  city: string
  form: CompanyForm
  status: CompanyStatus
  founded: number
  protected: boolean
  address: string
  domain: string
}

export type WaterStep = 'idle' | 'running' | 'hit' | 'miss' | 'skipped'
export type QueueState = 'idle' | 'queued' | 'running' | 'done' | 'stopped'

export type ContactScript = {
  own: 'hit' | 'miss'
  prospeo: 'hit' | 'miss'
  findymail: 'hit' | 'miss'
  foundEmail: string | null
  foundPhone: string | null
}

export type Contact = {
  id: string
  cvr: string
  name: string
  title: string
  email: string | null
  phone: string | null
  revealed: boolean
  source: 'own' | 'prospeo' | 'findymail' | null
  verified: boolean
  script: ContactScript
  waterfall: { own: WaterStep; prospeo: WaterStep; findymail: WaterStep }
  queue: QueueState
  ai: Record<string, string>
}

export type AiColumn = {
  id: string
  name: string
  prompt: string
}

export type SavedList = {
  id: string
  name: string
  contactIds: string[]
  createdAt: string
  aiColumns: AiColumn[]
}

export type LedgerKind = 'topup' | 'capture' | 'release' | 'reserve' | 'stop'

export type LedgerEntry = {
  id: string
  at: string
  kind: LedgerKind
  amount: number
  note: string
}

export type Suppression = {
  id: string
  kind: 'email' | 'domain'
  value: string
  addedAt: string
}

export type KeyRecord = {
  last4: string
  addedAt: string
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Member'
  pending?: boolean
}

export type HubField = {
  id: string
  label: string
  hubspot: string
  on: boolean
}

export type HubLog = {
  id: string
  at: string
  listName: string
  pushed: number
  skippedSuppressed: number
  skippedNoEmail: number
  skippedProtected: number
}

export type ToastTone = 'ok' | 'warn' | 'stop'

export type Toast = {
  id: string
  tone: ToastTone
  title: string
  body?: string
}

export type Pack = {
  id: string
  credits: number
  dkk: number
  name: string
  detail: string
}

export type WalkKey =
  | 'login'
  | 'search'
  | 'list'
  | 'enrich'
  | 'suppress'
  | 'export'
  | 'ai'
  | 'hubspot'
  | 'rest'
