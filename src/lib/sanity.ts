import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity Project Credentials provided:
// Project: iedc (s4nzdr3x)
// Dataset: production
export const SANITY_PROJECT_ID = 's4nzdr3x';
export const SANITY_DATASET = 'production';
export const SANITY_API_VERSION = '2024-03-01';

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

// Helper for generating Sanity image URLs
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

// Queries for fetching live data from Sanity if deployed
export const SANITY_QUERIES = {
  events: `*[_type == "event"] | order(eventDate desc) {
    "id": _id,
    _id,
    title,
    slug,
    status,
    eventDate,
    category,
    dateBadge,
    shortDescription,
    fullDescription,
    "coverImage": coverImage.asset->url,
    "galleryImages": galleryImages[].asset->url,
    location,
    time,
    attendeeCount,
    registrationOpen,
    icon,
    tags,
    schedule,
    mentors
  }`,
  teamMembers: `*[_type == "teamMember"] | order(order asc) {
    "id": _id,
    _id,
    name,
    role,
    initials,
    badgeIcon,
    hierarchy,
    linkedin,
    instagram,
    github,
    twitter,
    "photoUrl": photo.asset->url
  }`,
  siteSettings: `*[_type == "siteSettings"][0] {
    eventsHosted,
    studentsEngaged,
    startupsIncubated,
    industryPartners,
    contactEmail,
    contactPhone,
    footerDescription,
    instagramUrl,
    linkedinUrl,
    twitterUrl,
    youtubeUrl,
    websiteUrl,
    missionHeadline,
    missionDescription,
    missionSubtext,
    heroHeadline,
    heroSubtitle,
    heroDescription
  }`,
};
