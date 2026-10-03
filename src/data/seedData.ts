import {
  AuthorProfile,
  Book,
  Category,
  Chapter,
  Genre,
  PlatformSettings,
  TokenPackage,
  Advertisement,
  Review,
} from '../types';

export const COVER_IMAGES = {
  lagosNocturne: '/src/assets/images/cover_lagos_nocturne_1791056052060.jpg',
  saharaChronicles: '/src/assets/images/cover_sahara_chronicles_1791056063358.jpg',
  echoesOfAccra: '/src/assets/images/cover_echoes_of_accra_1791056074434.jpg',
  ironAndIvory: '/src/assets/images/cover_iron_and_ivory_1791056084520.jpg',
  authorPortrait: '/src/assets/images/author_portrait_editorial_1791056094705.jpg',
};

export const INITIAL_SETTINGS: PlatformSettings = {
  id: 'global',
  authorRevenueSharePercent: 75,
  requireBookApproval: true,
  requireAuthorApproval: false,
  heroHeadline: 'Stories Worth Reading. Authors Worth Discovering.',
  heroSubheadline:
    'Discover captivating novels, powerful stories and unforgettable voices from Africa and around the world.',
  announcementBanner:
    'LitVault Autumn Literary Prize Submissions Now Open · Authors retain 75% royalties on all LitToken unlocks.',
  adsEnabled: true,
  seoTitle: 'LitVault — Read. Discover. Publish.',
  seoDescription:
    'Discover captivating novels, powerful stories and unforgettable voices from Africa and around the world on LitVault.',
};

export const INITIAL_GENRES: Genre[] = [
  { id: 'african-literature', name: 'African Literature', slug: 'african-literature', description: 'Contemporary and classic literary voices from across the African continent and diaspora.', active: true },
  { id: 'literary-drama', name: 'Drama', slug: 'drama', description: 'Character-driven narratives exploring human conflict, ambition, and family bonds.', active: true },
  { id: 'historical-fiction', name: 'Historical Fiction', slug: 'historical-fiction', description: 'Richly researched journeys into kingdoms, colonial crossroads, and defining eras.', active: true },
  { id: 'romance', name: 'Romance', slug: 'romance', description: 'Intimate stories of devotion, longing, and second chances.', active: true },
  { id: 'thriller', name: 'Thriller', slug: 'thriller', description: 'High-stakes political, legal, and psychological suspense.', active: true },
  { id: 'mystery', name: 'Mystery', slug: 'mystery', description: 'Atmospheric investigations and intricate puzzles.', active: true },
  { id: 'fantasy', name: 'Fantasy', slug: 'fantasy', description: 'Mythic worlds, ancestral magic, and epic cosmology.', active: true },
  { id: 'science-fiction', name: 'Science Fiction', slug: 'science-fiction', description: 'Afrofuturism, speculative technology, and near-future horizons.', active: true },
  { id: 'poetry', name: 'Poetry', slug: 'poetry', description: 'Lyrical collections, verse monographs, and spoken-word anthologies.', active: true },
  { id: 'short-stories', name: 'Short Stories', slug: 'short-stories', description: 'Compact literary fiction crafted for single-sitting immersion.', active: true },
  { id: 'horror', name: 'Horror', slug: 'horror', description: 'Folklore uncanny, supernatural dread, and nocturnal terror.', active: true },
  { id: 'comedy', name: 'Comedy', slug: 'comedy', description: 'Sharp social satire, wit, and observational humor.', active: true },
  { id: 'christian', name: 'Christian', slug: 'christian', description: 'Faith-inspired narratives of grace, redemption, and stewardship.', active: true },
  { id: 'family', name: 'Family', slug: 'family', description: 'Multi-generational sagas and domestic chronicles.', active: true },
  { id: 'children', name: 'Children', slug: 'children', description: 'Illustrated fables and early-reader adventures.', active: true },
  { id: 'young-adult', name: 'Young Adult', slug: 'young-adult', description: 'Coming-of-age journeys of identity and courage.', active: true },
  { id: 'business', name: 'Business', slug: 'business', description: 'Leadership, emerging markets entrepreneurship, and economic strategy.', active: true },
  { id: 'inspirational', name: 'Inspirational', slug: 'inspirational', description: 'Memoirs and essays on resilience and purpose.', active: true },
  { id: 'crime', name: 'Crime', slug: 'crime', description: 'Noir investigations, syndicate syndication, and courtroom drama.', active: true },
  { id: 'adventure', name: 'Adventure', slug: 'adventure', description: 'Expeditions across deserts, archipelagos, and uncharted frontiers.', active: true },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'novel', name: 'Full-Length Novel', slug: 'novel', active: true },
  { id: 'novella', name: 'Novella', slug: 'novella', active: true },
  { id: 'short-collection', name: 'Short Story Anthology', slug: 'short-collection', active: true },
  { id: 'poetry-monograph', name: 'Poetry Monograph', slug: 'poetry-monograph', active: true },
  { id: 'serialized-epic', name: 'Serialized Fiction', slug: 'serialized-epic', active: true },
  { id: 'non-fiction-essay', name: 'Essays & Non-Fiction', slug: 'non-fiction-essay', active: true },
];

