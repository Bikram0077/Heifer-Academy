import type { CategoryId, Bi } from '@shared/schema'

export const categories: { id: CategoryId; label: Bi }[] = [
  { id: 'all', label: { en: 'All', ne: 'सबै' } },
  { id: 'social', label: { en: 'Social Capital', ne: 'सामाजिक पुँजी' } },
  { id: 'livestock', label: { en: 'Livestock / VAHW', ne: 'पशुपालन / भेटेरिनरी' } },
  { id: 'agribusiness', label: { en: 'Agribusiness', ne: 'कृषि व्यवसाय' } },
  { id: 'climate', label: { en: 'Climate Resilience', ne: 'जलवायु उत्थानशीलता' } },
  { id: 'cooperatives', label: { en: 'Cooperatives', ne: 'सहकारी' } },
]

