import { EventItem, TeamMember, SiteStats } from '../types';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'ideathon-2026',
    title: 'Ideathon 2026: Campus to Startup',
    date: '2026-10-12',
    dateBadge: '12 OCT 2026',
    category: '36-HOUR SPRINT',
    icon: 'terminal',
    shortDescription: 'A 36-hour sprint empowering student cohorts to prototype rapid software & hardware solutions.',
    fullDescription: 'Ideathon 2026 is the flagship collegiate hackathon of IEDC MTM College. Student teams will ideate, wireframe, and build working MVPs addressing healthcare, sustainable agriculture, smart logistics, and localized fintech. Supported by 12+ industry mentors and pre-incubation grants of up to ₹50,000 for top-performing prototypes.',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Auditorium & Innovation Lab, MTM College Ponnani',
    time: '09:00 AM - 36 Hours Continuous',
    registrationOpen: true,
    attendeeCount: 148,
    tags: ['Hackathon', 'Prototyping', 'Hardware & Software', 'Cash Prizes'],
    schedule: [
      { time: 'Day 1 - 09:00 AM', activity: 'Registration & Team Allotment' },
      { time: 'Day 1 - 11:30 AM', activity: 'Problem Statements Unveiling & Hacking Commences' },
      { time: 'Day 1 - 08:00 PM', activity: 'Mentor Check-in Round 1: Feasibility Audit' },
      { time: 'Day 2 - 10:00 AM', activity: 'Code Freeze & Smoke Tests' },
      { time: 'Day 2 - 02:00 PM', activity: 'Grand Jury Pitches & Awards Ceremony' }
    ],
    mentors: [
      { name: 'Dr. K. M. Abdul Gafoor', designation: 'Faculty Nodal Officer, IEDC MTM' },
      { name: 'Nihal Krishna', designation: 'Tech Lead & Open-Source Contributor' },
      { name: 'Shamsudheen V.', designation: 'Senior Architect, Technopark Kochi' }
    ]
  },
  {
    id: 'pitch-deck-clinic-2026',
    title: 'Venture Capital & Angel Pitch Deck Clinic',
    date: '2026-10-28',
    dateBadge: '28 OCT 2026',
    category: 'PITCH CLINIC',
    icon: 'query_stats',
    shortDescription: 'Exclusive workshop with early-stage angel investors on valuation, equity, and narrative architecture.',
    fullDescription: 'An intensive founder-level clinic designed for collegiate startups aiming to secure angel investments and pre-seed venture capital. Learn the exact architecture of compelling 10-slide pitch decks, how to calculate realistic addressable market sizing (TAM/SAM/SOM), cap-table dilution math, and high-converting storytelling.',
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Seminar Hall 2, MTM College Ponnani & Zoom Stream',
    time: '10:00 AM - 04:30 PM IST',
    registrationOpen: true,
    attendeeCount: 92,
    tags: ['Angel Investing', 'Pitch Decks', 'Valuation', 'Storytelling'],
    schedule: [
      { time: '10:00 AM', activity: 'Demystifying the Seed Round Landscape in South India' },
      { time: '11:45 AM', activity: 'Slide-by-Slide Anatomy: The Perfect 10-Slide Deck' },
      { time: '01:30 PM', activity: 'Live Pitch Tear-down: 5 Student Founders on the Hot Seat' },
      { time: '03:15 PM', activity: 'Term Sheet Fundamentals & Valuation Negotiation' }
    ],
    mentors: [
      { name: 'Fidha Rahman', designation: 'CEO, IEDC MTM' },
      { name: 'Ashwin Kumar', designation: 'Principal, Malabar Angel Network' }
    ]
  },
  {
    id: 'startup-conclave-2026',
    title: 'Kerala Startup Conclave: Founders Roundtable',
    date: '2026-11-15',
    dateBadge: '15 NOV 2026',
    category: 'FOUNDERS ROUNDTABLE',
    icon: 'forum',
    shortDescription: 'Keynote panels and breakout mentorship circles with alumni founders from Malappuram & Kochi.',
    fullDescription: 'Join successful serial founders, ecosystem builders, and policy enablers for an afternoon of candid reflections on building high-growth enterprises from tier-2 and tier-3 colleges. Hear firsthand case studies of scaling from collegiate research into sustainable commercial ventures.',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Main Amphitheatre, MTM College Ponnani',
    time: '02:00 PM - 06:30 PM IST',
    registrationOpen: true,
    attendeeCount: 220,
    tags: ['Ecosystem', 'Panel', 'Alumni Mentorship', 'Networking'],
    schedule: [
      { time: '02:00 PM', activity: 'Inaugural Address: The Kerala Startup Mission Vision' },
      { time: '02:45 PM', activity: 'Panel: Zero to One from College Dorms' },
      { time: '04:15 PM', activity: 'Speed Mentoring Hub: 15-Minute Founder Clinics' },
      { time: '05:30 PM', activity: 'High-Tea & Ecosystem Networking Mixer' }
    ],
    mentors: [
      { name: 'Adil Shan', designation: 'COO, IEDC MTM' },
      { name: 'Junaid Ahmed', designation: 'Founder, EdTech Global (Alumnus)' },
      { name: 'Ananya Nair', designation: 'Ecosystem Manager, KSUM' }
    ]
  },
  {
    id: 'ai-prototype-lab-2026',
    title: 'Applied AI & GenAI Prototype Sprint',
    date: '2026-11-28',
    dateBadge: '28 NOV 2026',
    category: 'HANDS-ON WORKSHOP',
    icon: 'smart_toy',
    shortDescription: 'Build and deploy production-grade LLM agents and multi-modal assistants using modern SDKs.',
    fullDescription: 'Hands-on architectural masterclass on developing context-aware AI tools, enterprise retrieval systems, and edge automation models for collegiate innovators looking to build defensible AI products.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80'
    ],
    location: 'Advanced Computing Lab 1, MTM College',
    time: '09:30 AM - 04:30 PM IST',
    registrationOpen: true,
    attendeeCount: 75,
    tags: ['Artificial Intelligence', 'Full-Stack', 'Machine Learning', 'API Design'],
    schedule: [
      { time: '09:30 AM', activity: 'Deep Dive: State-of-the-art GenAI Architectures' },
      { time: '11:30 AM', activity: 'Live Lab: Vector Search and RAG Pipeline Assembly' },
      { time: '02:00 PM', activity: 'Hands-on: Building Interactive Agents' },
      { time: '04:00 PM', activity: 'Cloud Deployment and Demo Showcase' }
    ],
    mentors: [
      { name: 'Nihal Krishna', designation: 'CTO, IEDC MTM' }
    ]
  }
];

