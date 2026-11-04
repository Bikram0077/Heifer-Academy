import type { PageContent } from '@shared/schema'
import { defaultHomeData } from './homeData'
import { defaultLayoutConfig } from './layoutConfig'
import { defaultResourcesData } from './resourcesData'
import { ui } from './ui'

export const defaultPages: Record<string, import('@shared/schema').PageContent> = {
  home: {
    slug: 'home',
    title: { en: 'Homepage', ne: 'गृहपृष्ठ' },
    homeData: defaultHomeData,
  },
  explore: {
    slug: 'explore',
    title: ui.exploreHeading,
    exploreData: {
      eyebrow: ui.exploreSub,
      heading: ui.exploreHeading,
      intro: ui.exploreIntro,
    },
  },
  about: {
    slug: 'about',
    title: { en: 'About Heifer Academy', ne: 'हेफर एकेडेमीबारे' },
    aboutData: {
      introEyebrow: ui.introEyebrow,
      introTitle: ui.introTitle,
      introBody: {
        en: 'Heifer Academy is the free e-learning platform of Heifer International Nepal. It makes the practical training behind Heifer’s community development model available to every farmer, facilitator and student in Nepal’s seven provinces.',
        ne: 'हेफर एकेडेमी हेफर इन्टरनेसनल नेपालको निःशुल्क अनलाइन सिकाइ प्लेटफर्म हो। यसले हेफरको सामुदायिक विकास मोडलपछाडिको व्यावहारिक तालिमलाई नेपालका सातै प्रदेशका हरेक किसान, सहजकर्ता र विद्यार्थीसम्म पुर्‍याउँछ।',
      },
      paragraphs: [
        {
          en: 'Heifer International has worked alongside farming families since 1944. In Nepal, Heifer has partnered with communities since 1997 to build resilient food systems, promote sustainable agriculture and livestock development, and drive inclusive growth through the Social Entrepreneur Women’s Alliance and its network of cooperatives.',
          ne: 'हेफर इन्टरनेसनलले सन् १९४४ देखि किसान परिवारसँग काम गर्दै आएको छ। नेपालमा सन् १९९७ देखि हेफरले सामाजिक उद्यमी महिला गठबन्धन र सहकारी सञ्जालमार्फत उत्थानशील खाद्य प्रणाली, दिगो कृषि र पशुपालन विकास तथा समावेशी वृद्धिका लागि समुदायसँग साझेदारी गर्दै आएको छ।',
        },
      ],
      pillars: [
        { icon: 'sprout', t: { en: 'Field-tested knowledge', ne: 'फिल्डमा परीक्षित ज्ञान' }, d: { en: 'Built on more than 25 years of Heifer Nepal’s work with smallholder farmers, self-help groups and women-led cooperatives.', ne: 'साना किसान, स्वावलम्बन समूह र महिला नेतृत्वका सहकारीसँग हेफर नेपालको २५ वर्षभन्दा लामो कामको आधारमा।' } },
        { icon: 'languages', t: { en: 'Truly bilingual', ne: 'साँच्चै द्विभाषी' }, d: { en: 'Every screen, note and glossary works in English and नेपाली, so learners can study in the language they think in.', ne: 'हरेक पृष्ठ, टिपोट र शब्दकोश English र नेपालीमा चल्छ, ताकि सिकारुले आफूले सोच्ने भाषामा पढ्न सकून्।' } },
        { icon: 'users', t: { en: 'Made for groups', ne: 'समूहका लागि बनाइएको' }, d: { en: 'Discussion prompts, checklists and facilitator guidance turn each video into a ready-made group session.', ne: 'छलफलका प्रश्न, चेकलिस्ट र सहजकर्ता मार्गदर्शनले हरेक भिडियोलाई तयारी समूह सत्रमा बदल्छ।' } },
        { icon: 'hands', t: { en: 'Values first', ne: 'मूल्य पहिले' }, d: { en: 'Guided by Heifer’s 12 Cornerstones for Just and Sustainable Development, including Passing on the Gift.', ne: 'उपहार हस्तान्तरणसहित न्यायपूर्ण र दिगो विकासका लागि हेफरका १२ आधारभूत मूल्यद्वारा निर्देशित।' } },
      ],
      stats: [
        { v: { en: '6', ne: '६' }, l: { en: 'Courses', ne: 'पाठ्यक्रम' }, useLiveCount: 'courses' },
        { v: { en: '18', ne: '१८' }, l: { en: 'Video lessons', ne: 'भिडियो पाठ' }, useLiveCount: 'lessons' },
        { v: { en: '7', ne: '७' }, l: { en: 'Provinces served', ne: 'प्रदेशमा सेवा' }, useLiveCount: 'none' },
        { v: { en: '2', ne: '२' }, l: { en: 'Languages', ne: 'भाषा' }, useLiveCount: 'none' },
      ],
    },
  },
  privacy: {
    slug: 'privacy',
    title: { en: 'Privacy Policy', ne: 'गोपनीयता नीति' },
    sections: [
      {
        h: { en: 'What we store', ne: 'हामी के राख्छौं' },
        p: {
          en: 'Your lesson progress, checklist ticks, notes, language and accessibility preferences are saved only in your own browser (local storage). They are never sent to Heifer or anyone else, and you can clear them at any time from your browser settings.',
          ne: 'तपाईंको पाठ प्रगति, चेकलिस्ट, टिपोट, भाषा र पहुँचयोग्यता रोजाइ तपाईंकै ब्राउजरमा मात्र सुरक्षित हुन्छ। यी हेफर वा अरू कसैलाई पठाइँदैन, र तपाईं ब्राउजर सेटिङबाट जुनसुकै बेला हटाउन सक्नुहुन्छ।',
        },
      },
      {
        h: { en: 'Video playback', ne: 'भिडियो प्रसारण' },
        p: {
          en: 'Lessons are streamed from YouTube in privacy-enhanced mode (youtube-nocookie.com). YouTube does not store information about you unless you play a video. YouTube’s own privacy policy applies to playback.',
          ne: 'पाठहरू युट्युबको गोपनीयता-सुदृढ मोड (youtube-nocookie.com) बाट प्रसारण हुन्छन्। भिडियो नचलाएसम्म युट्युबले तपाईंबारे जानकारी राख्दैन। प्रसारणमा युट्युबको आफ्नै गोपनीयता नीति लागू हुन्छ।',
        },
      },
      {
        h: { en: 'Optional feedback', ne: 'ऐच्छिक प्रतिक्रिया' },
        p: {
          en: 'The learner survey is optional and anonymous. It asks only for district, role and gender, and never for your name or phone number.',
          ne: 'सिकारु सर्वेक्षण ऐच्छिक र गोप्य छ। यसले जिल्ला, भूमिका र लिङ्ग मात्र सोध्छ, नाम वा फोन नम्बर कहिल्यै सोध्दैन।',
        },
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: { en: 'Terms of Use', ne: 'प्रयोगका सर्तहरू' },
    sections: [
      {
        h: { en: 'Free to learn and share', ne: 'सिक्न र बाँड्न निःशुल्क' },
        p: {
          en: 'All courses are free for personal and community learning. Facilitators may play lessons in group meetings, trainings and classrooms.',
          ne: 'सबै पाठ्यक्रम व्यक्तिगत र सामुदायिक सिकाइका लागि निःशुल्क छन्। सहजकर्ताले समूह बैठक, तालिम र कक्षामा पाठहरू चलाउन सक्छन्।',
        },
      },
      {
        h: { en: 'Content ownership', ne: 'सामग्रीको स्वामित्व' },
        p: {
          en: 'Videos remain the property of Heifer International and the respective creators. Please do not re-upload or sell course content.',
          ne: 'भिडियोहरू हेफर इन्टरनेसनल र सम्बन्धित निर्माताकै स्वामित्वमा रहन्छन्। कृपया पाठ्यक्रम सामग्री पुनः अपलोड वा बिक्री नगर्नुहोस्।',
        },
      },
      {
        h: { en: 'Advice, not a substitute', ne: 'सल्लाह, विकल्प होइन' },
        p: {
          en: 'Lessons share general good practice. For animal illness, always consult your local veterinary technician or community animal health worker.',
          ne: 'पाठहरूले सामान्य असल अभ्यास बाँड्छन्। पशु बिरामी हुँदा सधैं स्थानीय पशु प्राविधिक वा सामुदायिक पशु स्वास्थ्य कार्यकर्तासँग सल्लाह लिनुहोस्।',
        },
      },
    ],
  },
  accessibility: {
    slug: 'accessibility',
    title: { en: 'Accessibility Statement', ne: 'पहुँचयोग्यता विवरण' },
    sections: [
      {
        h: { en: 'Our commitment', ne: 'हाम्रो प्रतिबद्धता' },
        p: {
          en: 'Heifer Academy aims to meet WCAG 2.2 Level AA, and AAA wherever possible, so that every learner — including people with low vision, limited literacy or slow connections — can use it.',
          ne: 'हेफर एकेडेमीले WCAG २.२ स्तर AA, र सम्भव भएसम्म AAA पूरा गर्ने लक्ष्य राखेको छ, ताकि कमजोर दृष्टि, सीमित साक्षरता वा ढिलो इन्टरनेट भएका सहित हरेक सिकारुले प्रयोग गर्न सकून्।',
        },
      },
      {
        h: { en: 'Built-in tools', ne: 'भित्रै उपलब्ध उपकरण' },
        p: {
          en: 'Use the accessibility button in the header for high contrast, dark mode, larger or smaller text, a reading line guide and text-to-speech in English or Nepali. Every page works with a keyboard alone.',
          ne: 'हेडरको पहुँचयोग्यता बटनबाट उच्च कन्ट्रास्ट, डार्क मोड, ठूलो वा सानो अक्षर, पढ्ने रेखा र अङ्ग्रेजी वा नेपालीमा पढेर सुनाउने सुविधा प्रयोग गर्नुहोस्। हरेक पृष्ठ किबोर्डबाट मात्र चलाउन सकिन्छ।',
        },
      },
      {
        h: { en: 'Tell us what to improve', ne: 'के सुधार्ने भन्नुहोस्' },
        p: {
          en: 'If something is hard to use, email heifer.nepal@heifer.org and we will respond.',
          ne: 'कुनै कुरा प्रयोग गर्न गाह्रो भएमा heifer.nepal@heifer.org मा इमेल गर्नुहोस्, हामी जवाफ दिनेछौं।',
        },
      },
    ],
  },
  layout: {
    slug: 'layout',
    title: { en: 'Header & Footer Navigation', ne: 'हेडर र फुटर नेभिगेसन' },
    layoutData: defaultLayoutConfig,
  },
  resources: {
    slug: 'resources',
    title: { en: 'Learning Materials & Field Guides', ne: 'सिकाइ सामग्री र फिल्ड पुस्तिकाहरू' },
    resourcesData: defaultResourcesData,
  },
}

