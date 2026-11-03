import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { sanitizeHref, sanitizeImageSrc } from '@shared/url'
import { num } from '../data'
import { useApp, useClickOutside, useReducedMotion } from '../lib'
import { useContent } from '../content'
import { CourseCard } from '../components/CourseCard'
import { Container, Eyebrow } from '../components/Layout'
import { VideoPlayer } from '../components/VideoPlayer'
import { ResourceCard } from './Resources'
import {
  ArrowLeft, ArrowRight, BookIcon, CheckIcon, ChevronDown, ChevronLeft, ChevronRight, ExternalIcon, GlobeIcon, HandsIcon, LanguagesIcon, MinusIcon, PlusIcon, QuoteIcon, SproutIcon, TrendIcon, UsersIcon,
} from '../components/icons'

export function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <IntroStats />
      <CourseCarousel />
      <FeaturedMaterials />
      <Testimonials />
      <Faq />
      <Partners />
      <Cta />
    </>
  )
}

/* ---------------- Hero (Shikshya layout) ---------------- */

function Hero() {
  const { lang } = useApp()
  const { courses, ui, homeData } = useContent()
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const heroTitle = homeData.hero?.title?.[lang] || ui.heroTitle?.[lang]
  const heroSub = homeData.hero?.subtitle?.[lang] || ui.heroSub?.[lang]
  const configuredFeatured = homeData.hero?.featuredCourseId
  const firstCourseId =
    (configuredFeatured && courses.some((c) => c.id === configuredFeatured) ? configuredFeatured : courses[0]?.id) ||
    'social-capital'

  const step = (d: 1 | -1) => {
    const el = track.current
    const tile = el?.firstElementChild as HTMLElement | null
    if (!el || !tile) return
    const max = el.scrollWidth - el.clientWidth
    let left = el.scrollLeft + d * tile.clientWidth
    if (d > 0 && el.scrollLeft >= max - 2) left = 0
    if (d < 0 && el.scrollLeft <= 2) left = max
    el.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section className="overflow-hidden border-b border-line bg-card">
      {/* Heading */}
      <Container className="flex flex-col items-center pt-10 text-center md:pt-14">
        <h1 className="max-w-4xl px-2 text-3xl leading-tight font-bold tracking-[-0.02em] text-balance text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18]">
          {heroTitle}
        </h1>
        <p className="ne-relaxed mt-5 mb-8 w-[92%] max-w-3xl text-base leading-7 font-medium text-ink-2 sm:text-[1.125rem] sm:leading-8">
          {heroSub}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <a
            href={`#/learn/${firstCourseId}/0`}
            className="inline-flex h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0d416b] to-[#2f8fa8] px-7 text-[0.95rem] font-semibold text-white shadow-card transition hover:brightness-110 active:translate-y-px sm:h-[3.25rem] sm:px-8 sm:text-base"
          >
            {ui.startLearning?.[lang]} <ArrowRight size={19} />
          </a>
          <a
            href="#/courses"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-primary-700 bg-card px-7 text-[0.95rem] font-semibold text-brand transition-colors hover:bg-primary-100 active:translate-y-px sm:h-[3.25rem] sm:px-8 sm:text-base"
          >
            {ui.exploreCourses?.[lang]}
          </a>
        </div>
      </Container>

      {/* Curved course carousel */}
      <div className="relative mt-6 pb-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-7 left-0 right-0 z-[2] h-14 w-full rounded-[45%] bg-card md:-top-10 md:h-20"
        />
        <div className="my-7 md:my-10">
          <div
            ref={track}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
            aria-label={ui.featured?.[lang]}
          >
            {courses.map((c, idx) => (
              <HeroTile key={c.id} id={c.id} title={c.title[lang]} image={c.image} alt={c.imageAlt} priority={idx === 0} />
            ))}
          </div>
        </div>
        <div className="relative z-[3] -mt-12 flex h-16 items-center justify-center gap-2 bg-card pt-2 md:-mt-14 md:h-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-7 -left-[25px] h-14 w-[calc(100%+50px)] rounded-[45%] bg-card md:-top-10 md:h-20"
          />
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={ui.previous?.[lang]}
            className="relative z-[1] flex size-11 items-center justify-center rounded-full border border-line bg-card text-ink shadow-soft transition-colors hover:border-primary-700 hover:bg-subtle hover:text-brand"
          >
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={ui.next?.[lang]}
            className="relative z-[1] flex size-11 items-center justify-center rounded-full border border-line bg-card text-ink shadow-soft transition-colors hover:border-primary-700 hover:bg-subtle hover:text-brand"
          >
            <ArrowRight size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </section>
  )
}

