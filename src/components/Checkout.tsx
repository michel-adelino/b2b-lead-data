import { useState } from 'react'
import { dkk } from '../lib/format'
import { PACKS, useDemo } from '../state/demo'
import { Button } from './Ui'

export function Checkout({
  packId,
  onClose,
}: {
  packId: string | null
  onClose: () => void
}) {
  const demo = useDemo()
  const pack = PACKS.find((item) => item.id === packId)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  if (!pack) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close checkout" className="absolute inset-0 bg-[#0c1a14]/55" onClick={onClose} />
      <div className="relative z-10 grid w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[1fr_0.9fr]">
        <div className="bg-[#f6f8fb] p-6">
          <div className="text-xs tracking-[0.14em] text-[#687386] uppercase">Felt · Powered by Stripe</div>
          <div className="mt-6 text-sm text-[#3c4257]">Subscribe nothing new. This is a prepaid credit pack.</div>
          <div className="mt-2 text-2xl font-medium tracking-tight text-[#1a1f36]">{pack.name}</div>
          <div className="mt-6 flex items-center justify-between border-t border-[#e3e8ee] pt-4 text-sm">
            <span>Due today</span>
            <span className="text-base font-medium">{dkk(pack.dkk)}</span>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[#687386]">
            Credits land in the Nordlys wallet. They are not a line of credit. The balance cannot go below zero.
          </p>
        </div>
        <div className="p-6">
          {done ? (
            <div className="flex h-full flex-col justify-center">
              <div className="text-lg font-medium">Payment complete</div>
              <p className="mt-2 text-sm text-ink-soft">{pack.credits} credits are in the wallet.</p>
              <Button className="mt-6" onClick={onClose}>
                Back to wallet
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setPaying(true)
                window.setTimeout(() => {
                  demo.buyCredits(pack.id)
                  setPaying(false)
                  setDone(true)
                }, 700)
              }}
            >
              <div className="text-sm font-medium text-[#1a1f36]">Pay with card</div>
              <label className="mt-4 block text-[12px] text-[#687386]">
                Email
                <input defaultValue="ane@nordlys.dk" className="mt-1 h-10 w-full rounded-md border border-[#e3e8ee] px-3 text-sm" />
              </label>
              <label className="mt-3 block text-[12px] text-[#687386]">
                Card
                <input defaultValue="4242 4242 4242 4242" className="mt-1 h-10 w-full rounded-md border border-[#e3e8ee] px-3 text-sm" />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-[12px] text-[#687386]">
                  Expiry
                  <input defaultValue="12 / 28" className="mt-1 h-10 w-full rounded-md border border-[#e3e8ee] px-3 text-sm" />
                </label>
                <label className="text-[12px] text-[#687386]">
                  CVC
                  <input defaultValue="123" className="mt-1 h-10 w-full rounded-md border border-[#e3e8ee] px-3 text-sm" />
                </label>
              </div>
              <button
                type="submit"
                data-tour="pay"
                disabled={paying}
                className="mt-5 h-11 w-full rounded-md bg-[#0a2540] text-sm font-medium text-white disabled:opacity-60"
              >
                {paying ? 'Processing…' : `Pay ${dkk(pack.dkk)}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
