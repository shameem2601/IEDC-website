import {defineField, defineType} from 'sanity'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  icon: () => '👤',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'initials',
      title: 'Initials',
      type: 'string',
      description: '2-letter initials displayed when no photo is uploaded, e.g. "FR".',
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'role',
      title: 'Role / Designation',
      type: 'string',
      description: 'e.g. "Chief Executive Officer", "Faculty Nodal Officer", "UI/UX Design Lead".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hierarchy',
      title: 'Team Tier',
      type: 'string',
      description: 'Determines the layout section on the website.',
      options: {
        list: [
          {title: 'Faculty Leadership & Nodal Officer (2-3 per row)', value: 'nodal'},
          {title: 'Executive Council (4 per row)', value: 'executive'},
          {title: 'Domain Leads & Innovators (5 per row)', value: 'member'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      description: 'Upload a profile photo. If empty, initials will be shown instead.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'badgeIcon',
      title: 'Badge Icon',
      type: 'string',
      description: 'Material icon name for the badge, e.g. "verified", "flag", "code", "palette".',
      initialValue: 'person',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({scheme: ['http', 'https'], allowRelative: false}),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({scheme: ['http', 'https'], allowRelative: false}),
    }),
    defineField({
      name: 'github',
      title: 'GitHub URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({scheme: ['http', 'https'], allowRelative: false}),
    }),
    defineField({
      name: 'twitter',
      title: 'X (Twitter) URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({scheme: ['http', 'https'], allowRelative: false}),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first within their tier. Use this to control ordering.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
    preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
      hierarchy: 'hierarchy',
    },
    prepare({title, subtitle, media, hierarchy}) {
      const tierLabel =
        hierarchy === 'nodal'
          ? '🏛️ Faculty'
          : hierarchy === 'executive'
            ? '⭐ Executive'
            : '💡 Member';
      return {
        title: title || 'Unnamed Member',
        subtitle: `${tierLabel} — ${subtitle || ''}`,
        media,
      };
    },
  },
});