import { slugName } from '../lib/format'
import type {
  Company,
  Contact,
  ContactScript,
  HubField,
  LedgerEntry,
  SavedList,
  Suppression,
  TeamMember,
} from '../types'

export const REGISTER_SYNC = 'Today, 06:10'
export const REGISTER_UPDATED = 1204
export const SEAT_LIMIT = 5
export const FAIR_CAP = 2000
export const FAIR_USED = 1972
export const OPENING_CREDITS = 48

export const sampleCsv = `name,title,email,phone,cvr
Clara Vang,Sales Director,clara.vang@havn.co,+45 31 20 11 45,39881234
Freja Lind,Marketing Lead,freja.lind@solhavn.dk,+45 22 18 44 09,45519028
Otto Skov,Owner,otto@unknown-bakery.dk,+45 40 11 22 33,99999999
Signe Ravn,COO,signe.ravn@vindholm.dk,+45 76 12 30 08,27440019
Niels Holm,Advisor,niels.holm@do-not-mail.dk,+45 20 10 30 40,36550944`

export const companies: Company[] = [
  { cvr: '39881234', name: 'Havn & Co ApS', industry: 'Software', nace: '62.01', employees: 42, region: 'Hovedstaden', city: 'København', form: 'ApS', status: 'Active', founded: 2016, protected: false, address: 'Havnegade 12, 1058 København K', domain: 'havn.co' },
  { cvr: '41220918', name: 'Loopfelt ApS', industry: 'Software', nace: '62.01', employees: 18, region: 'Hovedstaden', city: 'København', form: 'ApS', status: 'Active', founded: 2021, protected: false, address: 'Rådhusstræde 4, 1466 København K', domain: 'loopfelt.dk' },
  { cvr: '37660021', name: 'Kystdata ApS', industry: 'Software', nace: '62.01', employees: 86, region: 'Hovedstaden', city: 'Hellerup', form: 'ApS', status: 'Active', founded: 2014, protected: false, address: 'Strandvejen 60, 2900 Hellerup', domain: 'kystdata.dk' },
  { cvr: '33441890', name: 'Nordkode A/S', industry: 'Software', nace: '62.01', employees: 260, region: 'Midtjylland', city: 'Aarhus', form: 'A/S', status: 'Active', founded: 2009, protected: false, address: 'Åboulevarden 22, 8000 Aarhus C', domain: 'nordkode.dk' },
  { cvr: '44120033', name: 'Strandbugt Software ApS', industry: 'Software', nace: '62.01', employees: 7, region: 'Syddanmark', city: 'Odense', form: 'ApS', status: 'Active', founded: 2024, protected: false, address: 'Vestergade 18, 5000 Odense C', domain: 'strandbugt.dk' },
  { cvr: '28991102', name: 'Fyrlinjen A/S', industry: 'Software', nace: '62.02', employees: 140, region: 'Nordjylland', city: 'Aalborg', form: 'A/S', status: 'Active', founded: 2001, protected: false, address: 'Kastetvej 9, 9000 Aalborg', domain: 'fyrlinjen.dk' },
  { cvr: '45519028', name: 'Nyhavn Systems ApS', industry: 'Software', nace: '62.01', employees: 23, region: 'Hovedstaden', city: 'København', form: 'ApS', status: 'Active', founded: 2025, protected: false, address: 'Nyhavn 31, 1051 København K', domain: 'nyhavn.io' },
  { cvr: '21004455', name: 'Pixelhuset IVS', industry: 'Software', nace: '62.01', employees: 3, region: 'Hovedstaden', city: 'København', form: 'IVS', status: 'Bankrupt', founded: 2017, protected: false, address: 'Istedgade 88, 1650 København V', domain: 'pixelhuset.dk' },
  { cvr: '27440019', name: 'Vindholm Energy A/S', industry: 'Renewable energy', nace: '35.11', employees: 540, region: 'Syddanmark', city: 'Esbjerg', form: 'A/S', status: 'Active', founded: 2004, protected: false, address: 'Havnegade 3, 6700 Esbjerg', domain: 'vindholm.dk' },
  { cvr: '40118822', name: 'Blæst & Co ApS', industry: 'Renewable energy', nace: '35.11', employees: 64, region: 'Midtjylland', city: 'Herning', form: 'ApS', status: 'Active', founded: 2018, protected: false, address: 'Østergade 14, 7400 Herning', domain: 'blaest.co' },
  { cvr: '36001277', name: 'Østerhav Wind P/S', industry: 'Renewable energy', nace: '35.11', employees: 1200, region: 'Nordjylland', city: 'Frederikshavn', form: 'P/S', status: 'Active', founded: 2011, protected: false, address: 'Havnepladsen 6, 9900 Frederikshavn', domain: 'osterhavwind.dk' },
  { cvr: '19883345', name: 'Brygge Kaffe A/S', industry: 'Food & beverage', nace: '10.71', employees: 120, region: 'Hovedstaden', city: 'København', form: 'A/S', status: 'Active', founded: 2008, protected: false, address: 'Islands Brygge 32, 2300 København S', domain: 'bryggekaffe.dk' },
  { cvr: '42216750', name: 'Maltnord ApS', industry: 'Food & beverage', nace: '11.05', employees: 34, region: 'Midtjylland', city: 'Aarhus', form: 'ApS', status: 'Active', founded: 2019, protected: false, address: 'Mejlgade 51, 8000 Aarhus C', domain: 'maltnord.dk' },
  { cvr: '25550991', name: 'Slagelse Mejeri A/S', industry: 'Food & beverage', nace: '10.51', employees: 410, region: 'Sjælland', city: 'Slagelse', form: 'A/S', status: 'Active', founded: 1994, protected: false, address: 'Industrivej 8, 4200 Slagelse', domain: 'slagelse-mejeri.dk' },
  { cvr: '31220084', name: 'Fjordfragt A/S', industry: 'Freight & logistics', nace: '49.41', employees: 890, region: 'Midtjylland', city: 'Aarhus', form: 'A/S', status: 'Active', founded: 1998, protected: false, address: 'Søren Frichs Vej 40, 8230 Åbyhøj', domain: 'fjordfragt.dk' },
  { cvr: '38812006', name: 'Kystvognen ApS', industry: 'Freight & logistics', nace: '49.41', employees: 52, region: 'Syddanmark', city: 'Kolding', form: 'ApS', status: 'Active', founded: 2015, protected: false, address: 'Niels Bohrs Vej 5, 6000 Kolding', domain: 'kystvognen.dk' },
  { cvr: '26771130', name: 'Havnekaj Logistics A/S', industry: 'Freight & logistics', nace: '52.29', employees: 1500, region: 'Hovedstaden', city: 'København', form: 'A/S', status: 'Active', founded: 1987, protected: false, address: 'Levantkaj 2, 2150 Nordhavn', domain: 'havnekaj.dk' },
  { cvr: '40993312', name: 'Klinik Mesa ApS', industry: 'Medtech', nace: '21.20', employees: 28, region: 'Syddanmark', city: 'Odense', form: 'ApS', status: 'Active', founded: 2019, protected: false, address: 'Pantheonsgade 7, 5000 Odense C', domain: 'klinikmesa.dk' },
  { cvr: '35120047', name: 'Scanprobe A/S', industry: 'Medtech', nace: '32.50', employees: 190, region: 'Hovedstaden', city: 'Ballerup', form: 'A/S', status: 'Active', founded: 2012, protected: false, address: 'Lautrupvang 8, 2750 Ballerup', domain: 'scanprobe.dk' },
  { cvr: '44401880', name: 'Lumora Health ApS', industry: 'Medtech', nace: '21.20', employees: 9, region: 'Midtjylland', city: 'Aarhus', form: 'ApS', status: 'Active', founded: 2024, protected: false, address: 'Trøjborgvej 70, 8200 Aarhus N', domain: 'lumora.health' },
  { cvr: '37770015', name: 'Atelier Skaane ApS', industry: 'Architecture', nace: '71.11', employees: 15, region: 'Midtjylland', city: 'Aarhus', form: 'ApS', status: 'Active', founded: 2021, protected: false, address: 'Mejlborg 3, 8000 Aarhus C', domain: 'atelierskaane.dk' },
  { cvr: '21448890', name: 'Tegnestuen Holm A/S', industry: 'Architecture', nace: '71.11', employees: 72, region: 'Hovedstaden', city: 'København', form: 'A/S', status: 'Active', founded: 1999, protected: false, address: 'Toldbodgade 18, 1253 København K', domain: 'tegnestuenholm.dk' },
  { cvr: '43001126', name: 'Mur & Lys ApS', industry: 'Architecture', nace: '71.11', employees: 6, region: 'Sjælland', city: 'Roskilde', form: 'ApS', status: 'Active', founded: 2023, protected: false, address: 'Algade 21, 4000 Roskilde', domain: 'murlys.dk' },
  { cvr: '36550944', name: 'Klarrådgivning ApS', industry: 'Consulting', nace: '70.22', employees: 22, region: 'Hovedstaden', city: 'København', form: 'ApS', status: 'Active', founded: 2017, protected: false, address: 'Bredgade 25, 1260 København K', domain: 'klarraad.dk' },
  { cvr: '29910028', name: 'Partnere ved Kanalen P/S', industry: 'Consulting', nace: '70.22', employees: 110, region: 'Hovedstaden', city: 'København', form: 'P/S', status: 'Active', founded: 2006, protected: false, address: 'Holbergsgade 14, 1057 København K', domain: 'kanalen.dk' },
  { cvr: '18882003', name: 'Butikshuset A/S', industry: 'Retail', nace: '47.19', employees: 2400, region: 'Sjælland', city: 'Roskilde', form: 'A/S', status: 'Active', founded: 1978, protected: false, address: 'Københavnsvej 50, 4000 Roskilde', domain: 'butikshuset.dk' },
  { cvr: '41556019', name: 'Linned & Co ApS', industry: 'Retail', nace: '47.51', employees: 19, region: 'Syddanmark', city: 'Odense', form: 'ApS', status: 'Active', founded: 2020, protected: false, address: 'Vestergade 55, 5000 Odense C', domain: 'linned.co' },
  { cvr: '19007721', name: 'Trælasten Vest ApS', industry: 'Retail', nace: '47.52', employees: 26, region: 'Midtjylland', city: 'Herning', form: 'ApS', status: 'Ceased', founded: 2005, protected: false, address: 'Silkeborgvej 90, 7400 Herning', domain: 'traelastvest.dk' },
  { cvr: '33330091', name: 'Øresund Finance A/S', industry: 'Finance', nace: '64.19', employees: 330, region: 'Hovedstaden', city: 'Hellerup', form: 'A/S', status: 'Active', founded: 2003, protected: false, address: 'Tuborg Boulevard 12, 2900 Hellerup', domain: 'oerfinance.dk' },
  { cvr: '40221157', name: 'Folio Kredit ApS', industry: 'Finance', nace: '64.92', employees: 41, region: 'Midtjylland', city: 'Aarhus', form: 'ApS', status: 'Active', founded: 2018, protected: false, address: 'Banegårdspladsen 2, 8000 Aarhus C', domain: 'foliokredit.dk' },
  { cvr: '22110987', name: 'Glasværk Syd ApS', industry: 'Manufacturing', nace: '23.13', employees: 48, region: 'Syddanmark', city: 'Kolding', form: 'ApS', status: 'Under liquidation', founded: 1992, protected: false, address: 'Glasvej 1, 6000 Kolding', domain: 'glasvaerk.dk' },
  { cvr: '50112233', name: 'Familie Holm Consulting', industry: 'Consulting', nace: '70.22', employees: 1, region: 'Hovedstaden', city: 'Helsingør', form: 'Enkeltmandsvirksomhed', status: 'Active', founded: 2013, protected: true, address: 'Stengade 40, 3000 Helsingør', domain: 'holm-consult.dk' },
  { cvr: '50229871', name: 'Søren Bak Keramik', industry: 'Retail', nace: '47.19', employees: 2, region: 'Syddanmark', city: 'Svendborg', form: 'Enkeltmandsvirksomhed', status: 'Active', founded: 2009, protected: true, address: 'Gerritsgade 11, 5700 Svendborg', domain: 'bakkeramik.dk' },
  { cvr: '50334410', name: 'Lindholm Revision ApS', industry: 'Finance', nace: '69.20', employees: 4, region: 'Sjælland', city: 'Næstved', form: 'ApS', status: 'Active', founded: 2016, protected: true, address: 'Axeltorv 3, 4700 Næstved', domain: 'lindholm-rev.dk' },
]

