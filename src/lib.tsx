import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getPageIdentity, parseRoute, type Route } from '@shared/routing'
import type { Lang } from './data'
import { useContent } from './content'

export { getPageIdentity, parseRoute, type Route }

/* ---------- storage ---------- */

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
export function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* storage unavailable (private mode) */
  }
}

export function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => load(key, init))
  const initRef = useRef(init)
  useEffect(() => setV(load(key, initRef.current)), [key])
  const set = useCallback((n: T) => { setV(n); save(key, n) }, [key])
  return [v, set] as const
}

/* ---------- routing ---------- */

export function getCurrentRouteString(): string {
  if (typeof window === 'undefined') return '/'
  const hash = window.location.hash
  if (hash && (hash.startsWith('#/') || hash.startsWith('#!/'))) {
    return hash
  }
  const pathname = window.location.pathname
  const search = window.location.search
  return (pathname && pathname !== '/') ? `${pathname}${search}` : (hash || '/')
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(getCurrentRouteString()))
  useEffect(() => {
    const on = () => setRoute(parseRoute(getCurrentRouteString()))
    window.addEventListener('hashchange', on)
    window.addEventListener('popstate', on)
    return () => {
      window.removeEventListener('hashchange', on)
      window.removeEventListener('popstate', on)
    }
  }, [])
  return route
}

export const go = (path: string) => {
  if (typeof window === 'undefined') return
  if (path.startsWith('#')) {
    window.location.hash = path
  } else {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

/** Navigate home (if needed) and scroll to a section id. */
export function goToSection(id: string) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (parseRoute(getCurrentRouteString()).name === 'home') scroll()
  else {
    go('/')
    setTimeout(scroll, 120)
  }
}

/* ---------- app context ---------- */

export type A11y = { contrast: boolean; dark: boolean; font: number; line: boolean }
const a11yDefault: A11y = { contrast: false, dark: false, font: 0, line: false }

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  progress: Record<string, string[]>
  setLesson: (courseId: string, lessonId: string, done: boolean) => void
  openPulse: () => void
  a11y: A11y
  setA11y: (a: A11y) => void
}

const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => useContext(AppCtx)!

export function AppProvider({ children, onFirstCompletion, openPulse }: { children: ReactNode; onFirstCompletion: () => void; openPulse: () => void }) {
  const { settings } = useContent()
  const [lang, setLangState] = useState<Lang>(() => load<Lang>('ha-lang', 'en'))
  const [progress, setProgress] = useState<Record<string, string[]>>(() => load('ha-progress-v2', {}))
  const [a11y, setA11yState] = useState<A11y>(() => ({ ...a11yDefault, ...load<Partial<A11y>>('ha-a11y', {}) }))

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    const customTitle = settings?.brand?.siteTitle?.[lang]
    document.title =
      customTitle ||
      (lang === 'en'
        ? 'Heifer Academy — Practical learning for Nepal’s farming communities'
        : 'हेफर एकेडेमी — नेपालका किसान समुदायका लागि व्यावहारिक सिकाइ')
  }, [lang, settings?.brand?.siteTitle])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', a11y.dark)
    root.classList.toggle('hc', a11y.contrast)
    root.style.fontSize = `${100 + a11y.font * 12.5}%`
  }, [a11y])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    save('ha-lang', l)
  }, [])

  const setA11y = useCallback((a: A11y) => {
    setA11yState(a)
    save('ha-a11y', a)
  }, [])

  const setLesson = useCallback(
    (courseId: string, lessonId: string, done: boolean) => {
      setProgress((prev) => {
        const cur = prev[courseId] ?? []
        if (done === cur.includes(lessonId)) return prev
        const next = {
          ...prev,
          [courseId]: done ? [...cur, lessonId] : cur.filter((x) => x !== lessonId),
        }
        save('ha-progress-v2', next)
        return next
      })
      if (done && !load('ha-pulse-seen', false)) {
        save('ha-pulse-seen', true)
        setTimeout(onFirstCompletion, 600)
      }
    },
    [onFirstCompletion]
  )

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      progress,
      setLesson,
      openPulse,
      a11y,
      setA11y,
    }),
    [lang, setLang, progress, setLesson, openPulse, a11y, setA11y]
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

/* ---------- misc hooks ---------- */

export function useEscape(active: boolean, fn: () => void) {
  useEffect(() => {
    if (!active) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && fn()
    document.addEventListener('keydown', on)
    return () => document.removeEventListener('keydown', on)
  }, [active, fn])
}

export function useClickOutside<T extends HTMLElement>(active: boolean, fn: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!active) return
    const on = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fn()
    }
    document.addEventListener('pointerdown', on, { passive: true })
    return () => document.removeEventListener('pointerdown', on)
  }, [active, fn])
  return ref
}

export function useReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setR(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return r
}
