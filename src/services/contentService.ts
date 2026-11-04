import type {
  Bi,
  Category,
  CategoryId,
  ContentDoc,
  Course,
  FaqItem,
  HomePageData,
  LayoutConfig,
  PageContent,
  PartnerItem,
  ResourceItem,
  ResourcesPageData,
  SiteSettings,
  Testimonial,
} from '@shared/schema'
import { normalizeCourseMaterials, normalizeResourceItems } from '@shared/url'
import {
  ui as defaultUi,
  defaultLayoutConfig,
  defaultResourcesData,
  defaultPages,
  courses as defaultCourses,
  categories as defaultCategories,
  testimonials as defaultTestimonials,
  faqs as defaultFaqs,
  partners as defaultPartners,
  defaultSettings,
  normalizePartner,
} from '../data'

export interface ParsedLiveContent {
  courses: Course[]
  categories: { id: CategoryId; label: Bi }[]
  testimonials: Testimonial[]
  faqs: FaqItem[]
  partners: PartnerItem[]
  pages: Record<string, PageContent>
  settings: SiteSettings
  uiStrings: Record<string, Bi>
}

/**
 * Transforms a raw Firestore 'live' snapshot into strongly typed, sanitized domain entities.
 */
export function parseLiveSnapshot(docs: Array<{ id: string; data: () => unknown }>): ParsedLiveContent {
  if (docs.length === 0) {
    return {
      courses: defaultCourses,
      categories: defaultCategories,
      testimonials: defaultTestimonials,
      faqs: defaultFaqs,
      partners: defaultPartners,
      pages: defaultPages,
      settings: defaultSettings,
      uiStrings: defaultUi,
    }
  }

  const newCourses: Course[] = []
  let wrapperCategories: Category[] | null = null
  const legacyCategories: { id: CategoryId; label: Bi; order: number }[] = []

  let wrapperTestimonials: Testimonial[] | null = null
  const legacyTestimonials: Testimonial[] = []

  let wrapperFaqs: FaqItem[] | null = null
  const legacyFaqs: FaqItem[] = []

  let wrapperPartners: (PartnerItem | string)[] | null = null
  const legacyPartners: PartnerItem[] = []

  const newPages: Record<string, PageContent> = { ...defaultPages }
  let newSettings = null as SiteSettings | null
  let newUi = null as Record<string, Bi> | null

  docs.forEach((docSnap) => {
    const raw = docSnap.data() as ContentDoc
    if (!raw || !raw.type) return

    switch (raw.type) {
      case 'course': {
        const c = raw.data as Course
        if (c && c.id) {
          const defCourse = defaultCourses.find((dc: Course) => dc.id === c.id)
          newCourses.push({
            ...c,
            materials: normalizeCourseMaterials(c.materials, defCourse),
            order: c.order ?? raw.order ?? 0,
          })
        }
        break
      }
      case 'category': {
        const d = raw.data as { items?: Category[]; id?: CategoryId; label?: Bi } | Category[]
        if (Array.isArray(d)) {
          wrapperCategories = d
        } else if (d && Array.isArray(d.items)) {
          wrapperCategories = d.items
        } else if (d && d.id && d.label) {
          legacyCategories.push({
            id: d.id,
            label: d.label,
            order: raw.order ?? 0,
          })
        }
        break
      }
      case 'testimonial': {
        const d = raw.data as { items?: Testimonial[] } & Partial<Testimonial>
        if (Array.isArray(d)) {
          wrapperTestimonials = d
        } else if (d && Array.isArray(d.items)) {
          wrapperTestimonials = d.items
        } else if (d && d.name && d.quote && d.role) {
          legacyTestimonials.push({
            quote: d.quote,
            name: d.name,
            role: d.role,
            source: d.source || '',
            photo: d.photo || d.photoUrl,
            id: d.id || docSnap.id,
            order: raw.order ?? 0,
          })
        }
        break
      }
      case 'faq': {
        const d = raw.data as { items?: FaqItem[] } & Partial<FaqItem>
        if (Array.isArray(d)) {
          wrapperFaqs = d
        } else if (d && Array.isArray(d.items)) {
          wrapperFaqs = d.items
        } else if (d && d.q && d.a) {
          legacyFaqs.push({
            q: d.q,
            a: d.a,
            id: d.id || docSnap.id,
            order: raw.order ?? 0,
          })
        }
        break
      }
      case 'partner': {
        const d = raw.data as ({ items?: (PartnerItem | string)[] } & Partial<PartnerItem>) | (PartnerItem | string)[]
        if (Array.isArray(d)) {
          wrapperPartners = d
        } else if (d && Array.isArray(d.items)) {
          wrapperPartners = d.items
        } else if (d && d.name) {
          legacyPartners.push({
            id: d.id || docSnap.id,
            name: d.name,
            logo: d.logo || d.logoUrl,
            url: d.url,
            order: raw.order ?? 0,
          })
        }
        break
      }
      case 'page': {
        const pg = raw.data as PageContent
        if (pg && pg.slug) {
          const defPg = defaultPages[pg.slug]
          newPages[pg.slug] = {
            ...(defPg || {}),
            ...pg,
            exploreData:
              pg.exploreData || defPg?.exploreData
                ? {
                    ...(defPg?.exploreData || {}),
                    ...(pg.exploreData || {}),
                  }
                : undefined,
            aboutData:
              pg.aboutData || defPg?.aboutData
                ? {
                    ...(defPg?.aboutData || {}),
                    ...(pg.aboutData || {}),
                  }
                : undefined,
          }
        }
        break
      }
      case 'settings': {
        newSettings = raw.data as SiteSettings
        break
      }
      case 'strings': {
        newUi = raw.data as Record<string, Bi>
        break
      }
    }
  })

  const courses =
    newCourses.length > 0
      ? newCourses.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : defaultCourses

  let categories: { id: CategoryId; label: Bi }[]
  if (wrapperCategories !== null) {
    const sorted = [...(wrapperCategories as Category[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const hasAll = sorted.some((c) => c.id === 'all')
    categories = hasAll ? sorted : [{ id: 'all', label: { en: 'All', ne: 'सबै' } }, ...sorted]
  } else if (legacyCategories.length > 0) {
    legacyCategories.sort((a, b) => a.order - b.order)
    const hasAll = legacyCategories.some((c) => c.id === 'all')
    categories = hasAll
      ? legacyCategories
      : [{ id: 'all', label: { en: 'All', ne: 'सबै' }, order: -1 }, ...legacyCategories]
  } else {
    categories = defaultCategories
  }

  let testimonials: Testimonial[]
  if (wrapperTestimonials !== null) {
    testimonials = [...(wrapperTestimonials as Testimonial[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } else if (legacyTestimonials.length > 0) {
    testimonials = legacyTestimonials.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } else {
    testimonials = defaultTestimonials
  }

  let faqs: FaqItem[]
  if (wrapperFaqs !== null) {
    faqs = [...(wrapperFaqs as FaqItem[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } else if (legacyFaqs.length > 0) {
    faqs = legacyFaqs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } else {
    faqs = defaultFaqs
  }

  let partners: PartnerItem[]
  if (wrapperPartners !== null) {
    partners = (wrapperPartners as (PartnerItem | string)[]).map(normalizePartner)
  } else if (legacyPartners.length > 0) {
    legacyPartners.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    partners = legacyPartners.map(normalizePartner)
  } else {
    partners = defaultPartners
  }

  const mergedUi: Record<string, Bi> = {}
  const allUiKeys = new Set([...Object.keys(defaultUi), ...Object.keys(newUi || {})])
  allUiKeys.forEach((k) => {
    const defVal = (defaultUi as Record<string, Bi>)[k]
    const liveVal = newUi?.[k]
    mergedUi[k] = {
      en: liveVal?.en !== undefined && liveVal.en !== '' ? liveVal.en : defVal?.en || '',
      ne: liveVal?.ne !== undefined && liveVal.ne !== '' ? liveVal.ne : defVal?.ne || '',
    }
  })

  const mergedSettings: SiteSettings = {
    ...defaultSettings,
    ...(newSettings || {}),
    announcement: {
      ...(defaultSettings.announcement || { enabled: false, text: { en: '', ne: '' }, link: '' }),
      ...(newSettings?.announcement || {}),
    },
    brand: {
      ...defaultSettings.brand,
      ...(newSettings?.brand || {}),
      developedByDesc: pickBi(
        newSettings?.brand?.developedByDesc,
        defaultUi.developedByDesc,
        mergedUi.developedByDesc
      ),
    },
    contact: {
      ...(defaultSettings.contact || { email: '', phone: '', address: { en: '', ne: '' } }),
      ...(newSettings?.contact || {}),
      address: pickBi(newSettings?.contact?.address, defaultUi.address, mergedUi.address),
    },
    survey: {
      ...defaultSettings.survey,
      ...(newSettings?.survey || {}),
    },
  }

  return {
    courses,
    categories,
    testimonials,
    faqs,
    partners,
    pages: newPages,
    settings: mergedSettings,
    uiStrings: mergedUi,
  }
}

/**
 * Resolves a bilingual field that may be edited either in a structured section editor
 * (Homepage / Header & Footer / Pages / Settings) OR in Bilingual UI Labels (`strings`).
 * Whichever one was customized away from the bundled default wins cleanly.
 */
export function pickBi(sectionVal?: Partial<Bi>, defaultVal?: Bi, uiVal?: Partial<Bi>): Bi {
  const resolveLang = (lang: 'en' | 'ne'): string => {
    const def = defaultVal?.[lang] ?? ''
    const sec = sectionVal?.[lang]
    const u = uiVal?.[lang]
    if (sec !== undefined && sec !== '' && sec !== def) return sec
    if (u !== undefined && u !== '' && u !== def) return u
    return sec || u || def
  }
  return {
    en: resolveLang('en'),
    ne: resolveLang('ne'),
  }
}

export const NAV_UI_KEY_MAP: Record<string, keyof typeof defaultUi> = {
  'nav-courses': 'allCourses',
  'nav-resources': 'resources',
  'nav-about': 'about',
  'nav-faq': 'faq',
}

export const FOOTER_LINK_UI_KEY_MAP: Record<string, keyof typeof defaultUi> = {
  'fl-about': 'about',
  'fl-heifer': 'heiferNepal',
  'fl-cornerstones': 'cornerstonesLink',
  'fl-faq': 'faq',
  'fl-feedback': 'feedback',
  'fl-a11y': 'accessibilityStatement',
  'fl-privacy': 'privacy',
  'fl-terms': 'terms',
}

export const FOOTER_COL_UI_KEY_MAP: Record<string, keyof typeof defaultUi> = {
  'col-organisation': 'organisation',
  'col-support': 'support',
}

/**
 * Resolves homepage section content with bilingual fallback priorities.
 */
export function resolveHomeData(
  pages: Record<string, PageContent>,
  settings: SiteSettings,
  uiStrings: Record<string, Bi>
): HomePageData {
  const homePageContent = pages.home?.homeData
  const defIntro = defaultPages.home?.homeData?.intro || {
    videoId: 'toDpDvi1k60',
    seconds: 254,
    title: { en: '25 Years of Serving Smallholder Families in Nepal', ne: 'नेपालका साना किसान परिवारको सेवामा २५ वर्ष' },
    label: { en: 'Heifer International Nepal', ne: 'हेफर इन्टरनेसनल नेपाल' },
    eyebrow: defaultUi.introEyebrow,
    heading: defaultUi.introTitle,
    body: defaultUi.introBody,
    stats: [
      { v: { en: '1.7M+', ne: '१७ लाख+' }, l: defaultUi.statHouseholds },
      { v: { en: '277', ne: '२७७' }, l: defaultUi.statCoops },
      { v: { en: '29', ne: '२९' }, l: defaultUi.statYears },
    ],
    sourceNote: defaultUi.statSource,
  }
  const rawIntro = homePageContent?.intro || settings.intro || defIntro

  const rawValueProps = homePageContent?.valueProps || settings.valueProps || []
  const resolvedValueProps =
    rawValueProps.length === 3
      ? [
          {
            ...rawValueProps[0],
            t: pickBi(rawValueProps[0].t, defaultUi.v1t, uiStrings.v1t),
            d: pickBi(rawValueProps[0].d, defaultUi.v1d, uiStrings.v1d),
          },
          {
            ...rawValueProps[1],
            t: pickBi(rawValueProps[1].t, defaultUi.v2t, uiStrings.v2t),
            d: pickBi(rawValueProps[1].d, defaultUi.v2d, uiStrings.v2d),
          },
          {
            ...rawValueProps[2],
            t: pickBi(rawValueProps[2].t, defaultUi.v3t, uiStrings.v3t),
            d: pickBi(rawValueProps[2].d, defaultUi.v3d, uiStrings.v3d),
          },
        ]
      : rawValueProps

  const rawIntroStats = rawIntro.stats || defIntro.stats || []
  const resolvedIntroStats =
    rawIntroStats.length === 3
      ? [
          {
            ...rawIntroStats[0],
            l: pickBi(rawIntroStats[0].l, defaultUi.statHouseholds, uiStrings.statHouseholds),
          },
          {
            ...rawIntroStats[1],
            l: pickBi(rawIntroStats[1].l, defaultUi.statCoops, uiStrings.statCoops),
          },
          {
            ...rawIntroStats[2],
            l: pickBi(rawIntroStats[2].l, defaultUi.statYears, uiStrings.statYears),
          },
        ]
      : rawIntroStats

  return {
    hero: {
      ...(settings.hero || {}),
      ...(homePageContent?.hero || {}),
      title: pickBi(
        homePageContent?.hero?.title || settings.hero?.title,
        defaultUi.heroTitle,
        uiStrings.heroTitle
      ),
      subtitle: pickBi(
        homePageContent?.hero?.subtitle || settings.hero?.subtitle,
        defaultUi.heroSub,
        uiStrings.heroSub
      ),
    },
    valueProps: resolvedValueProps,
    intro: {
      ...defIntro,
      ...rawIntro,
      eyebrow: pickBi(rawIntro.eyebrow, defaultUi.introEyebrow, uiStrings.introEyebrow),
      heading: pickBi(rawIntro.heading, defaultUi.introTitle, uiStrings.introTitle),
      body: pickBi(rawIntro.body, defaultUi.introBody, uiStrings.introBody),
      sourceNote: pickBi(rawIntro.sourceNote, defaultUi.statSource, uiStrings.statSource),
      stats: resolvedIntroStats,
    },
    coursesHeader: {
      eyebrow: pickBi(
        homePageContent?.coursesHeader?.eyebrow,
        defaultUi.exploreSub,
        uiStrings.exploreSub
      ),
      title: pickBi(
        homePageContent?.coursesHeader?.title,
        defaultUi.exploreTitle,
        uiStrings.exploreTitle
      ),
    },
    voicesHeader: {
      eyebrow: pickBi(
        homePageContent?.voicesHeader?.eyebrow,
        defaultUi.voicesEyebrow,
        uiStrings.voicesEyebrow
      ),
      title: pickBi(
        homePageContent?.voicesHeader?.title,
        defaultUi.voicesTitle,
        uiStrings.voicesTitle
      ),
    },
    faqHeader: {
      eyebrow: pickBi(
        homePageContent?.faqHeader?.eyebrow,
        defaultUi.faqEyebrow,
        uiStrings.faqEyebrow
      ),
      title: pickBi(
        homePageContent?.faqHeader?.title,
        defaultUi.faqTitle,
        uiStrings.faqTitle
      ),
      prompt: pickBi(
        homePageContent?.faqHeader?.prompt,
        defaultUi.faqPrompt,
        uiStrings.faqPrompt
      ),
    },
    partnersHeader: {
      eyebrow: pickBi(
        homePageContent?.partnersHeader?.eyebrow,
        defaultUi.partnersTitle,
        uiStrings.partnersTitle
      ),
    },
    cta: {
      title: pickBi(
        homePageContent?.cta?.title || settings.cta?.title,
        defaultUi.ctaTitle,
        uiStrings.ctaTitle
      ),
      subtitle: pickBi(
        homePageContent?.cta?.subtitle || settings.cta?.subtitle,
        defaultUi.ctaSub,
        uiStrings.ctaSub
      ),
    },
  }
}

/**
 * Resolves header & footer layout navigation configuration.
 */
export function resolveLayoutConfig(
  pages: Record<string, PageContent>,
  uiStrings: Record<string, Bi>
): LayoutConfig {
  const uiDict = defaultUi as Record<string, Bi>
  const rawLayout = pages.layout?.layoutData
  const resolvedNavLinks = (rawLayout?.header?.navLinks ?? defaultLayoutConfig.header.navLinks).map(
    (item) => {
      const uiKey = NAV_UI_KEY_MAP[item.id]
      if (!uiKey) return item
      const defItem = defaultLayoutConfig.header.navLinks.find((n) => n.id === item.id)
      return {
        ...item,
        label: pickBi(item.label, defItem?.label || uiDict[uiKey], uiStrings[uiKey]),
      }
    }
  )

  const resolvedFooterCols = (rawLayout?.footer?.columns ?? defaultLayoutConfig.footer.columns).map(
    (col) => {
      const colUiKey = FOOTER_COL_UI_KEY_MAP[col.id]
      const defCol = defaultLayoutConfig.footer.columns.find((c) => c.id === col.id)
      return {
        ...col,
        title: colUiKey
          ? pickBi(col.title, defCol?.title || uiDict[colUiKey], uiStrings[colUiKey])
          : col.title,
        links: (col.links || []).map((lnk) => {
          const linkUiKey = FOOTER_LINK_UI_KEY_MAP[lnk.id]
          if (!linkUiKey) return lnk
          const defLink = defCol?.links.find((l) => l.id === lnk.id)
          return {
            ...lnk,
            label: pickBi(lnk.label, defLink?.label || uiDict[linkUiKey], uiStrings[linkUiKey]),
          }
        }),
      }
    }
  )

  return {
    header: {
      ...defaultLayoutConfig.header,
      ...(rawLayout?.header || {}),
      navLinks: resolvedNavLinks,
      ctaButton: {
        ...defaultLayoutConfig.header.ctaButton,
        ...(rawLayout?.header?.ctaButton || {}),
        label: pickBi(
          rawLayout?.header?.ctaButton?.label,
          defaultLayoutConfig.header.ctaButton.label,
          uiStrings.startLearning
        ),
      },
    },
    footer: {
      ...defaultLayoutConfig.footer,
      ...(rawLayout?.footer || {}),
      initiativeLabel: pickBi(
        rawLayout?.footer?.initiativeLabel,
        defaultLayoutConfig.footer.initiativeLabel,
        uiStrings.initiativeOf
      ),
      tagline: pickBi(
        rawLayout?.footer?.tagline,
        defaultLayoutConfig.footer.tagline,
        uiStrings.footerTagline
      ),
      subtitle: pickBi(
        rawLayout?.footer?.subtitle,
        defaultLayoutConfig.footer.subtitle,
        uiStrings.footerSub
      ),
      categoriesColumnTitle: pickBi(
        rawLayout?.footer?.categoriesColumnTitle,
        defaultLayoutConfig.footer.categoriesColumnTitle,
        uiStrings.learn
      ),
      copyrightText: pickBi(
        rawLayout?.footer?.copyrightText,
        defaultLayoutConfig.footer.copyrightText,
        uiStrings.copyright
      ),
      madeForText: pickBi(
        rawLayout?.footer?.madeForText,
        defaultLayoutConfig.footer.madeForText,
        uiStrings.footerMadeFor
      ),
      columns: resolvedFooterCols,
      socialLinks: rawLayout?.footer?.socialLinks ?? defaultLayoutConfig.footer.socialLinks,
    },
  }
}

/**
 * Aggregates and deduplicates materials across resources catalog and courses.
 */
export function resolveAllMaterials(
  normalizedCatalogItems: ResourceItem[],
  courses: Course[]
): ResourceItem[] {
  const base = [...normalizedCatalogItems]
  const seenIds = new Set(base.map((i) => i.id))
  courses.forEach((course) => {
    ;(course.materials || []).forEach((m, mIdx) => {
      if (seenIds.has(m.id)) return
      seenIds.add(m.id)
      base.push({
        id: m.id,
        title: m.title,
        description: m.description || course.subtitle,
        format: m.format || 'guide',
        category: course.category,
        url: m.url || '',
        image: m.image || course.image,
        meta: m.meta,
        courseId: course.id,
        body: m.body,
        keyPoints: m.keyPoints,
        facilitatorTip: m.facilitatorTip,
        order: 1000 + mIdx,
      })
    })
  })
  return base
}
