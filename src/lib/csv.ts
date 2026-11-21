export type CsvMatrix = {
  headers: string[]
  rows: string[][]
}

function splitLine(line: string, delimiter: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current.trim())
  return cells
}

export function parseCsv(text: string): CsvMatrix {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }
  const commas = (lines[0].match(/,/g) ?? []).length
  const semis = (lines[0].match(/;/g) ?? []).length
  const delimiter = semis > commas ? ';' : ','
  const headers = splitLine(lines[0], delimiter).map((header) => header.toLowerCase())
  const rows = lines.slice(1).map((line) => splitLine(line, delimiter))
  return { headers, rows }
}

export function cell(headers: string[], row: string[], header: string) {
  const index = headers.indexOf(header)
  return index >= 0 ? (row[index] ?? '') : ''
}

export function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = value ?? ''
          if (/[",\n;]/.test(text)) return `"${text.replaceAll('"', '""')}"`
          return text
        })
        .join(','),
    )
    .join('\n')
}

export function downloadCsv(filename: string, rows: string[][]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function safeFilename(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || 'export'
}
