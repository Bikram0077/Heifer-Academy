import type { HomePageData } from '@shared/schema'
import { ui } from './ui'

export const defaultHomeData: import('@shared/schema').HomePageData = {
  hero: {
    title: ui.heroTitle,
    subtitle: ui.heroSub,
    featuredCourseId: 'social-capital',
  },
  valueProps: [
    { icon: 'sprout', t: ui.v1t, d: ui.v1d },
    { icon: 'trend', t: ui.v2t, d: ui.v2d },
    { icon: 'hands', t: ui.v3t, d: ui.v3d },
  ],
  intro: {
    videoId: 'toDpDvi1k60',
    seconds: 254,
    title: { en: '25 Years of Serving Smallholder Families in Nepal', ne: 'नेपालका साना किसान परिवारको सेवामा २५ वर्ष' },
    label: { en: 'Heifer International Nepal', ne: 'हेफर इन्टरनेसनल नेपाल' },
    eyebrow: ui.introEyebrow,
    heading: ui.introTitle,
    body: ui.introBody,
    stats: [
      { v: { en: '1.7M+', ne: '१७ लाख+' }, l: ui.statHouseholds },
      { v: { en: '277', ne: '२७७' }, l: ui.statCoops },
      { v: { en: '29', ne: '२९' }, l: ui.statYears },
    ],
    sourceNote: ui.statSource,
  },
  coursesHeader: {
    eyebrow: ui.exploreSub,
    title: ui.exploreTitle,
  },
  voicesHeader: {
    eyebrow: ui.voicesEyebrow,
    title: ui.voicesTitle,
  },
  faqHeader: {
    eyebrow: ui.faqEyebrow,
    title: ui.faqTitle,
    prompt: ui.faqPrompt,
  },
  partnersHeader: {
    eyebrow: ui.partnersTitle,
  },
  cta: {
    title: ui.ctaTitle,
    subtitle: ui.ctaSub,
  },
}

