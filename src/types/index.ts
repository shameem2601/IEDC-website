export interface EventItem {
  id: string;
  title: string;
  date: string;
  dateBadge: string;
  category: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  galleryImages: string[];
  location: string;
  time: string;
  registrationOpen: boolean;
  attendeeCount: number;
  tags: string[];
  schedule?: { time: string; activity: string }[];
  mentors?: { name: string; designation: string }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  badgeIcon: string;
  highlightColor?: string;
  linkedin: string;
  instagram: string;
  photoUrl?: string;
  hierarchy: 'nodal' | 'executive' | 'member';
}

export interface SiteStats {
  eventsHosted: number;
  studentsEngaged: number;
  startupsIncubated: number;
  industryPartners: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  registeredAt: string;
  branchYear?: string;
  teamName?: string;
}

export interface ApplicationSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  startupName: string;
  stage: 'Idea' | 'Prototype' | 'Early Traction' | 'Pre-Incubation';
  department: string;
  pitchSummary: string;
  needsGrant: boolean;
  submittedAt: string;
}
