import { num, type Lang } from '../data'
import { isExternalHttpUrl, sanitizeHref, sanitizeImageSrc } from '@shared/url'
import { useApp, useStored } from '../lib'
import { useContent } from '../content'
import { Container, Eyebrow } from '../components/Layout'
import { formatLabel, ResourceCard } from './Resources'
import {
  ArrowLeft,
  ArrowRight,
  BookIcon,
  CheckIcon,
  ChevronRight,
  DownloadIcon,
  ExternalIcon,
  FileTextIcon,
  PrinterIcon,
  QuoteIcon,
  VideoIcon,
} from '../components/icons'

export function MaterialDetail({ id }: { id: string }) {
  const { lang } = useApp()
  const { allMaterials, categories, courses, ui } = useContent()
  const other: Lang = lang === 'en' ? 'ne' : 'en'

  const decodedId = (() => {
    try {
      return decodeURIComponent(id)
    } catch {
      return id
    }
  })()

  const item = allMaterials.find(
    (m) =>
      m.id === id ||
      m.id === decodedId ||
      m.id.toLowerCase() === id.toLowerCase() ||
      m.id.toLowerCase() === decodedId.toLowerCase()
  )
  const [checked, setChecked] = useStored<number[]>(`ha-mat-check-${id}`, [])

  if (!item) {
    return (
      <Container className="py-20 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-subtle text-brand">
          <FileTextIcon size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          {ui.materialNotFound?.[lang] || (lang === 'en' ? 'Material not found' : 'सिकाइ सामग्री भेटिएन')}
        </h1>
        <p className="ne-relaxed mx-auto mt-2 max-w-md text-ink-2">
          {ui.materialNotFoundSub?.[lang] ||
            (lang === 'en'
              ? 'This guide or handout may have been moved or unpublished. Browse our full library below.'
              : 'यो पुस्तिका वा सामग्री सारिएको वा अप्रकाशित भएको हुन सक्छ। तल सबै सामग्री हेर्नुहोस्।')}
        </p>
        <a
          href="#/resources"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary-900 px-6 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <ArrowLeft size={16} />
          {ui.viewAllMaterials?.[lang] || (lang === 'en' ? 'Browse all materials' : 'सबै सामग्री हेर्नुहोस्')}
        </a>
      </Container>
    )
  }

  const catLabel =
    categories.find((c) => c.id === item.category)?.label || {
      en: item.category,
      ne: item.category,
    }
  const linkedCourse = item.courseId ? courses.find((c) => c.id === item.courseId) : undefined

  const rawExternal = item.url?.trim() || ''
  const safeExternalHref = rawExternal ? sanitizeHref(rawExternal, '') : ''
  const hasExternalAction =
    Boolean(safeExternalHref) &&
    safeExternalHref !== `#/material/${item.id}` &&
    safeExternalHref !== '#/resources'
  const isExternal = isExternalHttpUrl(safeExternalHref)
  const safeCover = sanitizeImageSrc(item.image)

  const title = item.title[lang] || item.title.en
  const altLangTitle = item.title[other]
  const summary = item.description[lang] || item.description.en
  const bodyText =
    item.body?.[lang]?.trim() ||
    item.body?.en?.trim() ||
    linkedCourse?.summary?.[lang] ||
    ''
  const steps =
    item.keyPoints && item.keyPoints.length > 0
      ? item.keyPoints
      : linkedCourse?.checklist || []
  const facilitatorTip =
    item.facilitatorTip?.[lang]?.trim() ||
    item.facilitatorTip?.en?.trim() ||
    linkedCourse?.facilitator?.[lang] ||
    ''

  const related = allMaterials
    .filter((m) => m.id !== item.id)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3)

  return (
    <>
      {/* Header Banner */}
      <section className="border-b border-line bg-card print:border-b-2 print:bg-white">
        <Container className="py-8 md:py-12">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-ink-2 print:hidden"
          >
            <a href="#/" className="hover:text-brand hover:underline">
              {ui.home?.[lang] || 'Home'}
            </a>
            <ChevronRight size={14} className="text-ink-3" />
            <a href="#/resources" className="hover:text-brand hover:underline">
              {ui.resources?.[lang] || 'Materials'}
            </a>
            <ChevronRight size={14} className="text-ink-3" />
            <span aria-current="page" className="font-medium text-ink">
              {title}
            </span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-brand">
              {item.format === 'video' ? <VideoIcon size={14} /> : <FileTextIcon size={14} />}
              {formatLabel(item.format, lang)}
            </span>
            <a
              href={`#/resources?cat=${item.category}`}
              className="inline-flex items-center rounded-full border border-line px-3 py-1 text-xs font-bold tracking-[0.08em] text-ochre uppercase hover:border-line-strong print:border-none"
            >
              {catLabel[lang]}
            </a>
            {item.meta?.[lang] && (
              <span className="text-xs font-medium text-ink-3">{item.meta[lang]}</span>
            )}
          </div>

          <h1 className="mt-4 max-w-4xl text-2xl leading-tight font-bold tracking-[-0.02em] text-balance text-ink sm:text-3xl md:text-[2.5rem] md:leading-[1.15]">
            {title}
          </h1>
          {altLangTitle && altLangTitle !== title && (
            <p className="mt-1.5 text-base font-medium text-ink-3">{altLangTitle}</p>
          )}
          <p className="ne-relaxed mt-4 max-w-3xl text-base leading-relaxed text-ink-2 sm:text-lg">
            {summary}
          </p>

          {/* Action Bar */}
          <div className="mt-7 flex flex-wrap items-center gap-3 print:hidden">
            {hasExternalAction && (
              <a
                href={safeExternalHref}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-900 px-6 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
              >
                <DownloadIcon size={16} />
                <span>
                  {ui.downloadExternal?.[lang] ||
                    (lang === 'en' ? 'Open external file' : 'बाह्य फाइल खोल्नुहोस्')}
                </span>
                {isExternal && <ExternalIcon size={14} />}
              </a>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${
                hasExternalAction
                  ? 'border border-line-strong bg-card text-ink hover:border-primary-700 hover:text-brand'
                  : 'bg-primary-900 text-white shadow-soft hover:bg-primary-700'
              }`}
            >
              <PrinterIcon size={16} />
              <span>
                {ui.printMaterial?.[lang] ||
                  (lang === 'en' ? 'Print / Save PDF' : 'प्रिन्ट / पीडीएफ सुरक्षित')}
              </span>
            </button>

            {linkedCourse && (
              <a
                href={`#/course/${linkedCourse.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-5 text-sm font-semibold text-brand transition-colors hover:border-primary-700 hover:bg-primary-100/50"
              >
                <BookIcon size={16} />
                <span>{linkedCourse.title[lang]}</span>
                <ArrowRight size={15} />
              </a>
            )}
          </div>
        </Container>
      </section>

      {/* Main Reader Content */}
      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 print:block">
          <div className="min-w-0 space-y-8">
            {safeCover && (
              <div className="overflow-hidden rounded-xl border border-line bg-subtle shadow-soft print:max-h-64">
                <img
                  src={safeCover}
                  alt={title}
                  decoding="async"
                  className="aspect-[16/9] max-h-[24rem] w-full object-cover"
                />
              </div>
            )}

            {bodyText && (
              <section className="rounded-xl border border-line bg-card p-6 shadow-soft md:p-8 print:border-none print:p-0 print:shadow-none">
                <Eyebrow>
                  {formatLabel(item.format, lang)}
                </Eyebrow>
                <div className="ne-relaxed mt-3 space-y-4 text-[1.05rem] leading-relaxed whitespace-pre-line text-ink">
                  {bodyText}
                </div>
              </section>
            )}

            {steps.length > 0 && (
              <section className="rounded-xl border border-line bg-card p-6 shadow-soft md:p-8 print:mt-6">
                <h2 className="text-lg font-bold text-ink md:text-xl">
                  {ui.keyStepsHeading?.[lang] ||
                    (lang === 'en' ? 'Key steps & field checklist' : 'मुख्य चरण र फिल्ड चेकलिस्ट')}
                </h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {steps.map((step, idx) => {
                    const isChecked = checked.includes(idx)
                    return (
                      <li key={idx}>
                        <label
                          className={`flex cursor-pointer items-start gap-3.5 rounded-lg border p-4 transition-colors ${
                            isChecked
                              ? 'border-primary-700/30 bg-primary-100/60'
                              : 'border-line bg-canvas/60 hover:border-line-strong'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isChecked}
                            onChange={() =>
                              setChecked(
                                isChecked
                                  ? checked.filter((x) => x !== idx)
                                  : [...checked, idx]
                              )
                            }
                          />
                          <span
                            className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 ${
                              isChecked
                                ? 'bg-primary-700 text-white'
                                : 'border-2 border-primary-700/40 text-transparent'
                            }`}
                          >
                            <CheckIcon size={14} strokeWidth={2.5} />
                          </span>
                          <span
                            className={`ne-relaxed flex-1 text-[0.98rem] leading-relaxed ${
                              isChecked ? 'text-ink-2 line-through decoration-ink-3' : 'text-ink'
                            }`}
                          >
                            <strong className="mr-1.5 font-bold text-brand">
                              {num(idx + 1, lang)}.
                            </strong>
                            {step[lang] || step.en}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {facilitatorTip && (
              <aside className="rounded-xl border-l-4 border-accent-500 bg-accent-100 p-6">
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-ochre uppercase">
                  <QuoteIcon size={16} className="text-accent-500" />
                  {ui.forFacilitators?.[lang] || 'For facilitators'}
                </p>
                <p className="ne-relaxed mt-2 text-[1rem] leading-relaxed text-ink">
                  {facilitatorTip}
                </p>
              </aside>
            )}
          </div>

          {/* Sidebar Card */}
          <aside className="space-y-5 print:hidden">
            {linkedCourse && (
              <div className="overflow-hidden rounded-xl border border-line bg-card shadow-soft lg:sticky lg:top-24">
                <img
                  src={sanitizeImageSrc(linkedCourse.image)}
                  alt={linkedCourse.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-bold tracking-[0.12em] text-ochre uppercase">
                    {ui.linkedCourseLabel?.[lang] ||
                      (lang === 'en' ? 'Part of course' : 'सम्बन्धित पाठ्यक्रम')}
                  </p>
                  <h2 className="mt-1.5 text-lg leading-snug font-bold text-ink">
                    {linkedCourse.title[lang]}
                  </h2>
                  <p className="ne-relaxed mt-2 text-sm leading-relaxed text-ink-2">
                    {linkedCourse.subtitle[lang]}
                  </p>
                  <a
                    href={`#/course/${linkedCourse.id}`}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-900 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    {ui.viewCourse?.[lang] || 'View Course'} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-line bg-card p-5 shadow-soft">
              <a
                href="#/resources"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                <ArrowLeft size={16} />
                {ui.backToMaterials?.[lang] ||
                  (lang === 'en' ? 'All materials' : 'सबै सामग्रीहरू')}
              </a>
            </div>
          </aside>
        </div>
      </Container>

      {/* Related Materials */}
      {related.length > 0 && (
        <section className="border-t border-line bg-card py-14 print:hidden">
          <Container>
            <h2 className="text-2xl font-bold tracking-[-0.01em] text-ink md:text-3xl">
              {ui.relatedMaterials?.[lang] ||
                (lang === 'en' ? 'More field guides & handouts' : 'थप फिल्ड पुस्तिका र सामग्री')}
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((m) => (
                <li key={m.id}>
                  <ResourceCard item={m} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  )
}

