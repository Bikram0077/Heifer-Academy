export type Lang = 'en' | 'ne'
export type Bi = { en: string; ne: string }

export type Role = 'viewer' | 'editor' | 'super_admin'

export type UserProfile = {
  email: string
  name: string
  role: Role
  disabled: boolean
  createdAt: string
  mfaEnabled?: boolean
  mfaEnrolledAt?: string
  mfaSecret?: string
}

export type Invite = {
  email: string
  name?: string
  role: Role
  invitedBy?: string
  invitedAt?: string
}

export type CategoryId = 'all' | 'social' | 'livestock' | 'agribusiness' | 'climate' | 'cooperatives' | string

export type Category = {
  id: string
  label: Bi
  order?: number
}

export type MaterialFormat = 'pdf' | 'guide' | 'poster' | 'toolkit' | 'worksheet' | 'audio' | 'video' | 'article'

export type CourseMaterial = {
  id: string
  title: Bi
  description?: Bi
  format: MaterialFormat
  url: string
  image?: string
  meta?: Bi
  body?: Bi
  keyPoints?: Bi[]
  facilitatorTip?: Bi
}

export type Lesson = {
  id: string
  seconds: number
  title: Bi
  notes?: Bi
  materialUrl?: string
  materialLabel?: Bi
}

export type Module = {
  title: Bi
  lessons: Lesson[]
}

export type Course = {
  id: string
  category: string
  title: Bi
  subtitle: Bi
  description: Bi
  image: string
  imageAlt: string
  badge?: Bi
  level?: Bi
  instructor?: Bi
  outcomes: Bi[]
  modules: Module[]
  summary: Bi
  checklist: Bi[]
  facilitator: Bi
  discussion: Bi[]
  glossary: { term: Bi; meaning: Bi }[]
  materials?: CourseMaterial[]
  order?: number
}

export type ResourceItem = {
  id: string
  title: Bi
  description: Bi
  format: MaterialFormat
  category: string
  url: string
  image?: string
  meta?: Bi
  courseId?: string
  featuredOnHome?: boolean
  body?: Bi
  keyPoints?: Bi[]
  facilitatorTip?: Bi
  order?: number
}

export type ResourcesPageData = {
  eyebrow: Bi
  heading: Bi
  intro: Bi
  homeEyebrow?: Bi
  homeHeading?: Bi
  showOnHome?: boolean
  items: ResourceItem[]
}

export type NavLinkItem = {
  id: string
  label: Bi
  href: string
  action?: 'link' | 'faq' | 'pulse'
  external?: boolean
  enabled: boolean
}

export type FooterLinkItem = {
  id: string
  label: Bi
  href: string
  action?: 'link' | 'pulse' | 'faq'
  external?: boolean
}

export type FooterColumn = {
  id: string
  title: Bi
  links: FooterLinkItem[]
}

export type SocialPlatform = 'facebook' | 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'website'

export type SocialLink = {
  id: string
  platform: SocialPlatform
  label: string
  url: string
  enabled: boolean
}

export type LayoutConfig = {
  header: {
    showExploreDropdown: boolean
    navLinks: NavLinkItem[]
    ctaButton: {
      enabled: boolean
      label: Bi
      href: string
    }
  }
  footer: {
    showTopBanner: boolean
    initiativeLabel: Bi
    tagline: Bi
    subtitle: Bi
    description?: Bi
    showCategoriesColumn: boolean
    categoriesColumnTitle: Bi
    columns: FooterColumn[]
    socialLinks: SocialLink[]
    copyrightText: Bi
    madeForText: Bi
  }
}

export type Testimonial = {
  id?: string
  quote: Bi
  name: string
  role: Bi
  source: string
  photo?: string
  photoUrl?: string
  order?: number
}

export type FaqItem = {
  id?: string
  q: Bi
  a: Bi
  order?: number
}

export type PartnerItem = {
  id?: string
  name: string
  logo?: string
  logoUrl?: string
  url?: string
  order?: number
}

export type PageSectionKind = 'text' | 'callout' | 'bullets' | 'image' | 'video' | 'download'

