import {defineConfig, Tool} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {BulkMemberTool} from './tools/BulkMemberTool'

// Custom desk structure: siteSettings as a singleton, events & members as lists
const deskStructure = (S: any) =>
  S.list()
    .title('IEDC MTM Content')
    .items([
      // Singleton: Site Settings
      S.listItem()
        .title('⚙️ Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),
      S.divider(),
      // Events list
      S.listItem()
        .title('📅 Events')
        .schemaType('event')
        .child(S.documentTypeList('event').title('All Events')),
      // Team Members list
      S.listItem()
        .title('👤 Team Members')
        .schemaType('teamMember')
        .child(S.documentTypeList('teamMember').title('All Team Members')),
    ])

export default defineConfig({
  name: 'default',
  title: 'IEDC MTM Studio',

  projectId: 's4nzdr3x',
  dataset: 'production',

  plugins: [
    structureTool({structure: deskStructure}),
    visionTool(),
  ],

  tools: (prev: Tool[]) => [
    ...prev,
    {
      name: 'bulk-members',
      title: 'Bulk Member Upload',
      component: BulkMemberTool,
    },
  ],

  schema: {
    types: schemaTypes,
  },
})
