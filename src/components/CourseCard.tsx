import { sanitizeImageSrc } from '@shared/url'
import { duration, lessonsOf, num, totalSeconds, type Course } from '../data'
import { useApp } from '../lib'
import { useContent } from '../content'
import { ArrowRight, CheckCircle, ClockIcon, FileTextIcon, LanguagesIcon, VideoIcon } from './icons'

export function CourseCard({ course, className = '' }: { course: Course; className?: string }) {
  const { lang, progress } = useApp()
  const { categories, resourcesData, ui } = useContent()
  const lessons = lessonsOf(course)
  const done = (progress[course.id] ?? []).filter((id) => lessons.some((l) => l.id === id)).length
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0
  const completed = lessons.length > 0 && done === lessons.length
  const catLabel = categories.find((c) => c.id === course.category)?.label || { en: course.category, ne: course.category }
  const ownMats = course.materials ?? []
  const extraLinkedMats = (resourcesData.items || []).filter(
    (item) => item.courseId === course.id && !ownMats.some((m) => m.id === item.id)
  )
  const matCount = ownMats.length + extraLinkedMats.length
  const safeCover = sanitizeImageSrc(course.image)

  return (
    <a
      href={`#/course/${encodeURIComponent(course.id)}`}
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-soft transition duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-line-strong [@media(hover:hover)]:hover:shadow-card ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-subtle">
        {safeCover && (
          <img src={safeCover} alt={course.imageAlt} loading="lazy" decoding="async" className="size-full object-cover transition duration-500 [@media(hover:hover)]:group-hover:scale-[1.04]" />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.72rem] font-semibold text-[#0d416b] shadow-soft">
          <LanguagesIcon size={14} /> {ui.multiLang?.[lang]}
        </span>
        {completed ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 py-1 pr-2.5 pl-1 text-[0.72rem] font-semibold text-[#0d416b]">
            <CheckCircle size={18} className="text-primary-700" /> {ui.completedLabel?.[lang]}
          </span>
        ) : course.badge?.[lang] ? (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-accent-500 px-2.5 py-1 text-[0.72rem] font-bold text-slate-900 shadow-soft">
            {course.badge[lang]}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-xs font-bold tracking-[0.12em] text-ochre uppercase">{catLabel[lang]}</p>
        <h3 className="mt-2 text-lg leading-snug font-semibold text-ink">{course.title[lang]}</h3>
        <p className="mt-1 text-sm text-ink-2">{course.subtitle[lang]}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-ink-2">
          <span className="inline-flex items-center gap-1.5"><VideoIcon size={16} className="text-brand" /> {num(lessons.length, lang)} {ui.lessons?.[lang]}</span>
          <span className="inline-flex items-center gap-1.5"><ClockIcon size={16} className="text-brand" /> {duration(totalSeconds(course), lang)}</span>
          {matCount > 0 && (
            <span className="inline-flex items-center gap-1.5"><FileTextIcon size={15} className="text-brand" /> {num(matCount, lang)} {ui.resources?.[lang]?.toLowerCase()}</span>
          )}
        </div>
        <div className="mt-auto pt-5">
          {done > 0 && !completed && (
            <div className="mb-4">
              <div className="mb-1.5 flex justify-between text-xs text-ink-2">
                <span>{num(done, lang)}/{num(lessons.length, lang)} {ui.lessons?.[lang]}</span>
                <span className="font-semibold text-ink">{num(pct, lang)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          <span className="flex items-center justify-between border-t border-line pt-4 text-sm font-semibold text-brand">
            {ui.viewCourse?.[lang]}
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-brand transition [@media(hover:hover)]:group-hover:bg-primary-900 [@media(hover:hover)]:group-hover:text-white">
              <ArrowRight size={16} />
            </span>
          </span>
        </div>
      </div>
    </a>
  )
}
