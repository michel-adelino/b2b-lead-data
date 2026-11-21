import { isSuppressed } from './export'
import type { Company, Contact, Suppression } from '../types'

export type MappedRow = {
  name: string
  title: string
  email: string
  phone: string
  cvr: string
}

export type ReviewStatus = 'ready' | 'suppressed' | 'unmatched' | 'duplicate' | 'protected' | 'incomplete'

export type ReviewedRow = MappedRow & {
  status: ReviewStatus
  companyName?: string
}

export function reviewImport(
  rows: MappedRow[],
  companies: Company[],
  contacts: Contact[],
  suppression: Suppression[],
): ReviewedRow[] {
  const byCvr = new Map(companies.map((company) => [company.cvr, company]))
  const seen = new Set(
    contacts
      .filter((contact) => contact.email)
      .map((contact) => `${contact.cvr}|${contact.email!.toLowerCase()}`),
  )

  return rows.map((row) => {
    const cvr = row.cvr.trim()
    const email = row.email.trim()
    const company = byCvr.get(cvr)
    if (!company) return { ...row, status: 'unmatched' as const }
    if (!email || !row.name.trim()) {
      return { ...row, status: 'incomplete' as const, companyName: company.name }
    }
    if (company.protected) {
      return { ...row, status: 'protected' as const, companyName: company.name }
    }
    if (isSuppressed(email, suppression)) {
      return { ...row, status: 'suppressed' as const, companyName: company.name }
    }
    const key = `${company.cvr}|${email.toLowerCase()}`
    if (seen.has(key)) {
      return { ...row, status: 'duplicate' as const, companyName: company.name }
    }
    seen.add(key)
    return { ...row, status: 'ready' as const, companyName: company.name }
  })
}
