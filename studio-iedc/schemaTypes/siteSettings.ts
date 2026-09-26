import {defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: () => '⚙️',
  description: 'Global settings: stats numbers, footer contact info, social links, mission text.',
  fields: [
    // ─── STATS / METRICS ───
    defineField({
      name: 'statsHeading',
      title: 'Stats Section',
      type: 'string',
      readOnly: true,
      initialValue: '📊 Site Metrics (Homepage Counters)',
      components: {input: () => null},
    }),
    defineField({
      name: 'eventsHosted',
      title: 'Events Hosted',
      type: 'number',
      description: 'Total number of events hosted (displays as animated counter).',
      initialValue: 50,
      validation: (rule) => rule.min(0),
      group: 'stats',
    }),
    defineField({
      name: 'studentsEngaged',
      title: 'Students Engaged',
      type: 'number',
      description: 'Total students engaged across all cohorts.',
      initialValue: 500,
      validation: (rule) => rule.min(0),
      group: 'stats',
    }),
    defineField({
      name: 'startupsIncubated',
      title: 'Startups Incubated',
      type: 'number',
      description: 'Number of student startups incubated.',
      initialValue: 10,
      validation: (rule) => rule.min(0),
      group: 'stats',
    }),
    defineField({
      name: 'industryPartners',
      title: 'Industry Partners',
      type: 'number',
      description: 'Number of industry partners/MoUs.',
      initialValue: 15,
      validation: (rule) => rule.min(0),
      group: 'stats',
    }),

    // ─── FOOTER CONTACT INFO ───
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      description: 'Email displayed in the footer, e.g. "hello@iedcmtm.in".',
      group: 'footer',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
      description: 'Phone number displayed in the footer, e.g. "+91 98470 00000".',
      group: 'footer',
    }),
    defineField({
      name: 'footerDescription',
      title: 'Footer Description',
      type: 'text',
      rows: 3,
      description: 'Short description under the IEDC MTM logo in the footer.',
      group: 'footer',
    }),

    // ─── SOCIAL MEDIA LINKS ───
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'X (Twitter) URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      group: 'social',
    }),

    // ─── MISSION & VISION TEXT ───
    defineField({
      name: 'missionHeadline',
      title: 'Mission Headline',
      type: 'string',
      description: 'The big headline in the About section.',
      group: 'content',
    }),
    defineField({
      name: 'missionDescription',
      title: 'Mission Description',
      type: 'text',
      rows: 5,
      description: 'Primary paragraph in the About/Mission section.',
      group: 'content',
    }),
    defineField({
      name: 'missionSubtext',
      title: 'Mission Subtext',
      type: 'text',
      rows: 4,
      description: 'Secondary paragraph mentioning KSUM partnership, hackspaces, etc.',
      group: 'content',
    }),

    // ─── HERO TEXT ───
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'Main hero headline, e.g. "Where ideas become ventures."',
      group: 'content',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      description: 'Subtitle under the headline.',
      group: 'content',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      rows: 3,
      description: 'Paragraph below the subtitle on the hero section.',
      group: 'content',
    }),
  ],
  groups: [
    {name: 'stats', title: '📊 Stats & Metrics', default: true},
    {name: 'footer', title: '📬 Footer & Contact'},
    {name: 'social', title: '🔗 Social Media Links'},
    {name: 'content', title: '✏️ Hero & Mission Text'},
  ],
  preview: {
    prepare() {
      return {
        title: '⚙️ Site Settings',
        subtitle: 'Stats, Footer, Social Links, Hero & Mission Text',
      }
    },
  },
})
