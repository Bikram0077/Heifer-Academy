import { useState, type ReactNode } from 'react'
import { save, useApp } from '../lib'
import { useContent } from '../content'
import { CheckCircle, ChevronDown } from './icons'
import { CloseButton, Overlay } from './Layout'

export function PulseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useApp()
  const { ui, roles, genders, provinces } = useContent()
  const [district, setDistrict] = useState('')
  const [role, setRole] = useState('')
  const [gender, setGender] = useState('')
  const [sent, setSent] = useState(false)

  const close = () => { onClose(); setTimeout(() => setSent(false), 300) }

  return (
    <Overlay open={open} onClose={close} label={ui.pulseTitle[lang]} variant="center">
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden />
      {sent ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <CheckCircle size={52} className="text-primary-700" />
          <p className="ne-relaxed mt-4 max-w-[20rem] text-lg text-ink">{ui.thanks[lang]}</p>
          <button type="button" onClick={close} className="mt-6 h-12 rounded-full bg-primary-900 px-8 font-semibold text-white hover:bg-primary-700">{ui.continue[lang]}</button>
        </div>
      ) : (
        <form
          className="flex flex-col overflow-y-auto p-6"
          onSubmit={(e) => {
            e.preventDefault()
            save('ha-pulse-response', { district, role, gender, at: new Date().toISOString() })
            setSent(true)
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-sm bg-accent-100 px-2 py-1 text-[0.7rem] font-semibold tracking-[0.1em] text-ochre uppercase">{ui.optional[lang]}</span>
              <h2 className="mt-3 text-xl font-bold text-ink">{ui.pulseTitle[lang]}</h2>
              <p className="ne-relaxed mt-1 text-sm text-ink-2">{ui.pulseSub[lang]}</p>
            </div>
            <CloseButton onClick={close} />
          </div>

          <div className="mt-6 flex flex-col gap-5">
            <Field label={ui.district[lang]} id="pulse-district">
              <Select id="pulse-district" value={district} onChange={setDistrict} placeholder={ui.selectDistrict[lang]}>
                {provinces.map((p) => (
                  <optgroup key={p.name.en} label={p.name[lang]}>
                    {p.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field label={ui.role[lang]} id="pulse-role">
              <Select id="pulse-role" value={role} onChange={setRole} placeholder={ui.selectRole[lang]}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.label[lang]}</option>)}
              </Select>
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">{ui.gender[lang]}</legend>
              <div className="flex flex-wrap gap-2">
                {genders.map((g) => (
                  <label key={g.id} className="cursor-pointer">
                    <input type="radio" name="gender" value={g.id} checked={gender === g.id} onChange={() => setGender(g.id)} className="peer sr-only" />
                    <span className="flex h-11 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink-2 transition-colors peer-checked:border-primary-900 peer-checked:bg-primary-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 hover:border-primary-700">
                      {g.label[lang]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-8 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)]">
            <button type="submit" className="h-12 rounded-full bg-primary-900 font-semibold text-white hover:bg-primary-700">{ui.submit[lang]}</button>
            <button type="button" onClick={close} className="h-12 rounded-full font-medium text-ink-2 hover:bg-subtle hover:text-ink">{ui.skip[lang]}</button>
          </div>
        </form>
      )}
    </Overlay>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}

function Select({ id, value, onChange, placeholder, children }: { id: string; value: string; onChange: (v: string) => void; placeholder: string; children: ReactNode }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full appearance-none rounded-md border border-line-strong bg-card pr-10 pl-4 text-[0.95rem] focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none ${value ? 'text-ink' : 'text-ink-2'}`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-2" />
    </div>
  )
}