type Override = {
  id: string
  name: string
  title: string
  own: 'hit' | 'miss'
  prospeo?: 'hit' | 'miss'
  findymail?: 'hit' | 'miss'
  email?: string | null
  phone?: string | null
  foundEmail?: string | null
  foundPhone?: string | null
  revealed?: boolean
}

const overrides: Record<string, Override> = {
  '39881234': {
    id: 'c-maja',
    name: 'Maja Kruse',
    title: 'Head of Growth',
    own: 'hit',
    email: 'maja.kruse@havn.co',
    phone: '+45 31 42 18 07',
    revealed: false,
  },
  '41220918': {
    id: 'c-ida',
    name: 'Ida Berg',
    title: 'Founder',
    own: 'miss',
    prospeo: 'miss',
    findymail: 'hit',
    foundEmail: 'ida@loopfelt.dk',
    foundPhone: '+45 42 77 01 16',
  },
  '37660021': {
    id: 'c-emil',
    name: 'Emil Sørensen',
    title: 'CTO',
    own: 'miss',
    prospeo: 'hit',
    foundEmail: 'emil.sorensen@kystdata.dk',
    foundPhone: '+45 53 18 22 90',
  },
  '33441890': {
    id: 'c-noah',
    name: 'Noah Kjær',
    title: 'VP Sales',
    own: 'hit',
    email: 'noah.kjaer@nordkode.dk',
    phone: '+45 86 12 40 33',
    revealed: true,
  },
  '28991102': {
    id: 'c-asta',
    name: 'Asta Holm',
    title: 'Commercial Director',
    own: 'hit',
    email: 'asta.holm@fyrlinjen.dk',
    phone: '+45 98 12 55 70',
    revealed: true,
  },
  '45519028': {
    id: 'c-freja',
    name: 'Freja Lind',
    title: 'Marketing Lead',
    own: 'hit',
    email: 'freja.lind@solhavn.dk',
    phone: '+45 22 18 44 09',
    revealed: false,
  },
  '44120033': {
    id: 'c-laerke',
    name: 'Lærke Iversen',
    title: 'Product Lead',
    own: 'hit',
    email: 'laerke.iversen@strandbugt.dk',
    phone: '+45 60 18 44 21',
    revealed: false,
  },
}

