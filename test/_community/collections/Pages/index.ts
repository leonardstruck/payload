import type { CollectionConfig } from '../../../../packages/payload/src/collections/config/types'

export const pagesSlug = 'pages'

export const PagesCollection: CollectionConfig = {
  slug: pagesSlug,
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'text',
      name: 'title',
      localized: true,
    },
  ],
}
