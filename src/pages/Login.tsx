import { Navigate, useNavigate } from 'react-router-dom'
import { FieldMark } from '../components/Shell'
import { Walkthrough } from '../components/Walkthrough'
import { Button, Field, TextInput } from '../components/Ui'
import { ring } from '../components/Ui'
import { useDemo } from '../state/demo'

export function Login() {
  const demo = useDemo()
  const navigate = useNavigate()
  if (demo.signedIn) return <Navigate to="/" replace />
  return (
    <div className="min-h-full bg-paper">
      <Walkthrough />
      <div className="grid min-h-[calc(100vh-52px)] lg:grid-cols-2">
        <section className="flex flex-col justify-between bg-ink px-8 py-10 text-[#f3efe6] lg:px-14">
          <div className="flex items-center gap-3">
            <FieldMark />
            <span className="text-lg font-semibold tracking-tight">Felt</span>
          </div>
          <div className="max-w-xl py-16">
            <h1 className="text-4xl leading-[1.05] font-medium tracking-tight lg:text-[52px]">
              The Danish register, and the people you already know.
            </h1>
            <ul className="mt-10 space-y-4 text-sm leading-relaxed text-[#d5d0c4]">
              <li><span className="text-copper">01</span> Daily CVR sync. Advertising-protected companies stay out of outreach.</li>
              <li><span className="text-copper">02</span> Your spreadsheet, matched on CVR, before any provider is called.</li>
              <li><span className="text-copper">03</span> Credits are reserved first. The balance cannot go negative, and exports stop at the cap.</li>
            </ul>
          </div>
          <p className="text-xs text-[#8e9a90]">Interactive preview · simulated data · Nordlys ApS</p>
        </section>
        <section className="flex items-center justify-center px-6 py-16">
          <form
            className="w-full max-w-sm"
            onSubmit={(event) => {
              event.preventDefault()
              demo.signIn()
              navigate('/')
            }}
          >
            <div className="text-[11px] tracking-[0.16em] text-ink-soft uppercase">Workspace</div>
            <h2 className="mt-2 text-3xl font-medium tracking-tight">Sign in to Nordlys</h2>
            <p className="mt-2 text-sm text-ink-soft">Register Annual · renews 12 March 2027</p>
            <div className="mt-8 space-y-4">
              <Field label="Work email">
                <TextInput defaultValue="ane@nordlys.dk" readOnly />
              </Field>
              <Button
                type="submit"
                variant="primary"
                data-tour="continue"
                className={`w-full ${ring(demo.tour === 'login')}`}
              >
                Continue
              </Button>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
              No password in this preview. The workspace, credits, and register sample live in the browser.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
