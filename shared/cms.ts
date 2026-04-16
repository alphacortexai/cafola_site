export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  location: string;
};

export type ServiceDetailItem = {
  title: string;
  description: string;
};

export type Service = {
  title: string;
  description: string;
  icon: string;
  longDescription: string;
  details?: ServiceDetailItem[];
};

export type Article = {
  title: string;
  description: string;
  featured?: boolean;
};

export type SiteContent = {
  brandName: string;
  tagline: string;
  companyDescriptor: string;
  navItems: string[];
  phone: string;
  heroHeading: string;
  heroSubheading: string;
  servicesHeading: string;
  servicesIntro: string;
  services: Service[];
  storyHeading: string;
  storyParagraphs: string[];
  caregiversHeading: string;
  caregiversCopy: string[];
  resourcesHeading: string;
  articles: Article[];
  newsletterHeading: string;
  footerAddress: string[];
  footerLinks: string[];
  testimonials: Testimonial[];
};

export const defaultSiteContent: SiteContent = {
  brandName: "CAFOLA",
  tagline: "Compassionate support for living well at home.",
  companyDescriptor: "In-Home Care & Assistance",
  navItems: ["Services", "Resources", "About Us", "Careers", "Contact"],
  phone: "(877) 697-7537",
  heroHeading: "CAFOLA",
  heroSubheading: "Personalized care that helps families thrive at home.",
  servicesHeading: "What CAFOLA Can Do for You",
  servicesIntro:
    "From post-hospital recovery to specialized long-term support, our care team provides professional nursing and compassionate assistance.",
  services: [
    {
      title: "Post-Hospital Recovery",
      description: "Skilled nursing care tailored to support residents following acute hospital admission, ensuring continuity of care and preventing re-admission.",
      icon: "🏥",
      longDescription: "Many patients are discharged from hospitals but still need skilled nursing care. Our services are tailored to support residents in our recovery center / residential care centers following acute hospital admission. CAFOLA work to ensure continuity of care structured to facilitate complication prevention, avoid re-admission and complete healing.",
      details: [
        { title: "Vital Signs Monitoring", description: "Closely observing and managing blood pressure, blood oxygen, respiratory rate, temperatures and heart rate." },
        { title: "Wound Care", description: "Expert management of wounds and sores, including professional cleaning and dressing." },
        { title: "Medication Management", description: "Helping and guiding residents in the administration of their prescribed medicines." },
        { title: "24/7 Nursing Care", description: "Qualified nurses providing round-the-clock support including pressure point care, feeding (NG tube), and hygiene." },
        { title: "Catheter and Stoma Care", description: "Daily cleaning, bag changes, and monitoring for infections or complications." },
        { title: "Emotional Support", description: "Companionship and comfort for residents and families through the journey of distress." },
        { title: "GP Visits", description: "In-house general practitioner visits to observe and monitor health conditions." }
      ]
    },
    {
      title: "Stroke Recovery & Rehab",
      description: "One-on-one professional nursing care and personalized rehabilitation plans for residents recovering from stroke in a comfortable environment.",
      icon: "🧠",
      longDescription: "When a serious or chronic health issue affects someone you love, it seems overwhelming. Fortunately we are here to provide one on one professional nursing care and attention while outside the hospital, in a comfortable recovery center. We personalize care plan for our residents recovering from stroke.",
      details: [
        { title: "Therapy & Rehab", description: "Speech and language therapy, mobility training, and occupational therapy." },
        { title: "Specialized Care", description: "Feeding (Oral/NG), hygiene, grooming, and toileting/bowl programs." },
        { title: "Clinical Support", description: "Suction, pressure sore management, and medication administration." },
        { title: "Physiotherapy", description: "Professional physiotherapy based on need and physician's recommendation." }
      ]
    },
    {
      title: "Long-Term Care",
      description: "Round-the-clock support for daily living, health monitoring, and professional nursing for chronic conditions like Diabetes, Hypertension, and Cancer.",
      icon: "⏳",
      longDescription: "CAFOLA is here to work with family in providing round the clock support for individuals needing assistance with daily living activities, health monitoring, psychological comfort, and professional nursing care.",
      details: [
        { title: "Diabetes Management", description: "Blood glucose monitoring, medication timing, diabetic diet, and neuropathy prevention." },
        { title: "Hypertension Care", description: "Blood pressure monitoring, medication adherence, and lifestyle modification support." },
        { title: "Cancer Support", description: "Symptom management, psychosocial support, and infection prevention (neutropenic precautions)." },
        { title: "Pain & Fatigue", description: "Pain assessment and management, energy conservation, and light exercise promotion." },
        { title: "Gastrointestinal Care", description: "Managing nausea/vomiting, promoting nutritious diets, and managing digestive issues." },
        { title: "Psychological Support", description: "Counseling and spiritual support to help residents and families cope with anxiety and depression." }
      ]
    },
    {
      title: "Specialty Care",
      description: "Unique care designs including Dementia care, Geriatry, and specialized therapies like Psychotherapy and Speech therapy.",
      icon: "✨",
      longDescription: "At CAFOLA, we believe that care should be designed towards each person's unique needs. That's the exact reason you should rely on people with the skills.",
      details: [
        { title: "Dementia & Memory Care", description: "Helping loved ones live a quality and independent life despite cognitive changes." },
        { title: "Speech & Physiotherapy", description: "Verified professional therapists planning sessions to improve communication and body functioning." },
        { title: "Psychotherapy", description: "Specialized support from psychologists for various psychological concerns." },
        { title: "Geriatry", description: "Addressing unique needs of older residents: mobility, safety, nutrition, and family ties." },
        { title: "Orthopedic & Disability", description: "Promoting independence, dignity, and self-worth through daily living support." },
        { title: "Medical Daycare", description: "Helping mothers with baby feeding, care, hygiene routines, and medication." },
        { title: "Home Visits", description: "Planned or full-time (24/7) care in the comfort of our client's own homes." }
      ]
    },
  ],
  storyHeading: "Our Story",
  storyParagraphs: [
    "Home is where routines feel familiar and life feels grounded. CAFOLA was built to protect that feeling for older adults and families navigating change.",
    "Our mission is simple: empower people to age, recover, and live confidently in the place they know best.",
    "Through expert caregivers, family coaching, and thoughtful planning, we help make complex care decisions more manageable.",
  ],
  caregiversHeading: "A Care Team Families Can Trust",
  caregiversCopy: [
    "CAFOLA caregivers are selected for compassion, trained for excellence, and matched to each client's needs.",
    "If you're driven by purpose and want a meaningful career in home care, we'd love to meet you.",
  ],
  resourcesHeading: "Latest Resources for Families",
  articles: [
    {
      title: "How to Build a Safer Home for Aging in Place",
      description: "Simple room-by-room updates that improve safety, comfort, and independence.",
      featured: true,
    },
    {
      title: "Early Signs That Extra Daily Support May Help",
      description: "Learn practical indicators and how to start a conversation with empathy.",
    },
    {
      title: "Nutrition Tips for Older Adults at Home",
      description: "Keep meals balanced, accessible, and enjoyable with these caregiver-backed ideas.",
    },
    {
      title: "How Respite Care Supports Family Caregivers",
      description: "Why short breaks can prevent burnout and improve long-term care outcomes.",
    },
  ],
  newsletterHeading: "Get CAFOLA care insights in your inbox",
  footerAddress: ["6700 Mercy Rd", "Ste 400", "Omaha, NE 68106"],
  footerLinks: ["Find Care", "Find Jobs", "Contact Us", "FAQ"],
  testimonials: [
    {
      quote: "CAFOLA gave our family peace of mind and helped my mother stay safely in her own home.",
      author: "Norma",
      role: "Client",
      location: "Norfolk, Nebraska",
    },
    {
      quote:
        "Their caregivers are professional, kind, and deeply attentive. We finally felt like we had a partner in this journey.",
      author: "Michelle",
      role: "Client's Family Member",
      location: "Clemson, South Carolina",
    },
    {
      quote:
        "The communication is excellent and the support is reliable. CAFOLA has truly made daily life easier for us.",
      author: "Donna",
      role: "Client's Family Member",
      location: "Tulsa, Oklahoma",
    },
  ],
};
