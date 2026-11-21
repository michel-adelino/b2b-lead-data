import { X } from 'lucide-react'
import { useDemo } from '../state/demo'

const tone: Record<string, string> = {
  ok: 'border-[#cfe3d6]',
  warn: 'border-[#ead7ae]',
  stop: 'border-[#e7c7c0]',
}

export function Toasts() {
  const { toasts, dismissToast } = useDemo()
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-16 right-4 z-60 flex w-[320px] flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-xl border bg-card px-3 py-3 shadow-lg ${tone[toast.tone]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{toast.title}</div>
              {toast.body ? <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{toast.body}</p> : null}
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => dismissToast(toast.id)} className="text-ink-soft">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
