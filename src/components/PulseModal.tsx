import { useState, type ReactNode } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { save, useApp } from '../lib'
import { useContent } from '../content'
import { getFirebaseDb } from '../services/firebase'
import type { FeedbackItem } from '@shared/schema'
import { CheckCircle, ChevronDown } from './icons'
import { CloseButton, Overlay } from './Layout'

export function PulseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useApp()
  const { ui, roles, genders, provinces } = useContent()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [role, setRole] = useState('')
  const [otherRoleText, setOtherRoleText] = useState('')
  const [gender, setGender] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  // Ensure 'other' option is present in roles list
  const displayedRoles = [...roles]
  if (!displayedRoles.some((r) => r.id === 'other')) {
    displayedRoles.push({
      id: 'other',
      label: ui.roleOther || { en: 'Other', ne: 'अन्य' },
    })
  }

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setDistrict('')
    setMunicipality('')
    setRole('')
    setOtherRoleText('')
    setGender('')
    setSuggestions('')
    setError(null)
    setSubmitting(false)
  }

  const close = () => {
    onClose()
    setTimeout(() => {
      setSent(false)
      resetForm()
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedSuggestions = suggestions.trim()
    if (!trimmedSuggestions) {
      setError(
        lang === 'ne'
          ? 'कृपया आफ्नो सुझाव वा प्रतिक्रिया लेख्नुहोस्।'
          : 'Please enter your suggestions or feedback before submitting.'
      )
      return
    }

    setSubmitting(true)
    setError(null)

    // Resolve province from district if selected
    const matchedProvince = provinces.find((p) => p.districts.includes(district))
    const provinceName = matchedProvince?.name?.en || ''

    const feedbackPayload: FeedbackItem = {
      fullName: fullName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      province: provinceName || undefined,
      district: district.trim() || undefined,
      municipality: municipality.trim() || undefined,
      role: role.trim() || undefined,
      otherRoleText: role === 'other' ? otherRoleText.trim() || undefined : undefined,
      gender: gender.trim() || undefined,
      suggestions: trimmedSuggestions,
      status: 'new',
      createdAt: new Date().toISOString(),
    }

    try {
      const db = getFirebaseDb()
      if (db) {
        // Strip out undefined values for Firestore serialization
        const cleanDoc: Record<string, string> = {
          suggestions: feedbackPayload.suggestions,
          createdAt: feedbackPayload.createdAt,
          status: 'new',
        }
        if (feedbackPayload.fullName) cleanDoc.fullName = feedbackPayload.fullName
        if (feedbackPayload.email) cleanDoc.email = feedbackPayload.email
        if (feedbackPayload.phone) cleanDoc.phone = feedbackPayload.phone
        if (feedbackPayload.province) cleanDoc.province = feedbackPayload.province
        if (feedbackPayload.district) cleanDoc.district = feedbackPayload.district
        if (feedbackPayload.municipality) cleanDoc.municipality = feedbackPayload.municipality
        if (feedbackPayload.role) cleanDoc.role = feedbackPayload.role
        if (feedbackPayload.otherRoleText) cleanDoc.otherRoleText = feedbackPayload.otherRoleText
        if (feedbackPayload.gender) cleanDoc.gender = feedbackPayload.gender

        await addDoc(collection(db, 'feedback'), cleanDoc)
      }
    } catch (err) {
      console.warn('Real-time Firestore feedback submission failed, saving to local state:', err)
    }

    // Persist to local storage for offline resiliency
    save('ha-pulse-response', feedbackPayload)
    setSubmitting(false)
    setSent(true)
  }

  return (
    <Overlay open={open} onClose={close} label={ui.pulseTitle[lang]} variant="center">
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden />
      {sent ? (
        <div className="flex flex-col items-center px-6 py-12 text-center animate-fade">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-primary-700">
            <CheckCircle size={44} />
          </div>
          <h3 className="mt-4 text-xl font-bold text-ink">
            {lang === 'ne' ? 'सुझाव प्राप्त भयो!' : 'Feedback Received!'}
          </h3>
          <p className="ne-relaxed mt-2 max-w-[24rem] text-sm leading-relaxed text-ink-2">
            {ui.thanks[lang]}
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-6 h-11 rounded-full bg-primary-900 px-8 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-700"
          >
            {ui.continue[lang]}
          </button>
        </div>
      ) : (
        <form className="flex flex-col overflow-y-auto p-6 md:p-7" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <span className="inline-block rounded-sm bg-accent-100 px-2 py-0.5 text-[0.7rem] font-bold tracking-[0.1em] text-ochre uppercase">
                {ui.feedback[lang]} &bull; {ui.optional[lang]}
              </span>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-ink md:text-2xl">
                {ui.pulseTitle[lang]}
              </h2>
              <p className="ne-relaxed mt-1 text-xs text-ink-2 sm:text-sm">
                {ui.pulseSub[lang]}
              </p>
            </div>
            <CloseButton onClick={close} />
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-900">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-4">
            {/* Suggestions / Feedback field (Primary) */}
            <Field
              label={`${ui.suggestions[lang]} *`}
              id="pulse-suggestions"
              description={
                lang === 'ne'
                  ? 'तपाईंको सुझाव सिधै हेफर एकेडेमी टोलीसमक्ष पुग्नेछ।'
                  : 'Your suggestions are reviewed directly by the Heifer Academy team.'
              }
            >
              <textarea
                id="pulse-suggestions"
                rows={3}
                required
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder={ui.suggestionsPlaceholder[lang]}
                className="w-full rounded-lg border border-line-strong bg-card p-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
              />
            </Field>

            {/* Submitter Name (Optional) */}
            <Field label={`${ui.fullName[lang]} (${ui.optional[lang]})`} id="pulse-name">
              <input
                id="pulse-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={ui.fullNamePlaceholder[lang]}
                className="h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
              />
            </Field>

            {/* Email & Phone side-by-side */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={`${ui.emailAddress[lang]} (${ui.optional[lang]})`} id="pulse-email">
                <input
                  id="pulse-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ui.emailPlaceholder[lang]}
                  className="h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
                />
              </Field>
              <Field label={`${ui.phoneNumber[lang]} (${ui.optional[lang]})`} id="pulse-phone">
                <input
                  id="pulse-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={ui.phonePlaceholder[lang]}
                  className="h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
                />
              </Field>
            </div>

            {/* Address: District & Municipality */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={ui.district[lang]} id="pulse-district">
                <Select
                  id="pulse-district"
                  value={district}
                  onChange={setDistrict}
                  placeholder={ui.selectDistrict[lang]}
                >
                  {provinces.map((p) => (
                    <optgroup key={p.name.en} label={p.name[lang]}>
                      {p.districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Field>
              <Field
                label={`${ui.municipality[lang]} (${ui.optional[lang]})`}
                id="pulse-municipality"
              >
                <input
                  id="pulse-municipality"
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  placeholder={ui.municipalityPlaceholder[lang]}
                  className="h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
                />
              </Field>
            </div>

            {/* Role & Other role text */}
            <Field label={ui.role[lang]} id="pulse-role">
              <Select
                id="pulse-role"
                value={role}
                onChange={setRole}
                placeholder={ui.selectRole[lang]}
              >
                {displayedRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label[lang]}
                  </option>
                ))}
              </Select>
              {role === 'other' && (
                <div className="mt-2.5 animate-fade">
                  <label
                    htmlFor="pulse-other-role"
                    className="mb-1 block text-xs font-medium text-ink-2"
                  >
                    {ui.otherRoleSpecify[lang]}
                  </label>
                  <input
                    id="pulse-other-role"
                    type="text"
                    value={otherRoleText}
                    onChange={(e) => setOtherRoleText(e.target.value)}
                    placeholder={ui.otherRolePlaceholder[lang]}
                    className="h-10 w-full rounded-md border border-line-strong bg-card px-3 text-xs text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
                  />
                </div>
              )}
            </Field>

            {/* Gender options */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-ink sm:text-sm">
                {ui.gender[lang]}
              </legend>
              <div className="flex flex-wrap gap-2">
                {genders.map((g) => (
                  <label key={g.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={g.id}
                      checked={gender === g.id}
                      onChange={() => setGender(g.id)}
                      className="peer sr-only"
                    />
                    <span className="flex h-9 items-center rounded-full border border-line-strong px-3.5 text-xs font-medium text-ink-2 transition-colors peer-checked:border-primary-900 peer-checked:bg-primary-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 hover:border-primary-700">
                      {g.label[lang]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-line pb-[env(safe-area-inset-bottom)]">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 items-center justify-center rounded-full bg-primary-900 font-semibold text-white shadow-soft transition hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? ui.submittingFeedback[lang] : ui.submitFeedback[lang]}
            </button>
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-full text-xs font-medium text-ink-2 hover:bg-subtle hover:text-ink"
            >
              {ui.skip[lang]}
            </button>
          </div>
        </form>
      )}
    </Overlay>
  )
}

function Field({
  label,
  id,
  description,
  children,
}: {
  label: string
  id: string
  description?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-ink sm:text-sm">
        {label}
      </label>
      {description && <p className="mb-1.5 text-[0.75rem] text-ink-2">{description}</p>}
      {children}
    </div>
  )
}

function Select({
  id,
  value,
  onChange,
  placeholder,
  children,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  children: ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full appearance-none rounded-md border border-line-strong bg-card pr-10 pl-3 text-sm focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none ${
          value ? 'text-ink' : 'text-ink-3'
        }`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-2"
      />
    </div>
  )
}
