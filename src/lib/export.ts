import type { Company, Contact, Suppression } from '../types'

export const REGISTER_TOTAL = 318_204

export type ExportReason = 'ok' | 'empty' | 'fair-use'

export type ExportPlan = {
  title: string
  filename: string
  requested: number
  suppressed: number
  protected: number
  unrevealed: number
  exportable: number
  rows: string[][]
  remaining: number
  reason: ExportReason
}

export function isSuppressed(email: string | null, list: Suppression[]) {
  if (!email) return false
  const normalised = email.trim().toLowerCase()
  const domain = normalised.split('@')[1] ?? ''
  return list.some((item) => {
    const value = item.value.trim().toLowerCase()
    if (item.kind === 'email') return value === normalised
    return domain === value || domain.endsWith(`.${value}`)
  })
}

export function buildExport(input: {
  title: string
  filename: string
  requested: number
  contacts: Contact[]
  companies: Company[]
  suppression: Suppression[]
  remaining: number
  register?: boolean
}): ExportPlan {
  if (input.register) {
    return {
      title: input.title,
      filename: input.filename,
      requested: REGISTER_TOTAL,
      suppressed: 0,
      protected: 0,
      unrevealed: 0,
      exportable: REGISTER_TOTAL,
      rows: [],
      remaining: input.remaining,
      reason: 'fair-use',
    }
  }

  const byCvr = new Map(input.companies.map((company) => [company.cvr, company]))
  let suppressed = 0
  let protectedCount = 0
  let unrevealed = 0
  const kept: { contact: Contact; company: Company }[] = []

  for (const contact of input.contacts) {
    const company = byCvr.get(contact.cvr)
    if (!company) continue
    if (company.protected) {
      protectedCount += 1
      continue
    }
    if (isSuppressed(contact.email, input.suppression)) {
      suppressed += 1
      continue
    }
    if (!contact.revealed || !contact.email) {
      unrevealed += 1
      continue
    }
    kept.push({ contact, company })
  }

  const header = [
    'name',
    'title',
    'email',
    'phone',
    'company',
    'cvr',
    'industry',
    'city',
    'source',
  ]
  const rows = [
    header,
    ...kept.map(({ contact, company }) => [
      contact.name,
      contact.title,
      contact.email ?? '',
      contact.phone ?? '',
      company.name,
      company.cvr,
      company.industry,
      company.city,
      contact.source ?? '',
    ]),
  ]

  let reason: ExportReason = 'ok'
  if (kept.length === 0) reason = 'empty'
  else if (kept.length > input.remaining) reason = 'fair-use'

  return {
    title: input.title,
    filename: input.filename,
    requested: input.requested,
    suppressed,
    protected: protectedCount,
    unrevealed,
    exportable: kept.length,
    rows: reason === 'ok' ? rows : [],
    remaining: input.remaining,
    reason,
  }
}
