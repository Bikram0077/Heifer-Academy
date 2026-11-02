import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  initializeFirestore,
  collection,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore'
import { firebaseConfig } from '@shared/firebaseConfig'
import { normalizeCourseMaterials, normalizeResourceItems } from '@shared/url'
import type {
  Course,
  CategoryId,
  Category,
  Bi,
  Testimonial,
  FaqItem,
  PartnerItem,
  PageContent,
  HomePageData,
  SiteSettings,
  SurveyOption,
  ProvinceItem,
  LayoutConfig,
  ResourceItem,
  ResourcesPageData,
  ContentDoc,
} from '@shared/schema'
import {
  courses as defaultCourses,
  categories as defaultCategories,
  testimonials as defaultTestimonials,
  faqs as defaultFaqs,
  partners as defaultPartners,
  defaultPages,
  defaultHomeData,
  defaultLayoutConfig,
  defaultResourcesData,
  defaultSettings,
  roles as defaultRoles,
  genders as defaultGenders,
  provinces as defaultProvinces,
  ui as defaultUi,
} from './data'

export interface ContentContextValue {
  courses: Course[]
  categories: { id: CategoryId; label: Bi }[]
  testimonials: Testimonial[]
  faqs: FaqItem[]
  partners: string[]
  pages: Record<string, PageContent>
  customPages: Record<string, PageContent>
  homeData: HomePageData
  layout: LayoutConfig
  resourcesData: ResourcesPageData
  allMaterials: ResourceItem[]
  settings: SiteSettings
  roles: SurveyOption[]
  genders: SurveyOption[]
  provinces: ProvinceItem[]
  ui: Record<string, Bi>
  isLiveConnected: boolean
  lastLiveUpdate: Date | null
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return ctx
}

let cachedApp: FirebaseApp | null = null
let cachedDb: Firestore | null = null

function getFirebaseDb(): Firestore | null {
  try {
    if (!cachedDb) {
      cachedApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
      try {
        cachedDb = initializeFirestore(cachedApp, { ignoreUndefinedProperties: true })
      } catch {
        cachedDb = getFirestore(cachedApp)
      }
    }
    return cachedDb
  } catch (err) {
    console.warn('Failed to initialize Firebase for public site:', err)
    return null
  }
}

/**
 * Resolves a bilingual field that may be edited either in a structured section editor
 * (Homepage / Header & Footer / Pages / Settings) OR in Bilingual UI Labels (`strings`).
 * Whichever one was customized away from the bundled default wins cleanly.
 */
