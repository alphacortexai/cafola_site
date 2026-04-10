export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  location: string;
};

export type Service = {
  title: string;
  description: string;
  icon: string;
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
    "From companionship to specialized support, our care team adapts to each family and each stage of life.",
  services: [
    {
      title: "Companion Care",
      description: "Friendly visits, meal prep, transportation, and everyday support to reduce isolation.",
      icon: "🏠",
    },
    {
      title: "Personal Care",
      description: "Respectful help with hygiene, dressing, mobility, and routines that preserve dignity.",
      icon: "👤",
    },
    {
      title: "Nursing Services",
      description: "Skilled in-home care coordination, medication support, and health monitoring.",
      icon: "⚕️",
    },
    {
      title: "Specialty Care",
      description: "Condition-specific care plans for dementia, Parkinson's, stroke recovery, and more.",
      icon: "🏥",
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
