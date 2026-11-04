import type { Course, Lesson, Module } from '@shared/schema'

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
