import type { Course, Lang } from '@shared/schema'
import { extractYouTubeId } from '@shared/url'
import { categories } from './categories'

export const lessonsOf = (c: Course) => c.modules.flatMap((m, mi) => m.lessons.map((ls) => ({ ...ls, module: mi })))
export const totalSeconds = (c: Course) => lessonsOf(c).reduce((s, x) => s + x.seconds, 0)
export const thumb = (videoId: string, q: 'hq' | 'maxres' = 'hq') => {
  const safeId = extractYouTubeId(videoId) || videoId.replace(/[^A-Za-z0-9_-]/g, '')
  return `https://i.ytimg.com/vi/${safeId}/${q}default.jpg`
}

const neDigits = '०१२३४५६७८९'
export const num = (n: number | string, lang: Lang) =>
  lang === 'ne' ? String(n).replace(/\d/g, (d) => neDigits[Number(d)]) : String(n)

export const clock = (s: number, lang: Lang) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return num(h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`, lang)
}

export const duration = (s: number, lang: Lang) => {
  const m = Math.round(s / 60)
  if (m < 60) return `${num(m, lang)} ${lang === 'en' ? 'min' : 'मिनेट'}`
  const h = Math.floor(m / 60)
  const r = m % 60
  return lang === 'en' ? `${h} hr ${r ? `${r} min` : ''}`.trim() : `${num(h, lang)} घण्टा ${r ? `${num(r, lang)} मिनेट` : ''}`.trim()
}

export const categoryLabel = (id: Course['category']) =>
  categories.find((c) => c.id === id)?.label ?? { en: id, ne: id }

