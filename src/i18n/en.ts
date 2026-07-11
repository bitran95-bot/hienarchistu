import type { Translations } from './vi';

const en: Translations = {
  nav: {
    story: 'Our Story',
    services: 'Services',
    projects: 'Projects',
    library: 'Library',
    contact: 'Contact',
  },
  loading: {
    text: 'Loading space...',
  },
  contact: {
    close: 'Close',
    phone: 'Phone',
    quote: '"Every project is a story. Let\'s write your architectural story together."',
  },
  contactForm: {
    title: 'Send a message',
    name: 'Full name',
    namePlaceholder: 'John Doe',
    email: 'Email',
    emailPlaceholder: 'email@example.com',
    message: 'Message',
    messagePlaceholder: 'Describe your requirements or questions...',
    send: 'Send message',
    sending: 'Sending...',
    success: 'Message sent successfully! We will respond as soon as possible.',
    error: 'Something went wrong. Please try again or contact us by phone.',
  },
  scene: {
    loadingData: 'Loading data...',
  },
  about: {
    title: 'I am Tran Thai Bao, an architect passionate about local identity. I design humble homes that adapt to nature and the homeowner\'s love for life.',
    text: 'Throughout my career, I seek beauty in the simplicity of wood, concrete, pebbles, and the verandas that welcome sunlight and shelter from rain. Working with skilled local craftsmen, we build peaceful homes where people find connection with nature, with themselves, and with their families.',
  },
  magazine: {
    aboutProject: 'About the Project',
    details: 'Details',
    videoTitle: 'Project Video',
    galleryAlt: 'Photo Gallery',
    galleryHint: 'Turn to the next page →',
    theEnd: 'The End.',
    subtitle: 'Architectural publication by Hiên studio',
    infoFallback: 'Project information is being updated...',
  },
  shop: {
    pageTitle: 'Revit Library — Hiên Archi Studio',
    pageDesc: 'Buy and download high-quality Revit Family and Revit Templates from Hiên Archi Studio.',
    heroTitle: 'Revit',
    heroHighlight: 'Library',
    heroSubtitle: 'High-quality Revit Family & Templates, meticulously designed by Hiên studio architects',
    backHome: '← Home',
    activeLabel: 'Revit Library',
    filterAll: 'All',
    filterFamily: 'Revit Family',
    filterTemplate: 'Revit Template',
    productCount: (n: number) => `${n} product${n !== 1 ? 's' : ''}`,
    free: 'Free',
    buy: 'Buy now',
    download: 'Download',
    downloadFree: '📥 Download free',
    buyNow: '🛒 Buy now',
    comingSoon: 'Coming soon',
    featured: '★ Featured',
    emptyTitle: 'No products yet',
    emptyText: 'Products are being updated, please check back later!',
    previewImages: 'Preview images',
    fileFormat: 'Format',
    compatibility: 'Compatibility',
    backHomeFooter: '← Back to home',
    footerCopy: (year: number) => `© ${year} Hiên Archi Studio. Crafted with ❤️`,
  },
  seo: {
    siteTitle: 'Hiên Archi Studio',
    siteDesc: 'Architecture and interior design studio, creating simple and sincere living spaces.',
  },
  projectsPage: {
    title: 'Our Projects',
    subtitle: 'Where peaceful homes and rustic, sincere living spaces are crafted.',
    searchPlaceholder: 'Search projects...',
    noProjects: 'No projects yet.',
    noMatch: 'No matching projects found.',
    clearSearch: 'Clear search',
  },
  projectDetail: {
    generalInfo: 'General Information',
    story: 'Project Story',
    video: 'Project Video',
    noImage: 'No images available',
    viewDetail: 'View details',
    zoomIn: 'Zoom in',
    gallery: 'Photo Gallery',
    detailHeader: 'Project Details',
  },
  servicesPage: {
    title: 'Architectural & Interior Design Process',
    subtitle: 'A professional step-by-step roadmap to bring your living space to life.',
    step: 'Phase',
    duration: 'Duration',
    deliverable: 'Key Deliverables',
    ctaTitle: 'Ready to bring your dream home to life?',
    ctaDesc: 'Let us start writing your unique architectural story together.',
    ctaButton: 'Contact Us Now',
    exploreProjects: 'Explore Realized Projects',
    steps: [
      {
        id: '01',
        title: 'Reception & Site Survey',
        duration: '1 - 3 days',
        details: [
          { label: 'Discussion', text: 'Meet in person or online to listen to your needs, preferences, and analyze the investment budget.' },
          { label: 'Site Survey', text: 'Measure current conditions, check elevation, sun & wind direction, and document site/building photos.' }
        ],
        deliverable: 'Requirements brief and site condition assessment document.'
      },
      {
        id: '02',
        title: 'Concept Design',
        duration: '5 - 7 days',
        details: [
          { label: 'Layout 2D', text: 'Design space division, circulation, and furniture arrangement options.' },
          { label: 'Moodboard', text: 'Suggest design style, materials, and main color palette through visual references.' }
        ],
        deliverable: 'Functional layout drawings + Style Moodboard.'
      },
      {
        id: '03',
        title: 'Design Contract Signing',
        duration: '3 - 5 days',
        details: [
          { label: 'Agreement', text: 'Both parties finalize the preliminary layout and sign the official design contract.' },
          { label: 'Advance Payment', text: 'Client makes the 1st design fee payment according to contract terms.' }
        ],
        deliverable: 'Signed official architectural/interior design contract & detailed timeline.'
      },
      {
        id: '04',
        title: 'Detailed 3D Rendering',
        duration: '10 - 15 days',
        details: [
          { label: 'Visualization', text: 'Create realistic 3D perspectives with accurate lighting, colors, and materials.' },
          { label: 'Refinement', text: 'Discuss and adjust details based on client feedback (within contract limits).' }
        ],
        deliverable: 'High-quality 3D render set covering all angles of the project.'
      },
      {
        id: '05',
        title: 'Technical Construction Drawings',
        duration: '10 - 12 days',
        details: [
          { label: 'Detailing', text: 'Develop detailed construction drawings (Architecture, Structure, MEP, Interior details, Ceiling - Wall - Floor).' }
        ],
        deliverable: 'Comprehensive construction technical drawings (hard copy and PDF) for precise building.'
      },
      {
        id: '06',
        title: 'Handover & Author Supervision',
        duration: 'Throughout construction',
        details: [
          { label: 'Handover', text: 'Finalize design contract, hand over full stamped drawings and digital files.' },
          { label: 'Supervision', text: 'Architect inspects key construction milestones (concrete pouring, rough-in acceptance, material selection) to ensure adherence to design.' }
        ],
        deliverable: 'Final handover package & on-site author supervision during key milestones.'
      }
    ]
  },
};

export default en;
