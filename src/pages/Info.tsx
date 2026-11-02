import type { ReactNode } from 'react'
import { isExternalHttpUrl, sanitizeHref, sanitizeImageSrc } from '@shared/url'
import { lessonsOf, num, type Bi, type Lang } from '../data'
import type { PageSection } from '@shared/schema'
import { useApp } from '../lib'
import { useContent } from '../content'
import { Container, Eyebrow } from '../components/Layout'
import { VideoPlayer } from '../components/VideoPlayer'
import { formatLabel } from './Resources'
import {
  ArrowRight,
  BookIcon,
  CheckIcon,
  ChevronRight,
  DownloadIcon,
  ExternalIcon,
  FileTextIcon,
  GlobeIcon,
  HandsIcon,
  LanguagesIcon,
  QuoteIcon,
  SproutIcon,
  TrendIcon,
  UsersIcon,
} from '../components/icons'

const defaultTitles: Record<string, Bi> = {
  about: { en: 'About Heifer Academy', ne: 'हेफर एकेडेमीबारे' },
  privacy: { en: 'Privacy Policy', ne: 'गोपनीयता नीति' },
  terms: { en: 'Terms of Use', ne: 'प्रयोगका सर्तहरू' },
  accessibility: { en: 'Accessibility Statement', ne: 'पहुँचयोग्यता विवरण' },
}

export function Info({ slug, isCustom = false }: { slug: string; isCustom?: boolean }) {
  const { lang } = useApp()
  const { pages, customPages, ui } = useContent()
  const pageData = isCustom
    ? customPages[slug] || pages[`custom_${slug}`] || pages[slug]
    : pages[slug]

  const title =
    pageData?.title?.[lang] ||
    pageData?.title?.en ||
    defaultTitles[slug]?.[lang] ||
    slug.replace(/-/g, ' ')
  const subtitle = pageData?.subtitle?.[lang] || ''

  if (isCustom && !pageData) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">
          {ui.pageNotFound?.[lang] || (lang === 'en' ? 'Page not found' : 'पृष्ठ भेटिएन')}
        </h1>
        <p className="mt-2 text-ink-2">
          {ui.pageNotFoundSub?.[lang] ||
            (lang === 'en'
              ? 'This page has not been published yet or may have been moved.'
              : 'यो पृष्ठ अझै प्रकाशित भएको छैन वा सारिएको हुन सक्छ।')}
        </p>
        <a
          href="#/"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary-900 px-6 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {ui.home?.[lang]} <ArrowRight size={16} />
        </a>
      </Container>
    )
  }

  return (
    <>
      <section className="border-b border-line bg-card">
        <Container className="py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-2">
            <a href="#/" className="hover:text-brand hover:underline">{ui.home?.[lang]}</a>
            <ChevronRight size={14} className="text-ink-3" />
            <span aria-current="page" className="text-ink">{title}</span>
          </nav>
          <h1 className="mt-6 text-3xl font-bold tracking-[-0.02em] text-ink md:text-[2.75rem] md:leading-tight">{title}</h1>
          {subtitle && <p className="ne-relaxed mt-3 max-w-2xl text-lg text-ink-2">{subtitle}</p>}
        </Container>
      </section>
      {slug === 'about' && !isCustom ? (
        <About />
      ) : (
        <Container className="py-12 md:py-16">
          <div className="max-w-3xl space-y-10">
            {(pageData?.sections || []).map((b, idx) => (
              <RichSectionBlock key={`${idx}-${b.h?.en || idx}`} section={b} lang={lang} />
            ))}
          </div>
        </Container>
      )}
    </>
  )
}

