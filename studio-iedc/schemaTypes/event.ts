import {defineField, defineType} from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: () => '📅',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Event Status',
      type: 'string',
      description:
        '⚡ Automatic (website auto-shifts to Past when date passes), or force Upcoming/Past manually.',
      options: {
        list: [
          {title: '⚡ Automatic (Auto-changes based on date & time)', value: 'auto'},
          {title: '🟢 Upcoming (Force Future)', value: 'upcoming'},
          {title: '⚪ Past (Force Completed / Archived)', value: 'past'},
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eventDate',
      title: 'Event Date & Time',
      type: 'datetime',
      description: 'The real-world date & time of the event (used for auto past/future detection and sorting).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dateBadge',
      title: 'Date Badge Text',
      type: 'string',
      description: 'Display text for the date badge, e.g. "12 OCT 2026".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: '36-Hour Sprint', value: '36-HOUR SPRINT'},
          {title: 'Workshop', value: 'WORKSHOP'},
          {title: 'Hands-On Workshop', value: 'HANDS-ON WORKSHOP'},
          {title: 'Founder Clinic', value: 'FOUNDER CLINIC'},
          {title: 'Pitch Clinic', value: 'PITCH CLINIC'},
          {title: 'Panel', value: 'PANEL'},
          {title: 'Conference', value: 'CONFERENCE'},
          {title: 'Founders Roundtable', value: 'FOUNDERS ROUNDTABLE'},
          {title: 'Hackathon', value: 'HACKATHON'},
          {title: 'Meetup', value: 'MEETUP'},
          {title: 'Webinar', value: 'WEBINAR'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Material Icon Name',
      type: 'string',
      description: 'Google Material Symbol name, e.g. "bolt", "terminal", "school", "smart_toy".',
      initialValue: 'event',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief summary for the event card (max 160 characters).',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'text',
      rows: 8,
      description: 'Detailed description shown in the event lightbox modal.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Main 16:9 banner image for the event card.',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      description: 'Upload multiple photos from the event. Supports bulk uploading.',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Venue name and address.',
    }),
    defineField({
      name: 'time',
      title: 'Time',
      type: 'string',
      description: 'Display time, e.g. "09:00 AM - 04:30 PM IST".',
    }),
    defineField({
      name: 'attendeeCount',
      title: 'Attendee Count',
      type: 'number',
      description: 'Number of registered/attended participants.',
      initialValue: 0,
    }),
    defineField({
      name: 'registrationOpen',
      title: 'Registration Open?',
      type: 'boolean',
      description: 'Toggle to open/close registration for this event.',
      initialValue: true,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Keywords like "Hackathon", "AI", "Prototyping".',
    }),
    defineField({
      name: 'schedule',
      title: 'Event Schedule',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'scheduleItem',
          title: 'Schedule Item',
          fields: [
            defineField({name: 'time', title: 'Time', type: 'string'}),
            defineField({name: 'activity', title: 'Activity', type: 'string'}),
          ],
          preview: {
            select: {title: 'activity', subtitle: 'time'},
          },
        },
      ],
    }),
    defineField({
      name: 'mentors',
      title: 'Mentors / Speakers',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'mentorItem',
          title: 'Mentor',
          fields: [
            defineField({name: 'name', title: 'Name', type: 'string'}),
            defineField({name: 'designation', title: 'Designation', type: 'string'}),
          ],
          preview: {
            select: {title: 'name', subtitle: 'designation'},
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Event Date (Newest First)',
      name: 'eventDateDesc',
      by: [{field: 'eventDate', direction: 'desc'}],
    },
    {
      title: 'Event Date (Oldest First)',
      name: 'eventDateAsc',
      by: [{field: 'eventDate', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'dateBadge',
      media: 'coverImage',
      status: 'status',
    },
    prepare({title, subtitle, media, status}) {
      const emoji = status === 'past' ? '⚪' : status === 'upcoming' ? '🟢' : '⚡';
      return {
        title: title ? `${emoji} ${title}` : 'Untitled Event',
        subtitle: subtitle || '',
        media,
      };
    },
  },
})