import { Link } from 'react-router-dom'
import { Card, PageHeader, Pill } from '../components/Ui'
import { useDemo } from '../state/demo'

export function Lists() {
  const { lists } = useDemo()
  return (
    <div>
      <PageHeader
        title="Lists"
        lede="Saved people, not a live search. Enrichment, AI columns, export, and HubSpot all run from a list."
      />
      <div className="grid gap-3">
        {lists.map((list) => (
          <Link key={list.id} to={`/lists/${list.id}`}>
            <Card className="flex items-center justify-between gap-4 px-5 py-4 hover:border-copper">
              <div>
                <div className="font-medium">{list.name}</div>
                <div className="mt-1 text-sm text-ink-soft">{list.createdAt} · {list.aiColumns.length} AI {list.aiColumns.length === 1 ? 'column' : 'columns'}</div>
              </div>
              <Pill>{list.contactIds.length} people</Pill>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
