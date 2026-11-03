import { extractYouTubeId } from '@shared/url'
import type {
  Lang,
  Bi,
  CategoryId,
  Lesson,
  Module,
  Course,
  CourseMaterial,
  MaterialFormat,
  ResourceItem,
  ResourcesPageData,
  LayoutConfig,
} from '@shared/schema'

export type {
  Lang,
  Bi,
  CategoryId,
  Lesson,
  Module,
  Course,
  CourseMaterial,
  MaterialFormat,
  ResourceItem,
  ResourcesPageData,
  LayoutConfig,
}

export const categories: { id: CategoryId; label: Bi }[] = [
  { id: 'all', label: { en: 'All', ne: 'सबै' } },
  { id: 'social', label: { en: 'Social Capital', ne: 'सामाजिक पुँजी' } },
  { id: 'livestock', label: { en: 'Livestock / VAHW', ne: 'पशुपालन / भेटेरिनरी' } },
  { id: 'agribusiness', label: { en: 'Agribusiness', ne: 'कृषि व्यवसाय' } },
  { id: 'climate', label: { en: 'Climate Resilience', ne: 'जलवायु उत्थानशीलता' } },
  { id: 'cooperatives', label: { en: 'Cooperatives', ne: 'सहकारी' } },
]

const img = (id: string, w = 1200, h = 675) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${w}&h=${h}`

const l = (id: string, seconds: number, en: string, ne: string): Lesson => ({ id, seconds, title: { en, ne } })
const mod = (en: string, ne: string, lessons: Lesson[]): Module => ({ title: { en, ne }, lessons })


export const courses: Course[] = [
  {
    id: 'social-capital',
    category: 'social',
    title: { en: 'Social Capital & 12 Cornerstones', ne: 'सामाजिक पुँजी र १२ आधारभूत मूल्य' },
    description: {
      en: 'The values that hold self-help groups together — trust, sharing and accountability — explained through everyday village situations.',
      ne: 'स्वावलम्बन समूहलाई जोडेर राख्ने मूल्यहरू — विश्वास, बाँडचुँड र जवाफदेहिता — गाउँका दैनिक उदाहरणमार्फत।',
    },
    image: img('1549819363-10acf530e110'),
    imageAlt: 'A group of women seated together outside a village building in Nepal',
    subtitle: { en: 'Values that hold groups together', ne: 'समूहलाई जोड्ने मूल्यहरू' },
    outcomes: [
      { en: 'Explain what social capital is and why it matters for group enterprises.', ne: 'सामाजिक पुँजी के हो र समूह उद्यमका लागि किन महत्त्वपूर्ण छ भनी व्याख्या गर्न।' },
      { en: 'Describe the 12 Cornerstones and connect each to everyday village life.', ne: '१२ आधारभूत मूल्यहरू वर्णन गर्न र गाउँको दैनिक जीवनसँग जोड्न।' },
      { en: 'Facilitate a values-based discussion in a self-help group meeting.', ne: 'स्वावलम्बन समूह बैठकमा मूल्यमा आधारित छलफल सहजीकरण गर्न।' },
      { en: 'Recognise how women’s leadership strengthens whole communities.', ne: 'महिला नेतृत्वले सम्पूर्ण समुदायलाई कसरी बलियो बनाउँछ भनी बुझ्न।' },
    ],
    modules: [
      mod('Foundations of Social Capital', 'सामाजिक पुँजीको आधार', [
        l('sh85cYW4hbk', 292, 'Women in Nepal Form a Community Group', 'नेपालका महिलाले सामुदायिक समूह बनाउँदा'),
        l('X1LKbgofc6U', 399, 'Building Social Capital Through Value Chains', 'मूल्य शृङ्खलामार्फत सामाजिक पुँजी निर्माण'),
      ]),
      mod('The 12 Cornerstones in Practice', 'अभ्यासमा १२ आधारभूत मूल्य', [
        l('qIgJ1inwFGE', 99, 'What Happens When a Community Shares', 'समुदायले बाँडचुँड गर्दा के हुन्छ'),
        l('tvVjAdqnNnU', 1761, 'Cornerstones Facilitation Training in Dhading', 'धादिङमा आधारभूत मूल्य सहजीकरण तालिम'),
      ]),
      mod('Women’s Leadership', 'महिला नेतृत्व', [
        l('ZzPYHWbH1TE', 397, 'The Power of People', 'जनशक्तिको सामर्थ्य'),
        l('rPdvaICoVew', 192, 'Women Leading Healthier, Stronger Communities', 'स्वस्थ र सबल समुदायको नेतृत्वमा महिला'),
        l('qMMZS1VaJQY', 182, 'Ganga Khanal: Breadwinner', 'गंगा खनाल: परिवारको आधार'),
      ]),
    ],
    summary: {
      en: 'Each cornerstone is a shared value your group can practise at every monthly meeting. Strong values build trust, and trust makes savings, livestock and markets work for everyone.',
      ne: 'हरेक आधारभूत मूल्य समूहले मासिक बैठकमा अभ्यास गर्न सक्ने साझा मूल्य हो। बलियो मूल्यले विश्वास बढाउँछ, र विश्वासले बचत, पशुपालन र बजारलाई सबैका लागि सफल बनाउँछ।',
    },
    checklist: [
      { en: 'Read one cornerstone aloud at the start of each meeting.', ne: 'हरेक बैठकको सुरुमा एउटा मूल्य ठूलो स्वरमा पढ्नुहोस्।' },
      { en: 'Ask two members to share a real example from their household.', ne: 'दुई सदस्यलाई आफ्नो घरको वास्तविक उदाहरण सुनाउन आग्रह गर्नुहोस्।' },
      { en: 'Agree on one small action the group will take before next month.', ne: 'अर्को महिनाअघि समूहले गर्ने एउटा सानो काममा सहमति गर्नुहोस्।' },
      { en: 'Record the action in the group minute book with a responsible person.', ne: 'जिम्मेवार व्यक्तिसहित उक्त काम माइन्युट पुस्तिकामा लेख्नुहोस्।' },
    ],
    facilitator: {
      en: 'Let members speak first. A cornerstone is understood best when people connect it to their own lives, not when it is lectured.',
      ne: 'सदस्यहरूलाई पहिले बोल्न दिनुहोस्। मूल्यलाई भाषणले होइन, आफ्नै जीवनसँग जोडेर बुझ्दा राम्रो बुझिन्छ।',
    },
    discussion: [
      { en: 'Which cornerstone is strongest in our group today? Which needs work?', ne: 'आज हाम्रो समूहमा कुन मूल्य सबैभन्दा बलियो छ? कुनमा सुधार चाहिन्छ?' },
      { en: 'How do we make sure every member’s voice is heard?', ne: 'हरेक सदस्यको आवाज सुनिने कसरी सुनिश्चित गर्ने?' },
      { en: 'What does “self-reliance” look like for our village in five years?', ne: 'पाँच वर्षपछि हाम्रो गाउँका लागि “आत्मनिर्भरता” कस्तो देखिन्छ?' },
    ],
    glossary: [
      { term: { en: 'Social capital', ne: 'सामाजिक पुँजी' }, meaning: { en: 'Trust and relationships that let people act together.', ne: 'मानिसहरूलाई सँगै काम गर्न सक्षम बनाउने विश्वास र सम्बन्ध।' } },
      { term: { en: 'Self-help group (SHG)', ne: 'स्वावलम्बन समूह' }, meaning: { en: 'A small group of 15–25 members who save, learn and act together.', ne: 'सँगै बचत गर्ने, सिक्ने र काम गर्ने १५–२५ जनाको सानो समूह।' } },
      { term: { en: 'Cornerstone', ne: 'आधारभूत मूल्य' }, meaning: { en: 'A core value that guides group decisions.', ne: 'समूहका निर्णयलाई मार्गदर्शन गर्ने मुख्य मूल्य।' } },
      { term: { en: 'Minute book', ne: 'माइन्युट पुस्तिका' }, meaning: { en: 'The written record of each meeting’s decisions.', ne: 'हरेक बैठकका निर्णयहरूको लिखित अभिलेख।' } },
    ],
    level: { en: 'Foundational · All Groups', ne: 'आधारभूत · सबै समूह' },
    instructor: { en: 'Heifer Nepal Community Facilitation Team', ne: 'हेफर नेपाल सामुदायिक सहजीकरण टोली' },
    materials: [
      {
        id: 'sc-cornerstones-guide',
        title: { en: '12 Cornerstones Group Facilitation Handbook', ne: '१२ आधारभूत मूल्य समूह सहजीकरण पुस्तिका' },
        description: {
          en: 'Step-by-step monthly meeting exercises, role-plays and reflection prompts for SHG facilitators.',
          ne: 'स्वावलम्बन समूहका सहजकर्ताका लागि मासिक बैठक अभ्यास, भूमिका अभिनय र समीक्षा प्रश्नहरू।',
        },
        format: 'guide',
        url: 'https://www.heifer.org/our-work/approach/cornerstones',
        meta: { en: 'Facilitator Guide · EN / नेपाली', ne: 'सहजकर्ता पुस्तिका · नेपाली / EN' },
        body: {
          en: 'Use this handbook during monthly Self-Help Group (SHG) meetings to turn the 12 Cornerstones into practical household habits. Begin every session in a circle so all members see one another equally, invite two households to share real experiences from the past month, and close with one concrete group commitment.',
          ne: 'मासिक स्वावलम्बन समूह बैठकमा १२ आधारभूत मूल्यलाई व्यावहारिक घरायसी बानीमा बदल्न यो पुस्तिका प्रयोग गर्नुहोस्। सबै सदस्यले एकअर्कालाई बराबरी देख्ने गरी गोलो घेरामा बैठक सुरु गर्नुहोस्, दुई घरपरिवारलाई गत महिनाको अनुभव सुनाउन लगाउनुहोस् र एउटा ठोस सामूहिक प्रतिबद्धतासहित समापन गर्नुहोस्।',
        },
        keyPoints: [
          { en: 'Open the meeting by reading one Cornerstone aloud in the language members speak at home.', ne: 'सदस्यहरूले घरमा बोल्ने भाषामै एउटा आधारभूत मूल्य ठूलो स्वरमा पढेर बैठक सुरु गर्नुहोस्।' },
          { en: 'Pair members for a 5-minute story exchange before opening group discussion.', ne: 'सामूहिक छलफल सुरु गर्नुअघि ५ मिनेट जोडीमा अनुभव आदानप्रदान गराउनुहोस्।' },
          { en: 'Connect the value directly to savings, animal care or collective marketing.', ne: 'उक्त मूल्यलाई बचत, पशु हेरचाह वा सामूहिक बजारीकरणसँग सिधै जोड्नुहोस्।' },
          { en: 'Write one agreed household action and follow-up date in the group minute book.', ne: 'समूह माइन्युट पुस्तिकामा सहमत घरायसी काम र अनुगमन मिति टिप्नुहोस्।' },
        ],
        facilitatorTip: {
          en: 'Rotate facilitation each month so quiet and younger members build confidence leading the group.',
          ne: 'कम बोल्ने र युवा सदस्यहरूको आत्मविश्वास बढाउन हरेक महिना सहजीकरणको पालो फेर्नुहोस्।',
        },
      },
      {
        id: 'sc-shg-action-sheet',
        title: { en: 'Monthly SHG Action Plan & Minute Worksheet', ne: 'मासिक समूह कार्ययोजना र माइन्युट फारम' },
        description: {
          en: 'Printable record sheet to track cornerstone commitments, household actions and follow-ups.',
          ne: 'आधारभूत मूल्य प्रतिबद्धता, घरायसी काम र अनुगमन टिप्न मिल्ने फारम।',
        },
        format: 'worksheet',
        url: '',
        meta: { en: 'Worksheet · Printable A4', ne: 'फारम · प्रिन्ट योग्य A4' },
        body: {
          en: 'Keep a clear record of every monthly SHG meeting so promises turn into action. Print or copy these columns into your group register and review last month’s commitments before adding new ones.',
          ne: 'हरेक मासिक स्वावलम्बन समूह बैठकको स्पष्ट अभिलेख राख्नुहोस् ताकि वाचाहरू व्यवहारमा बदलियून्। यो ढाँचा प्रिन्ट गर्नुहोस् वा समूह रजिस्टरमा सारेर नयाँ निर्णय थप्नुअघि अघिल्लो महिनाको समीक्षा गर्नुहोस्।',
        },
        keyPoints: [
          { en: 'Meeting date, attendance count (women / men) and savings collected today.', ne: 'बैठक मिति, उपस्थिति सङ्ख्या (महिला / पुरुष) र आज सङ्कलित बचत रकम।' },
          { en: 'Review of last month’s agreed action: completed, in progress or needs support.', ne: 'गत महिनाको सहमत कामको समीक्षा: पूरा भएको, जारी रहेको वा सहयोग आवश्यक।' },
          { en: 'Cornerstone of the month and two household examples shared by members.', ne: 'महिनाको आधारभूत मूल्य र सदस्यहरूले सुनाएका दुई घरायसी उदाहरण।' },
          { en: 'Next action, responsible member name, deadline and signatures of all present.', ne: 'अर्को कार्य, जिम्मेवार सदस्यको नाम, समयसीमा र उपस्थित सबैको हस्ताक्षर।' },
        ],
        facilitatorTip: {
          en: 'Read the written minutes aloud before anyone signs so members with limited literacy can verify every detail.',
          ne: 'हस्ताक्षर गर्नुअघि लेखिएको माइन्युट ठूलो स्वरमा पढेर सुनाउनुहोस् ताकि सबै सदस्यले विवरण रुजु गर्न सकून्।',
        },
      },
    ],
  },
  {
    id: 'pog',
    category: 'social',
    title: { en: 'Passing on the Gift (POG)', ne: 'उपहार हस्तान्तरण (पीओजी)' },
    description: {
      en: 'How families who receive animals pass on the first offspring and training to another family, multiplying impact across the community.',
      ne: 'पशु पाउने परिवारले पहिलो पाठापाठी र तालिम अर्को परिवारलाई कसरी हस्तान्तरण गर्छन् र समुदायभरि प्रभाव कसरी बढ्छ।',
    },
    image: img('1781673314288-0841a5a86b05'),
    imageAlt: 'An elderly woman sitting outdoors surrounded by her goats',
    subtitle: { en: 'Sharing animals, skills and responsibility', ne: 'पशु, सीप र जिम्मेवारीको बाँडफाँड' },
    outcomes: [
      { en: 'Explain the Passing on the Gift commitment and why it multiplies impact.', ne: 'उपहार हस्तान्तरणको प्रतिबद्धता र यसले प्रभाव किन गुणात्मक बनाउँछ भनी व्याख्या गर्न।' },
      { en: 'Apply accountability practices before, during and after receiving an animal.', ne: 'पशु पाउनुअघि, पाउँदा र पाएपछि जवाफदेहिताका अभ्यास लागू गर्न।' },
      { en: 'Plan a fair, transparent passing-on ceremony with your group.', ne: 'समूहसँग मिलेर निष्पक्ष र पारदर्शी हस्तान्तरण समारोहको योजना बनाउन।' },
    ],
    modules: [
      mod('Understanding the Gift', 'उपहार बुझ्ने', [
        l('qCExn6UuiBA', 58, 'What is Passing on the Gift?', 'उपहार हस्तान्तरण के हो?'),
        l('JnMI848PSWM', 128, 'Can One Cow Really Change Everything?', 'के एउटा गाईले सबै बदल्न सक्छ?'),
        l('515JeN5n9bs', 42, 'The Promise Behind the Gift', 'उपहारपछाडिको वाचा'),
      ]),
      mod('Accountability and the Multiplier Effect', 'जवाफदेहिता र गुणात्मक प्रभाव', [
        l('xu2d8vTKb0g', 121, 'The Multiplier Effect', 'गुणात्मक प्रभाव'),
        l('tLQVjN-6-vo', 186, 'Passing on the Gift of Heifers in Nepal', 'नेपालमा बाछीको उपहार हस्तान्तरण'),
      ]),
      mod('Celebrating the Gift', 'उपहारको उत्सव', [
        l('XFgDSOMTSCs', 358, '80 Years of Community Empowerment', 'सामुदायिक सशक्तीकरणका ८० वर्ष'),
      ]),
    ],
    summary: {
      en: 'Accountability means every family that receives a gift keeps its promise: care for the animal well, attend training, and pass on the first female offspring to the next family chosen by the group.',
      ne: 'जवाफदेहिता भनेको उपहार पाउने हरेक परिवारले आफ्नो वाचा पूरा गर्नु हो: पशुको राम्रो हेरचाह, तालिममा सहभागिता, र पहिलो माउ पाठी समूहले छानेको अर्को परिवारलाई हस्तान्तरण।',
    },
    checklist: [
      { en: 'Sign the POG agreement with the group before receiving the animal.', ne: 'पशु पाउनुअघि समूहसँग पीओजी सम्झौतामा हस्ताक्षर गर्नुहोस्।' },
      { en: 'Report the animal’s health and breeding status at every monthly meeting.', ne: 'हरेक मासिक बैठकमा पशुको स्वास्थ्य र प्रजनन अवस्था जानकारी गराउनुहोस्।' },
      { en: 'Keep the offspring until it is healthy and of agreed age before passing on.', ne: 'हस्तान्तरण गर्नुअघि पाठी स्वस्थ र सहमत उमेरको नहुन्जेल पाल्नुहोस्।' },
      { en: 'Share your training notes with the receiving family on ceremony day.', ne: 'समारोहको दिन प्राप्तकर्ता परिवारसँग आफ्नो तालिमका टिपोट बाँड्नुहोस्।' },
    ],
    facilitator: {
      en: 'Accountability is not punishment. When a family struggles, the group helps first — with fodder, labour or a VAHW visit — so the gift can still be passed on.',
      ne: 'जवाफदेहिता सजाय होइन। कुनै परिवारलाई गाह्रो पर्दा समूहले पहिले घाँस, श्रम वा भेटेरिनरी सहायकको भ्रमणमार्फत सहयोग गर्छ, ताकि उपहार हस्तान्तरण हुन सकोस्।',
    },
    discussion: [
      { en: 'What should the group do if a gift animal falls sick or dies?', ne: 'उपहार पशु बिरामी भए वा मरे समूहले के गर्नुपर्छ?' },
      { en: 'How do we choose the next family fairly?', ne: 'अर्को परिवार न्यायोचित रूपमा कसरी छान्ने?' },
      { en: 'What did receiving a gift change in your household?', ne: 'उपहार पाएपछि तपाईंको घरमा के परिवर्तन भयो?' },
    ],
    glossary: [
      { term: { en: 'Passing on the Gift', ne: 'उपहार हस्तान्तरण' }, meaning: { en: 'Giving the first female offspring and knowledge to another family.', ne: 'पहिलो माउ पाठी र ज्ञान अर्को परिवारलाई दिनु।' } },
      { term: { en: 'Recipient family', ne: 'प्राप्तकर्ता परिवार' }, meaning: { en: 'The family receiving a gift animal.', ne: 'उपहार पशु पाउने परिवार।' } },
      { term: { en: 'Accountability', ne: 'जवाफदेहिता' }, meaning: { en: 'Keeping promises made to the group and being open about progress.', ne: 'समूहसँग गरेको वाचा पूरा गर्नु र प्रगतिबारे खुला हुनु।' } },
      { term: { en: 'VAHW', ne: 'भेटेरिनरी सहायक' }, meaning: { en: 'Village Animal Health Worker who provides basic animal care.', ne: 'आधारभूत पशु उपचार गर्ने गाउँस्तरीय पशु स्वास्थ्य कार्यकर्ता।' } },
    ],
    materials: [
      {
        id: 'pog-ceremony-checklist',
        title: { en: 'Passing on the Gift Preparation & Ceremony Checklist', ne: 'उपहार हस्तान्तरण तयारी तथा समारोह चेकलिस्ट' },
        description: {
          en: 'Step-by-step health check, recipient readiness verification and community ceremony checklist for POG groups.',
          ne: 'उपहार पशुको स्वास्थ्य जाँच, प्राप्तकर्ता परिवारको तयारी र सामुदायिक हस्तान्तरण समारोह चेकलिस्ट।',
        },
        format: 'worksheet',
        url: '',
        meta: { en: 'Checklist · Community POG', ne: 'चेकलिस्ट · सामुदायिक पीओजी' },
        body: {
          en: 'Passing on the Gift succeeds when both the animal and the receiving household are fully prepared. Complete this checklist with your SHG committee and local VAHW at least two weeks before ceremony day.',
          ne: 'पशु र प्राप्तकर्ता परिवार दुवै पूर्ण तयार हुँदा मात्र उपहार हस्तान्तरण सफल हुन्छ। समारोहभन्दा कम्तीमा दुई हप्ताअघि समूह समिति र स्थानीय भेटेरिनरी सहायकसँग मिलेर यो चेकलिस्ट पूरा गर्नुहोस्।',
        },
        keyPoints: [
          { en: 'Receiving family has built an elevated, well-ventilated shed and planted fodder.', ne: 'प्राप्तकर्ता परिवारले हावा खेल्ने टाँडे खोर बनाएको र घाँस रोपेको छ।' },
          { en: 'VAHW has examined the offspring, confirmed deworming and completed PPR/FMD vaccination.', ne: 'भेटेरिनरी सहायकले पाठापाठी जाँचेर जुकाको औषधि र खोप पूरा भएको प्रमाणित गरेको छ।' },
          { en: 'Donor family shares feeding schedule, health record card and practical care tips.', ne: 'दाता परिवारले दाना तालिका, स्वास्थ्य कार्ड र हेरचाह अनुभव हस्तान्तरण गरेको छ।' },
          { en: 'POG commitment is recorded transparently in the group ledger and witnessed by members.', ne: 'समूहको रोहबरमा पीओजी सम्झौता पारदर्शी रूपमा रजिस्टरमा अभिलेख गरिएको छ।' },
        ],
        facilitatorTip: {
          en: 'Invite local ward representatives and neighbouring groups so the ceremony celebrates community solidarity.',
          ne: 'सामुदायिक एकताको उत्सव मनाउन समारोहमा वडा प्रतिनिधि र छिमेकी समूहलाई पनि आमन्त्रण गर्नुहोस्।',
        },
      },
    ],
  },
  {
    id: 'fbs',
    category: 'agribusiness',
    title: { en: 'Farmers Business School (FBS)', ne: 'कृषक व्यवसाय विद्यालय (एफबीएस)' },
    description: {
      en: 'Treat your farm as a business: study the market, calculate costs and profit, keep records and sell together as a group.',
      ne: 'खेतीलाई व्यवसायका रूपमा हेर्नुहोस्: बजार अध्ययन, लागत र नाफा हिसाब, अभिलेख राख्ने र समूहमा मिलेर बिक्री।',
    },
    image: img('1691514201446-3333b40b05cd'),
    imageAlt: 'People gathered around a market table full of fresh vegetables',
    subtitle: { en: 'Run your farm like a business', ne: 'खेतीलाई व्यवसायझैं सञ्चालन' },
    outcomes: [
      { en: 'Think like an entrepreneur and choose a profitable farm enterprise.', ne: 'उद्यमीझैं सोच्न र नाफामूलक कृषि उद्यम छनोट गर्न।' },
      { en: 'Use collective marketing to get fairer prices for goats and milk.', ne: 'बाख्रा र दूधको उचित मूल्य पाउन सामूहिक बजारीकरण प्रयोग गर्न।' },
      { en: 'Use mobile and digital tools for market information and records.', ne: 'बजार सूचना र अभिलेखका लागि मोबाइल र डिजिटल उपकरण प्रयोग गर्न।' },
      { en: 'Tell your enterprise’s story to reach new buyers.', ne: 'नयाँ खरिदकर्तासम्म पुग्न आफ्नो उद्यमको कथा भन्न।' },
    ],
    modules: [
      mod('Farming as a Business', 'व्यवसायका रूपमा खेती', [
        l('_eVdzIxOBSU', 55, 'Thinking Like an Entrepreneur', 'उद्यमीझैं सोच्ने'),
        l('7MdDL5SVEb0', 283, 'Digital Tools for Women Micro-Entrepreneurs', 'महिला लघु उद्यमीका लागि डिजिटल उपकरण'),
      ]),
      mod('Markets and Marketing', 'बजार र बजारीकरण', [
        l('PY8zekhK0tc', 303, 'Collective Goat Marketing', 'सामूहिक बाख्रा बजारीकरण'),
        l('bd-aSkgWqUc', 260, 'Promoting Dairy Markets', 'दुग्ध बजार प्रवर्द्धन'),
        l('DzYvCgS7BLY', 183, 'Market Information by SMS', 'एसएमएसमार्फत बजार सूचना'),
      ]),
      mod('Telling Your Business Story', 'आफ्नो व्यवसायको कथा', [
        l('GOgX0HdJ2mk', 157, 'Videography for Farmer-Owned Businesses', 'किसान व्यवसायका लागि भिडियो निर्माण'),
      ]),
    ],
    summary: {
      en: 'A business-minded farmer knows what buyers want before planting. Visit the local market, compare prices, and choose the product that gives the best return for your land and labour.',
      ne: 'व्यवसायिक सोच भएका किसानलाई रोप्नुअघि नै खरिदकर्ताले के चाहन्छन् भन्ने थाहा हुन्छ। स्थानीय बजार जानुहोस्, मूल्य तुलना गर्नुहोस्, र आफ्नो जग्गा र श्रमका लागि राम्रो प्रतिफल दिने उत्पादन छान्नुहोस्।',
    },
    checklist: [
      { en: 'Visit two nearby markets and note prices for five products.', ne: 'नजिकका दुई बजार गएर पाँच उत्पादनको मूल्य टिप्नुहोस्।' },
      { en: 'Ask three traders what they find hard to buy locally.', ne: 'तीन व्यापारीलाई स्थानीय रूपमा किन्न के गाह्रो छ भनी सोध्नुहोस्।' },
      { en: 'List all costs: seed, feed, labour, transport.', ne: 'सबै लागत सूची बनाउनुहोस्: बीउ, दाना, श्रम, ढुवानी।' },
      { en: 'Share your findings with the group and agree on one enterprise.', ne: 'समूहसँग नतिजा बाँडेर एउटा उद्यममा सहमति गर्नुहोस्।' },
    ],
    facilitator: {
      en: 'Use real prices from this week. Numbers members collected themselves are far more convincing than examples from a book.',
      ne: 'यसै हप्ताको वास्तविक मूल्य प्रयोग गर्नुहोस्। सदस्यहरू आफैंले सङ्कलन गरेका अङ्क पुस्तकका उदाहरणभन्दा धेरै विश्वसनीय हुन्छन्।',
    },
    discussion: [
      { en: 'Which product do buyers ask for that our village does not supply?', ne: 'खरिदकर्ताले माग्ने तर हाम्रो गाउँले नदिने उत्पादन कुन हो?' },
      { en: 'Can we lower transport costs by selling together?', ne: 'सँगै बेचेर ढुवानी खर्च घटाउन सकिन्छ?' },
      { en: 'Who in our group can keep the sales records?', ne: 'हाम्रो समूहमा बिक्री अभिलेख कसले राख्न सक्छ?' },
    ],
    glossary: [
      { term: { en: 'Enterprise', ne: 'उद्यम' }, meaning: { en: 'A farm activity run to earn income.', ne: 'आम्दानीका लागि गरिने कृषि कार्य।' } },
      { term: { en: 'Gross margin', ne: 'कुल नाफा' }, meaning: { en: 'Sales income minus direct costs.', ne: 'बिक्री आम्दानीबाट प्रत्यक्ष लागत घटाएपछिको रकम।' } },
      { term: { en: 'Collection centre', ne: 'सङ्कलन केन्द्र' }, meaning: { en: 'A shared place where members gather produce for sale.', ne: 'बिक्रीका लागि सदस्यहरूले उत्पादन जम्मा गर्ने साझा ठाउँ।' } },
      { term: { en: 'Value chain', ne: 'मूल्य शृङ्खला' }, meaning: { en: 'All the steps from farm to buyer.', ne: 'खेतदेखि खरिदकर्तासम्मका सबै चरण।' } },
    ],
  },
  {
    id: 'climate',
    category: 'climate',
    title: { en: 'Nature-Based Climate Adaptation', ne: 'प्रकृतिमा आधारित जलवायु अनुकूलन' },
    description: {
      en: 'Low-cost practices that protect soil, water and fodder from erratic rain, drought and landslides in hill and Terai farms.',
      ne: 'पहाड र तराईका खेतमा अनियमित वर्षा, खडेरी र पहिरोबाट माटो, पानी र घाँस जोगाउने कम लागतका अभ्यासहरू।',
    },
    image: img('1758701318699-391a633a240f'),
    imageAlt: 'Terraced fields on a hillside with mountains in the distance',
    subtitle: { en: 'Protect soil, water and livestock', ne: 'माटो, पानी र पशुको संरक्षण' },
    outcomes: [
      { en: 'Identify the climate risks facing your farm and village.', ne: 'आफ्नो खेत र गाउँले सामना गर्ने जलवायु जोखिम पहिचान गर्न।' },
      { en: 'Adopt climate-resilient practices for cattle and dairy.', ne: 'गाईवस्तु र डेरीका लागि जलवायु-उत्थानशील अभ्यास अपनाउन।' },
      { en: 'Turn farm waste into compost for healthier soil and bigger harvests.', ne: 'स्वस्थ माटो र राम्रो उब्जनीका लागि फार्मको फोहोरलाई कम्पोस्टमा बदल्न।' },
    ],
    modules: [
      mod('Understanding Climate Risk', 'जलवायु जोखिम बुझ्ने', [
        l('zje-KpjLmQo', 89, 'Climate Risks and Vulnerabilities', 'जलवायु जोखिम र संवेदनशीलता'),
        l('y9lCfGz5xlQ', 181, 'Climate-Smart Farming in Bardiya', 'बर्दियामा जलवायु-स्मार्ट खेती'),
      ]),
      mod('Climate-Resilient Livestock', 'जलवायु-उत्थानशील पशुपालन', [
        l('j0Gtxoy0ZiU', 410, 'Climate-Resilient Cattle Farming', 'जलवायु-उत्थानशील गाईपालन'),
        l('C37WjLw45nE', 410, 'Climate-Resilient Dairy Practices', 'जलवायु-उत्थानशील दुग्ध अभ्यास'),
      ]),
      mod('Nature-Based Solutions', 'प्रकृतिमा आधारित समाधान', [
        l('zCdz4ln7n-I', 57, 'Waste to Wonder: Compost for Bigger Harvests', 'फोहोरबाट मल: राम्रो उब्जनीका लागि कम्पोस्ट'),
      ]),
    ],
    summary: {
      en: 'Nature is your first line of defence. Trees on terrace edges hold soil, compost keeps moisture in the ground, and small ponds store monsoon water for the dry months.',
      ne: 'प्रकृति नै पहिलो सुरक्षा हो। गराको किनारका रूखले माटो समात्छन्, कम्पोस्टले जमिनमा चिस्यान राख्छ, र साना पोखरीले सुक्खा महिनाका लागि वर्षाको पानी जम्मा गर्छन्।',
    },
    checklist: [
      { en: 'Walk your land after heavy rain and mark where water runs off.', ne: 'ठूलो पानीपछि आफ्नो जग्गा घुमेर पानी बग्ने ठाउँ चिनो लगाउनुहोस्।' },
      { en: 'Plant fodder trees or grass strips along terrace edges.', ne: 'गराको किनारमा डालेघाँस वा घाँसका पट्टी रोप्नुहोस्।' },
      { en: 'Start one compost pit near the livestock shed.', ne: 'गोठ नजिकै एउटा कम्पोस्ट खाडल सुरु गर्नुहोस्।' },
      { en: 'Collect cattle urine to use as a liquid fertiliser.', ne: 'तरल मलका रूपमा प्रयोग गर्न गाईवस्तुको गहुँत सङ्कलन गर्नुहोस्।' },
    ],
    facilitator: {
      en: 'Begin with elders’ memories: how has rain changed since they were young? Their stories make the science local.',
      ne: 'बुढापाकाको सम्झनाबाट सुरु गर्नुहोस्: उनीहरू सानो छँदादेखि वर्षा कसरी बदलियो? उनीहरूका कथाले विज्ञानलाई स्थानीय बनाउँछ।',
    },
    discussion: [
      { en: 'Which months have become harder for farming in the last ten years?', ne: 'पछिल्ला दस वर्षमा खेतीका लागि कुन महिना कठिन भए?' },
      { en: 'Where could our community build a shared water pond?', ne: 'हाम्रो समुदायले साझा पोखरी कहाँ बनाउन सक्छ?' },
      { en: 'Which fodder trees grow well in our area?', ne: 'हाम्रो क्षेत्रमा कुन डालेघाँस राम्ररी हुर्कन्छ?' },
    ],
    glossary: [
      { term: { en: 'Adaptation', ne: 'अनुकूलन' }, meaning: { en: 'Changing practices to cope with a changing climate.', ne: 'बदलिँदो जलवायुसँग जुध्न अभ्यास परिवर्तन गर्नु।' } },
      { term: { en: 'Agroforestry', ne: 'कृषि वन' }, meaning: { en: 'Growing trees together with crops or livestock.', ne: 'बाली वा पशुसँगै रूख लगाउनु।' } },
      { term: { en: 'Run-off', ne: 'बहाव' }, meaning: { en: 'Rainwater flowing over land and carrying soil away.', ne: 'माटो बगाउँदै जमिनमाथि बग्ने वर्षाको पानी।' } },
      { term: { en: 'Compost', ne: 'कम्पोस्ट मल' }, meaning: { en: 'Decomposed organic matter that feeds the soil.', ne: 'माटोलाई पोषण दिने कुहिएको जैविक पदार्थ।' } },
    ],
  },
  {
    id: 'febl',
    category: 'livestock',
    title: { en: 'FEBL Training', ne: 'एफईबीएल तालिम' },
    description: {
      en: 'Practical livestock enterprise skills for households: shed hygiene, feed planning, vaccination and working with your local VAHW.',
      ne: 'घरपरिवारका लागि व्यावहारिक पशु उद्यम सीप: गोठ सरसफाइ, दाना योजना, खोप र स्थानीय भेटेरिनरी सहायकसँग समन्वय।',
    },
    image: img('1708513524652-0e1694d7ebdd'),
    imageAlt: 'A group of women sitting together during a training session',
    subtitle: { en: 'Livestock enterprise and animal health', ne: 'पशु उद्यम र पशु स्वास्थ्य' },
    outcomes: [
      { en: 'Apply better feeding and disease-control practices for cattle and goats.', ne: 'गाई र बाख्राका लागि उचित आहार र रोग नियन्त्रण अभ्यास लागू गर्न।' },
      { en: 'Keep people and animals safe with simple biosecurity measures.', ne: 'सरल जैविक सुरक्षा उपायद्वारा मानिस र पशुलाई सुरक्षित राख्न।' },
      { en: 'Understand the role of community agro-vet entrepreneurs.', ne: 'सामुदायिक कृषि-पशु उद्यमीको भूमिका बुझ्न।' },
      { en: 'Learn how improved dairy practices raise household income.', ne: 'सुधारिएको डेरी अभ्यासले घरायसी आम्दानी कसरी बढाउँछ भनी सिक्न।' },
    ],
    modules: [
      mod('Animal Health Basics', 'पशु स्वास्थ्यका आधारभूत कुरा', [
        l('UIKLxIuvXe4', 233, 'Better Cow Feeding and Disease Control', 'गाईको उचित आहार र रोग नियन्त्रण'),
        l('8UnqRQbw_4s', 82, 'Biosecurity on the Farm', 'फार्ममा जैविक सुरक्षा'),
      ]),
      mod('Community Agro-Vet Entrepreneurs', 'सामुदायिक कृषि-पशु उद्यमी', [
        l('zVPkw_Ip-AA', 401, 'Digital Training for Community Agro-Vets', 'सामुदायिक कृषि-पशु उद्यमीका लागि डिजिटल तालिम'),
      ]),
      mod('Modern Dairy', 'आधुनिक डेरी', [
        l('7ANv1bO9FyI', 272, 'The Milky Way: Transforming Nepal’s Dairy', 'मिल्की वे: नेपालको दुग्ध क्षेत्र रूपान्तरण'),
        l('PMLX2mvqsx8', 344, 'Jersey Valleys: Shared Lives, Shared Passion', 'जर्सी भ्याली: साझा जीवन, साझा लगाव'),
      ]),
    ],
    summary: {
      en: 'Healthy animals start with a clean, dry shed and a feeding plan for the whole year. Know the warning signs of illness and call your VAHW early.',
      ne: 'स्वस्थ पशुको सुरुवात सफा, सुक्खा गोठ र वर्षभरिको दाना योजनाबाट हुन्छ। रोगका चेतावनी सङ्केत चिन्नुहोस् र भेटेरिनरी सहायकलाई चाँडै बोलाउनुहोस्।',
    },
    checklist: [
      { en: 'Clean the shed floor daily and keep bedding dry.', ne: 'हरेक दिन गोठको भुइँ सफा गर्नुहोस् र ओछ्यान सुक्खा राख्नुहोस्।' },
      { en: 'Write a 12-month fodder calendar for your animals.', ne: 'आफ्ना पशुका लागि १२ महिने घाँस तालिका लेख्नुहोस्।' },
      { en: 'Save your VAHW’s phone number where the family can see it.', ne: 'भेटेरिनरी सहायकको फोन नम्बर परिवारले देख्ने ठाउँमा राख्नुहोस्।' },
      { en: 'Mark vaccination dates on the household calendar.', ne: 'घरको पात्रोमा खोपका मितिहरू चिनो लगाउनुहोस्।' },
    ],
    facilitator: {
      en: 'Invite the local VAHW to this session. Members trust advice more when they have met the person who gives it.',
      ne: 'यस सत्रमा स्थानीय भेटेरिनरी सहायकलाई बोलाउनुहोस्। सल्लाह दिने व्यक्तिलाई भेटेपछि सदस्यहरूले बढी विश्वास गर्छन्।',
    },
    discussion: [
      { en: 'Which month is fodder hardest to find, and how can we prepare?', ne: 'कुन महिनामा घाँस पाउन गाह्रो हुन्छ, र कसरी तयारी गर्ने?' },
      { en: 'Who in the family decides when to sell an animal?', ne: 'पशु कहिले बेच्ने भन्ने निर्णय परिवारमा कसले गर्छ?' },
      { en: 'What signs tell us an animal needs a VAHW?', ne: 'पशुलाई भेटेरिनरी सहायक चाहिएको कुन सङ्केतले थाहा हुन्छ?' },
    ],
    glossary: [
      { term: { en: 'Deworming', ne: 'जुकाको औषधि' }, meaning: { en: 'Medicine that removes internal parasites.', ne: 'भित्री परजीवी हटाउने औषधि।' } },
      { term: { en: 'Silage', ne: 'साइलेज' }, meaning: { en: 'Green fodder stored airtight for the dry season.', ne: 'सुक्खा याममा प्रयोग गर्न हावा नछिर्ने गरी राखिएको हरियो घाँस।' } },
      { term: { en: 'Vaccination', ne: 'खोप' }, meaning: { en: 'Protection against disease given before illness.', ne: 'रोग लाग्नुअघि दिइने सुरक्षा।' } },
      { term: { en: 'Bedding', ne: 'सोत्तर' }, meaning: { en: 'Dry straw or leaves on the shed floor.', ne: 'गोठको भुइँमा राखिने सुक्खा पराल वा पात।' } },
    ],
  },
  {
    id: 'pearls',
    category: 'cooperatives',
    title: { en: 'Cooperative PEARLS Tools', ne: 'सहकारी पर्ल्स (PEARLS) उपकरण' },
    description: {
      en: 'Read your cooperative’s financial health with the six PEARLS indicators — explained simply for board and committee members.',
      ne: 'छवटा पर्ल्स सूचकमार्फत आफ्नो सहकारीको वित्तीय स्वास्थ्य बुझ्नुहोस् — सञ्चालक र समिति सदस्यका लागि सरल व्याख्या।',
    },
    image: img('1572109801525-0bb0272e8579'),
    imageAlt: 'Community members gathered on an open grassy field',
    subtitle: { en: 'Financial health for member-owned cooperatives', ne: 'सदस्य-स्वामित्वका सहकारीको वित्तीय स्वास्थ्य' },
    outcomes: [
      { en: 'Understand how a cooperative works as a business hub for members.', ne: 'सहकारीले सदस्यका लागि व्यवसाय केन्द्रका रूपमा कसरी काम गर्छ भनी बुझ्न।' },
      { en: 'Read the six PEARLS indicators of financial health.', ne: 'वित्तीय स्वास्थ्यका छवटा पर्ल्स सूचक पढ्न।' },
      { en: 'Lead a quarterly financial review with the board.', ne: 'सञ्चालक समितिसँग त्रैमासिक वित्तीय समीक्षा नेतृत्व गर्न।' },
    ],
    modules: [
      mod('The Cooperative as a Business', 'व्यवसायका रूपमा सहकारी', [
        l('bdVsvG5mKUs', 149, 'Cooperative as a Business Hub', 'व्यवसाय केन्द्रका रूपमा सहकारी'),
        l('A3kIIYtDtoU', 135, 'The Farmer Cooperative Model', 'किसान सहकारी मोडल'),
      ]),
      mod('Financial Management and PEARLS', 'वित्तीय व्यवस्थापन र पर्ल्स', [
        l('iMSAMGZWeEQ', 291, 'Financial Management in Cooperatives', 'सहकारीमा वित्तीय व्यवस्थापन'),
        l('Yhbw_qAzV90', 188, 'Financial Controls and Reporting', 'वित्तीय नियन्त्रण र प्रतिवेदन'),
      ]),
      mod('Strengthening Food Systems', 'खाद्य प्रणाली सुदृढीकरण', [
        l('RNRqxyldG_U', 880, 'Seeding Strength: Supporting Farmer Cooperatives', 'सहकारीको बल: किसान सहकारीलाई सहयोग'),
      ]),
    ],
    summary: {
      en: 'PEARLS is a set of simple ratios that show whether savings are safe, loans are being repaid and the cooperative can grow. Review them every quarter at the board meeting.',
      ne: 'पर्ल्स भनेको बचत सुरक्षित छ कि छैन, ऋण असुली भइरहेको छ कि छैन र सहकारी बढ्न सक्छ कि सक्दैन भन्ने देखाउने सरल अनुपातहरू हुन्। हरेक त्रैमासिक सञ्चालक बैठकमा समीक्षा गर्नुहोस्।',
    },
    checklist: [
      { en: 'Bring the latest balance sheet to the board meeting.', ne: 'सञ्चालक बैठकमा पछिल्लो वासलात ल्याउनुहोस्।' },
      { en: 'Calculate the share of loans overdue more than 30 days.', ne: '३० दिनभन्दा बढी भाखा नाघेका ऋणको हिस्सा हिसाब गर्नुहोस्।' },
      { en: 'Check that cash on hand covers expected withdrawals.', ne: 'हातमा भएको नगदले अपेक्षित झिकाइ धान्छ कि जाँच गर्नुहोस्।' },
      { en: 'Share a one-page summary with all members.', ne: 'सबै सदस्यसँग एक पृष्ठको सारांश बाँड्नुहोस्।' },
    ],
    facilitator: {
      en: 'Translate each ratio into a household example — a family that lends more than it saves faces the same risk as a cooperative.',
      ne: 'हरेक अनुपातलाई घरायसी उदाहरणमा बदल्नुहोस् — बचतभन्दा बढी ऋण दिने परिवारले पनि सहकारीजस्तै जोखिम भोग्छ।',
    },
    discussion: [
      { en: 'Which PEARLS indicator worries our cooperative most?', ne: 'हाम्रो सहकारीलाई कुन पर्ल्स सूचकले बढी चिन्तित बनाउँछ?' },
      { en: 'How can we follow up kindly on late loan repayments?', ne: 'ढिलो ऋण भुक्तानीमा सद्भावपूर्वक कसरी पछ्याउने?' },
      { en: 'How often should members see the financial report?', ne: 'सदस्यहरूले वित्तीय प्रतिवेदन कति पटक हेर्नुपर्छ?' },
    ],
    glossary: [
      { term: { en: 'Liquidity', ne: 'तरलता' }, meaning: { en: 'Cash available to pay members on demand.', ne: 'माग भएमा सदस्यलाई तिर्न उपलब्ध नगद।' } },
      { term: { en: 'Delinquency', ne: 'भाखा नाघेको ऋण' }, meaning: { en: 'Loans not repaid on time.', ne: 'समयमा नतिरिएको ऋण।' } },
      { term: { en: 'Provision', ne: 'जोखिम व्यवस्था' }, meaning: { en: 'Money set aside for loans that may not be repaid.', ne: 'नउठ्न सक्ने ऋणका लागि छुट्याइएको रकम।' } },
      { term: { en: 'Institutional capital', ne: 'संस्थागत पुँजी' }, meaning: { en: 'Reserves owned by the cooperative, not by individual members.', ne: 'व्यक्तिगत सदस्यको नभई सहकारीको स्वामित्वमा रहेको जगेडा।' } },
    ],
  },
]

/** All lessons of a course in order, with their module index. */
export const lessonsOf = (c: Course) => c.modules.flatMap((m, mi) => m.lessons.map((ls) => ({ ...ls, module: mi })))
export const totalSeconds = (c: Course) => lessonsOf(c).reduce((s, x) => s + x.seconds, 0)
export const thumb = (videoId: string, q: 'hq' | 'maxres' = 'hq') => {
  const safeId = extractYouTubeId(videoId) || videoId.replace(/[^A-Za-z0-9_-]/g, '')
  return `https://i.ytimg.com/vi/${safeId}/${q}default.jpg`
}