export const NODAL_OFFICERS: TeamMember[] = [
  {
    id: 'nodal-1',
    name: 'Dr. K. M. Abdul Gafoor',
    role: 'Faculty Nodal Officer',
    initials: 'AG',
    badgeIcon: 'verified',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'nodal',
  },
  {
    id: 'nodal-2',
    name: 'Prof. Aisha Basheer',
    role: 'Assistant Nodal Officer & IPR Lead',
    initials: 'AB',
    badgeIcon: 'school',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'nodal',
  },
  {
    id: 'nodal-3',
    name: 'Dr. Muhammed Rashid',
    role: 'Dean & Research Mentor',
    initials: 'MR',
    badgeIcon: 'psychology',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'nodal',
  },
];

export const EXECUTIVE_MEMBERS: TeamMember[] = [
  {
    id: 'exec-1',
    name: 'Fidha Rahman',
    role: 'Chief Executive Officer',
    initials: 'FR',
    badgeIcon: 'flag',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'executive',
  },
  {
    id: 'exec-2',
    name: 'Adil Shan',
    role: 'Chief Operating Officer',
    initials: 'AS',
    badgeIcon: 'settings_suggest',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'executive',
  },
  {
    id: 'exec-3',
    name: 'Nihal Krishna',
    role: 'Chief Technology Officer',
    initials: 'NK',
    badgeIcon: 'code',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'executive',
  },
  {
    id: 'exec-4',
    name: 'Shamla Parveen',
    role: 'Chief Creative Officer',
    initials: 'SP',
    badgeIcon: 'palette',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'executive',
  },
];

export const GENERAL_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Rihan K.',
    role: 'Full-Stack Dev Lead',
    initials: 'RK',
    badgeIcon: 'terminal',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'member',
  },
  {
    id: 'member-2',
    name: 'Fathima Sana',
    role: 'UI/UX Design Lead',
    initials: 'FS',
    badgeIcon: 'brush',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'member',
  },
  {
    id: 'member-3',
    name: 'Salman Faris',
    role: 'IoT & Hardware Lead',
    initials: 'SF',
    badgeIcon: 'memory',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'member',
  },
  {
    id: 'member-4',
    name: 'Ananya P.',
    role: 'Grants & Finance Lead',
    initials: 'AP',
    badgeIcon: 'account_balance',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'member',
  },
  {
    id: 'member-5',
    name: 'Ashiq Bilal',
    role: 'Community & Events Lead',
    initials: 'AB',
    badgeIcon: 'campaign',
    highlightColor: '#5231FF',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    hierarchy: 'member',
  },
];

// Retain TEAM_MEMBERS for backward compatibility
export const TEAM_MEMBERS: TeamMember[] = [...NODAL_OFFICERS, ...EXECUTIVE_MEMBERS, ...GENERAL_MEMBERS];

export const INITIAL_STATS: SiteStats = {
  eventsHosted: 50,
  studentsEngaged: 500,
  startupsIncubated: 10,
  industryPartners: 15,
};