export type PageSection = {
  kind?: PageSectionKind
  h: Bi
  p: Bi
  items?: Bi[]
  imageUrl?: string
  imageCaption?: Bi
  videoId?: string
  videoSeconds?: number
  linkUrl?: string
  linkLabel?: Bi
  format?: MaterialFormat
}

export type AboutPillar = {
  icon: 'sprout' | 'languages' | 'users' | 'hands' | 'trend' | 'book' | 'globe' | string
  t: Bi
  d: Bi
}

export type ValuePillar = {
  icon: 'sprout' | 'trend' | 'hands' | 'users' | 'languages' | 'book' | 'globe' | string
  t: Bi
  d: Bi
}

export type HomePageData = {
  hero?: {
    title: Bi
    subtitle: Bi
    featuredCourseId?: string
  }
  valueProps?: ValuePillar[]
  intro?: {
    videoId: string
    seconds: number
    title: Bi
    label: Bi
    eyebrow: Bi
    heading: Bi
    body: Bi
    stats: { v: Bi; l: Bi }[]
    sourceNote: Bi
  }
  coursesHeader?: {
    eyebrow: Bi
    title: Bi
  }
  voicesHeader?: {
    eyebrow: Bi
    title: Bi
  }
  faqHeader?: {
    eyebrow: Bi
    title: Bi
    prompt: Bi
  }
  partnersHeader?: {
    eyebrow: Bi
  }
  cta?: {
    title: Bi
    subtitle: Bi
  }
}

export type PageSlug = 'home' | 'explore' | 'about' | 'privacy' | 'terms' | 'accessibility' | 'layout' | 'resources' | string

export type PageContent = {
  slug: PageSlug
  title: Bi
  subtitle?: Bi
  isCustom?: boolean
  sections?: PageSection[]
  homeData?: HomePageData
  exploreData?: {
    eyebrow?: Bi
    heading?: Bi
    intro?: Bi
  }
  aboutData?: {
    introEyebrow?: Bi
    introTitle?: Bi
    introBody?: Bi
    paragraphs?: Bi[]
    pillars?: AboutPillar[]
    stats?: { v: Bi; l: Bi; useLiveCount?: 'courses' | 'lessons' | 'none' }[]
  }
  layoutData?: LayoutConfig
  resourcesData?: ResourcesPageData
}

export type SurveyOption = {
  id: string
  label: Bi
}

export type ProvinceItem = {
  name: Bi
  districts: string[]
}

export type SiteSettings = {
  announcement?: {
    enabled: boolean
    text: Bi
    link?: string
  }
  brand?: {
    siteTitle?: Bi
    orgName?: Bi
    orgUrl?: string
    logoUrl?: string
    logoDarkUrl?: string
    wordmark?: string
    cornerstonesUrl?: string
    developedByDesc?: Bi
  }
  hero?: {
    title: Bi
    subtitle: Bi
    featuredCourseId?: string
  }
  valueProps?: ValuePillar[]
  intro?: {
    videoId: string
    seconds: number
    title: Bi
    label: Bi
    eyebrow: Bi
    heading: Bi
    body: Bi
    stats: { v: Bi; l: Bi }[]
    sourceNote: Bi
  }
  cta?: {
    title: Bi
    subtitle: Bi
  }
  contact?: {
    email: string
    phone: string
    address: Bi
  }
  survey?: {
    roles?: SurveyOption[]
    genders?: SurveyOption[]
    provinces?: ProvinceItem[]
  }
}

export type ContentType =
  | 'course'
  | 'category'
  | 'testimonial'
  | 'faq'
  | 'partner'
  | 'page'
  | 'strings'
  | 'settings'

export type FeedbackStatus = 'new' | 'reviewed' | 'archived'

export interface FeedbackItem {
  id?: string
  fullName?: string
  email?: string
  phone?: string
  province?: string
  district?: string
  municipality?: string
  role?: string
  otherRoleText?: string
  gender?: string
  suggestions: string
  status?: FeedbackStatus
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export type ContentDoc<T = any> = {
  type: ContentType
  order: number
  data: T
  updatedBy: string
  updatedByEmail?: string
  updatedByName?: string
  updatedAt: string
  publishedAt?: string
}