const pool: [string, string, string][] = [
  ['Magnus', 'Dalgaard', 'Managing Director'],
  ['Sigrid', 'Bech', 'Finance Director'],
  ['Oliver', 'Krogh', 'Head of Sales'],
  ['Nanna', 'Friis', 'Operations Lead'],
  ['Jonas', 'Vester', 'Commercial Lead'],
  ['Ellen', 'Munk', 'People Lead'],
  ['Mikkel', 'Strand', 'Head of Partnerships'],
  ['Karla', 'Bjerre', 'Marketing Director'],
  ['Andreas', 'Lund', 'General Manager'],
  ['Pil', 'Skovgaard', 'Head of Customer'],
  ['Rasmus', 'Toft', 'Sales Director'],
  ['Marie', 'Kofod', 'COO'],
  ['Sebastian', 'Holm', 'Country Manager'],
  ['Ida Marie', 'Kragh', 'Head of Expansion'],
  ['Frederik', 'Bang', 'Finance Lead'],
  ['Astrid', 'Mølgaard', 'Director'],
  ['Carl', 'Nyholm', 'Head of Procurement'],
  ['Liv', 'Eskildsen', 'Marketing Manager'],
  ['Valdemar', 'Riis', 'Managing Partner'],
  ['Alma', 'Søndergaard', 'Head of Studio'],
  ['August', 'Kirk', 'Commercial Director'],
  ['Frida', 'Hald', 'Office Lead'],
  ['Malthe', 'Borup', 'CEO'],
  ['Nora', 'Vang', 'Head of Growth'],
  ['William', 'Kaae', 'Plant Manager'],
  ['Sara', 'Dahl', 'Owner'],
  ['Emilie', 'Frost', 'Partner'],
  ['Hugo', 'Bruun', 'Advisor'],
]

