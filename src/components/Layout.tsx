import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { isExternalHttpUrl, sanitizeHref, sanitizeImageSrc } from '@shared/url'
import { lessonsOf, num, type Lang } from '../data'
import type { SocialPlatform } from '@shared/schema'
import { useContent } from '../content'
import { goToSection, useApp, useClickOutside, useEscape } from '../lib'
import heiferLogoLight from '../assets/heifer-academy-logo-light.png'
import heiferLogoDark from '../assets/heifer-academy-logo-dark.png'
import {
  AccessibilityIcon, ArrowRight, ChevronDown, ContrastIcon, MailIcon, MenuIcon, MoonIcon, PhoneIcon, PinIcon,
  ReadingLineIcon, ResetIcon, SpeakerIcon, XIcon, ExternalIcon, FacebookIcon, YoutubeIcon, InstagramIcon, LinkedinIcon, TwitterIcon, GlobeIcon,
} from './icons'

export const Container = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-[1240px] px-5 md:px-8 ${className}`}>{children}</div>
)

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-bold tracking-[0.12em] text-ochre uppercase ${className}`}>{children}</p>
}

export function Logo({ inverted = false, onClick }: { inverted?: boolean; onClick?: () => void }) {
  const { settings } = useContent()
  const { lang } = useApp()
  const lightSrc = sanitizeImageSrc(settings?.brand?.logoUrl, heiferLogoLight)
  const darkSrc = sanitizeImageSrc(settings?.brand?.logoDarkUrl, heiferLogoDark)
  const orgName = settings?.brand?.orgName?.[lang] || 'Heifer International Nepal'

  if (inverted) {
    return (
      <a
        href="#/"
        onClick={onClick}
        aria-label={`Heifer Academy (${orgName}) — home`}
        className="inline-flex shrink-0 items-center rounded-md py-0.5"
      >
        <img
          src={darkSrc}
          alt="Heifer Academy"
          width={917}
          height={223}
          decoding="async"
          className="h-9 w-auto sm:h-11"
        />
      </a>
    )
  }

  return (
    <a
      href="#/"
      onClick={onClick}
      aria-label={`Heifer Academy (${orgName}) — home`}
      className="inline-flex shrink-0 items-center rounded-md py-0.5"
    >
      <img
        src={lightSrc}
        alt="Heifer Academy"
        width={917}
        height={223}
        decoding="async"
        className="block h-8 w-auto max-[380px]:h-7 sm:h-9 md:h-11 dark:hidden"
      />
      <img
        src={darkSrc}
        alt="Heifer Academy"
        width={917}
        height={223}
        decoding="async"
        className="hidden h-8 w-auto max-[380px]:h-7 sm:h-9 md:h-11 dark:block"
      />
    </a>
  )
}

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useApp()
  const { ui } = useContent()
  const opts: { id: Lang; label: string; full: string }[] = [
    { id: 'en', label: 'EN', full: 'English' },
    { id: 'ne', label: 'ने', full: 'नेपाली' },
  ]
  return (
    <div role="group" aria-label={ui.language?.[lang] || 'Language'} className="flex shrink-0 rounded-full border border-line bg-subtle p-1">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={lang === o.id}
          aria-label={o.full}
          onClick={() => setLang(o.id)}
          className={`rounded-full font-semibold transition-colors ${compact ? 'h-8 min-w-9 px-2.5 text-[0.8rem]' : 'h-9 min-w-11 px-3 text-sm'} ${lang === o.id ? 'bg-primary-900 text-white shadow-soft' : 'text-ink-2 hover:text-ink'
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Header ---------------- */

export function Header() {
  const { lang, openPulse } = useApp()
  const { ui, categories, courses, layout } = useContent()
  const [explore, setExplore] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const scrolledRef = useRef(false)
  const closeExplore = useCallback(() => setExplore(false), [])
  const closeMobile = useCallback(() => setMobile(false), [])
  const exploreRef = useClickOutside<HTMLDivElement>(explore, closeExplore)
  useEscape(explore, closeExplore)

  useEffect(() => {
    const on = () => {
      const next = window.scrollY > 8
      if (next !== scrolledRef.current) {
        scrolledRef.current = next
        setScrolled(next)
      }
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const on = () => { setExplore(false); setMobile(false) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const navLink = 'inline-flex h-10 items-center gap-1 rounded-md px-3 text-[0.95rem] font-medium text-ink-2 transition-colors hover:bg-subtle hover:text-ink'
  const activeNavLinks = (layout.header.navLinks || []).filter((item) => item.enabled)
  const cta = layout.header.ctaButton
  const ctaHref = sanitizeHref(cta?.href, '#/courses')
  const ctaExt = isExternalHttpUrl(ctaHref)

  return (
    <>
      <header className={`sticky top-0 z-40 border-b bg-card/98 transition-shadow md:bg-card/88 md:backdrop-blur-md md:supports-[backdrop-filter]:bg-card/80 print:hidden ${scrolled ? 'border-line shadow-soft' : 'border-transparent'}`}>
        <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only rounded-md bg-primary-900 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50">
          {ui.skipToContent?.[lang]}
        </a>
        <Container className="flex h-16 items-center gap-3 max-[380px]:px-4 md:h-[4.5rem]">
          <Logo />

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {layout.header.showExploreDropdown !== false && (
              <div ref={exploreRef} className="relative">
                <button type="button" aria-expanded={explore} aria-haspopup="true" onClick={() => setExplore((v) => !v)} className={`${navLink} ${explore ? 'bg-subtle text-ink' : ''}`}>
                  {ui.explore?.[lang]} <ChevronDown size={16} className={`transition-transform ${explore ? 'rotate-180' : ''}`} />
                </button>
                {explore && <ExploreMenu lang={lang} onClose={closeExplore} />}
              </div>
            )}
            {activeNavLinks.map((item) => {
              const labelText = item.label?.[lang] || item.label?.en || ''
              if (item.action === 'faq' || item.href === '#faq') {
                return (
                  <button key={item.id} type="button" onClick={() => goToSection('faq')} className={navLink}>
                    {labelText}
                  </button>
                )
              }
              if (item.action === 'pulse' || item.href === '#feedback') {
                return (
                  <button key={item.id} type="button" onClick={openPulse} className={navLink}>
                    {labelText}
                  </button>
                )
              }
              const safeHref = sanitizeHref(item.href, '#/')
              const isExt = Boolean(item.external) || isExternalHttpUrl(safeHref)
              return (
                <a
                  key={item.id}
                  href={safeHref}
                  target={isExt ? '_blank' : undefined}
                  rel={isExt ? 'noopener noreferrer' : undefined}
                  className={navLink}
                >
                  {labelText}
                </a>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="hidden sm:block"><LangSwitch /></div>
            <div className="sm:hidden"><LangSwitch compact /></div>
            <AccessibilityMenu />
            {cta?.enabled !== false && (
              <a
                href={ctaHref}
                target={ctaExt ? '_blank' : undefined}
                rel={ctaExt ? 'noopener noreferrer' : undefined}
                className="hidden h-11 items-center gap-2 rounded-full bg-primary-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 lg:inline-flex"
              >
                {cta?.label?.[lang] || ui.startLearning?.[lang]} <ArrowRight size={16} />
              </a>
            )}
            <button type="button" onClick={() => setMobile(true)} aria-label={ui.menu?.[lang]} aria-expanded={mobile} className="-mr-2 flex size-10 items-center justify-center rounded-md text-ink hover:bg-subtle active:bg-subtle sm:size-11 lg:hidden">
              <MenuIcon size={22} />
            </button>
          </div>
        </Container>
      </header>

      <Overlay open={mobile} onClose={closeMobile} label={ui.menu?.[lang] || 'Menu'} variant="sheet">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Logo onClick={closeMobile} />
          <CloseButton onClick={closeMobile} />
        </div>
        <nav aria-label="Mobile" className="flex flex-col overflow-y-auto overscroll-contain p-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <a href="#/" onClick={closeMobile} className="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-subtle active:bg-subtle">{ui.home?.[lang]}</a>
          {activeNavLinks.map((item) => {
            const labelText = item.label?.[lang] || item.label?.en || ''
            if (item.action === 'faq' || item.href === '#faq') {
              return (
                <button key={item.id} type="button" onClick={() => { closeMobile(); goToSection('faq') }} className="flex min-h-12 items-center rounded-md px-3 text-left text-base font-medium text-ink hover:bg-subtle active:bg-subtle">
                  {labelText}
                </button>
              )
            }
            if (item.action === 'pulse' || item.href === '#feedback') {
              return (
                <button key={item.id} type="button" onClick={() => { closeMobile(); openPulse() }} className="flex min-h-12 items-center rounded-md px-3 text-left text-base font-medium text-ink hover:bg-subtle active:bg-subtle">
                  {labelText}
                </button>
              )
            }
            const safeHref = sanitizeHref(item.href, '#/')
            const isExt = Boolean(item.external) || isExternalHttpUrl(safeHref)
            return (
              <a
                key={item.id}
                href={safeHref}
                onClick={closeMobile}
                target={isExt ? '_blank' : undefined}
                rel={isExt ? 'noopener noreferrer' : undefined}
                className="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink hover:bg-subtle active:bg-subtle"
              >
                {labelText}
              </a>
            )
          })}
          <p className="mt-4 mb-1 px-3 text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase">{ui.browseTopics?.[lang]}</p>
          {categories.filter((c) => c.id !== 'all').map((c) => (
            <a key={c.id} href={`#/courses?cat=${c.id}`} onClick={closeMobile} className="flex min-h-12 items-center justify-between rounded-md px-3 text-[0.95rem] text-ink-2 hover:bg-subtle hover:text-ink active:bg-subtle">
              {c.label[lang]}
              <span className="text-sm text-ink-3">{num(courses.filter((x) => x.category === c.id).length, lang)}</span>
            </a>
          ))}
          {cta?.enabled !== false && (
            <a
              href={ctaHref}
              onClick={closeMobile}
              target={ctaExt ? '_blank' : undefined}
              rel={ctaExt ? 'noopener noreferrer' : undefined}
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-primary-900 font-semibold text-white active:bg-primary-700"
            >
              {cta?.label?.[lang] || ui.startLearning?.[lang]} <ArrowRight size={16} />
            </a>
          )}
        </nav>
      </Overlay>
    </>
  )
}

