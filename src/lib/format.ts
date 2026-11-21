import type { AgeBand, Company, SizeBand } from '../types'

export function sizeBand(employees: number): SizeBand {
  if (employees <= 10) return '1–10'
  if (employees <= 50) return '11–50'
  if (employees <= 200) return '51–200'
  if (employees <= 1000) return '201–1,000'
  return '1,000+'
}

export function ageBand(founded: number): AgeBand {
  const age = 2026 - founded
  if (age < 3) return 'Under 3 years'
  if (age <= 10) return '3–10 years'
  return 'Over 10 years'
}

export function num(value: number) {
  return new Intl.NumberFormat('en-GB').format(value)
}

export function dkk(value: number) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(value)
}

export function stamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!domain) return '••••'
  return `${user.slice(0, 1)}•••@${domain}`
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `+45 •• •• •• ${digits.slice(-2)}`
}

export function slugName(value: string) {
  return value
    .toLowerCase()
    .replaceAll('æ', 'ae')
    .replaceAll('ø', 'oe')
    .replaceAll('å', 'aa')
    .replaceAll('é', 'e')
    .replace(/[^a-z]/g, '')
}

export function companyLabel(company: Company) {
  return `${company.name} · CVR ${company.cvr}`
}

export function sourceLabel(source: 'own' | 'prospeo' | 'findymail' | null) {
  if (source === 'own') return 'Your file'
  if (source === 'prospeo') return 'Prospeo'
  if (source === 'findymail') return 'Findymail'
  return '—'
}