const gapPeople: [string, string][] = [
  ['Anders', 'Nielsen'],
  ['Birgitte', 'Jensen'],
  ['Christian', 'Hansen'],
  ['Dorthe', 'Pedersen'],
  ['Esben', 'Andersen'],
  ['Gitte', 'Christensen'],
  ['Henrik', 'Larsen'],
  ['Inger', 'Sørensen'],
  ['Jakob', 'Rasmussen'],
  ['Karen', 'Jørgensen'],
  ['Lars', 'Petersen'],
  ['Mette', 'Madsen'],
  ['Nikolaj', 'Kristensen'],
  ['Olivia', 'Olsen'],
  ['Peter', 'Thomsen'],
  ['Rikke', 'Christiansen'],
  ['Sofie', 'Poulsen'],
  ['Thomas', 'Johansen'],
  ['Ulla', 'Møller'],
  ['Viktor', 'Knudsen'],
  ['Winnie', 'Bak'],
  ['Yasmin', 'Lund'],
  ['Adam', 'Friis'],
  ['Bente', 'Krogh'],
  ['Casper', 'Holm'],
  ['Diana', 'Skov'],
]

const gapTitles = [
  'Head of Sales',
  'Finance Director',
  'Operations Lead',
  'Managing Director',
  'Marketing Manager',
]