function HeroTile({ id, title, image, alt, priority = false }: { id: string; title: string; image: string; alt: string; priority?: boolean }) {
  const { lang, setLang } = useApp()
  const { ui } = useContent()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useClickOutside<HTMLDivElement>(open, close)
  const safeImage = sanitizeImageSrc(image)
  return (
    <div className="group relative h-[24rem] w-full shrink-0 snap-start overflow-hidden border-r border-white/10 last:border-r-0 sm:h-[30rem] sm:w-1/2 xl:w-1/3">
      {safeImage && (
        <img
          src={safeImage}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="size-full object-cover transition duration-1000 ease-out [@media(hover:hover)]:group-hover:scale-105"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
      <div className="absolute inset-x-0 bottom-14 flex flex-col gap-3 px-6 sm:bottom-16 sm:px-9 lg:px-11">
        <div ref={ref} className="relative flex">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0d416b] shadow-soft backdrop-blur transition hover:bg-white sm:text-[0.82rem]"
          >
            <GlobeIcon size={16} />
            <span>{ui.multiLang?.[lang]}</span>
            <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-line bg-card p-1.5 shadow-card">
              {(['en', 'ne'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => { setLang(l); setOpen(false) }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold ${lang === l ? 'bg-primary-100 text-brand' : 'text-ink hover:bg-subtle'
                    }`}
                >
                  {l === 'en' ? 'English' : 'नेपाली'}
                  {lang === l && <CheckIcon size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <a href={`#/course/${id}`} className="group/link flex items-center justify-between gap-4 text-white transition-colors hover:text-accent-500">
          <span className="text-lg leading-snug font-semibold sm:text-[1.2rem]">{title}</span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover/link:bg-accent-500 group-hover/link:text-primary-950">
            <ArrowRight size={18} />
          </span>
        </a>
      </div>
    </div>
  )
}

/* ---------------- Value props ---------------- */

function getPillarIcon(name: string): ReactNode {
  switch (name) {
    case 'sprout': return <SproutIcon size={24} />
    case 'trend': return <TrendIcon size={24} />
    case 'hands': return <HandsIcon size={24} />
    case 'users': return <UsersIcon size={24} />
    case 'languages': return <LanguagesIcon size={24} />
    case 'book': return <BookIcon size={24} />
    case 'globe': return <GlobeIcon size={24} />
    default: return <SproutIcon size={24} />
  }
}

function ValueProps() {
  const { lang } = useApp()
  const { ui, homeData } = useContent()
  const items = homeData.valueProps?.length
    ? homeData.valueProps
    : [
      { icon: 'sprout', t: ui.v1t, d: ui.v1d },
      { icon: 'trend', t: ui.v2t, d: ui.v2d },
      { icon: 'hands', t: ui.v3t, d: ui.v3d },
    ]
  return (
    <section className="py-16 md:py-24">
      <Container className="grid gap-6 md:grid-cols-3 md:gap-8">
        {items.map((x, idx) => (
          <div key={`${x.t?.en || idx}-${idx}`} className="rounded-lg border border-line bg-card p-7 shadow-soft">
            <span className="flex size-12 items-center justify-center rounded-md bg-primary-100 text-brand">{getPillarIcon(x.icon)}</span>
            <h2 className="mt-5 text-xl leading-snug font-bold tracking-[-0.01em] text-ink">{x.t?.[lang]}</h2>
            <p className="ne-relaxed mt-2 text-base leading-7 text-ink-2">{x.d?.[lang]}</p>
          </div>
        ))}
      </Container>
    </section>
  )
}

/* ---------------- Intro video + stats ---------------- */

function IntroStats() {
  const { lang } = useApp()
  const { ui, homeData } = useContent()

  const intro = homeData.intro
  const videoId = intro?.videoId || 'toDpDvi1k60'
  const seconds = intro?.seconds || 254
  const videoTitle = intro?.title?.[lang] || (lang === 'en' ? '25 Years of Serving Smallholder Families in Nepal' : 'नेपालका साना किसान परिवारको सेवामा २५ वर्ष')
  const videoLabel = intro?.label?.[lang] || 'Heifer International Nepal'
  const eyebrow = intro?.eyebrow?.[lang] || ui.introEyebrow?.[lang]
  const heading = intro?.heading?.[lang] || ui.introTitle?.[lang]
  const body = intro?.body?.[lang] || ui.introBody?.[lang]
  const source = intro?.sourceNote?.[lang] || ui.statSource?.[lang]

  const statsList = intro?.stats?.length ? intro.stats : [
    { v: { en: '1.7M+', ne: '१७ लाख+' }, l: ui.statHouseholds },
    { v: { en: '277', ne: '२७७' }, l: ui.statCoops },
    { v: { en: '29', ne: '२९' }, l: ui.statYears },
  ]

  return (
    <section className="border-y border-line bg-card py-16 md:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <VideoPlayer videoId={videoId} seconds={seconds} title={videoTitle} label={videoLabel} />
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[1.75rem] leading-tight font-semibold md:text-[2.5rem] md:leading-[3rem] text-ink">{heading}</h2>
          <p className="ne-relaxed mt-4 text-lg leading-relaxed text-ink-2">{body}</p>
          <dl className="mt-8 grid grid-cols-3 gap-3">
            {statsList.map((s, idx) => (
              <div key={idx} className="rounded-lg bg-subtle p-4 md:p-5">
                <dt className="sr-only">{s.l[lang]}</dt>
                <dd className="text-2xl font-bold tracking-tight text-brand md:text-3xl">{s.v[lang]}</dd>
                <dd className="mt-1 text-[0.8rem] leading-snug text-ink-2">{s.l[lang]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-ink-2">{source}</p>
        </div>
      </Container>
    </section>
  )
}

/* ---------------- Course carousel ---------------- */

function CourseCarousel() {
  const { lang } = useApp()
  const { courses, ui, homeData } = useContent()
  const track = useRef<HTMLUListElement>(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const eyebrow = homeData.coursesHeader?.eyebrow?.[lang] || ui.exploreSub?.[lang]
  const heading = homeData.coursesHeader?.title?.[lang] || ui.exploreTitle?.[lang]

  useEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => {
      setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)))
      setPage(Math.round(el.scrollLeft / el.clientWidth))
    }
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => { el.removeEventListener('scroll', measure); window.removeEventListener('resize', measure) }
  }, [courses])

  const goPage = (p: number) => track.current?.scrollTo({ left: p * track.current.clientWidth, behavior: 'smooth' })

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-3 text-[1.75rem] leading-tight font-semibold md:text-[3rem] md:leading-[3.6rem] text-ink">{heading}</h2>
          </div>
          <div className="flex items-center gap-2">
            <ArrowBtn dir="prev" disabled={page <= 0} onClick={() => goPage(page - 1)} />
            <ArrowBtn dir="next" disabled={page >= pages - 1} onClick={() => goPage(page + 1)} />
          </div>
        </div>
        <ul ref={track} className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-4 md:mx-0 md:scroll-px-0 md:px-0">
          {courses.map((c) => (
            <li key={c.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <CourseCard course={c} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col items-center gap-6">
          {pages > 1 && (
            <div className="flex gap-2">
              {Array.from({ length: pages }).map((_, p) => (
                <button key={p} type="button" onClick={() => goPage(p)} aria-label={`${p + 1}`} aria-current={p === page} className={`h-2.5 rounded-full transition-all ${p === page ? 'w-8 bg-primary-900' : 'w-2.5 bg-line-strong hover:bg-ink-3'}`} />
              ))}
            </div>
          )}
          <a href="#/courses" className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-card px-7 font-semibold text-ink transition-colors hover:border-primary-700 hover:text-brand">
            {ui.viewAll?.[lang]} <ArrowRight size={18} />
          </a>
        </div>
      </Container>
    </section>
  )
}

function ArrowBtn({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled?: boolean; onClick: () => void }) {
  const { lang } = useApp()
  const { ui } = useContent()
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={dir === 'prev' ? ui.previous?.[lang] : ui.next?.[lang]} className="flex size-12 items-center justify-center rounded-full border border-line-strong bg-card text-ink transition-colors hover:border-primary-700 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-ink">
      {dir === 'prev' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  )
}

/* ---------------- Featured Learning Materials ---------------- */

function FeaturedMaterials() {
  const { lang } = useApp()
  const { resourcesData, ui } = useContent()
  if (resourcesData.showOnHome === false) return null
  const featured = (resourcesData.items || []).filter((item) => item.featuredOnHome)
  if (!featured.length) return null

  const eyebrow = resourcesData.homeEyebrow?.[lang] || resourcesData.eyebrow?.[lang] || ui.materialsEyebrow?.[lang]
  const heading = resourcesData.homeHeading?.[lang] || ui.materialsTitle?.[lang]

  return (
    <section className="border-t border-line bg-card py-16 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-3 text-[1.75rem] leading-tight font-semibold text-ink md:text-[2.75rem] md:leading-[3.3rem]">{heading}</h2>
          </div>
          <a
            href="#/resources"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-card px-6 font-semibold text-ink transition-colors hover:border-primary-700 hover:text-brand"
          >
            {ui.viewAllMaterials?.[lang] || ui.resources?.[lang]} <ArrowRight size={18} />
          </a>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <li key={item.id}>
              <ResourceCard item={item} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/* ---------------- Testimonials ---------------- */

function TestimonialAvatar({ photo, name }: { photo?: string; name: string }) {
  const [loadError, setLoadError] = useState(false)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (photo && !loadError) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setLoadError(true)}
        className="size-12 shrink-0 rounded-full border-2 border-accent-500/80 object-cover shadow-sm"
      />
    )
  }

  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-500 font-bold text-white shadow-sm">
      {initials || 'HA'}
    </span>
  )
}

function Testimonials() {
  const { lang } = useApp()
  const { testimonials, ui, homeData } = useContent()
  if (!testimonials.length) return null
  const eyebrow = homeData.voicesHeader?.eyebrow?.[lang] || ui.voicesEyebrow?.[lang]
  const heading = homeData.voicesHeader?.title?.[lang] || ui.voicesTitle?.[lang]

  return (
    <section className="relative overflow-hidden bg-primary-950 py-16 text-white md:py-24">
      <div aria-hidden className="contours absolute inset-0" />
      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[1.75rem] leading-tight font-semibold md:text-[3rem] md:leading-[3.6rem]">{heading}</h2>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <li key={t.id || `${t.name}-${idx}`} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-7 transition hover:bg-white/[0.07]">
              <QuoteIcon size={32} className="text-accent-500" />
              <blockquote className="ne-relaxed mt-4 flex-1 text-[1.05rem] leading-relaxed text-white/90">{t.quote[lang]}</blockquote>
              <div className="mt-6 flex items-center gap-3.5 border-t border-white/10 pt-5">
                <TestimonialAvatar photo={t.photo || t.photoUrl} name={t.name} />
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{t.name}</p>
                  <p className="text-xs text-white/70 line-clamp-2">{t.role[lang]}</p>
                </div>
                {t.source && sanitizeHref(t.source, '') && (
                  <a href={sanitizeHref(t.source, '')} target="_blank" rel="noopener noreferrer" aria-label={`${t.name} — source`} className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
                    <ExternalIcon size={16} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/* ---------------- FAQ ---------------- */

function Faq() {
  const { lang } = useApp()
  const { faqs, ui, settings, homeData } = useContent()
  const [open, setOpen] = useState<number | null>(0)
  const contactEmail = settings?.contact?.email || 'heifer.nepal@heifer.org'
  const eyebrow = homeData.faqHeader?.eyebrow?.[lang] || ui.faqEyebrow?.[lang]
  const heading = homeData.faqHeader?.title?.[lang] || ui.faqTitle?.[lang]
  const prompt = homeData.faqHeader?.prompt?.[lang] || ui.faqPrompt?.[lang] || (lang === 'en' ? 'Can’t find what you’re looking for? Write to the Heifer Nepal team.' : 'खोजेको जवाफ भेटिएन? हेफर नेपाल टोलीलाई लेख्नुहोस्।')

  if (!faqs.length) return null

  return (
    <section id="faq" className="py-16 md:py-24">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[1.75rem] leading-tight font-semibold md:text-[3rem] md:leading-[3.6rem] text-ink">{heading}</h2>
          <p className="ne-relaxed mt-4 text-ink-2">
            {prompt}
          </p>
          <a href={`mailto:${contactEmail}`} className="mt-6 inline-flex h-12 items-center rounded-full border border-line-strong bg-card px-6 font-semibold text-ink transition-colors hover:border-primary-700 hover:text-brand">
            {contactEmail}
          </a>
        </div>
        <div className="divide-y divide-line rounded-lg border border-line bg-card">
          {faqs.map((f, n) => {
            const isOpen = open === n
            return (
              <div key={f.id || n}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-${n}`} onClick={() => setOpen(isOpen ? null : n)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[1.05rem] font-semibold text-ink hover:text-brand">
                    {f.q[lang]}
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-primary-900 text-white' : 'bg-subtle text-ink-2'}`}>
                      {isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                    </span>
                  </button>
                </h3>
                <div id={`faq-${n}`} hidden={!isOpen} className="ne-relaxed px-6 pb-6 leading-relaxed text-ink-2">{f.a[lang]}</div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

/* ---------------- Partners marquee ---------------- */

function PartnerLogoCard({ partner }: { partner: import('@shared/schema').PartnerItem | string }) {
  const p = typeof partner === 'string' ? { name: partner } : partner
  const logo = p.logo || p.logoUrl

  const content = (
    <div
      title={p.name}
      className="flex h-18 shrink-0 items-center gap-3.5 rounded-xl border border-line bg-card px-5 py-2.5 shadow-xs transition hover:border-primary-500 hover:shadow-md"
    >
      {logo ? (
        <img
          src={logo}
          alt={p.name}
          className="h-10 w-auto max-w-[170px] object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLElement).style.display = 'none'
          }}
        />
      ) : null}
      <span className="text-xs font-bold tracking-tight text-ink-2 whitespace-nowrap">
        {p.name}
      </span>
    </div>
  )

  if (p.url) {
    return (
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={p.name}
        className="block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl"
      >
        {content}
      </a>
    )
  }

  return content
}

function Partners() {
  const { lang } = useApp()
  const { partners, ui, homeData } = useContent()
  if (!partners.length) return null
  const eyebrow = homeData.partnersHeader?.eyebrow?.[lang] || ui.partnersTitle?.[lang]

  const row = (hidden?: boolean): ReactNode =>
    partners.map((p, idx) => {
      const key = typeof p === 'string' ? p : p.id || p.name
      return (
        <li key={`${key}-${idx}${hidden ? '-dup' : ''}`} aria-hidden={hidden} className="shrink-0">
          <PartnerLogoCard partner={p} />
        </li>
      )
    })

  return (
    <section className="border-y border-line bg-card py-14 overflow-hidden">
      <Container>
        <p className="text-center text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase">{eyebrow}</p>
      </Container>
      <div className="group relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused]">
          {row()}
          {row(true)}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- CTA ---------------- */

function Cta() {
  const { lang } = useApp()
  const { ui, homeData } = useContent()
  const ctaTitle = homeData.cta?.title?.[lang] || ui.ctaTitle?.[lang]
  const ctaSub = homeData.cta?.subtitle?.[lang] || ui.ctaSub?.[lang]

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-xl bg-primary-900 px-6 py-12 text-white md:px-14 md:py-16">
          <div aria-hidden className="contours absolute inset-0" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(28rem_20rem_at_100%_0%,rgb(217_119_6/0.28),transparent_70%)]" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-[1.75rem] leading-tight font-semibold md:text-[2.5rem] md:leading-[3rem] text-balance">{ctaTitle}</h2>
              <p className="ne-relaxed mt-4 text-lg text-white/80">{ctaSub}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#/courses" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 font-semibold text-[#0d416b] transition-colors hover:bg-[#e7f0f7]">
                {ui.startLearning?.[lang]} <ArrowRight size={18} />
              </a>
              <a href="#/about" className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 font-semibold text-white transition-colors hover:bg-white/10">
                {ui.about?.[lang]}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