const neDigits = '०१२३४५६७८९'
export const num = (n: number | string, lang: Lang) =>
  lang === 'ne' ? String(n).replace(/\d/g, (d) => neDigits[Number(d)]) : String(n)

export const clock = (s: number, lang: Lang) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return num(h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`, lang)
}

export const duration = (s: number, lang: Lang) => {
  const m = Math.round(s / 60)
  if (m < 60) return `${num(m, lang)} ${lang === 'en' ? 'min' : 'मिनेट'}`
  const h = Math.floor(m / 60)
  const r = m % 60
  return lang === 'en' ? `${h} hr ${r ? `${r} min` : ''}`.trim() : `${num(h, lang)} घण्टा ${r ? `${num(r, lang)} मिनेट` : ''}`.trim()
}

export const categoryLabel = (id: Course['category']) =>
  categories.find((c) => c.id === id)?.label ?? { en: id, ne: id }

export const ui = {
  explore: { en: 'Explore', ne: 'अन्वेषण' },
  about: { en: 'About', ne: 'हाम्रोबारे' },
  faq: { en: 'FAQ', ne: 'प्रश्नोत्तर' },
  startLearning: { en: 'Start Learning', ne: 'सिक्न सुरु गर्नुहोस्' },
  allCourses: { en: 'All courses', ne: 'सबै पाठ्यक्रम' },
  browseTopics: { en: 'Browse by topic', ne: 'विषयअनुसार हेर्नुहोस्' },
  menu: { en: 'Menu', ne: 'मेनु' },
  close: { en: 'Close', ne: 'बन्द गर्नुहोस्' },
  language: { en: 'Language', ne: 'भाषा' },
  skipToContent: { en: 'Skip to content', ne: 'मुख्य सामग्रीमा जानुहोस्' },

  heroTitle: { en: 'Community Knowledge for Sustainable Livelihoods', ne: 'समुदाय सशक्तीकरणका लागि व्यावहारिक ज्ञान' },
  heroSub: {
    en: 'Free, self-paced video courses on social capital, livestock, agribusiness, climate resilience and cooperatives — made with Heifer International Nepal for farming families across all seven provinces.',
    ne: 'सामाजिक पुँजी, पशुपालन, कृषि व्यवसाय, जलवायु उत्थानशीलता र सहकारीसम्बन्धी निःशुल्क, आफ्नै गतिका भिडियो पाठ्यक्रम — सातै प्रदेशका किसान परिवारका लागि हेफर इन्टरनेसनल नेपालसँग मिलेर तयार पारिएको।',
  },
  featured: { en: 'Featured course', ne: 'विशेष पाठ्यक्रम' },
  multiLang: { en: 'Available in English & नेपाली', ne: 'नेपाली र English मा उपलब्ध' },
  startCourse: { en: 'Start Course', ne: 'पाठ्यक्रम सुरु गर्नुहोस्' },
  continueCourse: { en: 'Continue Course', ne: 'पाठ्यक्रम जारी राख्नुहोस्' },
  reviewCourse: { en: 'Review Course', ne: 'पाठ्यक्रम पुनः हेर्नुहोस्' },
  exploreCourses: { en: 'Explore Courses', ne: 'पाठ्यक्रमहरू हेर्नुहोस्' },
  previous: { en: 'Previous', ne: 'अघिल्लो' },
  next: { en: 'Next', ne: 'अर्को' },

  v1t: { en: 'Learn practical skills.', ne: 'व्यावहारिक सीप सिक्नुहोस्।' },
  v1d: {
    en: 'Short video lessons from Heifer’s field teams cover livestock, markets, climate and cooperatives — ready to apply on your farm.',
    ne: 'हेफरका फिल्ड टोलीका छोटा भिडियो पाठहरूले पशुपालन, बजार, जलवायु र सहकारी समेट्छन् — खेतमै लागू गर्न तयार।',
  },
  v2t: { en: 'Grow your enterprise.', ne: 'आफ्नो उद्यम बढाउनुहोस्।' },
  v2d: {
    en: 'Turn knowledge into income with business, marketing and financial tools built for smallholder families.',
    ne: 'साना किसान परिवारका लागि बनाइएका व्यवसाय, बजारीकरण र वित्तीय उपकरणमार्फत ज्ञानलाई आम्दानीमा बदल्नुहोस्।',
  },
  v3t: { en: 'Strengthen your community.', ne: 'समुदायलाई सबल बनाउनुहोस्।' },
  v3d: {
    en: 'Every lesson includes checklists and discussion prompts so self-help groups and cooperatives can learn together.',
    ne: 'हरेक पाठमा चेकलिस्ट र छलफलका प्रश्न छन्, जसले स्वावलम्बन समूह र सहकारीलाई सँगै सिक्न मद्दत गर्छ।',
  },

  introEyebrow: { en: 'Heifer International Nepal', ne: 'हेफर इन्टरनेसनल नेपाल' },
  introTitle: { en: 'Partnering with farming families since 1997', ne: 'सन् १९९७ देखि किसान परिवारसँगको साझेदारी' },
  introBody: {
    en: 'Heifer Academy brings the training that has helped hundreds of thousands of Nepali families build resilient food systems and inclusive livelihoods to anyone, anywhere.',
    ne: 'लाखौं नेपाली परिवारलाई उत्थानशील खाद्य प्रणाली र समावेशी जीविकोपार्जन निर्माण गर्न सघाएको तालिम हेफर एकेडेमीले जोसुकै, जहाँसुकै पुर्‍याउँछ।',
  },
  statHouseholds: { en: 'Household participants to date', ne: 'हालसम्म सहभागी घरपरिवार' },
  statCoops: { en: 'Women-led cooperatives', ne: 'महिला नेतृत्वका सहकारी' },
  statYears: { en: 'Years in Nepal', ne: 'नेपालमा वर्ष' },
  statSource: { en: 'Source: Heifer International, 2025–2026.', ne: 'स्रोत: हेफर इन्टरनेसनल, २०२५–२०२६।' },

  exploreTitle: { en: 'Explore Our Courses', ne: 'हाम्रा पाठ्यक्रमहरू' },
  exploreSub: { en: 'Courses offered by Heifer Academy', ne: 'हेफर एकेडेमीद्वारा प्रस्तुत पाठ्यक्रम' },
  viewCourse: { en: 'View Course', ne: 'पाठ्यक्रम हेर्नुहोस्' },
  viewAll: { en: 'View all courses', ne: 'सबै पाठ्यक्रम हेर्नुहोस्' },
  lessons: { en: 'lessons', ne: 'पाठ' },
  modules: { en: 'modules', ne: 'मोड्युल' },
  videos: { en: 'videos', ne: 'भिडियो' },

  voicesEyebrow: { en: 'Voices from the field', ne: 'फिल्डका आवाज' },
  voicesTitle: { en: 'What farmers and leaders say', ne: 'किसान र अगुवाहरू के भन्छन्' },

  faqEyebrow: { en: 'Know your answer', ne: 'जवाफ जान्नुहोस्' },
  faqTitle: { en: 'Frequently Asked Questions', ne: 'बारम्बार सोधिने प्रश्नहरू' },
  faqPrompt: {
    en: 'Can’t find what you’re looking for? Write to the Heifer Nepal team.',
    ne: 'खोजेको जवाफ भेटिएन? हेफर नेपाल टोलीलाई लेख्नुहोस्।',
  },

  partnersTitle: { en: 'Working alongside', ne: 'सहकार्यमा' },
  ctaTitle: { en: 'Bring practical learning to your next group meeting', ne: 'अर्को समूह बैठकमा व्यावहारिक सिकाइ ल्याउनुहोस्' },
  ctaSub: {
    en: 'Every course is free, bilingual and designed for self-help groups, cooperatives and facilitators.',
    ne: 'हरेक पाठ्यक्रम निःशुल्क, द्विभाषी र स्वावलम्बन समूह, सहकारी तथा सहजकर्ताका लागि तयार पारिएको छ।',
  },
  initiativeOf: { en: 'An initiative of', ne: 'एक पहल' },

  footerTagline: { en: 'Come learn with us', ne: 'हामीसँग सिक्न आउनुहोस्' },
  footerSub: { en: 'Practical, bilingual training for Nepal’s farming communities.', ne: 'नेपालका किसान समुदायका लागि व्यावहारिक, द्विभाषी तालिम।' },
  learn: { en: 'Learn', ne: 'सिकाइ' },
  organisation: { en: 'Organisation', ne: 'संस्था' },
  support: { en: 'Support', ne: 'सहयोग' },
  heiferNepal: { en: 'Heifer Nepal website', ne: 'हेफर नेपाल वेबसाइट' },
  cornerstonesLink: { en: '12 Cornerstones', ne: '१२ आधारभूत मूल्य' },
  contact: { en: 'Contact', ne: 'सम्पर्क' },
  address: { en: 'Hattiban, Lalitpur, Nepal', ne: 'हात्तीवन, ललितपुर, नेपाल' },
  privacy: { en: 'Privacy Policy', ne: 'गोपनीयता नीति' },
  terms: { en: 'Terms of Use', ne: 'प्रयोगका सर्तहरू' },
  accessibilityStatement: { en: 'Accessibility', ne: 'पहुँचयोग्यता' },
  feedback: { en: 'Feedback', ne: 'प्रतिक्रिया' },
  copyright: { en: 'Heifer International Nepal. All rights reserved.', ne: 'हेफर इन्टरनेसनल नेपाल। सर्वाधिकार सुरक्षित।' },
  footerMadeFor: { en: 'Made for Nepal’s farming communities', ne: 'नेपालका किसान समुदायका लागि निर्मित' },

  exploreHeading: { en: 'Explore courses', ne: 'पाठ्यक्रमहरू अन्वेषण गर्नुहोस्' },
  exploreIntro: {
    en: 'Self-paced video courses on social capital, livestock, agribusiness, climate resilience and cooperatives.',
    ne: 'सामाजिक पुँजी, पशुपालन, कृषि व्यवसाय, जलवायु उत्थानशीलता र सहकारीसम्बन्धी आफ्नै गतिका भिडियो पाठ्यक्रम।',
  },
  search: { en: 'Search courses and lessons', ne: 'पाठ्यक्रम र पाठ खोज्नुहोस्' },
  results: { en: 'courses', ne: 'पाठ्यक्रम' },
  noResults: { en: 'No courses match your search.', ne: 'तपाईंको खोजसँग मिल्ने पाठ्यक्रम भेटिएन।' },
  clear: { en: 'Clear filters', ne: 'फिल्टर हटाउनुहोस्' },
  home: { en: 'Home', ne: 'गृहपृष्ठ' },

  selfPaced: { en: 'Self-paced', ne: 'आफ्नै गतिमा' },
  languageLabel: { en: 'Language', ne: 'भाषा' },
  languageValue: { en: 'English / नेपाली', ne: 'नेपाली / English' },
  format: { en: 'Format', ne: 'ढाँचा' },
  formatValue: { en: 'Video lessons with field notes', ne: 'फिल्ड टिपोटसहित भिडियो पाठ' },
  requirements: { en: 'Requirements', ne: 'आवश्यकता' },
  requirementsValue: { en: 'No prior requirements', ne: 'पूर्व आवश्यकता छैन' },
  whatLearn: { en: 'What You Will Learn', ne: 'तपाईंले के सिक्नुहुनेछ' },
  courseOutline: { en: 'Course Outline', ne: 'पाठ्यक्रम रूपरेखा' },
  includes: { en: 'This course includes', ne: 'यस पाठ्यक्रममा समावेश' },
  incVideos: { en: 'video lessons', ne: 'भिडियो पाठ' },
  incChecklists: { en: 'Field action checklists', ne: 'फिल्ड कार्य चेकलिस्ट' },
  incGlossary: { en: 'Bilingual glossary', ne: 'द्विभाषी शब्दकोश' },
  incFacilitator: { en: 'Facilitator guidance', ne: 'सहजकर्ता मार्गदर्शन' },
  developedWith: { en: 'Developed by', ne: 'विकासकर्ता' },
  developedByDesc: {
    en: 'Video lessons are produced by Heifer International and its partners. Field notes and checklists are prepared by Heifer Nepal’s community development team.',
    ne: 'भिडियो पाठहरू हेफर इन्टरनेसनल र साझेदारहरूद्वारा निर्मित हुन्। फिल्ड टिपोट र चेकलिस्ट हेफर नेपालको सामुदायिक विकास टोलीले तयार पारेको हो।',
  },
  related: { en: 'You may also like', ne: 'तपाईंलाई यी पनि मन पर्न सक्छन्' },
  watchPreview: { en: 'Watch preview', ne: 'झलक हेर्नुहोस्' },
  expandAll: { en: 'Expand all', ne: 'सबै खोल्नुहोस्' },
  collapseAll: { en: 'Collapse all', ne: 'सबै बन्द गर्नुहोस्' },
  module: { en: 'Module', ne: 'मोड्युल' },
  completedLabel: { en: 'Completed', ne: 'पूरा भयो' },
  complete: { en: 'complete', ne: 'पूरा' },

  courseContent: { en: 'Course content', ne: 'पाठ्यक्रम सामग्री' },
  tabOverview: { en: 'Overview', ne: 'सारांश' },
  tabDiscussion: { en: 'Discussion', ne: 'छलफल' },
  tabGlossary: { en: 'Glossary', ne: 'शब्दकोश' },
  meaning: { en: 'Meaning', ne: 'अर्थ' },
  markDone: { en: 'Mark as completed', ne: 'पूरा भएको चिन्ह लगाउनुहोस्' },
  done: { en: 'Completed', ne: 'पूरा भयो' },
  prevLesson: { en: 'Previous lesson', ne: 'अघिल्लो पाठ' },
  nextLesson: { en: 'Next lesson', ne: 'अर्को पाठ' },
  upNext: { en: 'Up next', ne: 'अर्को पाठ' },
  playingIn: { en: 'Playing in', ne: 'सुरु हुँदै' },
  playNow: { en: 'Play now', ne: 'अहिले चलाउनुहोस्' },
  cancel: { en: 'Cancel', ne: 'रद्द गर्नुहोस्' },
  replay: { en: 'Replay', ne: 'फेरि हेर्नुहोस्' },
  play: { en: 'Play video', ne: 'भिडियो चलाउनुहोस्' },
  fullscreen: { en: 'Full screen', ne: 'पूर्ण स्क्रिन' },
  exitFullscreen: { en: 'Exit full screen', ne: 'पूर्ण स्क्रिनबाट बाहिर' },
  theater: { en: 'Theater mode', ne: 'ठूलो दृश्य' },
  defaultView: { en: 'Default view', ne: 'सामान्य दृश्य' },
  summary: { en: 'Summary & action points', ne: 'सारांश र कार्य बुँदा' },
  actions: { en: 'Field action checklist', ne: 'फिल्ड कार्य चेकलिस्ट' },
  forFacilitators: { en: 'For facilitators', ne: 'सहजकर्ताका लागि' },
  discussIntro: {
    en: 'Use these prompts at your next group meeting. Give each question 10 minutes and let every member speak once.',
    ne: 'अर्को समूह बैठकमा यी प्रश्न प्रयोग गर्नुहोस्। हरेक प्रश्नलाई १० मिनेट दिनुहोस् र हरेक सदस्यलाई एक पटक बोल्न दिनुहोस्।',
  },
  notesLabel: { en: 'Your notes', ne: 'तपाईंका टिपोट' },
  notesHint: { en: 'Saved automatically on this device', ne: 'यही उपकरणमा स्वतः सुरक्षित हुन्छ' },
  notesPlaceholder: { en: 'What did your group agree on?', ne: 'तपाईंको समूहले केमा सहमति गर्‍यो?' },
  backToCourse: { en: 'Course overview', ne: 'पाठ्यक्रम विवरण' },
  lessonOf: { en: 'Lesson', ne: 'पाठ' },
  of: { en: 'of', ne: 'मध्ये' },
  courseDone: { en: 'You have completed this course.', ne: 'तपाईंले यो पाठ्यक्रम पूरा गर्नुभयो।' },
  courseDoneSub: { en: 'Share what you learned with your group, or continue with another course.', ne: 'आफूले सिकेको कुरा समूहसँग बाँड्नुहोस्, वा अर्को पाठ्यक्रम सुरु गर्नुहोस्।' },
  browseMore: { en: 'Browse more courses', ne: 'थप पाठ्यक्रम हेर्नुहोस्' },
  source: { en: 'Video: Heifer International on YouTube', ne: 'भिडियो: युट्युबमा हेफर इन्टरनेसनल' },

  a11y: { en: 'Accessibility', ne: 'पहुँचयोग्यता' },
  highContrast: { en: 'High Contrast', ne: 'उच्च कन्ट्रास्ट' },
  darkMode: { en: 'Dark Mode', ne: 'डार्क मोड' },
  increaseFont: { en: 'Increase Font', ne: 'अक्षर ठूलो' },
  originalFont: { en: 'Original Font', ne: 'सामान्य अक्षर' },
  decreaseFont: { en: 'Decrease Font', ne: 'अक्षर सानो' },
  readingLine: { en: 'Reading Line', ne: 'पढ्ने रेखा' },
  tts: { en: 'Text To Speech', ne: 'पढेर सुनाउने' },
  ttsStop: { en: 'Stop Reading', ne: 'पढ्न रोक्नुहोस्' },
  reset: { en: 'Reset', ne: 'रिसेट' },

  pulseTitle: { en: 'Help us improve community learning', ne: 'सामुदायिक सिकाइ सुधार्न सहयोग गर्नुहोस्' },
  optional: { en: 'Optional', ne: 'ऐच्छिक' },
  pulseSub: {
    en: 'Three quick questions. No name or phone number — answers are anonymous.',
    ne: 'तीनवटा छोटा प्रश्न। नाम वा फोन नम्बर चाहिँदैन — उत्तर गोप्य रहन्छ।',
  },
  district: { en: 'District', ne: 'जिल्ला' },
  selectDistrict: { en: 'Select your district', ne: 'आफ्नो जिल्ला छान्नुहोस्' },
  role: { en: 'Your role', ne: 'तपाईंको भूमिका' },
  selectRole: { en: 'Select your role', ne: 'आफ्नो भूमिका छान्नुहोस्' },
  gender: { en: 'Gender', ne: 'लिङ्ग' },
  submit: { en: 'Submit anonymously', ne: 'गोप्य रूपमा पठाउनुहोस्' },
  skip: { en: 'Skip & Continue', ne: 'छोडेर जारी राख्नुहोस्' },
  thanks: { en: 'Thank you! Your answers help us plan training for your area.', ne: 'धन्यवाद! तपाईंको उत्तरले तपाईंको क्षेत्रका लागि तालिम योजना बनाउन मद्दत गर्छ।' },
  continue: { en: 'Continue', ne: 'जारी राख्नुहोस्' },

  resources: { en: 'Materials', ne: 'सामग्रीहरू' },
  courseMaterials: { en: 'Field Guides & Handouts', ne: 'फिल्ड पुस्तिका र सामग्री' },
  tabMaterials: { en: 'Materials', ne: 'सामग्री' },
  openResource: { en: 'Open material', ne: 'सामग्री खोल्नुहोस्' },
  readMaterial: { en: 'Read & print guide', ne: 'पुस्तिका पढ्नुहोस् र प्रिन्ट गर्नुहोस्' },
  downloadExternal: { en: 'Open external file', ne: 'बाह्य फाइल खोल्नुहोस्' },
  printMaterial: { en: 'Print / Save PDF', ne: 'प्रिन्ट / पीडीएफ सुरक्षित' },
  backToMaterials: { en: 'All materials', ne: 'सबै सामग्रीहरू' },
  keyStepsHeading: { en: 'Key steps & field checklist', ne: 'मुख्य चरण र फिल्ड चेकलिस्ट' },
  relatedMaterials: { en: 'More field guides & handouts', ne: 'थप फिल्ड पुस्तिका र सामग्री' },
  linkedCourseLabel: { en: 'Part of course', ne: 'सम्बन्धित पाठ्यक्रम' },
  lessonNotes: { en: 'Lesson note', ne: 'पाठ टिपोट' },
  materialsEyebrow: { en: 'Field guides, toolkits & posters', ne: 'फिल्ड पुस्तिका, टुलकिट र पोस्टर' },
  materialsTitle: { en: 'Practical Learning Materials', ne: 'व्यावहारिक सिकाइ सामग्रीहरू' },
  viewAllMaterials: { en: 'Browse all materials', ne: 'सबै सामग्री हेर्नुहोस्' },
  instructorLabel: { en: 'Prepared by', ne: 'तयारकर्ता' },
  levelLabel: { en: 'Level', ne: 'स्तर' },
  searchResources: { en: 'Search guides, posters and toolkits', ne: 'पुस्तिका, पोस्टर र टुलकिट खोज्नुहोस्' },
  allFormats: { en: 'All formats', ne: 'सबै ढाँचा' },
  courseMaterialsSub: {
    en: 'Reference guides, worksheets and group handouts accompanying this course.',
    ne: 'यस पाठ्यक्रमसँग सम्बन्धित सन्दर्भ पुस्तिका, कार्यपत्र र समूह सामग्रीहरू।',
  },
  noMaterials: {
    en: 'No learning materials match your filter.',
    ne: 'तपाईंको खोजसँग मिल्ने सिकाइ सामग्री भेटिएन।',
  },
  noLessonsYet: {
    en: 'No video lessons have been published in this course yet.',
    ne: 'यस पाठ्यक्रममा अझै कुनै भिडियो पाठ राखिएको छैन।',
  },
  pageNotFound: { en: 'Page not found', ne: 'पृष्ठ भेटिएन' },
  pageNotFoundSub: {
    en: 'This page has not been published yet or may have been moved.',
    ne: 'यो पृष्ठ अझै प्रकाशित भएको छैन वा सारिएको हुन सक्छ।',
  },
  materialNotFound: { en: 'Material not found', ne: 'सिकाइ सामग्री भेटिएन' },
  materialNotFoundSub: {
    en: 'This guide or handout may have been moved or unpublished. Browse our full library below.',
    ne: 'यो पुस्तिका वा सामग्री सारिएको वा अप्रकाशित भएको हुन सक्छ। तल सबै सामग्री हेर्नुहोस्।',
  },
  courseNotFound: { en: 'Course not found', ne: 'पाठ्यक्रम भेटिएन' },
  courseNotFoundSub: {
    en: 'The course you are looking for may have been moved or renamed. Explore all available courses below.',
    ne: 'तपाईंले खोज्नुभएको पाठ्यक्रम सारिएको वा नाम बदलिएको हुन सक्छ। तल उपलब्ध पाठ्यक्रमहरू हेर्नुहोस्।',
  },
} satisfies Record<string, Bi>

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

export const faqs: { q: Bi; a: Bi }[] = [
  {
    q: { en: 'What is Heifer Academy?', ne: 'हेफर एकेडेमी के हो?' },
    a: {
      en: 'Heifer Academy is the free e-learning platform of Heifer International Nepal. It shares practical, bilingual video courses on social capital, livestock, agribusiness, climate resilience and cooperatives with farmers, self-help groups, facilitators and students across all seven provinces.',
      ne: 'हेफर एकेडेमी हेफर इन्टरनेसनल नेपालको निःशुल्क अनलाइन सिकाइ प्लेटफर्म हो। यसले सातै प्रदेशका किसान, स्वावलम्बन समूह, सहजकर्ता र विद्यार्थीहरूलाई सामाजिक पुँजी, पशुपालन, कृषि व्यवसाय, जलवायु उत्थानशीलता र सहकारीसम्बन्धी व्यावहारिक, द्विभाषी भिडियो पाठ्यक्रम उपलब्ध गराउँछ।',
    },
  },
  {
    q: { en: 'How do I start a course?', ne: 'पाठ्यक्रम कसरी सुरु गर्ने?' },
    a: {
      en: 'Open any course and select “Start Course”. Lessons play right here on the page, and your progress is saved on your device so you can continue where you left off.',
      ne: 'कुनै पनि पाठ्यक्रम खोलेर “पाठ्यक्रम सुरु गर्नुहोस्” थिच्नुहोस्। पाठहरू यही पृष्ठमा चल्छन्, र तपाईंको प्रगति तपाईंकै उपकरणमा सुरक्षित हुन्छ, ताकि जहाँ छोड्नुभयो त्यहीँबाट जारी राख्न सक्नुहुन्छ।',
    },
  },
  {
    q: { en: 'Can I learn in Nepali?', ne: 'के म नेपालीमा सिक्न सक्छु?' },
    a: {
      en: 'Yes. Switch between English and नेपाली at any time using the language toggle at the top of the page. Lesson notes, checklists and glossaries are available in both languages.',
      ne: 'सक्नुहुन्छ। पृष्ठको माथि रहेको भाषा बटनबाट जुनसुकै बेला English र नेपाली बीच बदल्नुहोस्। पाठका टिपोट, चेकलिस्ट र शब्दकोश दुवै भाषामा उपलब्ध छन्।',
    },
  },
  {
    q: { en: 'Can facilitators use these lessons in group meetings?', ne: 'के सहजकर्ताले यी पाठ समूह बैठकमा प्रयोग गर्न सक्छन्?' },
    a: {
      en: 'Absolutely. Each lesson includes discussion prompts, a field checklist and facilitator guidance. Play the video in full screen on a phone, tablet or projector and follow the notes with your group.',
      ne: 'अवश्य। हरेक पाठमा छलफलका प्रश्न, फिल्ड चेकलिस्ट र सहजकर्ता मार्गदर्शन छन्। फोन, ट्याब्लेट वा प्रोजेक्टरमा भिडियो पूर्ण स्क्रिनमा चलाएर समूहसँग टिपोट पछ्याउनुहोस्।',
    },
  },
  {
    q: { en: 'Do the courses cost anything?', ne: 'के पाठ्यक्रमका लागि शुल्क लाग्छ?' },
    a: {
      en: 'No. Every course on Heifer Academy is free for everyone.',
      ne: 'लाग्दैन। हेफर एकेडेमीका सबै पाठ्यक्रम सबैका लागि निःशुल्क छन्।',
    },
  },
]

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

export const roles: { id: string; label: Bi }[] = [
  { id: 'farmer', label: { en: 'Farmer', ne: 'किसान' } },
  { id: 'shg', label: { en: 'SHG Member', ne: 'स्वावलम्बन समूह सदस्य' } },
  { id: 'facilitator', label: { en: 'Facilitator', ne: 'सहजकर्ता' } },
  { id: 'student', label: { en: 'Student', ne: 'विद्यार्थी' } },
]

export const genders: { id: string; label: Bi }[] = [
  { id: 'woman', label: { en: 'Woman', ne: 'महिला' } },
  { id: 'man', label: { en: 'Man', ne: 'पुरुष' } },
  { id: 'other', label: { en: 'Other', ne: 'अन्य' } },
  { id: 'na', label: { en: 'Prefer not to say', ne: 'भन्न चाहन्नँ' } },
]

export const provinces: { name: Bi; districts: string[] }[] = [
  { name: { en: 'Koshi', ne: 'कोशी' }, districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'] },
  { name: { en: 'Madhesh', ne: 'मधेश' }, districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'] },
  { name: { en: 'Bagmati', ne: 'बागमती' }, districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'] },
  { name: { en: 'Gandaki', ne: 'गण्डकी' }, districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'] },
  { name: { en: 'Lumbini', ne: 'लुम्बिनी' }, districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu', 'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rupandehi'] },
  { name: { en: 'Karnali', ne: 'कर्णाली' }, districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Western Rukum'] },
  { name: { en: 'Sudurpashchim', ne: 'सुदूरपश्चिम' }, districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'] },
]

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
}

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

export const defaultResourcesData: ResourcesPageData = {
  eyebrow: { en: 'Field guides, toolkits & posters', ne: 'फिल्ड पुस्तिका, टुलकिट र पोस्टर' },
  heading: { en: 'Learning Materials & Field Guides', ne: 'सिकाइ सामग्री र फिल्ड पुस्तिकाहरू' },
  intro: {
    en: 'Ready-to-use bilingual handbooks, group worksheets, animal health posters and cooperative toolkits prepared for self-help groups, facilitators and farming households.',
    ne: 'स्वावलम्बन समूह, सहजकर्ता र किसान परिवारका लागि तयार पारिएका द्विभाषी पुस्तिका, समूह फारम, पशु स्वास्थ्य पोस्टर र सहकारी टुलकिटहरू।',
  },
  homeEyebrow: { en: 'Field guides & handouts', ne: 'फिल्ड पुस्तिका र सामग्री' },
  homeHeading: { en: 'Practical Materials for Group Meetings', ne: 'समूह बैठकका लागि व्यावहारिक सामग्री' },
  showOnHome: true,
  items: [
    {
      id: 'res-cornerstones-handbook',
      title: {
        en: '12 Cornerstones Facilitator Handbook',
        ne: '१२ आधारभूत मूल्य सहजकर्ता पुस्तिका',
      },
      description: {
        en: 'Complete facilitation guide with group stories, discussion questions and monthly self-help group reflection activities.',
        ne: 'समूह कथाहरू, छलफलका प्रश्न र मासिक स्वावलम्बन समूह समीक्षा अभ्याससहितको पूर्ण सहजीकरण पुस्तिका।',
      },
      format: 'guide',
      category: 'social',
      url: 'https://www.heifer.org/our-work/approach/cornerstones',
      image: img('1549819363-10acf530e110', 800, 480),
      meta: { en: 'Facilitator Guide · EN / नेपाली', ne: 'सहजकर्ता पुस्तिका · नेपाली / EN' },
      courseId: 'social-capital',
      featuredOnHome: true,
      body: {
        en: 'Heifer’s 12 Cornerstones for Just and Sustainable Development form the ethical foundation of every Self-Help Group and cooperative across Nepal. Use this facilitation guide to introduce one Cornerstone at each monthly meeting through village storytelling, pair reflection and practical household commitments.\n\nRather than lecturing, invite members to connect Passing on the Gift, Accountability, Sharing & Caring, Sustainability, Full Participation and Gender & Family Focus to real decisions their families face this season.',
        ne: 'न्यायपूर्ण र दिगो विकासका लागि हेफरका १२ आधारभूत मूल्यहरू नेपालभरका प्रत्येक स्वावलम्बन समूह र सहकारीको नैतिक जग हुन्। गाउँका कथाहरू, जोडीमा छलफल र व्यावहारिक घरायसी प्रतिबद्धतामार्फत हरेक मासिक बैठकमा एउटा मूल्य अभ्यास गर्न यो पुस्तिका प्रयोग गर्नुहोस्।\n\nभाषण गर्नुको सट्टा उपहार हस्तान्तरण, जवाफदेहिता, बाँडचुँड र सद्भाव, दिगोपना, पूर्ण सहभागिता तथा लैङ्गिक र पारिवारिक सहकार्यलाई परिवारका वास्तविक निर्णयसँग जोड्न सदस्यहरूलाई प्रेरित गर्नुहोस्।',
      },
      keyPoints: [
        { en: 'Seat everyone in an open circle and review last month’s group commitment first.', ne: 'सबैलाई गोलो घेरामा बसाएर पहिले गत महिनाको सामूहिक प्रतिबद्धता समीक्षा गर्नुहोस्।' },
        { en: 'Share a short local story or proverb that illustrates today’s Cornerstone.', ne: 'आजको आधारभूत मूल्य बुझाउने स्थानीय कथा वा उखान सुनाउनुहोस्।' },
        { en: 'Give 10 minutes in small pairs so quieter members speak comfortably.', ne: 'कम बोल्ने सदस्यहरूले सहजै कुरा राख्न पाऊन् भनी १० मिनेट सानो जोडीमा छलफल गराउनुहोस्।' },
        { en: 'Agree on one measurable action for the household and one for the group before next meeting.', ne: 'अर्को बैठकअघि घरपरिवार र समूहले गर्ने एक-एकवटा ठोस काममा सहमति गर्नुहोस्।' },
      ],
      facilitatorTip: {
        en: 'Keep meetings under 60 minutes during planting and harvest seasons, and rotate the facilitator role among women members every month.',
        ne: 'रोपाइँ र कटानीको व्यस्त समयमा बैठक ६० मिनेटभित्र सक्नुहोस्, र हरेक महिना महिला सदस्यहरूबीच सहजीकरणको पालो फेर्नुहोस्।',
      },
      order: 0,
    },
    {
      id: 'res-goat-biosecurity-poster',
      title: {
        en: 'Improved Goat Shed & Biosecurity Reference Guide',
        ne: 'सुधारिएको खोर र जैविक सुरक्षा सन्दर्भ सामग्री',
      },
      description: {
        en: 'Visual reference for slatted-floor goat housing, ventilation, quarantine steps and vaccination calendar for smallholder farms.',
        ne: 'टाँडे खोर, हावा पास हुने व्यवस्था, क्वारेन्टाइन र खोप तालिकासम्बन्धी चित्रसहितको सन्दर्भ सामग्री।',
      },
      format: 'poster',
      category: 'livestock',
      url: '',
      image: img('1524024973431-2ad916746881', 800, 480),
      meta: { en: 'Visual Field Poster · Livestock', ne: 'फिल्ड पोस्टर · पशुपालन' },
      courseId: 'febl',
      featuredOnHome: true,
      body: {
        en: 'An elevated slatted-floor shed keeps goats dry, reduces pneumonia and hoof rot, and makes collecting manure for compost quick and hygienic. Raise the wooden or bamboo floor 3 to 4 feet above ground with 1.5 cm gaps between slats so droppings fall through cleanly without trapping kid hooves.\n\nPair good housing with strict farm biosecurity: isolate newly purchased or gift animals for 14–21 days before mixing with the herd, keep clean water and feed troughs outside floor level, and follow your district PPR and enterotoxaemia vaccination schedule with your local VAHW.',
        ne: 'जमिनभन्दा अग्लो टाँडे खोरले बाख्रालाई सुक्खा राख्छ, निमोनिया र खुर कुहिने रोग घटाउँछ, र कम्पोस्ट मलका लागि बड्कौला संकलन सहज बनाउँछ। पाठापाठीको खुर नअड्किने गरी काठ वा बाँसको भाटाबीच १.५ से.मी. खाली राखेर जमिनभन्दा ३ देखि ४ फिट अग्लो टाँड बनाउनुहोस्।\n\nराम्रो खोरसँगै जैविक सुरक्षा अपनाउनुहोस्: नयाँ ल्याइएका पशुलाई बथानमा मिसाउनुअघि १४–२१ दिन अलग्गै क्वारेन्टाइनमा राख्नुहोस्, सफा पानी र डुँड बाहिरपट्टि जडान गर्नुहोस्, र स्थानीय भेटेरिनरी सहायकको सल्लाहमा पीपीआर तथा भ्यागुते/चरचरे खोप समयमै लगाउनुहोस्।',
      },
      keyPoints: [
        { en: 'Build the slatted floor 3–4 ft above ground facing east-south for morning sunlight and cross-ventilation.', ne: 'बिहानको घाम र हावा खेल्ने गरी पूर्व-दक्षिण फर्काएर ३–४ फिट अग्लो टाँडे खोर बनाउनुहोस्।' },
        { en: 'Provide 1.0–1.5 sq. metres of floor space per adult doe and a warm draft-free corner for newborn kids.', ne: 'प्रति वयस्क माउ बाख्रा १–१.५ वर्ग मिटर ठाउँ र भर्खर जन्मेका पाठापाठीका लागि न्यानो कुना छुट्याउनुहोस्।' },
        { en: 'Quarantine any new or sick animal for 14–21 days and place a lime or ash footbath at the shed entrance.', ne: 'नयाँ वा बिरामी पशुलाई १४–२१ दिन अलग्गै राख्नुहोस् र खोरको ढोकामा चुना वा खरानीको फुटबाथ राख्नुहोस्।' },
        { en: 'Sweep under the shed daily, compost manure at least 10 metres away, and deworm/vaccinate on schedule.', ne: 'खोरमुनि दैनिक सफा गरी १० मिटर टाढा कम्पोस्ट खाडलमा राख्नुहोस् र तालिकाअनुसार जुकाको औषधि तथा खोप दिनुहोस्।' },
      ],
      facilitatorTip: {
        en: 'Hold this session at a member’s improved goat shed with your Village Animal Health Worker (VAHW) so farmers can measure slat spacing and trough height directly.',
        ne: 'सदस्यहरूले भाटाको दूरी र डुँडको उचाइ प्रत्यक्ष नाप्न सकून् भनी भेटेरिनरी सहायकसहित नमुना टाँडे खोरमै यो सत्र सञ्चालन गर्नुहोस्।',
      },
      order: 1,
    },
    {
      id: 'res-fbs-record-toolkit',
      title: {
        en: 'Farm Enterprise Cost, Profit & Collective Marketing Toolkit',
        ne: 'कृषि उद्यम लागत, नाफा र सामूहिक बजारीकरण टुलकिट',
      },
      description: {
        en: 'Simple ledger templates and seasonal price planning sheets to help households calculate production cost and sell together through cooperatives.',
        ne: 'उत्पादन लागत हिसाब गर्न र सहकारीमार्फत सामूहिक बिक्री योजना बनाउन मद्दत गर्ने सरल खाता ढाँचा।',
      },
      format: 'toolkit',
      category: 'agribusiness',
      url: '',
      image: img('1691514201446-3333b40b05cd', 800, 480),
      meta: { en: 'Toolkit & Ledger · Agribusiness', ne: 'टुलकिट र खाता · कृषि व्यवसाय' },
      courseId: 'fbs',
      featuredOnHome: true,
      body: {
        en: 'Many smallholder households work hard all year without knowing which enterprise truly earns a profit once feed, seed, medicine, transport and family labour are counted. This Farmers Business School (FBS) toolkit gives households and collection centres a simple four-column ledger to track every rupee spent and earned.\n\nWhen groups combine production calendars and aggregate live-weight goats, milk or vegetables at a cooperative collection centre, they attract reliable buyers, cut transport cost per kg and negotiate transparent weight-based prices.',
        ne: 'दाना, बीउ, औषधि, ढुवानी र पारिवारिक श्रमको हिसाब नराख्दा धेरै किसान परिवारलाई कुन उद्यमबाट वास्तविक नाफा भइरहेको छ भन्ने थाहा हुँदैन। यस कृषक व्यवसाय विद्यालय (एफबीएस) टुलकिटले आम्दानी र खर्च टिप्ने सरल चार-महले खाता उपलब्ध गराउँछ।\n\nजब समूहहरूले उत्पादन तालिका मिलाएर सहकारी संकलन केन्द्रमार्फत तौलका आधारमा बाख्रा, दूध वा तरकारी सामूहिक बिक्री गर्छन्, ढुवानी खर्च घट्छ र किसानले उचित बजार मूल्य पाउँछन्।',
      },
      keyPoints: [
        { en: 'Record all direct inputs weekly: seed/stock, concentrate feed, vet care, packaging and transport.', ne: 'साप्ताहिक रूपमा सबै प्रत्यक्ष खर्च टिप्नुहोस्: बीउ/पाठापाठी, दाना, उपचार, प्याकेजिङ र ढुवानी।' },
        { en: 'Value household labour Days worked so you compare enterprises honestly.', ne: 'उद्यमको सही तुलना गर्न घरायसी श्रम दिनको मूल्य पनि हिसाबमा समेट्नुहोस्।' },
        { en: 'Calculate Gross Margin = Total Sales Income minus Total Variable Costs after every batch.', ne: 'प्रत्येक लटपछि कुल बिक्री आम्दानीबाट कुल प्रत्यक्ष लागत घटाएर खुद मुनाफा निकाल्नुहोस्।' },
        { en: 'Pool group marketable surplus by grade and live weight at the cooperative collection centre.', ne: 'सहकारी संकलन केन्द्रमा गुणस्तर र जिउँदो तौलका आधारमा उत्पादन जम्मा गरी सामूहिक बिक्री गर्नुहोस्।' },
      ],
      facilitatorTip: {
        en: 'Bring a weighing scale and this week’s local haat-bazaar price list so members calculate real live-weight goat or milk margins together.',
        ne: 'तराजु र यस हप्ताको स्थानीय हाटबजार मूल्य सूची ल्याएर सदस्यहरूलाई वास्तविक तौल र नाफाको हिसाब अभ्यास गराउनुहोस्।',
      },
      order: 2,
    },
    {
      id: 'res-fodder-calendar',
      title: {
        en: 'Year-Round Forage, Silage & Climate-Smart Water Worksheet',
        ne: 'वर्षभरि हरियो घाँस, साइलेज र जलवायु-मैत्री पानी कार्यपत्र',
      },
      description: {
        en: 'Seasonal planting chart for perennial grasses, fodder trees and dry-season feed preservation across hill and Terai districts.',
        ne: 'पहाड र तराईका जिल्लाहरूका लागि बहुवर्षीय घाँस, डालेघाँस र सुक्खा यामको आहारा संरक्षण तालिका।',
      },
      format: 'worksheet',
      category: 'climate',
      url: '',
      image: img('1500382017468-9049fed747ef', 800, 480),
      meta: { en: 'Seasonal Worksheet · Climate', ne: 'मौसमी कार्यपत्र · जलवायु' },
      courseId: 'climate',
      featuredOnHome: false,
      body: {
        en: 'Dry winter and pre-monsoon months (Poush through Jestha) create severe green-fodder shortages that lower milk yield and animal weight. Planning a 12-month forage calendar combining perennial grasses (Napier, Super Napier, Mulato, Stylo), winter oats/berseem and fodder trees (Tanki, Kutmiro, Kimbu, Ipil-Ipil) keeps livestock productive year-round while stabilising fragile terrace risers.\n\nSurplus lush monsoon grass can be chopped, wilted and packed airtight in silage bags or pits for 45 days to provide nutritious feed throughout the dry season.',
        ne: 'हिउँद र सुक्खा महिना (पुसदेखि जेठसम्म) हरियो घाँसको अभाव हुँदा दूध उत्पादन र पशुको तौल घट्छ। बहुवर्षीय भुइँघाँस (नेपियर, सुपर नेपियर, मुलाटो, स्टाइलो), हिउँदे जै/बर्सिम र डालेघाँस (टाँकी, कुटमिरो, किम्बु, इपिल-इपिल) मिलाएर १२ महिने घाँस पात्रो बनाउँदा वर्षभरि पोसिलो आहारा पुग्छ र बारीका कान्ला पनि जोगिन्छन्।\n\nवर्षायामको बढी हरियो घाँसलाई टुक्र्याई ओइलाएर साइलेज झोला वा खाडलमा हावा नछिर्ने गरी ४५ दिन राखेमा सुक्खा याममा पोसिलो आहारा तयार हुन्छ।',
      },
      keyPoints: [
        { en: 'Monsoon (Asadh–Bhadra): Plant Napier/Mulato slips on terrace bunds and harvest surplus grass for silage.', ne: 'वर्षायाम (असार–भदौ): कान्लामा नेपियर/मुलाटो सार्नुहोस् र बढी घाँसबाट साइलेज बनाउनुहोस्।' },
        { en: 'Autumn (Ashwin–Kartik): Sow winter oats, vetch or berseem using residual soil moisture and farmyard compost.', ne: 'शरद ऋतु (असोज–कार्तिक): जमिनको चिस्यान र गोठेमल प्रयोग गरी हिउँदे जै र बर्सिम छर्नुहोस्।' },
        { en: 'Winter–Dry (Mangsir–Chaitra): Lop fodder trees rotationally and feed preserved silage with mineral block.', ne: 'हिउँद–सुक्खा (मंसिर–चैत): पालैपालो डालेघाँस खुवाउनुहोस् र खनिज ढिक्कासहित साइलेज दिनुहोस्।' },
        { en: 'Harvest greywater and roof/runoff rainwater into lined farm ponds for dry-season irrigation and livestock.', ne: 'सुक्खा यामको सिँचाइ र पशुपालनका लागि आकाशे पानी तथा घरायसी पानी पोखरीमा संकलन गर्नुहोस्।' },
      ],
      facilitatorTip: {
        en: 'Draw a 12-month Nepali calendar (Baisakh–Chaitra) on chart paper and let farmers mark green, dry and lean feed months for their own ward.',
        ne: 'चार्ट पेपरमा वैशाखदेखि चैतसम्मको १२ महिने तालिका कोरेर किसानहरूलाई आफ्नै वडाको हरियो र सुक्खा घाँसको समय चिन्ह लगाउन दिनुहोस्।',
      },
      order: 3,
    },
    {
      id: 'res-coop-pearls-checklist',
      title: {
        en: 'Women-Led Cooperative Governance & PEARLS Review Sheet',
        ne: 'महिला नेतृत्वको सहकारी सुशासन र पर्ल्स समीक्षा फारम',
      },
      description: {
        en: 'Monthly board review sheet covering liquidity, loan delinquency, member share records and transparent AGM reporting.',
        ne: 'तरलता, भाखा नाघेको ऋण, सदस्य सेयर अभिलेख र पारदर्शी साधारणसभा प्रतिवेदनका लागि मासिक समीक्षा फारम।',
      },
      format: 'pdf',
      category: 'cooperatives',
      url: '',
      image: img('1556742049-0cfed4f6a45d', 800, 480),
      meta: { en: 'Governance Checklist · Cooperatives', ne: 'सुशासन चेकलिस्ट · सहकारी' },
      courseId: 'pearls',
      featuredOnHome: false,
      body: {
        en: 'Strong women-led cooperatives protect member savings through disciplined monthly governance. PEARLS (Protection, Effective financial structure, Asset quality, Rates of return & costs, Liquidity and Signs of growth) turns complex accounting balances into clear health indicators that every board and account-supervision committee member can monitor.\n\nUse this monthly review sheet during board meetings to check cash reserves, follow up early on overdue loans and post a plain-language summary on the cooperative notice board.',
        ne: 'अनुशासित मासिक सुशासनमार्फत सबल महिला नेतृत्वका सहकारीले सदस्यको बचत सुरक्षित राख्छन्। पर्ल्स (PEARLS) प्रणालीले जटिल लेखा विवरणलाई सञ्चालक समिति र लेखा सुपरीवेक्षण समितिका हरेक सदस्यले सजिलै बुझ्ने वित्तीय स्वास्थ्य सूचकमा बदल्छ।\n\nसञ्चालक समितिको मासिक बैठकमा तरलता जाँच्न, भाखा नाघेका ऋणको समयमै समन्वय गर्न र सूचना पाटीमा सरल विवरण टाँस्न यो फारम प्रयोग गर्नुहोस्।',
      },
      keyPoints: [
        { en: 'Liquidity check: Confirm at least 15% of savings deposits are held in readily accessible cash/bank.', ne: 'तरलता जाँच: कुल बचत निक्षेपको कम्तीमा १५% रकम नगद वा बैंकमा तत्काल उपलब्ध छ भनी सुनिश्चित गर्नुहोस्।' },
        { en: 'Asset quality: Keep total loan delinquency (>30 days overdue) below 5% with supportive member follow-up.', ne: 'सम्पत्ति गुणस्तर: ३० दिनभन्दा बढी भाखा नाघेको ऋण ५% भन्दा कम राख्न सदस्यसँग नियमित समन्वय गर्नुहोस्।' },
        { en: 'Protection: Maintain 100% loan-loss allowance for loans overdue >12 months and 35% for 1–12 months.', ne: 'सुरक्षा कोष: १२ महिनाभन्दा बढी भाखा नाघेको ऋणमा १००% र १–१२ महिनाको ऋणमा ३५% जोखिम कोष राख्नुहोस्।' },
        { en: 'Transparency: Reconcile bank/cash count with the Account Supervision Committee and post monthly summary.', ne: 'पारदर्शिता: लेखा सुपरीवेक्षण समितिसँग नगद/बैंक हिसाब भिडाई मासिक सारांश सूचना पाटीमा टाँस्नुहोस्।' },
      ],
      facilitatorTip: {
        en: 'Use green, yellow and red status cards for each indicator so non-accountant board members can spot trends immediately.',
        ne: 'लेखा पृष्ठभूमि नभएका सञ्चालक सदस्यहरूले पनि तुरुन्त अवस्था बुझ्न सकून् भनी हरेक सूचकका लागि हरियो, पहेँलो र रातो कार्ड प्रयोग गर्नुहोस्।',
      },
      order: 4,
    },
  ],
}

defaultPages.layout = {
  slug: 'layout',
  title: { en: 'Header & Footer Navigation', ne: 'हेडर र फुटर नेभिगेसन' },
  layoutData: defaultLayoutConfig,
}

defaultPages.resources = {
  slug: 'resources',
  title: { en: 'Learning Materials & Field Guides', ne: 'सिकाइ सामग्री र फिल्ड पुस्तिकाहरू' },
  resourcesData: defaultResourcesData,
}

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