function pickBi(sectionVal?: Partial<Bi>, defaultVal?: Bi, uiVal?: Partial<Bi>): Bi {
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

const NAV_UI_KEY_MAP: Record<string, keyof typeof defaultUi> = {
  'nav-courses': 'allCourses',
  'nav-resources': 'resources',
  'nav-about': 'about',
  'nav-faq': 'faq',
}

const FOOTER_LINK_UI_KEY_MAP: Record<string, keyof typeof defaultUi> = {
  'fl-about': 'about',
  'fl-heifer': 'heiferNepal',
  'fl-cornerstones': 'cornerstonesLink',
  'fl-faq': 'faq',
  'fl-feedback': 'feedback',
  'fl-a11y': 'accessibilityStatement',
  'fl-privacy': 'privacy',
  'fl-terms': 'terms',
}

const FOOTER_COL_UI_KEY_MAP: Record<string, keyof typeof defaultUi> = {
  'col-organisation': 'organisation',
  'col-support': 'support',
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(defaultCourses)
  const [categories, setCategories] = useState<{ id: CategoryId; label: Bi }[]>(defaultCategories)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs)
  const [partners, setPartners] = useState<string[]>(defaultPartners)
  const [pages, setPages] = useState<Record<string, PageContent>>(defaultPages)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [uiStrings, setUiStrings] = useState<Record<string, Bi>>(defaultUi)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const db = getFirebaseDb()
    if (!db) return

    const liveCol = collection(db, 'live')
    const unsub = onSnapshot(
      liveCol,
      (snapshot) => {
        setIsLiveConnected(true)
        if (snapshot.empty) {
          setCourses(defaultCourses)
          setCategories(defaultCategories)
          setTestimonials(defaultTestimonials)
          setFaqs(defaultFaqs)
          setPartners(defaultPartners)
          setPages(defaultPages)
          setSettings(defaultSettings)
          setUiStrings(defaultUi)
          return
        }

        const newCourses: Course[] = []
        let wrapperCategories: Category[] | null = null
        const legacyCategories: { id: CategoryId; label: Bi; order: number }[] = []

        let wrapperTestimonials: Testimonial[] | null = null
        const legacyTestimonials: Testimonial[] = []

        let wrapperFaqs: FaqItem[] | null = null
        const legacyFaqs: FaqItem[] = []

        let wrapperPartners: string[] | null = null
        const legacyPartners: PartnerItem[] = []

        const newPages: Record<string, PageContent> = { ...defaultPages }
        let newSettings = null as SiteSettings | null
        let newUi = null as Record<string, Bi> | null

        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as ContentDoc
          if (!raw || !raw.type) return

          switch (raw.type) {
            case 'course': {
              const c = raw.data as Course
              if (c && c.id) {
                const defCourse = defaultCourses.find((dc) => dc.id === c.id)
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
              const d = raw.data as { items?: (PartnerItem | string)[] } & Partial<PartnerItem>
              if (Array.isArray(d)) {
                wrapperPartners = d.map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean)
              } else if (d && Array.isArray(d.items)) {
                wrapperPartners = d.items.map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean)
              } else if (d && d.name) {
                legacyPartners.push({
                  id: d.id || docSnap.id,
                  name: d.name,
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

        if (newCourses.length > 0) {
          newCourses.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setCourses(newCourses)
        } else {
          setCourses(defaultCourses)
        }

        if (wrapperCategories !== null) {
          const sorted = [...(wrapperCategories as Category[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          const hasAll = sorted.some((c) => c.id === 'all')
          setCategories(
            hasAll ? sorted : [{ id: 'all', label: { en: 'All', ne: 'सबै' } }, ...sorted]
          )
        } else if (legacyCategories.length > 0) {
          legacyCategories.sort((a, b) => a.order - b.order)
          const hasAll = legacyCategories.some((c) => c.id === 'all')
          setCategories(
            hasAll
              ? legacyCategories
              : [{ id: 'all', label: { en: 'All', ne: 'सबै' }, order: -1 }, ...legacyCategories]
          )
        } else {
          setCategories(defaultCategories)
        }

        if (wrapperTestimonials !== null) {
          const sorted = [...(wrapperTestimonials as Testimonial[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setTestimonials(sorted)
        } else if (legacyTestimonials.length > 0) {
          legacyTestimonials.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setTestimonials(legacyTestimonials)
        } else {
          setTestimonials(defaultTestimonials)
        }

        if (wrapperFaqs !== null) {
          const sorted = [...(wrapperFaqs as FaqItem[])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setFaqs(sorted)
        } else if (legacyFaqs.length > 0) {
          legacyFaqs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setFaqs(legacyFaqs)
        } else {
          setFaqs(defaultFaqs)
        }

        if (wrapperPartners !== null) {
          setPartners(wrapperPartners)
        } else if (legacyPartners.length > 0) {
          legacyPartners.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setPartners(legacyPartners.map((p) => p.name))
        } else {
          setPartners(defaultPartners)
        }

        setPages(newPages)

        const mergedUi: Record<string, Bi> = {}
        const allUiKeys = new Set([
          ...Object.keys(defaultUi),
          ...Object.keys(newUi || {}),
        ])
        allUiKeys.forEach((k) => {
          const defVal = (defaultUi as Record<string, Bi>)[k]
          const liveVal = newUi?.[k]
          mergedUi[k] = {
            en: liveVal?.en !== undefined && liveVal.en !== '' ? liveVal.en : defVal?.en || '',
            ne: liveVal?.ne !== undefined && liveVal.ne !== '' ? liveVal.ne : defVal?.ne || '',
          }
        })
        setUiStrings(mergedUi)

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
            address: pickBi(
              newSettings?.contact?.address,
              defaultUi.address,
              mergedUi.address
            ),
          },
          survey: {
            ...defaultSettings.survey,
            ...(newSettings?.survey || {}),
          },
        }
        setSettings(mergedSettings)

        setLastLiveUpdate(new Date())
      },
      (err) => {
        console.warn('Real-time live content subscription error (falling back to bundle):', err)
        setIsLiveConnected(false)
      }
    )

    return () => unsub()
  }, [])

  const homePageContent = pages.home?.homeData
  const defHero = defaultHomeData.hero!
  const defIntro = defaultHomeData.intro!
  const defPillars = defaultHomeData.valueProps || []
  const rawPillars = homePageContent?.valueProps || settings.valueProps || defPillars
  const pillarUiMap: [keyof typeof defaultUi, keyof typeof defaultUi][] = [
    ['v1t', 'v1d'],
    ['v2t', 'v2d'],
    ['v3t', 'v3d'],
  ]

  const resolvedValueProps = rawPillars.map((p, idx) => {
    const defP = defPillars[idx]
    const uiPair = pillarUiMap[idx]
    if (defP && uiPair) {
      return {
        ...p,
        t: pickBi(p.t, defP.t, uiStrings[uiPair[0]]),
        d: pickBi(p.d, defP.d, uiStrings[uiPair[1]]),
      }
    }
    return p
  })

  const rawIntro = homePageContent?.intro || settings.intro || defIntro
  const statUiKeys: (keyof typeof defaultUi)[] = ['statHouseholds', 'statCoops', 'statYears']
  const resolvedIntroStats = (rawIntro.stats || defIntro.stats || []).map((st, idx) => {
    const defSt = defIntro.stats?.[idx]
    const uiKey = statUiKeys[idx]
    if (defSt && uiKey) {
      return {
        ...st,
        l: pickBi(st.l, defSt.l, uiStrings[uiKey]),
      }
    }
    return st
  })

  const homeData: HomePageData = {
    ...defaultHomeData,
    ...(homePageContent || {}),
    hero: {
      ...defHero,
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

  const rawLayout = pages.layout?.layoutData
  const resolvedNavLinks = (rawLayout?.header?.navLinks ?? defaultLayoutConfig.header.navLinks).map(
    (item) => {
      const uiKey = NAV_UI_KEY_MAP[item.id]
      if (!uiKey) return item
      const defItem = defaultLayoutConfig.header.navLinks.find((n) => n.id === item.id)
      return {
        ...item,
        label: pickBi(item.label, defItem?.label || defaultUi[uiKey], uiStrings[uiKey]),
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
          ? pickBi(col.title, defCol?.title || defaultUi[colUiKey], uiStrings[colUiKey])
          : col.title,
        links: (col.links || []).map((lnk) => {
          const linkUiKey = FOOTER_LINK_UI_KEY_MAP[lnk.id]
          if (!linkUiKey) return lnk
          const defLink = defCol?.links.find((l) => l.id === lnk.id)
          return {
            ...lnk,
            label: pickBi(lnk.label, defLink?.label || defaultUi[linkUiKey], uiStrings[linkUiKey]),
          }
        }),
      }
    }
  )

  const layout: LayoutConfig = {
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

  const rawRes = pages.resources?.resourcesData
  const normalizedCatalogItems = useMemo(
    () =>
      normalizeResourceItems(rawRes?.items, defaultResourcesData.items).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    [rawRes?.items]
  )

  const resourcesData: ResourcesPageData = useMemo(
    () => ({
      ...defaultResourcesData,
      ...(rawRes || {}),
      eyebrow: pickBi(rawRes?.eyebrow, defaultResourcesData.eyebrow, uiStrings.materialsEyebrow),
      heading: pickBi(rawRes?.heading, defaultResourcesData.heading, uiStrings.materialsTitle),
      items: normalizedCatalogItems,
    }),
    [rawRes, uiStrings.materialsEyebrow, uiStrings.materialsTitle, normalizedCatalogItems]
  )

  const allMaterials: ResourceItem[] = useMemo(() => {
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
  }, [normalizedCatalogItems, courses])

  const resolvedPages: Record<string, PageContent> = useMemo(
    () => ({
      ...pages,
      explore: {
        ...(pages.explore || defaultPages.explore),
        exploreData: {
          eyebrow: pickBi(
            pages.explore?.exploreData?.eyebrow,
            defaultUi.exploreSub,
            uiStrings.exploreSub
          ),
          heading: pickBi(
            pages.explore?.exploreData?.heading,
            defaultUi.exploreHeading,
            uiStrings.exploreHeading
          ),
          intro: pickBi(
            pages.explore?.exploreData?.intro,
            defaultUi.exploreIntro,
            uiStrings.exploreIntro
          ),
        },
      },
    }),
    [pages, uiStrings.exploreSub, uiStrings.exploreHeading, uiStrings.exploreIntro]
  )

  const customPages: Record<string, PageContent> = useMemo(() => {
    const map: Record<string, PageContent> = {}
    Object.values(resolvedPages).forEach((pg) => {
      if (pg && (pg.isCustom || pg.slug.startsWith('custom_'))) {
        const clean = pg.slug.replace(/^custom_/, '')
        map[clean] = pg
      }
    })
    return map
  }, [resolvedPages])

  const value: ContentContextValue = useMemo(
    () => ({
      courses,
      categories,
      testimonials,
      faqs,
      partners,
      pages: resolvedPages,
      customPages,
      homeData,
      layout,
      resourcesData,
      allMaterials,
      settings,
      roles: settings.survey?.roles?.length ? settings.survey.roles : defaultRoles,
      genders: settings.survey?.genders?.length ? settings.survey.genders : defaultGenders,
      provinces: settings.survey?.provinces?.length ? settings.survey.provinces : defaultProvinces,
      ui: uiStrings,
      isLiveConnected,
      lastLiveUpdate,
    }),
    [
      courses,
      categories,
      testimonials,
      faqs,
      partners,
      resolvedPages,
      customPages,
      homeData,
      layout,
      resourcesData,
      allMaterials,
      settings,
      uiStrings,
      isLiveConnected,
      lastLiveUpdate,
    ]
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