const gapHosts = new Set([
  '27440019',
  '40118822',
  '36001277',
  '19883345',
  '42216750',
  '25550991',
  '31220084',
  '38812006',
  '26771130',
  '40993312',
  '35120047',
  '44401880',
  '37770015',
  '21448890',
  '43001126',
  '36550944',
  '29910028',
  '18882003',
  '41556019',
  '33330091',
  '40221157',
])

function phoneFor(index: number) {
  const parts = [
    20 + ((index * 3) % 70),
    10 + ((index * 7) % 80),
    12 + ((index * 5) % 80),
    14 + ((index * 11) % 80),
  ]
  return `+45 ${parts.map((part) => String(part).padStart(2, '0')).join(' ')}`
}

function blankWaterfall(): Contact['waterfall'] {
  return { own: 'idle', prospeo: 'idle', findymail: 'idle' }
}

function makeContact(input: {
  id: string
  cvr: string
  name: string
  title: string
  own: 'hit' | 'miss'
  prospeo?: 'hit' | 'miss'
  findymail?: 'hit' | 'miss'
  email?: string | null
  phone?: string | null
  foundEmail?: string | null
  foundPhone?: string | null
  revealed?: boolean
}): Contact {
  const ownHit = input.own === 'hit' && Boolean(input.email)
  const script: ContactScript = {
    own: input.own,
    prospeo: input.prospeo ?? 'miss',
    findymail: input.findymail ?? (input.own === 'hit' ? 'miss' : 'hit'),
    foundEmail: input.foundEmail ?? null,
    foundPhone: input.foundPhone ?? null,
  }
  return {
    id: input.id,
    cvr: input.cvr,
    name: input.name,
    title: input.title,
    email: ownHit ? (input.email ?? null) : null,
    phone: ownHit ? (input.phone ?? null) : null,
    revealed: ownHit ? Boolean(input.revealed) : false,
    source: ownHit ? 'own' : null,
    verified: ownHit,
    script,
    waterfall: blankWaterfall(),
    queue: 'idle',
    ai: {},
  }
}

function buildContacts() {
  const list: Contact[] = []
  let poolIndex = 0
  companies.forEach((company, index) => {
    const override = overrides[company.cvr]
    if (override) {
      list.push(makeContact({ ...override, cvr: company.cvr }))
      return
    }
    const [first, last, title] = pool[poolIndex % pool.length]
    poolIndex += 1
    const email = `${slugName(first)}.${slugName(last)}@${company.domain}`
    list.push(
      makeContact({
        id: `c-${company.cvr}`,
        cvr: company.cvr,
        name: `${first} ${last}`,
        title,
        own: 'hit',
        email,
        phone: phoneFor(index + 3),
        revealed: index % 4 === 0,
      }),
    )
  })

  const hosts = companies.filter((company) => gapHosts.has(company.cvr))
  gapPeople.forEach(([first, last], index) => {
    const company = hosts[index % hosts.length]
    const local = `${slugName(first)}.${slugName(last)}`
    list.push(
      makeContact({
        id: `c-gap-${String(index + 1).padStart(2, '0')}`,
        cvr: company.cvr,
        name: `${first} ${last}`,
        title: gapTitles[index % gapTitles.length],
        own: 'miss',
        prospeo: 'miss',
        findymail: 'hit',
        foundEmail: `${local}@${company.domain}`,
        foundPhone: phoneFor(40 + index),
      }),
    )
  })
  return list
}

export const contacts: Contact[] = buildContacts()

export const lists: SavedList[] = [
  {
    id: 'list-saas',
    name: 'Software decision-makers',
    contactIds: ['c-maja', 'c-emil', 'c-ida', 'c-freja', 'c-noah', 'c-asta'],
    createdAt: '12 Nov 2026',
    aiColumns: [],
  },
  {
    id: 'list-gap',
    name: 'Coverage gap',
    contactIds: contacts.filter((contact) => contact.id.startsWith('c-gap')).map((contact) => contact.id),
    createdAt: '18 Nov 2026',
    aiColumns: [],
  },
]