export function RichSectionBlock({ section: b, lang }: { section: PageSection; lang: Lang }) {
  const { ui } = useContent()
  const kind = b.kind || 'text'
  const heading = b.h?.[lang] || b.h?.en || ''
  const body = b.p?.[lang] || b.p?.en || ''

  if (kind === 'callout') {
    return (
      <aside className="rounded-xl border-l-4 border-accent-500 bg-accent-100 p-6">
        {heading && (
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <QuoteIcon size={18} className="shrink-0 text-accent-500" />
            <span>{heading}</span>
          </h2>
        )}
        {body && <p className="ne-relaxed mt-2 text-[1.02rem] leading-relaxed text-ink">{body}</p>}
      </aside>
    )
  }

  if (kind === 'bullets') {
    return (
      <section className="rounded-xl border border-line bg-card p-6 md:p-8">
        {heading && <h2 className="text-xl font-semibold text-ink">{heading}</h2>}
        {body && <p className="ne-relaxed mt-2 text-[1.02rem] leading-relaxed text-ink-2">{body}</p>}
        {(b.items || []).length > 0 && (
          <ul className="mt-5 space-y-3">
            {(b.items || []).map((it, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-brand">
                  <CheckIcon size={14} strokeWidth={2.5} />
                </span>
                <span className="ne-relaxed leading-relaxed text-ink">{it[lang] || it.en}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  if (kind === 'image') {
    const caption = b.imageCaption?.[lang] || b.imageCaption?.en || ''
    const safeImg = sanitizeImageSrc(b.imageUrl)
    return (
      <section className="space-y-4">
        {heading && <h2 className="text-xl font-semibold text-ink">{heading}</h2>}
        {body && <p className="ne-relaxed text-[1.05rem] leading-relaxed text-ink-2">{body}</p>}
        {safeImg && (
          <figure className="overflow-hidden rounded-xl border border-line bg-card shadow-soft">
            <img src={safeImg} alt={caption || heading} loading="lazy" decoding="async" className="max-h-[28rem] w-full object-cover" />
            {caption && <figcaption className="border-t border-line px-5 py-3 text-sm text-ink-2">{caption}</figcaption>}
          </figure>
        )}
      </section>
    )
  }

  if (kind === 'video') {
    return (
      <section className="space-y-4">
        {heading && <h2 className="text-xl font-semibold text-ink">{heading}</h2>}
        {body && <p className="ne-relaxed text-[1.05rem] leading-relaxed text-ink-2">{body}</p>}
        {b.videoId && (
          <VideoPlayer
            videoId={b.videoId}
            seconds={b.videoSeconds || 180}
            title={heading || 'Video'}
            label={heading || 'Video'}
          />
        )}
      </section>
    )
  }

  if (kind === 'download') {
    const url = sanitizeHref(b.linkUrl, '#/resources')
    const isExt = isExternalHttpUrl(url)
    const ctaText = b.linkLabel?.[lang] || b.linkLabel?.en || ui.openResource?.[lang] || (lang === 'en' ? 'Open resource' : 'सामग्री खोल्नुहोस्')
    return (
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-card p-6 shadow-soft sm:flex-row sm:items-center">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-brand">
            <FileTextIcon size={13} />
            {formatLabel(b.format || 'guide', lang)}
          </span>
          {heading && <h2 className="mt-2 text-lg font-semibold text-ink">{heading}</h2>}
          {body && <p className="ne-relaxed mt-1 text-sm leading-relaxed text-ink-2">{body}</p>}
        </div>
        <a
          href={url}
          target={isExt ? '_blank' : undefined}
          rel={isExt ? 'noopener noreferrer' : undefined}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <DownloadIcon size={16} />
          <span>{ctaText}</span>
          {isExt && <ExternalIcon size={14} />}
        </a>
      </section>
    )
  }

  return (
    <section>
      {heading && <h2 className="text-xl font-semibold text-ink">{heading}</h2>}
      {body && <p className="ne-relaxed mt-3 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink-2">{body}</p>}
    </section>
  )
}

function About() {
  const { lang } = useApp()
  const { courses, pages, settings, ui } = useContent()
  const about = pages.about?.aboutData
  const extraSections = pages.about?.sections
  const lessonCount = courses.reduce((s, c) => s + lessonsOf(c).length, 0)
  const orgUrl = sanitizeHref(settings.brand?.orgUrl, 'https://heifernepal.org/')

  const getIcon = (name: string): ReactNode => {
    switch (name) {
      case 'sprout': return <SproutIcon size={22} />
      case 'languages': return <LanguagesIcon size={22} />
      case 'users': return <UsersIcon size={22} />
      case 'hands': return <HandsIcon size={22} />
      case 'trend': return <TrendIcon size={22} />
      case 'book': return <BookIcon size={22} />
      case 'globe': return <GlobeIcon size={22} />
      default: return <SproutIcon size={22} />
    }
  }

  const eyebrow = about?.introEyebrow?.[lang] || ui.introEyebrow?.[lang]
  const introBody = about?.introBody?.[lang] || (
    lang === 'en'
      ? 'Heifer Academy is the free e-learning platform of Heifer International Nepal. It makes the practical training behind Heifer’s community development model available to every farmer, facilitator and student in Nepal’s seven provinces.'
      : 'हेफर एकेडेमी हेफर इन्टरनेसनल नेपालको निःशुल्क अनलाइन सिकाइ प्लेटफर्म हो। यसले हेफरको सामुदायिक विकास मोडलपछाडिको व्यावहारिक तालिमलाई नेपालका सातै प्रदेशका हरेक किसान, सहजकर्ता र विद्यार्थीसम्म पुर्‍याउँछ।'
  )

  const paragraphs = about?.paragraphs || [
    {
      en: 'Heifer International has worked alongside farming families since 1944. In Nepal, Heifer has partnered with communities since 1997 to build resilient food systems, promote sustainable agriculture and livestock development, and drive inclusive growth through the Social Entrepreneur Women’s Alliance and its network of cooperatives.',
      ne: 'हेफर इन्टरनेसनलले सन् १९४४ देखि किसान परिवारसँग काम गर्दै आएको छ। नेपालमा सन् १९९७ देखि हेफरले सामाजिक उद्यमी महिला गठबन्धन र सहकारी सञ्जालमार्फत उत्थानशील खाद्य प्रणाली, दिगो कृषि र पशुपालन विकास तथा समावेशी वृद्धिका लागि समुदायसँग साझेदारी गर्दै आएको छ।',
    },
  ]

  const pillars = about?.pillars || [
    { icon: 'sprout', t: { en: 'Field-tested knowledge', ne: 'फिल्डमा परीक्षित ज्ञान' }, d: { en: 'Built on more than 25 years of Heifer Nepal’s work with smallholder farmers, self-help groups and women-led cooperatives.', ne: 'साना किसान, स्वावलम्बन समूह र महिला नेतृत्वका सहकारीसँग हेफर नेपालको २५ वर्षभन्दा लामो कामको आधारमा।' } },
    { icon: 'languages', t: { en: 'Truly bilingual', ne: 'साँच्चै द्विभाषी' }, d: { en: 'Every screen, note and glossary works in English and नेपाली, so learners can study in the language they think in.', ne: 'हरेक पृष्ठ, टिपोट र शब्दकोश English र नेपालीमा चल्छ, ताकि सिकारुले आफूले सोच्ने भाषामा पढ्न सकून्।' } },
    { icon: 'users', t: { en: 'Made for groups', ne: 'समूहका लागि बनाइएको' }, d: { en: 'Discussion prompts, checklists and facilitator guidance turn each video into a ready-made group session.', ne: 'छलफलका प्रश्न, चेकलिस्ट र सहजकर्ता मार्गदर्शनले हरेक भिडियोलाई तयारी समूह सत्रमा बदल्छ।' } },
    { icon: 'hands', t: { en: 'Values first', ne: 'मूल्य पहिले' }, d: { en: 'Guided by Heifer’s 12 Cornerstones for Just and Sustainable Development, including Passing on the Gift.', ne: 'उपहार हस्तान्तरणसहित न्यायपूर्ण र दिगो विकासका लागि हेफरका १२ आधारभूत मूल्यद्वारा निर्देशित।' } },
  ]

  const statsList = about?.stats?.length
    ? about.stats.map((s) => ({
        v:
          s.useLiveCount === 'courses'
            ? num(courses.length, lang)
            : s.useLiveCount === 'lessons'
              ? num(lessonCount, lang)
              : s.v[lang],
        l: s.l,
      }))
    : [
        { v: num(courses.length, lang), l: { en: 'Courses', ne: 'पाठ्यक्रम' } },
        { v: num(lessonCount, lang), l: { en: 'Video lessons', ne: 'भिडियो पाठ' } },
        { v: num(7, lang), l: { en: 'Provinces served', ne: 'प्रदेशमा सेवा' } },
        { v: num(2, lang), l: { en: 'Languages', ne: 'भाषा' } },
      ]

  return (
    <Container className="py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <p className="ne-relaxed mt-4 text-xl leading-relaxed text-ink">
            {introBody}
          </p>
          {paragraphs.map((p, idx) => (
            <p key={idx} className="ne-relaxed mt-5 leading-relaxed text-ink-2">
              {p[lang]}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#/courses" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary-900 px-6 font-semibold text-white hover:bg-primary-700">{ui.exploreCourses?.[lang]} <ArrowRight size={18} /></a>
            <a href={orgUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-semibold text-ink hover:border-primary-700 hover:text-brand">{ui.heiferNepal?.[lang]}</a>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 self-start">
          {statsList.map((s, idx) => (
            <div key={`${idx}-${s.l.en}`} className="rounded-xl border border-line bg-card p-6">
              <dd className="text-4xl font-bold tracking-tight text-brand">{s.v}</dd>
              <dt className="mt-1 text-sm text-ink-2">{s.l[lang]}</dt>
            </div>
          ))}
        </dl>
      </div>
      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, idx) => (
          <li key={`${idx}-${p.t.en}`} className="rounded-xl border border-line bg-card p-6">
            <span className="flex size-11 items-center justify-center rounded-md bg-primary-100 text-brand">{getIcon(p.icon)}</span>
            <h2 className="mt-4 font-semibold text-ink">{p.t[lang]}</h2>
            <p className="ne-relaxed mt-2 text-sm leading-relaxed text-ink-2">{p.d[lang]}</p>
          </li>
        ))}
      </ul>
      {extraSections && extraSections.length > 0 && (
        <div className="mt-16 max-w-3xl space-y-10 border-t border-line pt-12">
          {extraSections.map((b, idx) => (
            <RichSectionBlock key={`${idx}-${b.h?.en || idx}`} section={b} lang={lang} />
          ))}
        </div>
      )}
    </Container>
  )
}
