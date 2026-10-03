import {
  Complaint,
  PickupRequest,
  WorkerProfile,
  WardPerformance,
  OverdueAlert,
  WasteItemGuide,
  QuizQuestion,
  RecyclingCenter,
  SocietyLeader,
  CitizenLeader,
  UserProfile,
} from '../types';

export function createSitePhotoDataUri(
  stage: 'before' | 'after',
  category: string,
  refCode: string
): string {
  const isBefore = stage === 'before';
  const skyColor = isBefore ? '#DCE3DC' : '#D5EBDD';
  const groundColor = isBefore ? '#9AA39B' : '#7C9A86';
  const binColor = isBefore ? '#685444' : '#15693F';
  const badgeBg = isBefore ? '#B8332A' : '#15693F';
  const label = isBefore ? 'BEFORE CLEANUP · SITE EVIDENCE' : 'AFTER RESOLUTION · VERIFIED CLEAN';

  const debrisSvg = isBefore
    ? `
      <rect x="75" y="175" width="44" height="26" rx="2" fill="#B57B45" transform="rotate(-12 75 175)" />
      <circle cx="150" cy="195" r="16" fill="#5A636A" />
      <polygon points="210,185 245,172 258,204 202,208" fill="#C98A3A" />
      <circle cx="285" cy="196" r="14" fill="#A84239" />
      <rect x="315" y="182" width="38" height="22" fill="#7D858C" transform="rotate(8 315 182)" />
      <path d="M168 118 Q195 95 224 118" stroke="#B8332A" stroke-width="4" fill="none" />
    `
    : `
      <rect x="145" y="112" width="46" height="72" rx="3" fill="#15693F" />
      <rect x="142" y="106" width="52" height="8" rx="2" fill="#0E4B2C" />
      <text x="168" y="152" fill="#F4F6F2" font-family="Inter, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">WET</text>
      <rect x="208" y="112" width="46" height="72" rx="3" fill="#1D5B96" />
      <rect x="205" y="106" width="52" height="8" rx="2" fill="#123D66" />
      <text x="231" y="152" fill="#F4F6F2" font-family="Inter, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">DRY</text>
    `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300">
    <rect width="480" height="200" fill="${skyColor}" />
    <rect y="180" width="480" height="120" fill="${groundColor}" />
    <rect x="24" y="54" width="110" height="126" fill="#BFC8C1" stroke="#8C9990" stroke-width="2" />
    <rect x="38" y="70" width="24" height="28" fill="#6F8276" />
    <rect x="76" y="70" width="24" height="28" fill="#6F8276" />
    <rect x="38" y="112" width="24" height="28" fill="#6F8276" />
    <rect x="76" y="112" width="24" height="28" fill="#6F8276" />
    <circle cx="385" cy="110" r="42" fill="#3C8D53" />
    <rect x="379" y="142" width="12" height="38" fill="#5C4938" />
    ${
      isBefore
        ? `<rect x="172" y="116" width="56" height="72" rx="3" fill="${binColor}" />`
        : ''
    }
    ${debrisSvg}
    <rect x="0" y="0" width="480" height="34" fill="#122017" fill-opacity="0.88" />
    <rect x="10" y="7" width="10" height="20" fill="${badgeBg}" />
    <text x="28" y="21" fill="#F4F6F2" font-family="Inter, sans-serif" font-size="11" font-weight="bold">${label}</text>
    <rect x="0" y="264" width="480" height="36" fill="#122017" fill-opacity="0.88" />
    <text x="14" y="286" fill="#D5E3DA" font-family="Inter, sans-serif" font-size="11">${refCode} · ${category.toUpperCase()} · GEOTAG VERIFIED</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const WARDS = [
  'Ward 14 - Swaroop Nagar & Arya Nagar',
  'Ward 07 - Civil Lines & Mall Road',
  'Ward 22 - Kakadeo & Geeta Nagar',
  'Ward 35 - Kalyanpur & IIT Campus',
  'Ward 18 - Govind Nagar & Fazalganj',
  'Ward 29 - Kidwai Nagar & Yashoda Nagar',
];

export const GUEST_USER: UserProfile = {
  name: 'Citizen',
  contact: '',
  role: 'citizen',
  userType: 'Household',
  ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
  address: 'Civil Lines, Kanpur, Uttar Pradesh',
  lat: 26.4784,
  lng: 80.3458,
  points: 0,
  streakDays: 0,
  badges: [],
};

export const INITIAL_USER: UserProfile = GUEST_USER;

export const INITIAL_COMPLAINTS: Complaint[] = [];

export const INITIAL_PICKUPS: PickupRequest[] = [];

export const WORKERS: WorkerProfile[] = [
  {
    id: 'WRK-101',
    name: 'Rameshwar Pal',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    phone: '+91 94150 11801',
    vehicle: 'UP-78-SW-4021 (E-Tipper)',
    tasksCompleted: 312,
    slaAdherence: 98.4,
    avgResolutionHours: 4.2,
    rating: 4.9,
    activeTasks: 3,
  },
  {
    id: 'WRK-102',
    name: 'Sunita Devi',
    ward: 'Ward 07 - Civil Lines & Mall Road',
    phone: '+91 94150 11802',
    vehicle: 'UP-78-SW-3819 (Twin-Bin Compactor)',
    tasksCompleted: 294,
    slaAdherence: 97.1,
    avgResolutionHours: 4.8,
    rating: 4.8,
    activeTasks: 2,
  },
  {
    id: 'WRK-105',
    name: 'Kavita Yadav',
    ward: 'Ward 18 - Govind Nagar & Fazalganj',
    phone: '+91 94150 11805',
    vehicle: 'UP-78-SW-5502 (Rapid Response EV)',
    tasksCompleted: 278,
    slaAdherence: 96.5,
    avgResolutionHours: 5.1,
    rating: 4.9,
    activeTasks: 2,
  },
  {
    id: 'WRK-104',
    name: 'Imran Khan',
    ward: 'Ward 35 - Kalyanpur & IIT Campus',
    phone: '+91 94150 11804',
    vehicle: 'UP-78-SW-6120 (MRF Carrier)',
    tasksCompleted: 251,
    slaAdherence: 94.2,
    avgResolutionHours: 6.3,
    rating: 4.7,
    activeTasks: 4,
  },
  {
    id: 'WRK-103',
    name: 'Mahesh Shukla',
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    phone: '+91 94150 11803',
    vehicle: 'UP-78-CD-2090 (C&D Loader)',
    tasksCompleted: 219,
    slaAdherence: 89.6,
    avgResolutionHours: 8.4,
    rating: 4.5,
    activeTasks: 5,
  },
];

export const WARD_PERFORMANCE: WardPerformance[] = [
  {
    ward: 'Ward 07 - Civil Lines & Mall Road',
    totalComplaints: 248,
    resolvedComplaints: 239,
    overdueComplaints: 3,
    segregationCompliance: 96.2,
    pickupCompletion: 99.1,
    avgHours: 4.6,
    score: 97,
  },
  {
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    totalComplaints: 310,
    resolvedComplaints: 289,
    overdueComplaints: 6,
    segregationCompliance: 94.1,
    pickupCompletion: 97.8,
    avgHours: 5.2,
    score: 95,
  },
  {
    ward: 'Ward 35 - Kalyanpur & IIT Campus',
    totalComplaints: 195,
    resolvedComplaints: 182,
    overdueComplaints: 5,
    segregationCompliance: 92.8,
    pickupCompletion: 96.4,
    avgHours: 5.9,
    score: 92,
  },
  {
    ward: 'Ward 18 - Govind Nagar & Fazalganj',
    totalComplaints: 226,
    resolvedComplaints: 201,
    overdueComplaints: 11,
    segregationCompliance: 89.5,
    pickupCompletion: 95.0,
    avgHours: 6.8,
    score: 88,
  },
  {
    ward: 'Ward 29 - Kidwai Nagar & Yashoda Nagar',
    totalComplaints: 164,
    resolvedComplaints: 141,
    overdueComplaints: 12,
    segregationCompliance: 87.3,
    pickupCompletion: 93.2,
    avgHours: 7.4,
    score: 84,
  },
  {
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    totalComplaints: 141,
    resolvedComplaints: 117,
    overdueComplaints: 16,
    segregationCompliance: 85.0,
    pickupCompletion: 91.5,
    avgHours: 8.9,
    score: 79,
  },
];

export const OVERDUE_ALERTS: OverdueAlert[] = [
  {
    complaintId: 'CMP-2026-8290',
    category: 'Burning waste',
    ward: 'Ward 29 - Kidwai Nagar & Yashoda Nagar',
    hoursOverdue: 76,
    escalationLevel: 'Super Admin (72h)',
    assignedTo: 'Kanpur Municipal Commissioner Desk & Zonal Chief (KNN)',
    escalatedNotified: true,
  },
  {
    complaintId: 'CMP-2026-8331',
    category: 'Dead animal',
    ward: 'Ward 18 - Govind Nagar & Fazalganj',
    hoursOverdue: 52,
    escalationLevel: 'Ward Admin (48h)',
    assignedTo: 'Ward Officer Rajeshwari Srivastava',
    escalatedNotified: true,
  },
  {
    complaintId: 'CMP-2026-8360',
    category: 'Illegal dumping',
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    hoursOverdue: 32,
    escalationLevel: 'Supervisor (24h)',
    assignedTo: 'Sanitation Supervisor Vikram Pandey',
    escalatedNotified: false,
  },
  {
    complaintId: 'CMP-2026-8388',
    category: 'Overflowing bin',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    hoursOverdue: 14,
    escalationLevel: 'Worker',
    assignedTo: 'Collector Rameshwar Pal',
    escalatedNotified: false,
  },
];

export const SWM_2026_STREAMS = [
  {
    stream: 'Wet' as const,
    titleEn: 'Wet Waste (Biodegradable)',
    titleHi: 'गीला कचरा (जैव-अपघटनीय)',
    binColorName: 'Green Bin',
    accentHex: '#15693F',
    bgTint: 'bg-[#E6F2EB] dark:bg-[#132A1E]',
    borderTint: 'border-[#9BC7AE] dark:border-[#25543B]',
    textTint: 'text-[#15693F] dark:text-[#68C88E]',
    ruleSummary:
      'Mandatory daily source segregation under SWM Rules 2026 Clause 4(1)(a). Zero plastic liner allowed; direct transfer to biomethanation or aerobic compost pits.',
    examples: [
      'Vegetable & fruit peels, banana peels',
      'Cooked food leftovers & stale bread',
      'Tea leaves, coffee grounds & eggshells',
      'Garden trimmings, dry leaves & flowers',
      'Coconut shells & sugarcane bagasse',
    ],
    prohibited: 'Plastic wrappers, aluminum foil, cooking oil bottles',
    destination: 'Ward Biomethanation Plant (Bio-CNG & Organic Compost)',
  },
  {
    stream: 'Dry' as const,
    titleEn: 'Dry Waste (Recyclable)',
    titleHi: 'सूखा कचरा (पुनर्चक्रण योग्य)',
    binColorName: 'Blue Bin',
    accentHex: '#1D5B96',
    bgTint: 'bg-[#E6EFF8] dark:bg-[#122436]',
    borderTint: 'border-[#9BBCE0] dark:border-[#264C73]',
    textTint: 'text-[#1D5B96] dark:text-[#78B2EB]',
    ruleSummary:
      'Clean, rinsed, and dry packaging materials under SWM Rules 2026 Extended Producer Responsibility (EPR) framework for Material Recovery Facilities (MRF).',
    examples: [
      'Rinsed milk packets, curd cups & PET bottles',
      'Newspapers, cardboard cartons & notebooks',
      'Metal beverage cans, tin containers & foil',
      'Clean glass jars, bottles & Tetrapak cartons',
      'Clean dry plastic bags & bubble wrap',
    ],
    prohibited: 'Food-soiled containers, wet tissues, broken tubelights',
    destination: 'Automated Material Recovery Facility (MRF Sorting Line)',
  },
  {
    stream: 'Sanitary' as const,
    titleEn: 'Sanitary & Domestic Medical',
    titleHi: 'सैनिटरी और घरेलू मेडिकल कचरा',
    binColorName: 'Red-Marked Bin / Red Pouch',
    accentHex: '#B8332A',
    bgTint: 'bg-[#F8EAE8] dark:bg-[#301614]',
    borderTint: 'border-[#DFABA7] dark:border-[#662B27]',
    textTint: 'text-[#B8332A] dark:text-[#EB827A]',
    ruleSummary:
      'Must be securely wrapped in leak-proof newspaper or biodegradable red-marked pouch so sanitation workers never touch bio-contaminated material by hand.',
    examples: [
      'Sanitary napkins, tampons & panty liners',
      'Baby & adult diapers, incontinence pads',
      'Used bandages, cotton swabs & gauze dressings',
      'Used face masks, disposable gloves & syringes (capped)',
      'Contaminated tissues & ear buds',
    ],
    prohibited: 'Unwrapped sharps, loose kitchen waste, electronics',
    destination: 'CBWTF High-Temperature Incineration & Autoclave Facility',
  },
  {
    stream: 'Special Care' as const,
    titleEn: 'Special Care & Domestic Hazardous',
    titleHi: 'विशेष देखभाल और हानिकारक कचरा',
    binColorName: 'Yellow / Black Hazard Box',
    accentHex: '#C27115',
    bgTint: 'bg-[#FBF1E4] dark:bg-[#2F2110]',
    borderTint: 'border-[#E2BF91] dark:border-[#63441D]',
    textTint: 'text-[#A85E0D] dark:text-[#F0AD5E]',
    ruleSummary:
      'Domestic hazardous, chemical, sharp, and electronic waste requiring isolated handling to prevent heavy-metal leaching, mercury contamination, or landfill fires.',
    examples: [
      'Used AA/AAA batteries, power banks & lithium cells',
      'Expired medicines, syrup bottles & ointment tubes',
      'CFL bulbs, LED lamps, tube lights & broken glass',
      'Paint cans, pesticide sprays, mosquito coils & aerosols',
      'Old chargers, earphones & small e-waste items',
    ],
    prohibited: 'Mixing with wet compostables or blue-bin paper',
    destination: 'CPCB Authorized Hazardous & E-Waste Recovery Depot',
  },
];

export const WASTE_ITEMS_GUIDE: WasteItemGuide[] = [
  {
    id: 'itm-1',
    name: 'Banana peel & fruit skins',
    hindiName: 'केले का छिलका और फलों के छिलके',
    keywords: ['banana', 'peel', 'fruit', 'mango', 'orange', 'apple', 'vegetable', ' छिलका'],
    stream: 'Wet',
    binColor: 'Green Bin (Wet)',
    instruction: 'Drop directly into the Green Bin without any plastic bag.',
    recoveryPath: 'Converted into nutrient-rich municipal city compost & Bio-CNG.',
  },
  {
    id: 'itm-2',
    name: 'Used AA/AAA battery or Lithium cell',
    hindiName: 'पुराना बैटरी सेल या पावर बैंक',
    keywords: ['battery', 'used battery', 'cell', 'lithium', 'power bank', 'remote battery'],
    stream: 'Special Care',
    binColor: 'Special Care Box (Amber/Black)',
    instruction: 'Tape terminals if lithium-ion and place in Special Care collection pouch.',
    recoveryPath: 'Sent to CPCB-certified hydrometallurgical battery recycler.',
  },
  {
    id: 'itm-3',
    name: 'Rinsed milk packet (LDPE plastic)',
    hindiName: 'धोया हुआ दूध का पैकेट',
    keywords: ['milk', 'packet', 'pouch', 'curd', 'plastic bag', 'ldpe'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry)',
    instruction: 'Cut a small corner without snipping it off completely, rinse water through, dry, and place in Blue Bin.',
    recoveryPath: 'High-value LDPE film recycled into pellets at Ward MRF.',
  },
  {
    id: 'itm-4',
    name: 'Sanitary pad or baby diaper',
    hindiName: 'सैनिटरी पैड या डायपर',
    keywords: ['sanitary', 'pad', 'diaper', 'napkin', 'tampon', 'panty liner'],
    stream: 'Sanitary',
    binColor: 'Red Bin / Red-Marked Newspaper Wrap',
    instruction: 'Wrap tightly in newspaper marked with a red cross or use a red sanitary pouch.',
    recoveryPath: 'Processed safely at authorized biomedical incineration plant.',
  },
  {
    id: 'itm-5',
    name: 'Expired medicine strips & tablets',
    hindiName: 'एक्सपायर्ड दवाइयां और टैबलेट',
    keywords: ['medicine', 'tablet', 'pill', 'syrup', 'capsule', 'pharma', 'drug'],
    stream: 'Special Care',
    binColor: 'Special Care Box (Amber/Black)',
    instruction: 'Keep in blister strip to prevent chemical mixing; hand over during Special Care pickup.',
    recoveryPath: 'High-temperature chemical neutralization under CPCB norms.',
  },
  {
    id: 'itm-6',
    name: 'Tea leaves, coffee grounds & filter',
    hindiName: 'चाय की पत्ती और कॉफी पाउडर',
    keywords: ['tea', 'coffee', 'leaves', 'chai', 'grounds'],
    stream: 'Wet',
    binColor: 'Green Bin (Wet)',
    instruction: 'Drain excess liquid and place loose tea leaves in Green Bin.',
    recoveryPath: 'Nitrogen-rich feedstock for ward aerobic composting.',
  },
  {
    id: 'itm-7',
    name: 'Broken glass bottle or mirror shard',
    hindiName: 'टूटा हुआ कांच या शीशा',
    keywords: ['broken glass', 'glass', 'mirror', 'cup', 'shard', 'bulb'],
    stream: 'Special Care',
    binColor: 'Special Care Box (Wrapped & Labelled)',
    instruction: 'Wrap in thick newspaper box, tape shut, and label "SHARP GLASS" to protect collectors.',
    recoveryPath: 'Safely crushed into cullet at glass furnace.',
  },
  {
    id: 'itm-8',
    name: 'Cardboard delivery box & newspaper',
    hindiName: 'गत्ते का डिब्बा और अखबार',
    keywords: ['cardboard', 'box', 'amazon', 'carton', 'newspaper', 'paper', 'magazine'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry)',
    instruction: 'Remove plastic tape, flatten the carton to save volume, and keep dry.',
    recoveryPath: 'Baled at MRF and sent to paper mills for pulp recovery.',
  },
  {
    id: 'itm-9',
    name: 'Thermocol & Styrofoam packaging (EPS #6)',
    hindiName: 'थर्मोकोल और फोम पैकेजिंग',
    keywords: ['thermocol', 'styrofoam', 'foam', 'packaging', 'eps', 'white foam'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry Recyclable / Neelā Dabbā)',
    instruction: 'Break into flat pieces without crumbling into small beads. Keep clean and dry without food or oil stains.',
    recoveryPath: 'Compacted and densified at Kanpur MRF into high-impact polystyrene granules.',
  },
  {
    id: 'itm-10',
    name: 'Coconut shell & sugarcane bagasse',
    hindiName: 'नारियल का खोल और गन्ने की खोई',
    keywords: ['coconut', 'shell', 'nariyal', 'sugarcane', 'bagasse', 'husk'],
    stream: 'Wet',
    binColor: 'Green Bin (Wet Biodegradable / Harā Dabbā)',
    instruction: 'Place in Green Bin. Due to high lignocellulose content, it provides ideal carbon balance for municipal compost.',
    recoveryPath: 'Co-composted into organic fertilizer or converted to biomass pellets.',
  },
  {
    id: 'itm-11',
    name: 'Pizza delivery box (soiled with grease/oil)',
    hindiName: 'चिकनाई वाला पिज़्ज़ा बॉक्स',
    keywords: ['pizza', 'pizza box', 'greasy box', 'oil box', 'food box'],
    stream: 'Wet',
    binColor: 'Green Bin (Wet / Compostable)',
    instruction: 'Tear off clean top lid for Blue Bin; place grease/oil-stained cardboard bottom directly in Green Bin for composting.',
    recoveryPath: 'Cellulose fibers with food oil biodegrade in aerobic composting pits.',
  },
  {
    id: 'itm-12',
    name: 'Fluorescent tube light & CFL bulb',
    hindiName: 'ट्यूबलाइट और सीएफएल बल्ब',
    keywords: ['tubelight', 'tube light', 'cfl', 'bulb', 'choke', 'mercury bulb'],
    stream: 'Special Care',
    binColor: 'Special Care Box (Amber/Black Container)',
    instruction: 'Keep intact without breaking. Wrap in original cardboard sleeve or bubble sheet to prevent toxic mercury vapor release.',
    recoveryPath: 'Destined for mercury distillation and phosphor powder recovery under CPCB norms.',
  },
  {
    id: 'itm-13',
    name: 'Multi-layer plastic chips wrapper & biscuit pack (MLP)',
    hindiName: 'चिप्स और नमकीन का पन्नी/रैपर',
    keywords: ['chips', 'wrapper', 'packet', 'lays', 'kurkure', 'biscuit', 'namkeen', 'snack pack', 'mlp'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry Waste / Neelā Dabbā)',
    instruction: 'Shake out dry crumbs, flatten the wrapper, and deposit in Blue Bin.',
    recoveryPath: 'Collected under EPR guidelines and sent to cement kilns for co-processing as Refuse Derived Fuel (RDF).',
  },
  {
    id: 'itm-14',
    name: 'Plastic water & cold drink bottle (PET #1)',
    hindiName: 'प्लास्टिक की पानी/कोल्ड ड्रिंक की बोतल',
    keywords: ['bottle', 'water bottle', 'pet bottle', 'coke', 'pepsi', 'plastic bottle', 'cold drink'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry Recyclable / Neelā Dabbā)',
    instruction: 'Empty remaining liquid, crush bottle flat (twist and cap), and place in Blue Bin.',
    recoveryPath: 'Washed and flaked into rPET yarn for polyester textiles and geofabrics.',
  },
  {
    id: 'itm-15',
    name: 'Old cotton clothes, bedsheet & textile scrap',
    hindiName: 'पुराने कपड़े, चादर और सूती चीथड़े',
    keywords: ['clothes', 'shirt', 'jeans', 'pant', 'textile', 'cloth', 'bedsheet', 'rag'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry Waste / Neelā Dabbā)',
    instruction: 'Ensure fabrics are dry and free from mould. Clean wearable clothes can be donated; rags go to Dry Bin.',
    recoveryPath: 'Shredded at textile recovery units into recycled yarn and industrial wiper rags.',
  },
  {
    id: 'itm-16',
    name: 'Broken bathroom tiles, cement chunks & mortar (C&D)',
    hindiName: 'टूटी हुई टाइल्स, सीमेंट और मलबा',
    keywords: ['tile', 'cement', 'concrete', 'brick', 'plaster', 'c&d', 'malba', 'rubble'],
    stream: 'Special Care',
    binColor: 'C&D Yard / Bulk Loader (निर्माण व विध्वंस स्थल)',
    instruction: 'Bag in heavy-duty gunny bags (बोरी). Never mix with domestic kitchen garbage or dump in open drains.',
    recoveryPath: 'Crushed at Kanpur Nagar Nigam Rooma C&D Plant into recycled concrete aggregate and eco-paver blocks.',
  },
  {
    id: 'itm-17',
    name: 'Eggshells & seafood/poultry bones',
    hindiName: 'अंडे के छिलके और चिकन/मटन की हड्डियां',
    keywords: ['egg', 'eggshell', 'bone', 'chicken', 'fish', 'meat', 'mutton', 'anda'],
    stream: 'Wet',
    binColor: 'Green Bin (Wet Biodegradable / Harā Dabbā)',
    instruction: 'Drop in Green Bin. High calcium and mineral content accelerates composting.',
    recoveryPath: 'Enriched mineral supplement for municipal city compost.',
  },
  {
    id: 'itm-18',
    name: 'Smartphone charger, USB wire & earphones',
    hindiName: 'मोबाइल चार्जर, डेटा केबल और इयरफ़ोन',
    keywords: ['charger', 'cable', 'wire', 'earphone', 'headphone', 'usb', 'cord', 'adapter'],
    stream: 'Special Care',
    binColor: 'Special Care Box (Amber/Black Container)',
    instruction: 'Coil cable neatly. Drop in Special Care box or hand over during monthly E-Waste drive.',
    recoveryPath: 'Copper wire stripped and recycled; plastic jacket pellets recovered.',
  },
  {
    id: 'itm-19',
    name: 'Old phone charger, cable or earphones',
    hindiName: 'पुराना मोबाइल चार्जर या केबल',
    keywords: ['charger', 'cable', 'earphone', 'wire', 'mouse', 'keyboard', 'ewaste', 'e-waste'],
    stream: 'Special Care',
    binColor: 'Special Care / E-Waste Bin',
    instruction: 'Bundle cable neatly and drop in Special Care bin or book an E-Waste pickup.',
    recoveryPath: 'Copper and precious metals recovered by authorized e-waste dismantler.',
  },
  {
    id: 'itm-20',
    name: 'Used bandage, cotton swab or face mask',
    hindiName: 'इस्तेमाल की गई पट्टी, रुई या मास्क',
    keywords: ['bandage', 'cotton', 'mask', 'glove', 'swab', 'plaster', 'medical'],
    stream: 'Sanitary',
    binColor: 'Red Bin (Sanitary)',
    instruction: 'Snip ear loops on masks, wrap in paper pouch, and place in Red Sanitary Bin.',
    recoveryPath: 'Sterilized and autoclaved at biomedical treatment facility.',
  },
  {
    id: 'itm-21',
    name: 'PET water bottle & shampoo container',
    hindiName: 'प्लास्टिक पानी की बोतल और शैम्पू डिब्बा',
    keywords: ['bottle', 'water bottle', 'pet', 'shampoo', 'detergent', 'plastic'],
    stream: 'Dry',
    binColor: 'Blue Bin (Dry)',
    instruction: 'Empty liquid completely, crush bottle flat, and replace cap before placing in Blue Bin.',
    recoveryPath: 'Shredded into recycled polyester fiber and rPET granules.',
  },
  {
    id: 'itm-12',
    name: 'Cooked rice, dal & rotis (food leftovers)',
    hindiName: 'पका हुआ खाना, दाल-चावल और रोटी',
    keywords: ['food', 'rice', 'roti', 'leftover', 'cooked', 'kitchen', 'bread', 'eggshell'],
    stream: 'Wet',
    binColor: 'Green Bin (Wet)',
    instruction: 'Drain excess curry liquid and place in Green Bin.',
    recoveryPath: 'High-methane yield input for Municipal Bio-CNG plant.',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Under SWM Rules 2026, where should a rinsed plastic milk pouch be placed?',
    item: 'Rinsed LDPE Milk Packet',
    correctStream: 'Dry',
    explanation:
      'Once rinsed and dried, LDPE milk pouches are high-value recyclables that belong in the Blue (Dry Waste) Bin.',
  },
  {
    id: 'q2',
    question: 'Which stream handles used AA batteries, expired medicine strips, and CFL bulbs?',
    item: 'Batteries, Medicines & CFL Bulbs',
    correctStream: 'Special Care',
    explanation:
      'Domestic hazardous and toxic items belong in the Special Care stream so mercury and heavy metals never enter compost or landfills.',
  },
  {
    id: 'q3',
    question: 'How should used bandages, masks, and diapers be disposed of?',
    item: 'Used Bandages & Diapers',
    correctStream: 'Sanitary',
    explanation:
      'Sanitary and domestic medical items must be wrapped in red-marked paper/pouch and placed in the Red Sanitary stream.',
  },
  {
    id: 'q4',
    question: 'Where do tea leaves, eggshells, and coconut husks go?',
    item: 'Tea Leaves & Eggshells',
    correctStream: 'Wet',
    explanation:
      'All biodegradable kitchen and garden organics go directly into the Green (Wet Waste) Bin without plastic liners.',
  },
];

export const RECYCLING_CENTERS: RecyclingCenter[] = [
  {
    id: 'RC-01',
    name: 'ClenC Automated MRF & Dry Waste Hub (Kanpur Nagar Nigam)',
    type: 'MRF & Dry Waste',
    ward: 'Ward 18 - Govind Nagar & Fazalganj',
    address: 'Plot 28, Fazalganj Industrial Area, Near Dada Nagar Road, Kanpur',
    distanceKm: 1.8,
    hours: '07:00 - 19:00 (Daily)',
    contact: '+91 512 254 8910',
    acceptedStreams: ['Dry Plastic (PET/HDPE/LDPE)', 'Paper & Cardboard', 'Glass & Metal'],
  },
  {
    id: 'RC-02',
    name: 'EcoVolt UPPCB-Authorized E-Waste & Battery Depot',
    type: 'Authorized E-Waste',
    ward: 'Ward 35 - Kalyanpur & IIT Campus',
    address: 'G.T. Road Industrial Corridor, Near Kalyanpur Crossing, Kanpur',
    distanceKm: 2.8,
    hours: '09:00 - 18:00 (Mon - Sat)',
    contact: '+91 512 258 4401',
    acceptedStreams: ['Computers & Phones', 'Lithium & Lead Batteries', 'CFL/LED Lamps'],
  },
  {
    id: 'RC-03',
    name: 'HaritUrja Bio-Methanation & Bio-CNG Processing Plant',
    type: 'Biomethanation & Compost',
    ward: 'Ward 07 - Civil Lines & Mall Road',
    address: 'Bhairav Ghat Road, Near Ganga Barrage Link, Kanpur',
    distanceKm: 3.2,
    hours: '06:00 - 20:00 (Daily)',
    contact: '+91 512 261 3390',
    acceptedStreams: ['Bulk Wet Kitchen Waste', 'Horticulture & Garden Pruning'],
  },
  {
    id: 'RC-04',
    name: 'Suraksha Domestic Hazardous & Special Care Transfer Station',
    type: 'Special Care & Hazardous',
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    address: 'Panki Industrial Area Phase II, Utility Yard C, Kanpur',
    distanceKm: 4.1,
    hours: '08:30 - 17:30 (Tue - Sun)',
    contact: '+91 512 254 7122',
    acceptedStreams: ['Expired Pharmaceuticals', 'Paint & Chemical Cans', 'Wrapped Sharps & Glass'],
  },
];

export const SOCIETY_LEADERBOARD: SocietyLeader[] = [
  {
    rank: 1,
    name: 'Ganga Heights Cooperative Housing Society (180 Flats)',
    type: 'Residential Society',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    segregationRate: 99.2,
    compostingKgPerMonth: 2840,
    points: 18450,
  },
  {
    rank: 2,
    name: 'IIT Kanpur Faculty & Student Residential Enclave',
    type: 'College/Campus',
    ward: 'Ward 35 - Kalyanpur & IIT Campus',
    segregationRate: 98.4,
    compostingKgPerMonth: 4620,
    points: 17890,
  },
  {
    rank: 3,
    name: 'Civil Lines Officers Colony RWA',
    type: 'Residential Society',
    ward: 'Ward 07 - Civil Lines & Mall Road',
    segregationRate: 96.8,
    compostingKgPerMonth: 2190,
    points: 16210,
  },
  {
    rank: 4,
    name: 'HBTU Kanpur Hostel & Campus Complex',
    type: 'College/Campus',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    segregationRate: 95.5,
    compostingKgPerMonth: 3410,
    points: 15400,
  },
  {
    rank: 5,
    name: 'Ratan Orbit & Som Dutt Enclave Residents Association',
    type: 'Residential Society',
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    segregationRate: 94.1,
    compostingKgPerMonth: 1650,
    points: 14120,
  },
];

export const TOP_CITIZEN_LEADERS: CitizenLeader[] = [
  {
    rank: 1,
    id: 'CTZ-KNN-101',
    name: 'Dr. Meenakshi Dixit',
    contact: '+91 94150 28114',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    userType: 'Household',
    points: 3420,
    streakDays: 48,
    badges: ['Zero-Mix Master', 'Swachh Champion', 'Compost Pioneer', 'KNN Gold Star'],
    resolvedReportsCount: 28,
    taxRebateTier: '15% KNN Property Tax Rebate',
  },
  {
    rank: 2,
    id: 'CTZ-KNN-102',
    name: 'Vikramaditya Rawat',
    contact: '+91 98390 19283',
    ward: 'Ward 07 - Civil Lines & Mall Road',
    userType: 'Residential Society',
    points: 3180,
    streakDays: 42,
    badges: ['Zone Sentinel', 'E-Waste Steward', 'SLA Enforcer'],
    resolvedReportsCount: 24,
    taxRebateTier: '15% KNN Property Tax Rebate',
  },
  {
    rank: 3,
    id: 'CTZ-KNN-103',
    name: 'Ananya Tandon',
    contact: '+91 97930 84729',
    ward: 'Ward 35 - Kalyanpur & IIT Campus',
    userType: 'College/Campus',
    points: 2890,
    streakDays: 39,
    badges: ['Green Scholar', 'Zero Waste Lead', 'SWM Quiz Ace'],
    resolvedReportsCount: 21,
    taxRebateTier: '10% KNN Property Tax Rebate',
  },
  {
    rank: 4,
    id: 'CTZ-KNN-104',
    name: 'Rajeshwar Shukla',
    contact: '+91 94520 63829',
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    userType: 'Household',
    points: 2640,
    streakDays: 35,
    badges: ['Plastic Reducer', 'Neighborhood Sentinel'],
    resolvedReportsCount: 19,
    taxRebateTier: '10% KNN Property Tax Rebate',
  },
  {
    rank: 5,
    id: 'CTZ-KNN-105',
    name: 'Sunita Awasthi',
    contact: '+91 98394 77218',
    ward: 'Ward 18 - Govind Nagar & Fazalganj',
    userType: 'Household',
    points: 2380,
    streakDays: 31,
    badges: ['Bio-Waste Champion', 'Segregation Star'],
    resolvedReportsCount: 16,
    taxRebateTier: '10% KNN Property Tax Rebate',
  },
  {
    rank: 6,
    id: 'CTZ-KNN-106',
    name: 'Mohammad Tariq',
    contact: '+91 94151 55092',
    ward: 'Ward 29 - Kidwai Nagar & Yashoda Nagar',
    userType: 'Commercial',
    points: 2150,
    streakDays: 28,
    badges: ['Clean Drain Guardian', 'Zero-Mix Commercial'],
    resolvedReportsCount: 14,
    taxRebateTier: '5% KNN Property Tax Rebate',
  },
  {
    rank: 7,
    id: 'CTZ-KNN-107',
    name: 'Pooja Mehrotra',
    contact: '+91 98399 22104',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    userType: 'Residential Society',
    points: 1980,
    streakDays: 25,
    badges: ['Compost Steward', 'Rapid Reporter'],
    resolvedReportsCount: 12,
    taxRebateTier: '5% KNN Property Tax Rebate',
  },
  {
    rank: 8,
    id: 'CTZ-KNN-108',
    name: 'Col. Devendra Chauhan (Retd.)',
    contact: '+91 94150 11983',
    ward: 'Ward 07 - Civil Lines & Mall Road',
    userType: 'Residential Society',
    points: 1820,
    streakDays: 23,
    badges: ['Clean Enclave Marshal', 'Civic Leader'],
    resolvedReportsCount: 11,
    taxRebateTier: '5% KNN Property Tax Rebate',
  },
  {
    rank: 9,
    id: 'CTZ-KNN-109',
    name: 'Kavita Nigam',
    contact: '+91 97931 44029',
    ward: 'Ward 22 - Kakadeo & Geeta Nagar',
    userType: 'Household',
    points: 1670,
    streakDays: 21,
    badges: ['Sanitary Waste Shield', 'Segregation Ace'],
    resolvedReportsCount: 9,
    taxRebateTier: '5% KNN Property Tax Rebate',
  },
  {
    rank: 10,
    id: 'CTZ-KNN-110',
    name: 'Rohit Mehra',
    contact: '+91 98390 44120',
    ward: 'Ward 14 - Swaroop Nagar & Arya Nagar',
    userType: 'Residential Society',
    points: 1480,
    streakDays: 19,
    badges: ['Zero-Mix Household', 'Zone 2 Sentinel'],
    resolvedReportsCount: 8,
    taxRebateTier: '5% KNN Property Tax Rebate',
  },
];

export const CATEGORY_CHART_DATA = [
  { name: 'Overflowing bin', value: 382, color: '#15693F' },
  { name: 'Garbage on road', value: 294, color: '#0F626A' },
  { name: 'Missed collection', value: 241, color: '#1D5B96' },
  { name: 'Illegal dumping', value: 186, color: '#C27115' },
  { name: 'Burning waste', value: 108, color: '#B8332A' },
  { name: 'Dead animal / Other', value: 73, color: '#586960' },
];

export const TREND_LINE_DATA = [
  { day: '16 Sep', submitted: 82, resolved: 78 },
  { day: '18 Sep', submitted: 94, resolved: 89 },
  { day: '20 Sep', submitted: 76, resolved: 81 },
  { day: '22 Sep', submitted: 105, resolved: 98 },
  { day: '24 Sep', submitted: 88, resolved: 91 },
  { day: '26 Sep', submitted: 112, resolved: 104 },
  { day: '28 Sep', submitted: 91, resolved: 96 },
  { day: '30 Sep', submitted: 84, resolved: 87 },
];

export const PEAK_HOURS_DATA = [
  { hour: '06:00', reports: 48 },
  { hour: '08:00', reports: 164 },
  { hour: '10:00', reports: 192 },
  { hour: '12:00', reports: 118 },
  { hour: '14:00', reports: 86 },
  { hour: '16:00', reports: 109 },
  { hour: '18:00', reports: 145 },
  { hour: '20:00', reports: 74 },
];

export const TRANSLATIONS = {
  en: {
    heroBadge: 'Kanpur Nagar Nigam · SWM Rules 2026 Compliant Municipal Infrastructure',
    heroTitle: 'Report waste issues, schedule segregated pickups, and verify resolution in one civic platform.',
    heroSubtitle:
      'ClenC connects Kanpur households, residential societies, university campuses (IIT Kanpur, HBTU), field collectors, and Kanpur Nagar Nigam ward administration with transparent SLA tracking and four-stream waste recovery.',
    reportBtn: 'Report an issue',
    pickupBtn: 'Request pickup',
    statsResolved: 'Complaints Resolved',
    statsPickups: 'Segregated Pickups Completed',
    statsCitizens: 'Active Citizens & RWAs',
    howItWorks: 'How ClenC Works',
    fourStreamsTitle: 'Four Official Waste Streams · Solid Waste Management Rules 2026',
    whoItServes: 'Built for Every Civic Institution',
    citizenHub: 'Citizen Dashboard',
    workerHub: 'Collector Daily Tasks',
    adminHub: 'Municipal Admin Command',
  },
  hi: {
    heroBadge: 'कानपुर नगर निगम · ठोस अपशिष्ट प्रबंधन नियम 2026 के अंतर्गत नागरिक मंच',
    heroTitle: 'कचरा शिकायतें दर्ज करें, पृथक पिकअप बुक करें और समाधान की लाइव स्थिति ट्रैक करें।',
    heroSubtitle:
      'ClenC कानपुर के नागरिकों, आवासीय सोसायटियों, विश्वविद्यालय परिसरों (IIT Kanpur, HBTU), सफाई मित्रों और कानपुर नगर निगम प्रशासन को पारदर्शी समय-सीमा (SLA) और 4-श्रेणी कचरा पृथक्करण से जोड़ता है।',
    reportBtn: 'समस्या दर्ज करें',
    pickupBtn: 'पिकअप अनुरोध करें',
    statsResolved: 'समाधान की गई शिकायतें',
    statsPickups: 'पूर्ण किए गए कचरा पिकअप',
    statsCitizens: 'सक्रिय नागरिक और सोसायटियां',
    howItWorks: 'ClenC कार्यप्रणाली (4 चरण)',
    fourStreamsTitle: 'ठोस अपशिष्ट प्रबंधन नियम 2026 · 4 आधिकारिक कचरा श्रेणियां',
    whoItServes: 'प्रत्येक नागरिक परिसर के लिए निर्मित',
    citizenHub: 'नागरिक डैशबोर्ड',
    workerHub: 'सफाई मित्र कार्य सूची',
    adminHub: 'वार्ड प्रशासन डैशबोर्ड',
  },
};