function ExploreMenu({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const { ui, categories, courses } = useContent()
  return (
    <div className="absolute top-full left-0 mt-2 w-[min(46rem,calc(100vw-4rem))] animate-rise overflow-hidden rounded-lg border border-line bg-card shadow-card">
      <div className="grid grid-cols-[15rem_1fr]">
        <div className="border-r border-line bg-subtle/60 p-3">
          <p className="px-3 pt-2 pb-2 text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase">{ui.browseTopics?.[lang]}</p>
          {categories.filter((c) => c.id !== 'all').map((c) => (
            <a key={c.id} href={`#/courses?cat=${c.id}`} onClick={onClose} className="flex h-11 items-center justify-between rounded-md px-3 text-sm font-medium text-ink hover:bg-card">
              {c.label[lang]}
              <span className="text-xs text-ink-3">{num(courses.filter((x) => x.category === c.id).length, lang)}</span>
            </a>
          ))}
          <a href="#/courses" onClick={onClose} className="mt-2 flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-brand hover:bg-card">
            {ui.viewAll?.[lang]} <ArrowRight size={15} />
          </a>
          <a href="#/resources" onClick={onClose} className="flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-ink-2 hover:bg-card hover:text-brand">
            {ui.viewAllMaterials?.[lang] || ui.resources?.[lang]} <ArrowRight size={15} />
          </a>
        </div>
        <ul className="grid grid-cols-2 gap-1 p-3">
          {courses.map((c) => (
            <li key={c.id}>
              <a href={`#/course/${encodeURIComponent(c.id)}`} onClick={onClose} className="flex gap-3 rounded-md p-2.5 hover:bg-subtle">
                {sanitizeImageSrc(c.image) && (
                  <img src={sanitizeImageSrc(c.image)} alt="" loading="lazy" decoding="async" className="size-14 shrink-0 rounded-md object-cover" />
                )}
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm leading-5 font-semibold text-ink">{c.title[lang]}</span>
                  <span className="mt-0.5 block text-xs text-ink-2">{num(lessonsOf(c).length, lang)} {ui.lessons?.[lang]}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------- Accessibility ---------------- */

function AccessibilityMenu() {
  const { lang, a11y, setA11y } = useApp()
  const { ui } = useContent()
  const [open, setOpen] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useClickOutside<HTMLDivElement>(open, close)
  useEscape(open, close)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => { if (canSpeak) window.speechSynthesis.cancel() }, [canSpeak])

  const speak = () => {
    if (!canSpeak) return
    const synth = window.speechSynthesis
    if (speaking) { synth.cancel(); setSpeaking(false); return }
    const selected = window.getSelection()?.toString().trim()
    const text = (selected || document.getElementById('main')?.innerText || '').slice(0, 6000)
    if (!text) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'ne' ? 'ne-NP' : 'en-US'
    u.rate = 0.95
    u.onend = u.onerror = () => setSpeaking(false)
    synth.cancel()
    synth.speak(u)
    setSpeaking(true)
  }

  const tiles: { label: string; icon: ReactNode; active?: boolean; onClick: () => void; disabled?: boolean }[] = [
    { label: ui.highContrast?.[lang] || 'High Contrast', icon: <ContrastIcon size={20} />, active: a11y.contrast, onClick: () => setA11y({ ...a11y, contrast: !a11y.contrast }) },
    { label: ui.darkMode?.[lang] || 'Dark Mode', icon: <MoonIcon size={20} />, active: a11y.dark, onClick: () => setA11y({ ...a11y, dark: !a11y.dark }) },
    { label: ui.increaseFont?.[lang] || 'A+', icon: <span className="text-base font-bold">A+</span>, active: a11y.font > 0, disabled: a11y.font >= 3, onClick: () => setA11y({ ...a11y, font: Math.min(3, a11y.font + 1) }) },
    { label: ui.originalFont?.[lang] || 'Aa', icon: <span className="text-base font-bold">Aa</span>, onClick: () => setA11y({ ...a11y, font: 0 }) },
    { label: ui.decreaseFont?.[lang] || 'A−', icon: <span className="text-base font-bold">A−</span>, active: a11y.font < 0, disabled: a11y.font <= -1, onClick: () => setA11y({ ...a11y, font: Math.max(-1, a11y.font - 1) }) },
    { label: ui.readingLine?.[lang] || 'Reading Line', icon: <ReadingLineIcon size={20} />, active: a11y.line, onClick: () => setA11y({ ...a11y, line: !a11y.line }) },
    { label: speaking ? (ui.ttsStop?.[lang] || 'Stop Reading') : (ui.tts?.[lang] || 'Text To Speech'), icon: <SpeakerIcon size={20} />, active: speaking, disabled: !canSpeak, onClick: speak },
    { label: ui.reset?.[lang] || 'Reset', icon: <ResetIcon size={20} />, onClick: () => { setA11y({ contrast: false, dark: false, font: 0, line: false }); if (canSpeak) window.speechSynthesis.cancel(); setSpeaking(false) } },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={ui.a11y?.[lang] || 'Accessibility'}
        onClick={() => setOpen((v) => !v)}
        className={`flex size-10 items-center justify-center rounded-full border transition-colors sm:size-11 ${open ? 'border-primary-700 bg-primary-100 text-brand' : 'border-line text-ink-2 hover:border-line-strong hover:text-ink'}`}
      >
        <AccessibilityIcon size={20} />
      </button>
      {open && (
        <div role="dialog" aria-label={ui.a11y?.[lang] || 'Accessibility'} className="fixed inset-x-3 top-[4.25rem] z-50 animate-rise rounded-lg border border-line bg-card p-4 shadow-card md:absolute md:inset-x-auto md:top-full md:right-0 md:mt-2 md:w-[22rem]">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-ink">{ui.a11y?.[lang] || 'Accessibility'}</p>
            <button type="button" onClick={close} aria-label={ui.close?.[lang] || 'Close'} className="-mr-1 flex size-9 items-center justify-center rounded-md text-ink-2 hover:bg-subtle"><XIcon size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tiles.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={t.onClick}
                disabled={t.disabled}
                aria-pressed={t.active ?? undefined}
                className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-3 text-center text-[0.8rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${t.active ? 'border-primary-700 bg-primary-100 text-brand' : 'border-line text-ink-2 hover:border-line-strong hover:text-ink'
                  }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ReadingLine() {
  const { a11y } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!a11y.line) return
    const on = (e: PointerEvent) => { if (ref.current) ref.current.style.transform = `translateY(${e.clientY}px)` }
    window.addEventListener('pointermove', on)
    return () => window.removeEventListener('pointermove', on)
  }, [a11y.line])
  if (!a11y.line) return null
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] -mt-5 h-10 border-y-2 border-accent-500 bg-accent-500/10" style={{ transform: 'translateY(50vh)' }} />
  )
}

/* ---------------- Footer ---------------- */

function getSocialIcon(platform: SocialPlatform) {
  switch (platform) {
    case 'facebook':
      return <FacebookIcon size={17} />
    case 'youtube':
      return <YoutubeIcon size={17} />
    case 'instagram':
      return <InstagramIcon size={17} />
    case 'linkedin':
      return <LinkedinIcon size={17} />
    case 'twitter':
      return <TwitterIcon size={16} />
    default:
      return <GlobeIcon size={17} />
  }
}

export function Footer() {
  const { lang, openPulse } = useApp()
  const { ui, categories, settings, layout } = useContent()
  const link = 'text-[0.9rem] text-white/75 transition-colors hover:text-white'
  const addressText = settings?.contact?.address?.[lang] || ui.address?.[lang]
  const phoneText = settings?.contact?.phone || '+977-1-5913120'
  const emailText = settings?.contact?.email || 'heifer.nepal@heifer.org'
  const orgName = settings?.brand?.orgName?.[lang] || 'Heifer International Nepal'
  const orgUrl = sanitizeHref(settings?.brand?.orgUrl, 'https://heifernepal.org/')
  const cornerstonesUrl = sanitizeHref(
    settings?.brand?.cornerstonesUrl,
    'https://www.heifer.org/our-work/approach/cornerstones'
  )

  const f = layout.footer
  const initiativeText = f.initiativeLabel?.[lang] || ui.initiativeOf?.[lang]
  const taglineText = f.tagline?.[lang] || ui.footerTagline?.[lang]
  const subtitleText = f.subtitle?.[lang] || ui.footerSub?.[lang]
  const descText = f.description?.[lang]?.trim() || ''
  const categoriesTitle = f.categoriesColumnTitle?.[lang] || ui.learn?.[lang] || 'Learn'
  const copyrightLabel = f.copyrightText?.[lang] || ui.copyright?.[lang]
  const madeForLabel = f.madeForText?.[lang] || ui.footerMadeFor?.[lang] || (lang === 'en' ? 'Made for Nepal’s farming communities' : 'नेपालका किसान समुदायका लागि निर्मित')

  const enabledSocials = (f.socialLinks || []).filter((s) => s.enabled && s.url?.trim())
  const customCols = f.columns || []
  const totalNavCols = (f.showCategoriesColumn !== false ? 1 : 0) + customCols.length

  const gridClass =
    totalNavCols <= 2
      ? 'lg:grid-cols-[1.4fr_1fr_1fr]'
      : totalNavCols === 3
        ? 'lg:grid-cols-[1.4fr_1fr_1fr_1fr]'
        : 'lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))]'

  return (
    <footer className="mt-auto bg-primary-950 text-white print:hidden">
      {f.showTopBanner !== false && (
        <div className="contours border-b border-white/10">
          <Container className="flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-white/60 uppercase">{initiativeText}</p>
              <a href={orgUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-white hover:underline">
                {orgName} <ExternalIcon size={16} />
              </a>
            </div>
            <div className="max-w-md md:text-right">
              <p className="text-2xl font-semibold">{taglineText}</p>
              <p className="ne-relaxed mt-1 text-white/75">{subtitleText}</p>
            </div>
          </Container>
        </div>
      )}
      <Container className={`grid gap-10 py-12 sm:grid-cols-2 ${gridClass}`}>
        <div>
          <Logo inverted />
          {descText && (
            <p className="ne-relaxed mt-4 max-w-sm text-[0.9rem] leading-relaxed text-white/75">{descText}</p>
          )}
          <ul className="mt-6 space-y-3 text-[0.9rem] text-white/75">
            {addressText && <li className="flex gap-3"><PinIcon size={18} className="mt-0.5 shrink-0 text-accent-500" />{addressText}</li>}
            {phoneText && <li className="flex gap-3"><PhoneIcon size={18} className="mt-0.5 shrink-0 text-accent-500" /><a href={`tel:${phoneText.replace(/[^\d+]/g, '')}`} className="hover:text-white">{phoneText}</a></li>}
            {emailText && <li className="flex gap-3"><MailIcon size={18} className="mt-0.5 shrink-0 text-accent-500" /><a href={`mailto:${emailText.replace(/[^\w.@+-]/g, '')}`} className="hover:text-white">{emailText}</a></li>}
          </ul>
          {enabledSocials.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {enabledSocials.map((soc) => {
                const safeSocUrl = sanitizeHref(soc.url, '')
                if (!safeSocUrl) return null
                return (
                  <a
                    key={soc.id}
                    href={safeSocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={soc.label || soc.platform}
                    title={soc.label || soc.platform}
                    className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition-colors hover:border-accent-500 hover:bg-accent-500 hover:text-primary-950"
                  >
                    {getSocialIcon(soc.platform)}
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {f.showCategoriesColumn !== false && (
          <FooterCol title={categoriesTitle}>
            {categories.filter((c) => c.id !== 'all').map((c) => (
              <a key={c.id} className={link} href={`#/courses?cat=${c.id}`}>{c.label[lang]}</a>
            ))}
          </FooterCol>
        )}

        {customCols.map((col) => (
          <FooterCol key={col.id} title={col.title?.[lang] || col.title?.en || ''}>
            {(col.links || []).map((item) => {
              const labelText = item.label?.[lang] || item.label?.en || ''
              if (item.action === 'faq' || item.href === '#faq') {
                return (
                  <button key={item.id} type="button" className={`${link} text-left`} onClick={() => goToSection('faq')}>
                    {labelText}
                  </button>
                )
              }
              if (item.action === 'pulse' || item.href === '#feedback') {
                return (
                  <button key={item.id} type="button" className={`${link} text-left`} onClick={openPulse}>
                    {labelText}
                  </button>
                )
              }
              let resolvedHref = item.href || '#/'
              if (
                item.id === 'fl-cornerstones' &&
                resolvedHref === 'https://www.heifer.org/our-work/approach/cornerstones'
              ) {
                resolvedHref = cornerstonesUrl
              } else if (
                item.id === 'fl-heifer' &&
                resolvedHref === 'https://heifernepal.org/'
              ) {
                resolvedHref = orgUrl
              }
              const safeFooterHref = sanitizeHref(resolvedHref, '#/')
              const isExt = Boolean(item.external) || isExternalHttpUrl(safeFooterHref)
              return (
                <a
                  key={item.id}
                  className={`${link} inline-flex items-center gap-1.5`}
                  href={safeFooterHref}
                  target={isExt ? '_blank' : undefined}
                  rel={isExt ? 'noopener noreferrer' : undefined}
                >
                  <span>{labelText}</span>
                  {isExt && <ExternalIcon size={13} className="opacity-70" />}
                </a>
              )
            })}
          </FooterCol>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-[0.85rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {num(new Date().getFullYear(), lang)} {copyrightLabel}</p>
          <p>{madeForLabel}</p>
        </Container>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold tracking-[0.12em] text-white/50 uppercase">{title}</p>
      <div className="flex flex-col items-start gap-3">{children}</div>
    </div>
  )
}

/* ---------------- Overlay ---------------- */

export function Overlay({ open, onClose, label, variant, children }: { open: boolean; onClose: () => void; label: string; variant: 'sheet' | 'center' | 'side'; children: ReactNode }) {
  useEscape(open, onClose)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])
  if (!open) return null
  const panel = {
    sheet: 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-xl animate-sheet will-change-transform',
    center: 'inset-x-0 bottom-0 max-h-[92vh] rounded-t-xl animate-sheet will-change-transform md:inset-auto md:top-1/2 md:left-1/2 md:w-[460px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:animate-fade',
    side: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl animate-sheet will-change-transform md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-none md:animate-fade',
  }[variant]
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade bg-[#081523]/55 md:bg-[#111827]/40 md:backdrop-blur-[4px]" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label={label} className={`absolute flex flex-col overflow-hidden bg-card shadow-modal ${panel}`}>
        {children}
      </div>
    </div>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  const { lang } = useApp()
  const { ui } = useContent()
  return (
    <button type="button" onClick={onClick} aria-label={ui.close?.[lang] || 'Close'} className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-md text-ink-2 hover:bg-subtle hover:text-ink">
      <XIcon size={20} />
    </button>
  )
}
