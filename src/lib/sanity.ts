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
  events: `*[_type == "event"] | order(dateBadge desc) {
    _id,
    title,
    category,
    dateBadge,
    shortDescription,
    fullDescription,
    "coverImage": coverImage.asset->url,
    "galleryImages": galleryImages[].asset->url,
    attendeeCount,
    icon
  }`,
  teamMembers: `*[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    role,
    initials,
    badgeIcon,
    hierarchy,
    linkedin,
    instagram,
    "photoUrl": photo.asset->url
  }`,
  siteStats: `*[_type == "siteStats"][0] {
    eventsHosted,
    studentsEngaged,
    startupsIncubated,
    industryPartners
  }`,
};
