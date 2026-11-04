import type { PartnerItem } from '@shared/schema'

export const partnerLogos: Record<string, string> = {
  'Ministry of Agriculture and Livestock Development': '/partners/moald.svg',
  'Department of Livestock Services': '/partners/dls.svg',
  'Social Entrepreneur Women’s Alliance (SEWA)': '/partners/sewa.svg',
  'Heifer Korea': '/partners/heifer-korea.svg',
  'Nepal Agricultural Research Council': '/partners/narc.svg',
  'National Cooperative Federation of Nepal': '/partners/ncf.svg',
  'University of Florida': '/partners/florida.svg',
  'Kathmandu University': '/partners/ku.svg',
}

export const partners: import('@shared/schema').PartnerItem[] = [
  {
    name: 'Ministry of Agriculture and Livestock Development',
    logo: '/partners/moald.svg',
    url: 'https://moald.gov.np',
  },
  {
    name: 'Department of Livestock Services',
    logo: '/partners/dls.svg',
    url: 'https://dls.gov.np',
  },
  {
    name: 'Social Entrepreneur Women’s Alliance (SEWA)',
    logo: '/partners/sewa.svg',
    url: 'https://sewabharat.org',
  },
  {
    name: 'Heifer Korea',
    logo: '/partners/heifer-korea.svg',
    url: 'https://heiferkorea.org',
  },
  {
    name: 'Nepal Agricultural Research Council',
    logo: '/partners/narc.svg',
    url: 'http://narc.gov.np',
  },
  {
    name: 'National Cooperative Federation of Nepal',
    logo: '/partners/ncf.svg',
    url: 'https://ncfnepal.com.np',
  },
  {
    name: 'University of Florida',
    logo: '/partners/florida.svg',
    url: 'https://ifas.ufl.edu',
  },
  {
    name: 'Kathmandu University',
    logo: '/partners/ku.svg',
    url: 'https://ku.edu.np',
  },
]

export function normalizePartner(p: string | import('@shared/schema').PartnerItem): import('@shared/schema').PartnerItem {
  if (typeof p === 'string') {
    return {
      name: p,
      logo: partnerLogos[p] || undefined,
    }
  }
  return {
    ...p,
    logo: p.logo || p.logoUrl || (p.name ? partnerLogos[p.name] : undefined),
  }
}

