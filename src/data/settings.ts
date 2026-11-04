import type { SiteSettings } from '@shared/schema'
import { ui } from './ui'
import { defaultHomeData } from './homeData'
import { roles, genders, provinces } from './demographics'

export const defaultSettings: import('@shared/schema').SiteSettings = {
  announcement: {
    enabled: false,
    text: { en: 'Welcome to Heifer Academy', ne: 'हेफर एकेडेमीमा स्वागत छ' },
    link: '#/courses',
  },
  brand: {
    siteTitle: {
      en: 'Heifer Academy — Practical learning for Nepal’s farming communities',
      ne: 'हेफर एकेडेमी — नेपालका किसान समुदायका लागि व्यावहारिक सिकाइ',
    },
    orgName: { en: 'Heifer International Nepal', ne: 'हेफर इन्टरनेसनल नेपाल' },
    orgUrl: 'https://heifernepal.org/',
    logoUrl: '',
    logoDarkUrl: '',
    wordmark: 'Academy',
    cornerstonesUrl: 'https://www.heifer.org/our-work/approach/cornerstones',
    developedByDesc: ui.developedByDesc,
  },
  hero: defaultHomeData.hero,
  valueProps: defaultHomeData.valueProps,
  intro: defaultHomeData.intro,
  cta: defaultHomeData.cta,
  contact: {
    email: 'heifer.nepal@heifer.org',
    phone: '+977-1-5913120',
    address: ui.address,
  },
  survey: {
    roles,
    genders,
    provinces,
  },
}


