import type { Bi } from '@shared/schema'

export const testimonials: { quote: Bi; name: string; role: Bi; source: string; photo?: string }[] = [
  {
    quote: {
      en: '“We realized that we couldn’t work singlehandedly, that we had to work together. We got to know our sisters. It unites us.”',
      ne: '“हामीले एक्लै काम गर्न सक्दैनौं, सँगै काम गर्नुपर्छ भन्ने बुझ्यौं। हामीले आफ्ना दिदीबहिनीलाई चिन्यौं। यसले हामीलाई एकजुट बनाउँछ।”',
    },
    name: 'Tulsi Thapa',
    role: { en: 'Cooperative Chairperson, Bihani Dairy', ne: 'सहकारी अध्यक्ष, बिहानी डेरी' },
    source: 'https://www.heifer.org/blog/women-of-bihani-dairy-nepal-give-back-to-community-create-opportunities',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    quote: {
      en: '“Our production has increased and the goats are higher quality. What used to sell for 10,000 rupees now can sell for 18,000 to 19,000 rupees.”',
      ne: '“हाम्रो उत्पादन बढेको छ र बाख्राको गुणस्तर राम्रो भएको छ। पहिले १०,००० रुपैयाँमा बिक्ने बाख्रा अहिले १८,००० देखि १९,००० रुपैयाँमा बिक्छ।”',
    },
    name: 'Kusu',
    role: { en: 'Certified Animal Health Service Provider', ne: 'प्रमाणित पशु स्वास्थ्य सेवा प्रदायक' },
    source: 'https://www.heifer.org/blog/online-training-opens-doors-for-a-mother-in-nepal.html',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    quote: {
      en: '“Goats generate income and savings, especially for women, enhancing their capacity to cope with economic emergencies.”',
      ne: '“बाख्राले विशेषगरी महिलाका लागि आम्दानी र बचत सिर्जना गर्छ, जसले आर्थिक सङ्कटसँग जुध्ने क्षमता बढाउँछ।”',
    },
    name: 'Dilip Bhandari',
    role: { en: 'Senior Director of Programs, Heifer International', ne: 'वरिष्ठ कार्यक्रम निर्देशक, हेफर इन्टरनेसनल' },
    source: 'https://www.heifer.org/blog/subsidy-sucess-holds-promise-for-nepali-farmers.html',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
]

