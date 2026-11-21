import type { Company, Contact } from '../types'

const ICE: Record<string, string> = {
  'c-maja':
    'Havn & Co is still listed at Havnegade — curious how you keep the CVR numbers in your outbound file current.',
  'c-emil':
    'Kystdata’s register record shows 86 people in Hellerup. Is the contact file still living in spreadsheets?',
  'c-ida':
    'Loopfelt was founded in 2021 and is still an ApS in København. Worth a short note on the accounts you already cover?',
}

const ICP: Record<string, string> = {
  'c-maja':
    'Strong fit. Head of Growth at a 42-person software ApS in København — a buyer for a register seat plus credits.',
  'c-emil':
    'Strong fit. CTO at a 86-person software firm. Likely owns the data stack the subscription would replace.',
  'c-ida':
    'Good fit. Founder of an 18-person product studio. Small team, high chance she still exports lists by hand.',
}

const DA: Record<string, string> = {
  'c-maja':
    'Hej Maja — Havn & Co står stadig på Havnegade i CVR. Har I styr på de numre, I allerede skriver til?',
  'c-emil':
    'Hej Emil — Kystdata er registreret i Hellerup med 86 ansatte. Ligger kontaktdata stadig i et regneark?',
  'c-ida':
    'Hej Ida — Loopfelt er et ApS fra 2021 i København. Skal jeg vise, hvordan jeres egne kontakter matcher CVR?',
}

export function writeAi(
  columnName: string,
  contact: Contact,
  company: Company,
) {
  const key = columnName.toLowerCase()
  if (key.includes('danish')) {
    return (
      DA[contact.id] ??
      `Hej ${contact.name.split(' ')[0]} — ${company.name} står i CVR som ${company.form} i ${company.city}. Et kort spørgsmål om jeres ${company.industry.toLowerCase()}?`
    )
  }
  if (key.includes('ice')) {
    return (
      ICE[contact.id] ??
      `${company.name} (CVR ${company.cvr}) is active in ${company.city}. Worth comparing notes on how you cover ${company.industry.toLowerCase()} accounts?`
    )
  }
  return (
    ICP[contact.id] ??
    `${company.name} · ${company.employees} people in ${company.industry}, ${company.city}. ${contact.title} sits close to a register subscription.`
  )
}
