import type { LayoutConfig } from '@shared/schema'

export const defaultLayoutConfig: LayoutConfig = {
  header: {
    showExploreDropdown: true,
    navLinks: [
      { id: 'nav-courses', label: { en: 'All courses', ne: 'सबै पाठ्यक्रम' }, href: '#/courses', action: 'link', enabled: true },
      { id: 'nav-resources', label: { en: 'Materials', ne: 'सामग्रीहरू' }, href: '#/resources', action: 'link', enabled: true },
      { id: 'nav-about', label: { en: 'About', ne: 'हाम्रोबारे' }, href: '#/about', action: 'link', enabled: true },
      { id: 'nav-faq', label: { en: 'FAQ', ne: 'प्रश्नोत्तर' }, href: '#faq', action: 'faq', enabled: true },
    ],
    ctaButton: {
      enabled: true,
      label: { en: 'Start Learning', ne: 'सिक्न सुरु गर्नुहोस्' },
      href: '#/courses',
    },
  },
  footer: {
    showTopBanner: true,
    initiativeLabel: { en: 'An initiative of', ne: 'एक पहल' },
    tagline: { en: 'Come learn with us', ne: 'हामीसँग सिक्न आउनुहोस्' },
    subtitle: {
      en: 'Practical, bilingual training for Nepal’s farming communities.',
      ne: 'नेपालका किसान समुदायका लागि व्यावहारिक, द्विभाषी तालिम।',
    },
    description: {
      en: '',
      ne: '',
    },
    showCategoriesColumn: true,
    categoriesColumnTitle: { en: 'Learn', ne: 'सिकाइ' },
    columns: [
      {
        id: 'col-organisation',
        title: { en: 'Organisation', ne: 'संस्था' },
        links: [
          { id: 'fl-about', label: { en: 'About', ne: 'हाम्रोबारे' }, href: '#/about', action: 'link' },
          { id: 'fl-materials', label: { en: 'Materials & Field Guides', ne: 'सिकाइ सामग्री र पुस्तिका' }, href: '#/resources', action: 'link' },
          { id: 'fl-heifer', label: { en: 'Heifer Nepal website', ne: 'हेफर नेपाल वेबसाइट' }, href: 'https://heifernepal.org/', action: 'link', external: true },
          { id: 'fl-cornerstones', label: { en: '12 Cornerstones', ne: '१२ आधारभूत मूल्य' }, href: 'https://www.heifer.org/our-work/approach/cornerstones', action: 'link', external: true },
          { id: 'fl-faq', label: { en: 'FAQ', ne: 'प्रश्नोत्तर' }, href: '#faq', action: 'faq' },
        ],
      },
      {
        id: 'col-support',
        title: { en: 'Support', ne: 'सहयोग' },
        links: [
          { id: 'fl-feedback', label: { en: 'Feedback', ne: 'प्रतिक्रिया' }, href: '#feedback', action: 'pulse' },
          { id: 'fl-a11y', label: { en: 'Accessibility', ne: 'पहुँचयोग्यता' }, href: '#/accessibility', action: 'link' },
          { id: 'fl-privacy', label: { en: 'Privacy Policy', ne: 'गोपनीयता नीति' }, href: '#/privacy', action: 'link' },
          { id: 'fl-terms', label: { en: 'Terms of Use', ne: 'प्रयोगका सर्तहरू' }, href: '#/terms', action: 'link' },
        ],
      },
    ],
    socialLinks: [
      { id: 'soc-fb', platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/heifernepal', enabled: true },
      { id: 'soc-yt', platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@HeiferInternational', enabled: true },
      { id: 'soc-li', platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/heifer-international', enabled: true },
      { id: 'soc-web', platform: 'website', label: 'Heifer Nepal', url: 'https://heifernepal.org/', enabled: false },
    ],
    copyrightText: {
      en: 'Heifer International Nepal. All rights reserved.',
      ne: 'हेफर इन्टरनेसनल नेपाल। सर्वाधिकार सुरक्षित।',
    },
    madeForText: {
      en: 'Made for Nepal’s farming communities',
      ne: 'नेपालका किसान समुदायका लागि निर्मित',
    },
  },
}