export const ledgerSeed: LedgerEntry[] = [
  {
    id: 'led-3',
    at: '19 Nov, 16:10',
    kind: 'capture',
    amount: 16,
    note: 'Provider lookups · 12–18 Nov',
  },
  {
    id: 'led-2',
    at: '18 Nov, 11:02',
    kind: 'capture',
    amount: 36,
    note: 'Waterfall · October lists',
  },
  {
    id: 'led-1',
    at: '1 Nov, 09:00',
    kind: 'topup',
    amount: 100,
    note: 'Prepaid pack · 100 credits',
  },
]

export const suppressionSeed: Suppression[] = [
  { id: 'sup-1', kind: 'email', value: 'freja.lind@solhavn.dk', addedAt: '4 Sep 2026' },
  { id: 'sup-2', kind: 'domain', value: 'do-not-mail.dk', addedAt: '4 Sep 2026' },
]

export const teamSeed: TeamMember[] = [
  { id: 'tm-1', name: 'Ane Møller', email: 'ane@nordlys.dk', role: 'Owner' },
  { id: 'tm-2', name: 'Mikkel Dahl', email: 'mikkel@nordlys.dk', role: 'Admin' },
  { id: 'tm-3', name: 'Sara Nygaard', email: 'sara@nordlys.dk', role: 'Member' },
  { id: 'tm-4', name: 'Jonas Berg', email: 'jonas@nordlys.dk', role: 'Member' },
]

export const hubFields: HubField[] = [
  { id: 'email', label: 'Email', hubspot: 'email', on: true },
  { id: 'name', label: 'Full name', hubspot: 'firstname + lastname', on: true },
  { id: 'title', label: 'Title', hubspot: 'jobtitle', on: true },
  { id: 'company', label: 'Company', hubspot: 'company', on: true },
  { id: 'cvr', label: 'CVR', hubspot: 'cvr_number', on: true },
  { id: 'city', label: 'City', hubspot: 'city', on: true },
]

export const PACKS = [
  { id: 'p100', credits: 100, dkk: 490, name: '100 credits', detail: 'A list or two' },
  { id: 'p500', credits: 500, dkk: 1900, name: '500 credits', detail: 'A quarter of outbound' },
  { id: 'p2000', credits: 2000, dkk: 6400, name: '2,000 credits', detail: 'Best price per credit' },
] as const

export const AI_PRESETS = [
  {
    name: 'ICP fit',
    prompt: 'One sentence on whether this person would buy a Danish register subscription.',
  },
  {
    name: 'Icebreaker',
    prompt: 'One line that mentions the company, the city, and the CVR record. No fluff.',
  },
  {
    name: 'Danish opener',
    prompt: 'A short Danish opener a seller could actually send. Mention the company and the city.',
  },
] as const

export const adminAccounts = [
  { name: 'Nordlys ApS', plan: 'Register Annual', seats: '4 / 5', exports: '1,972 / 2,000', credits: 48, live: true },
  { name: 'Kyst & Partnere', plan: 'Register Annual', seats: '3 / 5', exports: '640 / 2,000', credits: 1204, live: false },
  { name: 'Maltnord Studio', plan: 'Register Annual', seats: '2 / 5', exports: '88 / 2,000', credits: 40, live: false },
  { name: 'Holm Advisory', plan: 'Register Annual', seats: '5 / 5', exports: '2,000 / 2,000', credits: 0, live: false },
  { name: 'Brygge Group', plan: 'Register Annual', seats: '1 / 5', exports: '210 / 2,000', credits: 860, live: false },
  { name: 'Nordhavn Legal', plan: 'Register Annual', seats: '4 / 5', exports: '1,440 / 2,000', credits: 220, live: false },
  { name: 'Fjord & Felt', plan: 'Register Annual', seats: '2 / 5', exports: '12 / 2,000', credits: 500, live: false },
  { name: 'Atlas Revision', plan: 'Register Annual', seats: '3 / 5', exports: '990 / 2,000', credits: 76, live: false },
]

export const providerMonth = [
  { provider: 'Prospeo', calls: 18420, unitDkk: 0.82 },
  { provider: 'Findymail', calls: 9650, unitDkk: 1.15 },
  { provider: 'AI columns', calls: 4200, unitDkk: 0.35 },
]
