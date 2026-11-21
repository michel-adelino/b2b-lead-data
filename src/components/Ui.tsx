import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { X } from 'lucide-react'

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function ring(active: boolean) {
  return active ? 'ring-2 ring-copper ring-offset-2 ring-offset-paper' : ''
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ink' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'ink', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        variant === 'primary' && 'bg-copper text-white hover:bg-copper-deep',
        variant === 'ink' && 'bg-ink text-[#f4efe6] hover:bg-[#24382c]',
        variant === 'ghost' && 'border border-line bg-card text-ink hover:bg-white',
        variant === 'danger' && 'border border-[#e7c7c0] bg-stop-wash text-stop hover:bg-[#f6d9d3]',
        className,
      )}
      {...props}
    />
  )
}

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'stop' | 'copper'
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide',
        tone === 'neutral' && 'bg-paper-2 text-ink-soft',
        tone === 'good' && 'bg-moss-wash text-moss',
        tone === 'warn' && 'bg-amber-wash text-amber',
        tone === 'stop' && 'bg-stop-wash text-stop',
        tone === 'copper' && 'bg-[#f8e6da] text-copper-deep',
      )}
    >
      {children}
    </span>
  )
}

export function PageHeader({
  title,
  lede,
  actions,
}: {
  title: string
  lede?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-[28px] leading-none font-medium tracking-tight">{title}</h1>
        {lede ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{lede}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-2xl border border-line bg-card', className)}>{children}</section>
  )
}

export function Banner({
  tone = 'warn',
  children,
}: {
  tone?: 'warn' | 'stop' | 'good'
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed',
        tone === 'warn' && 'border-[#ead7ae] bg-amber-wash text-amber',
        tone === 'stop' && 'border-[#e7c7c0] bg-stop-wash text-stop',
        tone === 'good' && 'border-[#cfe3d6] bg-moss-wash text-moss',
      )}
    >
      {children}
    </div>
  )
}

export function Modal({
  open,
  title,
  lede,
  onClose,
  children,
  wide,
}: {
  open: boolean
  title: string
  lede?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={cx('relative z-10 w-full rounded-2xl border border-line bg-card p-5 shadow-2xl', wide ? 'max-w-2xl' : 'max-w-md')}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight">{title}</h2>
            {lede ? <p className="mt-1 text-sm text-ink-soft">{lede}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-ink-soft hover:bg-paper" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Drawer({
  open,
  title,
  lede,
  onClose,
  children,
}: {
  open: boolean
  title: string
  lede?: string
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Dismiss overlay" className="absolute inset-0 bg-ink/25" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-line bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight">{title}</h2>
            {lede ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{lede}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-ink-soft hover:bg-paper" aria-label="Close panel">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[12px] font-medium tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        'h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none placeholder:text-[#9aa397]',
        props.className,
      )}
    />
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        'min-h-24 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none placeholder:text-[#9aa397]',
        props.className,
      )}
    />
  )
}
