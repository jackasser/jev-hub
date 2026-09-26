export const en = {
  'site.name': 'Jev Hub',
  'site.tagline': 'Everything about TypeSafe AI’s Jev, in one place',
  'site.description':
    'A curated directory of Jev — TypeSafe AI’s System One decision model: official docs and SDKs, gateways that relay it, open-source compatible servers, integrations and measured evaluations.',

  'nav.home': 'Home',
  'nav.entries': 'Directory',
  'nav.explainer': 'What is Jev?',
  'nav.about': 'About',
  'nav.skip': 'Skip to content',

  'home.lead':
    'Jev is a model that answers typed questions about your program state instead of writing text back. This directory collects what exists around it: where the documentation is, which SDKs and gateways reach it, which open implementations speak the same protocol, and who has measured it.',
  'home.featured': 'Start here',
  'home.categories': 'Browse by category',
  'home.latest': 'Recently published',
  'home.viewAll': 'See the full directory',
  'home.count.one': 'entry',
  'home.count.other': 'entries',

  'entries.title': 'Directory',
  'entries.lead': 'Every entry here was opened and read before it was listed. Each one carries the URLs that were checked.',
  'entries.search.label': 'Search',
  'entries.search.placeholder': 'Name, tag, organisation…',
  'entries.filter.category': 'Category',
  'entries.filter.all': 'All categories',
  'entries.sort.label': 'Sort',
  'entries.sort.featured': 'Recommended',
  'entries.sort.stars': 'GitHub stars',
  'entries.sort.newest': 'Newest',
  'entries.showing': 'Showing',
  'entries.of': 'of',
  'entries.empty': 'Nothing matches that. Try a shorter word, or clear the category filter.',
  'entries.reset': 'Clear',

  'card.official': 'Official',
  'card.stars': 'stars',

  'detail.category': 'Category',
  'detail.org': 'From',
  'detail.license': 'License',
  'detail.language': 'Language',
  'detail.published': 'Published',
  'detail.added': 'Listed here',
  'detail.stars': 'GitHub stars',
  'detail.visit': 'Open',
  'detail.repo': 'Repository',
  'detail.sources': 'Sources checked',
  'detail.back': 'Back to the directory',
  'detail.related': 'Also in this category',

  'explainer.title': 'What is Jev?',
  'explainer.lead':
    'A short, plain explanation of System One models, the three question types, and the ways to reach the model.',

  'about.title': 'About this site',
  'about.lead': 'What is listed here, how it gets checked, and what this site deliberately does not do.',

  'claims.title': 'About the numbers on this site',
  'claims.body':
    'Speed, price and “no hallucination” figures come from TypeSafe AI’s own published material and are reported here as their claims, with a link to where they were read. Nothing on this site is an independent benchmark. The evaluations listed under Evaluations are third-party measurements with a published method; read their stated scope before generalising from them.',

  'footer.editorial': 'Listed only after reading the primary source. Descriptions are written here, not copied.',
  'footer.notAffiliated': 'An independent directory. Not affiliated with TypeSafe AI.',
  'footer.updated': 'Last updated',

  'lang.switch': '日本語',
  'lang.switchLabel': 'Switch language',

  '404.title': 'Page not found',
  '404.body': 'That URL does not exist here. The directory is a good place to start.',
} as const;

export type MessageKey = keyof typeof en;