export const INITIAL_TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'pkg_reader_starter',
    name: 'Chapbook Pouch',
    tokens: 100,
    priceMinorUnits: 499, // $4.99 stored as 499 cents
    currency: 'USD',
    active: true,
    popular: false,
  },
  {
    id: 'pkg_collector_edition',
    name: 'Collector’s Folio',
    tokens: 300,
    priceMinorUnits: 1299, // $12.99 stored as 1299 cents
    currency: 'USD',
    active: true,
    popular: true,
  },
  {
    id: 'pkg_patron_vault',
    name: 'Patron’s Archive',
    tokens: 750,
    priceMinorUnits: 2799, // $27.99 stored as 2799 cents
    currency: 'USD',
    active: true,
    popular: false,
  },
  {
    id: 'pkg_laureate_chest',
    name: 'Laureate Treasury',
    tokens: 1800,
    priceMinorUnits: 5999, // $59.99 stored as 5999 cents
    currency: 'USD',
    active: true,
    popular: false,
  },
];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad_homepage_banner',
    slotName: 'Homepage Editorial Sponsorship Slot',
    placement: 'homepage_banner',
    enabled: true,
    adType: 'sponsored_campaign',
    publisherId: 'ca-pub-0000000000000000',
    adSlotId: 'litvault-home-01',
    headline: 'The Pan-African Literary Monograph Series — Autumn Curated Hardbacks & Digital Editions',
    ctaText: 'Browse Featured Imprint',
    ctaUrl: '/?view=explore',
  },
  {
    id: 'ad_catalog_inline',
    slotName: 'Catalog Inline AdSense Slot',
    placement: 'catalog_inline',
    enabled: true,
    adType: 'adsense',
    publisherId: 'ca-pub-0000000000000000',
    adSlotId: 'litvault-catalog-02',
    headline: 'Google AdSense Publisher Unit Ready',
    ctaText: 'Learn More',
    ctaUrl: '/?view=explore',
  },
  {
    id: 'ad_book_detail_sidebar',
    slotName: 'Book Detail Sidebar Literary Partner Slot',
    placement: 'book_detail_sidebar',
    enabled: true,
    adType: 'sponsored_campaign',
    publisherId: 'ca-pub-0000000000000000',
    adSlotId: 'litvault-book-03',
    headline: 'Publish Your Manuscript on LitVault Studio — Earn 75% Royalties on Every Unlock',
    ctaText: 'Open Author Studio',
    ctaUrl: '/?view=author-studio',
  },
];

