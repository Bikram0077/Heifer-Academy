import type { ResourcesPageData } from '@shared/schema'

const img = (id: string, w = 1200, h = 675) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${w}&h=${h}`

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