export const INITIAL_AUTHORS: AuthorProfile[] = [
  {
    id: 'author_chimamanda_adeyemi',
    userId: 'author_chimamanda_adeyemi',
    penName: 'Zainab Adeyemi-Cole',
    bio: 'Zainab Adeyemi-Cole is a Lagos and London-based novelist and architectural historian whose fiction explores urban memory, West African coastal heritage, and the quiet resilience of post-independence families.',
    photoUrl: COVER_IMAGES.authorPortrait,
    location: 'Lagos, Nigeria · London, UK',
    website: 'https://litvault.org/authors/zainab-adeyemi-cole',
    twitterHandle: '@zainabadeyemi',
    status: 'approved',
    copyrightAgreed: true,
    followersCount: 1840,
    totalReads: 14290,
    averageRating: 4.9,
  },
  {
    id: 'author_kwame_mensah',
    userId: 'author_kwame_mensah',
    penName: 'Dr. Kwame Osei-Mensah',
    bio: 'Award-winning Ghanaian essayist, poet, and speculative historian. Former fellow at the University of Legon Archive, writing at the intersection of Saharan astronomy and oral cartography.',
    photoUrl: COVER_IMAGES.authorPortrait,
    location: 'Accra, Ghana',
    website: 'https://litvault.org/authors/kwame-osei-mensah',
    twitterHandle: '@kwameoseimensah',
    status: 'approved',
    copyrightAgreed: true,
    followersCount: 1290,
    totalReads: 9850,
    averageRating: 4.8,
  },
  {
    id: 'author_amara_diop',
    userId: 'author_amara_diop',
    penName: 'Amara Diop-Kouyaté',
    bio: 'Senegalese-French literary mystery and historical thriller writer. Her works weave archival provenance inquiries with contemporary diplomatic intrigue.',
    photoUrl: COVER_IMAGES.authorPortrait,
    location: 'Dakar, Senegal · Paris, France',
    website: 'https://litvault.org/authors/amara-diop',
    twitterHandle: '@amaradiopwrites',
    status: 'approved',
    copyrightAgreed: true,
    followersCount: 960,
    totalReads: 8140,
    averageRating: 4.7,
  },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book_lagos_nocturne',
    slug: 'nocturne-for-victoria-island',
    title: 'Nocturne for Victoria Island',
    subtitle: 'A Novel of Memory, Lagoon Tides, and Unfinished Architecture',
    authorId: 'author_chimamanda_adeyemi',
    authorName: 'Zainab Adeyemi-Cole',
    coverUrl: COVER_IMAGES.lagosNocturne,
    description:
      'Set across three monsoon seasons in Lagos between 1977 and the present day, Nocturne for Victoria Island follows archivist Eniola Coker as she discovers a cache of blueprints hidden inside a crumbling Brazilian-quarter townhouse. What begins as an architectural restoration unravels a sweeping family covenant spanning Marina merchants, jazz trumpeters, and a vanished ferryman.',
    genre: 'African Literature',
    category: 'Full-Length Novel',
    tags: ['Lagos', 'Literary Fiction', 'Family Saga', 'Architecture'],
    language: 'English',
    ageRating: '13+',
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    copyrightConfirmed: true,
    featured: true,
    trending: true,
    chaptersCount: 3,
    readsCount: 6420,
    ratingAvg: 4.9,
    ratingCount: 128,
  },
  {
    id: 'book_sahara_chronicles',
    slug: 'the-astrolabe-of-timbuktu',
    title: 'The Astrolabe of Timbuktu',
    subtitle: 'Chronicles of the Salt Caravan Astronomers',
    authorId: 'author_kwame_mensah',
    authorName: 'Dr. Kwame Osei-Mensah',
    coverUrl: COVER_IMAGES.saharaChronicles,
    description:
      'In sixteenth-century Timbuktu, apprentice celestial cartographer Idris al-Sadiq inherits a brass astrolabe engraved with coordinates that do not match any known constellation. Pursued across the Erg of Tenere by rival scholars and imperial emissaries, Idris must decode his mentor’s finalmarginalia before the autumn equinox.',
    genre: 'Historical Fiction',
    category: 'Full-Length Novel',
    tags: ['Timbuktu', 'Historical', 'Astronomy', 'Saharan Epic'],
    language: 'English',
    ageRating: '13+',
    isPremium: true,
    tokenPrice: 60,
    status: 'published',
    copyrightConfirmed: true,
    featured: true,
    trending: true,
    chaptersCount: 3,
    readsCount: 5180,
    ratingAvg: 4.8,
    ratingCount: 94,
  },
  {
    id: 'book_echoes_of_accra',
    slug: 'verandas-of-labone',
    title: 'Verandas of Labone',
    subtitle: 'Collected Stories & Coastal Elegies',
    authorId: 'author_kwame_mensah',
    authorName: 'Dr. Kwame Osei-Mensah',
    coverUrl: COVER_IMAGES.echoesOfAccra,
    description:
      'An intimate cycle of interconnected stories set along the sunlit boulevards and Atlantic seawalls of Accra. From a retired highlife guitarist tuning his final Gibson in Jamestown to two estranged sisters reuniting at an independence-era botanical conservatory, Verandas of Labone celebrates tenderness and reconciliation.',
    genre: 'Short Stories',
    category: 'Short Story Anthology',
    tags: ['Accra', 'Short Stories', 'Romance', 'Drama'],
    language: 'English',
    ageRating: 'All Ages',
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    copyrightConfirmed: true,
    featured: true,
    trending: false,
    chaptersCount: 2,
    readsCount: 4670,
    ratingAvg: 4.8,
    ratingCount: 76,
  },
  {
    id: 'book_iron_and_ivory',
    slug: 'provenance-of-bronze',
    title: 'Provenance of Bronze',
    subtitle: 'An International Restitution Thriller',
    authorId: 'author_amara_diop',
    authorName: 'Amara Diop-Kouyaté',
    coverUrl: COVER_IMAGES.ironAndIvory,
    description:
      'When a seventeenth-century royal bronze relief surfaces in a private Geneva vault forty-eight hours before a historic restitution treaty in Dakar, provenance investigator Mariama Sylla is summoned to authenticate the cast. Beneath the patina lies a contemporary forgery conspiracy reaching the highest corridors of European and West African auction houses.',
    genre: 'Thriller',
    category: 'Full-Length Novel',
    tags: ['Mystery', 'Art Restitution', 'Dakar', 'Thriller'],
    language: 'English',
    ageRating: '16+',
    isPremium: true,
    tokenPrice: 80,
    status: 'published',
    copyrightConfirmed: true,
    featured: true,
    trending: true,
    chaptersCount: 3,
    readsCount: 8140,
    ratingAvg: 4.7,
    ratingCount: 112,
  },
  {
    id: 'book_harmattan_sonnets',
    slug: 'canticles-of-the-harmattan',
    title: 'Canticles of the Harmattan',
    subtitle: 'Poems on Wind, Solitude, and Harmonies',
    authorId: 'author_chimamanda_adeyemi',
    authorName: 'Zainab Adeyemi-Cole',
    coverUrl: COVER_IMAGES.lagosNocturne,
    description:
      'A luminous poetry monograph capturing the silver dust of December winds across West Africa, meditations on motherhood, migration, and the quiet liturgy of dawn.',
    genre: 'Poetry',
    category: 'Poetry Monograph',
    tags: ['Poetry', 'African Literature', 'Inspirational'],
    language: 'English',
    ageRating: 'All Ages',
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    copyrightConfirmed: true,
    featured: false,
    trending: true,
    chaptersCount: 2,
    readsCount: 2790,
    ratingAvg: 4.9,
    ratingCount: 53,
  },
  {
    id: 'book_covenant_of_stars',
    slug: 'orbit-of-the-nok-citadel',
    title: 'Orbit of the Nok Citadel',
    subtitle: 'A Speculative Novel of Terracotta Cosmology',
    authorId: 'author_amara_diop',
    authorName: 'Amara Diop-Kouyaté',
    coverUrl: COVER_IMAGES.saharaChronicles,
    description:
      'Three centuries from now, orbital acousticians stationed above the Jos Plateau awaken a harmonic resonance embedded within ancient terracotta sculptures, opening a dialogue across deep time.',
    genre: 'Science Fiction',
    category: 'Serialized Fiction',
    tags: ['Science Fiction', 'Fantasy', 'Adventure'],
    language: 'English',
    ageRating: '13+',
    isPremium: true,
    tokenPrice: 45,
    status: 'published',
    copyrightConfirmed: true,
    featured: false,
    trending: false,
    chaptersCount: 2,
    readsCount: 3410,
    ratingAvg: 4.6,
    ratingCount: 41,
  },
];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap_lagos_1',
    bookId: 'book_lagos_nocturne',
    authorId: 'author_chimamanda_adeyemi',
    chapterNumber: 1,
    title: 'The Blueprint in the Cedar Chest',
    wordCount: 680,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `During the late October rains, the lagoon did not merely rise against the seawall of Victoria Island; it breathed through the lime-washed mortar of the old Coker House. Eniola stood on the upper gallery with a brass magnifying glass in her palm, listening to the steady drumbeat of water upon corrugated zinc.

For forty years the cedar chest in her grandfather’s drafting room had remained locked behind two rusted padlocks. Her aunts insisted it held nothing more than expired shipping manifests from the port of Apapa and yellowed programmes from the 1977 FESTAC colloquium. Yet when the locksmith finally coaxed the iron hasp open that morning, the scent that rose from within was not mildew, but clove oil and indigo drafting linen.

Unrolling the top cylinder across the mahogany table, Eniola weighted its corners with four smooth river stones. Drawn in meticulous Prussian blue ink was an elevation of a seven-bay arcade overlooking Five Cowrie Creek—a building that appeared on no municipal registry, signed in the lower right margin by her grandfather, Kehinde Coker, and a second name that had been carefully scraped away with a razor blade.

"Every house in Lagos keeps two histories," her grandmother used to say while shelling groundnuts on the back veranda. "The one stamped by the land registry clerk in Alausa, and the one whispered by the mason who mixed the sand."

Eniola traced the phantom indentation where the second signature had once rested. Hold the linen toward the louvered shutter, and the afternoon glare revealed the faint loop of an initial: an ornate capital M, followed by a date in November 1976—three nights before the ferry vanished in the fog off Tarkwa Bay.

Downstairs, the wrought-iron gate creaked open. A courier in a drenched oilskin coat stood beneath the frangipani tree holding a sealed Manila envelope bearing the crest of the Maritime Trust. Someone else in the city knew the cedar chest had been opened.`,
  },
  {
    id: 'chap_lagos_2',
    bookId: 'book_lagos_nocturne',
    authorId: 'author_chimamanda_adeyemi',
    chapterNumber: 2,
    title: 'Echoes Along Marina Pier',
    wordCount: 640,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `By seven in the evening the rain had thinned to a luminous mist that turned the streetlamps along Campbell Street into halos of amber. Eniola tucked the linen cylinder inside a waterproof leather tube and walked toward the old cathedral square.

The letter delivered by the courier had been brief—four lines typed on heavy cotton rag paper inviting her to inspect Archive Vault Four at the former Harbour Master’s annex before midnight. No telephone number was listed, only the embossed seal of the Trust and the signature of Chief Akinwale’s youngest archivist, Tunde Bamidele.

When she reached the annex, the night watchman barely glanced up from his transistor radio before unlocking the teak doors. High overhead, ceiling fans turned with a slow, hypnotic click. Tunde waited beside a light-table covered in glass-plate negatives.

"You brought the elevation?" he asked quietly, adjusting his wire-rimmed spectacles.

Eniola laid the cylinder beside the negatives without uncapping it. "First tell me why the Maritime Trust has been paying the ground rent on my grandfather’s studio for nineteen years without informing our family."

Tunde sighed, sliding a glass plate over the illuminated panel. In sharp monochrome contrast stood two young men on the deck of a timber launch in 1976: her grandfather Kehinde, holding a theodolite, and beside him a tall woman wearing the insignia of the Federal Hydrographic Survey.

"Because the arcade on your blueprint was never meant to be a residence, Eniola," Tunde said softly. "It was built to house the acoustic tide-recorders and the family ledger that every shipping dynasty on the coast wanted buried under the reclamation sand."`,
  },
  {
    id: 'chap_lagos_3',
    bookId: 'book_lagos_nocturne',
    authorId: 'author_chimamanda_adeyemi',
    chapterNumber: 3,
    title: 'The Tide-Keeper’s Ledger',
    wordCount: 610,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `At low tide the stone pilings beneath the Five Cowrie bridge emerged from the dark water like the ribs of an ancient vessel. Eniola and Tunde stepped from the wooden jetty into a narrow motor launch piloted by an elderly boatman who knew every sandbar between Ikoyi and the Atlantic bar.

As the launch glided beneath the third arch, the beam of Tunde’s lantern caught a recessed keystone carved with the same geometric relief that bordered her grandfather’s blueprint. Behind the ivy-draped grille lay a dry stone chamber where three brass cylinders stood sealed in beeswax.

"Your grandmother never left Lagos because she was guarding the key," Tunde murmured as Eniola fitted the small bronze ward from the cedar chest into the central cylinder.

Inside lay not gold, nor bearer bonds, but three hundred pages of hand-stitched rag paper recording the true names, villages, and testimonies of the artisans and dockworkers who had built the modern island—alongside the deeds to twelve waterfront parcels held in perpetual trust for their descendants. As dawn broke in pale rose and gold across the lagoon, Eniola realized the restoration of Coker House was only beginning.`,
  },
  {
    id: 'chap_sahara_1',
    bookId: 'book_sahara_chronicles',
    authorId: 'author_kwame_mensah',
    chapterNumber: 1,
    title: 'The Seventh Meridian of Sankore',
    wordCount: 720,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `On the night the comet crossed the shoulder of Orion, the courtyard of the Sankore Mosque smelled of cedar smoke and freshly ground gall-nut ink. Apprentice Idris al-Sadiq knelt beside the stone reflecting pool, aligning the sighted alidade of his master’s brass astrolabe with the reflection of Canopus in the still water.

For sixty winters, Sheikh Mahmoud hadcharted the southern stars from the mud-brick watchtower overlooking Timbuktu. Caravans departing for Taghaza and Cairo set their compasses by his ephemeris tables; judges settled inheritance disputes by the precision of his sundials. Yet three days before his passing, the Sheikh had unscrewed the rete of his finest astrolabe and replaced it with a disk hammered from meteoritic iron and inlaid with silver wire.

"Do not read the sky as a roof, Idris," the old astronomer had whispered, his fingers cold as desert flint. "Read it as a map of the wells that existed before the sand swallowed the rivers."

When Idris rotated the silver rete to match the comet’s declination, a hidden vernier scale clicked into alignment along the rim. Engraved in microscopic Maghribi script were coordinates pointing not toward Mecca or Fez, but due east into the trackless dunes of the Tenere—to a latitude where no oasis had been recorded for four hundred years.

Before he could copy the figures into his leather notebook, the heavy acacia door at the base of the tower shuddered under three urgent knocks.`,
  },
  {
    id: 'chap_sahara_2',
    bookId: 'book_sahara_chronicles',
    authorId: 'author_kwame_mensah',
    chapterNumber: 2,
    title: 'Caravan of the Blue Veil (Premium Chapter)',
    wordCount: 750,
    isPremium: true,
    tokenPrice: 60,
    status: 'published',
    content: `Three hours before dawn, the salt caravan assembled outside the northern gate of Kabara, four hundred camels kneeling in the silver starlight while drivers lashed slabs of rock salt and leather saddlebags of manuscripts to their wooden frames.

Idris rode near the center of the column, his cloak drawn tight against the biting desert chill, the brass astrolabe wrapped in oiled sheepskin against his chest. Beside him rode Tariq ibn-Yusuf, the Tuareg guide whose indigo tagelmust left only his dark, wind-honed eyes visible.

"The governor’s horsemen asked after a scholar carrying a brass instrument at the river ferry," Tariq said without turning his head. "They offered twenty mitkals of gold dust for the return of Sheikh Mahmoud’s final folio."

"The folio is ashes in the brazier," Idris replied. "Only the brass remembers."

For nine days they marched across gravel plains where fossilized shells gleamed beneath the hooves of the camels—proof of Sheikh Mahmoud’s heresy that the great desert had once been an inland sea. On the tenth evening, as a blood-red sun dipped below a ridge of singing sand dunes, Tariq reined his mount to a halt. Half-buried in the lee of a basalt escarpment stood two obelisks of black stone carved with celestial sighting notches that matched the silver rete to the fraction of a degree.`,
  },
  {
    id: 'chap_sahara_3',
    bookId: 'book_sahara_chronicles',
    authorId: 'author_kwame_mensah',
    chapterNumber: 3,
    title: 'The Subterranean Observatory (Premium Chapter)',
    wordCount: 710,
    isPremium: true,
    tokenPrice: 60,
    status: 'published',
    content: `Beneath the basalt escarpment, a spiral stair cut into living rock descended into the coolness of an artesian cavern. Torchlight danced across vaulted ceilings painted in lapis and ochre with star charts predating the foundation of Timbuktu by a millennium.

In the center of the chamber, a narrow shaft pierced forty cubits straight through the mountain peak above, allowing a single beam of zenith starlight to fall upon a circular marble basin fed by an underground spring.

Idris placed the astrolabe upon the bronze pedestal beside the basin. Instantly, the notches of the meteoritic rete cast a shadow-map across the engraved marble floor, illuminating seven subterranean aquifers stretching from the Niger bend to Lake Chad—enough living water to sustain a hundred cities through the coming century of drought. Sheikh Mahmoud had not left him a treasure of gold, but the key to the survival of the Sahel.`,
  },
  {
    id: 'chap_accra_1',
    bookId: 'book_echoes_of_accra',
    authorId: 'author_kwame_mensah',
    chapterNumber: 1,
    title: 'Highlife at Dusk in Jamestown',
    wordCount: 620,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `Every Friday at five o’clock, Uncle Mensah carried his velvet-lined guitar case out to the terrazzo veranda overlooking the red-and-white striped lighthouse of Jamestown. Down below, fishermen were hauling painted wooden canoes onto the sand while the Atlantic surf threw plumes of salt spray into the golden light.

His granddaughter Esi sat on the low concrete balustrade with a notebook balanced on her knees, recording the chord progressions he had played with the Tempos Band in 1962.

"You young people think nostalgia is a sadness," Uncle Mensah chuckled, tightening the B-string until it rang clear and warm against the sea breeze. "No, my dear. In highlife, even when the lyrics weep for a departed friend, the horn section reminds your feet that you are still alive."`,
  },
  {
    id: 'chap_accra_2',
    bookId: 'book_echoes_of_accra',
    authorId: 'author_kwame_mensah',
    chapterNumber: 2,
    title: 'The Glasshouse at Aburi',
    wordCount: 590,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `Up in the cool mist of the Akuapem ridge, the royal palms stood like cathedral columns along the avenue of Aburi Botanical Gardens. After eleven years on different continents, Adwoa and Serwaa walked side by side beneath the nutmeg trees, their footsteps crunching softly on the red laterite gravel.

Inside the old Victorian glasshouse, rain began to patter against the panes, releasing the scent of damp fern and wild orchid. Wordlessly, Serwaa reached into her handbag and handed her sister the brass key to their mother’s house in Labone. All the unsaid grievances of a decade dissolved in the quiet warmth of the conservatory.`,
  },
  {
    id: 'chap_bronze_1',
    bookId: 'book_iron_and_ivory',
    authorId: 'author_amara_diop',
    chapterNumber: 1,
    title: 'The Geneva Freeport Inspection',
    wordCount: 690,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `The climate-controlled viewing room of the Geneva Freeport smelled of deionized air and polished steel. Dr. Mariama Sylla pulled on a pair of unbleached cotton gloves and leaned over the velvet-draped cradle where the Seventeenth-Century Queen Mother’s Plaque rested under halogen museum lamps.

Outside, February snow fell silently against the customs wire. Inside, three Swiss insurers and an attaché from the Ministry of Culture in Dakar watched her portable X-ray fluorescence spectrometer.

"The zinc-to-copper ratio matches the 1640 royal foundry within half a percent," the auction house director said smoothly. "Everything is in order for Friday’s diplomatic transfer."

Mariama did not look up from her eyepiece. Within the recessed fold of the Queen Mother’s coral collar, her magnification lens revealed a microscopic trace of titanium dioxide pigment—a synthetic compound not synthesized until 1916.

"The alloy is seventeenth-century," Mariama said, her voice calm and lethal in the quiet room. "Someone melted down three genuine ceremonial bells to cast this forgery less than six months ago. Which means the real plaque never left Europe."`,
  },
  {
    id: 'chap_bronze_2',
    bookId: 'book_iron_and_ivory',
    authorId: 'author_amara_diop',
    chapterNumber: 2,
    title: 'The Foundry Ledger of Antwerp (Premium Chapter)',
    wordCount: 730,
    isPremium: true,
    tokenPrice: 80,
    status: 'published',
    content: `Forty-eight hours before the Dakar summit, the night train from Brussels to Antwerp carried Mariama through frozen Flemish marshlands. In her coat pocket lay a microfiche copy of a 1958 maritime insurance claim linking the plaque’s last documented private collector to a metallurgical workshop along the Scheldt docks.

When she arrived at the warehouse in the old diamond district, the furnace was still warm. On the workbench sat silicone molds bearing the unmistakable negative relief of the royal court insignia—and beside them, a diplomatic pouch addressed to the very restitution committee chair who had hired her.`,
  },
  {
    id: 'chap_bronze_3',
    bookId: 'book_iron_and_ivory',
    authorId: 'author_amara_diop',
    chapterNumber: 3,
    title: 'Return to Gorée Horizon (Premium Chapter)',
    wordCount: 680,
    isPremium: true,
    tokenPrice: 80,
    status: 'published',
    content: `Under the rotunda of the Museum of Black Civilizations in Dakar, cameras flashed as the sealed crate arrived under gendarmes escort. Thanks to the Interpol warrant executed at dawn in Ostend, it was not the Antwerp replica that rested beneath the glass vitrine, but the true ancestral bronze—its warm patina glowing under the Atlantic sun after a hundred and thirty years in exile.`,
  },
  {
    id: 'chap_poetry_1',
    bookId: 'book_harmattan_sonnets',
    authorId: 'author_chimamanda_adeyemi',
    chapterNumber: 1,
    title: 'I. Harmattan Liturgy',
    wordCount: 320,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `In December the north wind arrives with its library of chalk,
coating the hibiscus leaf and the iron railing in pale silver.
We wake to a quieter city, our lips salted with Sahara dust,
learning again how distance travels without a passport.

O potter of the red earth, keep the water-jar cool in the courtyard;
let the lantern burn steady behind thereed curtain
until the monsoon returns with its green syllables.`,
  },
  {
    id: 'chap_poetry_2',
    bookId: 'book_harmattan_sonnets',
    authorId: 'author_chimamanda_adeyemi',
    chapterNumber: 2,
    title: 'II. Cartography of Indigo',
    wordCount: 310,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `At Abeokuta the dyers fold the cloth seven times in the clay pit,
binding cassava paste like constellations across the cotton.
When the fabric rises into the sun, first green as river moss,
then oxidizing into the deep midnight of an ocean trench—
so too does memory deepen only when exposed to the open air.`,
  },
  {
    id: 'chap_nok_1',
    bookId: 'book_covenant_of_stars',
    authorId: 'author_amara_diop',
    chapterNumber: 1,
    title: 'Harmonics of the Jos Plateau',
    wordCount: 610,
    isPremium: false,
    tokenPrice: 0,
    status: 'published',
    content: `From Orbital Station Nok-IV, the Jos Plateau glowed in the infrared spectrum like a lattice of copper veins. Chief Acoustic Archaeologist Kemi Danjuma adjusted the laser interferometer aimed at the excavation trench two hundred kilometers below.

Every terracotta head recovered from the alluvial tin mines shared an identical hollow acoustic cavity tuned to 432 hertz. When the orbital relay mirrored the waveform back toward the plateau, the ancient clay resonators answered in binary pulse.`,
  },
  {
    id: 'chap_nok_2',
    bookId: 'book_covenant_of_stars',
    authorId: 'author_amara_diop',
    chapterNumber: 2,
    title: 'The Terracotta Ephemeris (Premium Chapter)',
    wordCount: 640,
    isPremium: true,
    tokenPrice: 45,
    status: 'published',
    content: `Decoded across the station’s holographic projection table, the acoustic pulses resolved into a three-dimensional stellar map of the local cluster as it appeared in 500 BCE—marking a dormant Lagrange beacon still orbiting behind the far side of the Moon.`,
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    bookId: 'book_lagos_nocturne',
    userId: 'reader_demo_1',
    userName: 'Chidi Okonkwo',
    rating: 5,
    comment: 'Masterful prose. The atmospheric detail of 1970s Victoria Island and the architectural mystery kept me reading late into the night.',
  },
  {
    id: 'rev_2',
    bookId: 'book_sahara_chronicles',
    userId: 'reader_demo_2',
    userName: 'Fatima El-Mansoor',
    rating: 5,
    comment: 'Worth every LitToken! The historical depth of the Sankore astronomers feels like Umberto Eco set in the golden age of Timbuktu.',
  },
  {
    id: 'rev_3',
    bookId: 'book_iron_and_ivory',
    userId: 'reader_demo_3',
    userName: 'Jean-Luc Moreau',
    rating: 5,
    comment: 'A razor-sharp restitution thriller that understands both metallurgy and international art law.',
  },
];
