import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.ts';
import {
  users,
  userPreferences,
  trips,
  tripCities,
  itineraries,
  itineraryDays,
  itineraryActivities,
  budgetAllocations,
  expenses,
  cities,
  activities,
} from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const SEED_CITIES_CATALOG = [
  {
    id: 'city_goa',
    name: 'Goa',
    country: 'India',
    region: 'South Asia / West Coast',
    latitude: 15.2993,
    longitude: 74.124,
    costIndex: 1.0,
    popularityRating: 4.88,
    reviewCount: 4900,
    estimatedDailyBudget: 3200,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Sun-kissed Arabian Sea beaches, Portuguese colonial Latin Quarters, spice farms, and vibrant coastal shacks.',
    tagline: 'Palm-lined beaches, heritage Portuguese villas & coastal breeze',
    bestFor: 'Beachfront sunsets, water sports & heritage Latin quarters',
    tags: JSON.stringify(['Beaches', 'Culture', 'Food', 'Nightlife', 'Relaxed', 'Water Sports']),
    highlights: JSON.stringify(['Fontainhas Latin Quarter', 'Palolem Beach', 'Spice Plantations', 'Fort Aguada', 'Dudhsagar Falls']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_jaipur',
    name: 'Jaipur',
    country: 'India',
    region: 'South Asia / North India',
    latitude: 26.9124,
    longitude: 75.7873,
    costIndex: 0.95,
    popularityRating: 4.92,
    reviewCount: 5400,
    estimatedDailyBudget: 3400,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'The Pink City of Rajasthan, majestic hilltop forts, ornate royal palaces, and world-renowned handicraft bazaars.',
    tagline: 'Terracotta pink palaces, hilltop forts & royal Rajasthani heritage',
    bestFor: 'Amber Fort exploration, royal palaces & traditional Rajasthani thalis',
    tags: JSON.stringify(['History', 'Culture', 'Architecture', 'Photography', 'Food', 'Shopping']),
    highlights: JSON.stringify(['Amber Fort & Sheesh Mahal', 'Hawa Mahal (Palace of Winds)', 'City Palace', 'Nahargarh Sunset Point', 'Johari Bazaar']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_udaipur',
    name: 'Udaipur',
    country: 'India',
    region: 'South Asia / Rajasthan',
    latitude: 24.5854,
    longitude: 73.7125,
    costIndex: 1.05,
    popularityRating: 4.93,
    reviewCount: 4300,
    estimatedDailyBudget: 3600,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'The romantic City of Lakes, shimmering Pichola waters, white marble island palaces, and Rajput grandeur.',
    tagline: 'Glistening lake reflections, royal island palaces & sunset serenity',
    bestFor: 'Lake Pichola sunset boat cruises, heritage havelis & rooftop dining',
    tags: JSON.stringify(['Romantic', 'Culture', 'Architecture', 'History', 'Photography', 'Luxury']),
    highlights: JSON.stringify(['Lake Pichola Boat Cruise', 'City Palace Complex', 'Jag Mandir Island', 'Saheliyon Ki Bari', 'Bagore Ki Haveli']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_leh_ladakh',
    name: 'Leh-Ladakh',
    country: 'India',
    region: 'South Asia / Himalayas',
    latitude: 34.1526,
    longitude: 77.5771,
    costIndex: 1.15,
    popularityRating: 4.96,
    reviewCount: 3950,
    estimatedDailyBudget: 4200,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Dramatic high-altitude Tibetan plateau, crystal-clear Pangong Tso, high mountain passes, and ancient cliffside monasteries.',
    tagline: 'High-altitude moonscapes, turquoise glacial lakes & ancient monasteries',
    bestFor: 'Motorbike expeditions, stargazing, Tibetan monasteries & high passes',
    tags: JSON.stringify(['Mountains', 'Adventure', 'Nature', 'Spirituality', 'Photography', 'Trekking']),
    highlights: JSON.stringify(['Pangong Tso Lake', 'Khardung La Pass', 'Thiksey Monastery', 'Nubra Valley Sand Dunes', 'Magnetic Hill']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_kerala',
    name: 'Kerala Backwaters',
    country: 'India',
    region: 'South Asia / South India',
    latitude: 9.4981,
    longitude: 76.3388,
    costIndex: 0.95,
    popularityRating: 4.91,
    reviewCount: 4700,
    estimatedDailyBudget: 3500,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Tranquil emerald canal networks, traditional thatched-roof luxury houseboats, coconut groves, and Ayurvedic wellness.',
    tagline: 'Palm-fringed lagoons, luxury houseboat cruises & Ayurvedic wellness',
    bestFor: 'Alleppey houseboat stays, authentic banana leaf sadhya & rejuvenating spas',
    tags: JSON.stringify(['Nature', 'Relaxed', 'Wellness', 'Food', 'Culture', 'Photography']),
    highlights: JSON.stringify(['Alleppey Houseboat Lagoon', 'Kumarakom Bird Sanctuary', 'Marari Beach', 'Ayurvedic Spas', 'Vembanad Lake']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_manali',
    name: 'Manali',
    country: 'India',
    region: 'South Asia / Himachal Pradesh',
    latitude: 32.2432,
    longitude: 77.1892,
    costIndex: 0.85,
    popularityRating: 4.88,
    reviewCount: 3600,
    estimatedDailyBudget: 2800,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Snow-dusted Pir Panjal peaks, cedar forests, hot sulphur springs, adventure passes, and bohemian cafes in Old Manali.',
    tagline: 'Himalayan peaks, alpine meadows & pine valley serenity',
    bestFor: 'Solang Valley adventure, Atal Tunnel drives & pine forest trails',
    tags: JSON.stringify(['Mountains', 'Adventure', 'Nature', 'Photography', 'Wellness', 'Temples']),
    highlights: JSON.stringify(['Solang Valley Snow Point', 'Atal Tunnel & Sissu', 'Hadimba Devi Ancient Temple', 'Old Manali Cafes', 'Jogini Waterfalls']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_mumbai',
    name: 'Mumbai',
    country: 'India',
    region: 'South Asia / West Coast',
    latitude: 19.076,
    longitude: 72.8777,
    costIndex: 1.25,
    popularityRating: 4.84,
    reviewCount: 5600,
    estimatedDailyBudget: 4500,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'The vibrant City of Dreams, historic Victorian architecture, bustling coastal promenades, Bollywood, and legendary street food.',
    tagline: 'Colonial heritage icons, Marine Drive sunsets & unmatched urban pulse',
    bestFor: 'Marine Drive promenades, Gateway of India & street food trails',
    tags: JSON.stringify(['Culture', 'Food', 'History', 'Nightlife', 'Architecture', 'Shopping']),
    highlights: JSON.stringify(['Gateway of India', 'Marine Drive Queen’s Necklace', 'Elephanta Caves', 'Bandra Street Murals', 'Colaba Causeway']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_varanasi',
    name: 'Varanasi',
    country: 'India',
    region: 'South Asia / Ganges Valley',
    latitude: 25.3176,
    longitude: 82.9739,
    costIndex: 0.75,
    popularityRating: 4.93,
    reviewCount: 5100,
    estimatedDailyBudget: 2400,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'One of the world’s oldest continuously inhabited cities, sacred Ganga riverfront ghats, evening Aarti, and Banarasi silk weaving.',
    tagline: 'Timeless sacred ghats, evening Ganga Aarti & spiritual awakening',
    bestFor: 'Dashashwamedh Ghat Aarti by boat, dawn rowboat rides & Banarasi silk trails',
    tags: JSON.stringify(['Spirituality', 'Culture', 'History', 'Photography', 'Food']),
    highlights: JSON.stringify(['Dashashwamedh Ghat Evening Aarti', 'Subah-e-Banaras Morning Boat Tour', 'Kashi Vishwanath Corridor', 'Sarnath Buddhist Stupa', 'Assi Ghat']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_agra',
    name: 'Agra',
    country: 'India',
    region: 'South Asia / North India',
    latitude: 27.1767,
    longitude: 78.0081,
    costIndex: 0.85,
    popularityRating: 4.9,
    reviewCount: 6100,
    estimatedDailyBudget: 2900,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Home of the timeless white marble Taj Mahal, red sandstone Mughal palaces, and centuries of imperial grandeur.',
    tagline: 'Taj Mahal marble majesty, Mughal fortresses & imperial legacy',
    bestFor: 'Taj Mahal sunrise viewing, Agra Fort discovery & royal Mughlai dining',
    tags: JSON.stringify(['History', 'Architecture', 'Culture', 'Photography', 'Romantic']),
    highlights: JSON.stringify(['Taj Mahal at Dawn', 'Agra Fort Red Palace', 'Mehtab Bagh Twilight View', 'Fatehpur Sikri', 'Kinari Bazaar']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_rishikesh',
    name: 'Rishikesh',
    country: 'India',
    region: 'South Asia / Himalayan Foothills',
    latitude: 30.0869,
    longitude: 78.2676,
    costIndex: 0.8,
    popularityRating: 4.92,
    reviewCount: 4400,
    estimatedDailyBudget: 2600,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'The Yoga Capital of the World along the emerald Ganga, exhilarating whitewater rapids, cliffside cafes, and soul-stirring Aarti.',
    tagline: 'Himalayan river rapids, sacred ashrams & global yoga sanctuary',
    bestFor: 'Whitewater rafting at Shivpuri, yoga ashrams & riverside evening Aarti',
    tags: JSON.stringify(['Adventure', 'Spirituality', 'Nature', 'Wellness', 'Mountains', 'Food']),
    highlights: JSON.stringify(['Shivpuri Whitewater Rafting', 'Parmarth Niketan Ganga Aarti', 'The Beatles Ashram', 'Neer Garh Waterfall', 'Triveni Ghat']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_ahmedabad',
    name: 'Ahmedabad',
    country: 'India',
    region: 'South Asia / Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    costIndex: 0.85,
    popularityRating: 4.78,
    reviewCount: 3100,
    estimatedDailyBudget: 2400,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'India’s first UNESCO World Heritage City, exquisite Solanki stepwells, Mahatma Gandhi’s historic ashram, and bustling midnight street food.',
    tagline: 'Heritage stepwells, Gandhian history & legendary Gujarati gastronomy',
    bestFor: 'Heritage walking tours, Adalaj Stepwell & Manek Chowk night market',
    tags: JSON.stringify(['Culture', 'History', 'Architecture', 'Food', 'Photography']),
    highlights: JSON.stringify(['Sabarmati Ashram', 'Adalaj Stepwell', 'Manek Chowk Night Market', 'Sidi Saiyyed Mosque', 'Riverfront Promenade']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_delhi',
    name: 'Delhi',
    country: 'India',
    region: 'South Asia / Capital',
    latitude: 28.6139,
    longitude: 77.209,
    costIndex: 1.05,
    popularityRating: 4.8,
    reviewCount: 5800,
    estimatedDailyBudget: 3500,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'India’s historic capital featuring UNESCO monuments, Mughal gardens, bustling Old Delhi bazaars, and renowned North Indian gastronomy.',
    tagline: 'Mughal monuments, heritage bazaars & legendary culinary culture',
    bestFor: 'Mughal architecture, Old Delhi food walks & world heritage sites',
    tags: JSON.stringify(['History', 'Culture', 'Food', 'Architecture', 'Shopping']),
    highlights: JSON.stringify(['Qutub Minar', 'Humayun’s Tomb', 'Red Fort & Chandni Chowk', 'Akshardham Temple', 'India Gate']),
    isDomestic: true,
    isFeatured: true,
  },
  {
    id: 'city_shimla',
    name: 'Shimla',
    country: 'India',
    region: 'South Asia / Himachal',
    latitude: 31.1048,
    longitude: 77.1734,
    costIndex: 0.9,
    popularityRating: 4.82,
    reviewCount: 3200,
    estimatedDailyBudget: 2900,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'The Queen of Hills with historic British colonial architecture, pine-covered slopes, the Ridge promenade, and UNESCO mountain toy train.',
    tagline: 'Colonial hill charm, pine-fringed ridges & historic toy train',
    bestFor: 'The Ridge strolls, Jakhoo Temple ropeway & heritage architecture',
    tags: JSON.stringify(['Mountains', 'History', 'Nature', 'Photography', 'Temples', 'Relaxed']),
    highlights: JSON.stringify(['The Ridge & Mall Road', 'Jakhoo Temple Ropeway', 'Viceregal Lodge', 'Christ Church', 'Kalka Toy Train']),
    isDomestic: true,
    isFeatured: true,
  },
  // Top International Destinations
  {
    id: 'city_tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    latitude: 35.6762,
    longitude: 139.6503,
    costIndex: 2.4,
    popularityRating: 4.92,
    reviewCount: 6200,
    estimatedDailyBudget: 9200,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Futuristic neon skylines seamlessly blending with ancient Shinto shrines, tranquil gardens, and world-class Michelin dining.',
    tagline: 'Neon cityscapes, tranquil shrines & unparalleled gastronomy',
    bestFor: 'Culinary perfection, vibrant street fashion & futuristic technology',
    tags: JSON.stringify(['Food', 'Culture', 'Architecture', 'Nightlife', 'Shopping', 'Photography']),
    highlights: JSON.stringify(['Shibuya Crossing', 'Senso-ji Temple', 'Shinjuku Gyoen Garden', 'teamLab Planets', 'Meiji Shrine']),
    isDomestic: false,
    isFeatured: true,
  },
  {
    id: 'city_paris',
    name: 'Paris',
    country: 'France',
    region: 'Western Europe',
    latitude: 48.8566,
    longitude: 2.3522,
    costIndex: 2.5,
    popularityRating: 4.9,
    reviewCount: 6800,
    estimatedDailyBudget: 8500,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'The City of Light, world-famous museums, romantic Seine boulevards, Haussmann architecture, and legendary pastry shops.',
    tagline: 'Art sanctuaries, river Seine strolls & cafe culture',
    bestFor: 'World-class museums, culinary discovery & romantic sunset walks',
    tags: JSON.stringify(['Culture', 'Food', 'History', 'Architecture', 'Romantic', 'Photography']),
    highlights: JSON.stringify(['Louvre Museum', 'Eiffel Tower at Twilight', 'Montmartre Artists Quarter', 'Seine River Cruise', 'Musée d’Orsay']),
    isDomestic: false,
    isFeatured: true,
  },
  {
    id: 'city_bali',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    latitude: -8.3405,
    longitude: 115.092,
    costIndex: 1.1,
    popularityRating: 4.89,
    reviewCount: 4200,
    estimatedDailyBudget: 4500,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Emerald terraced rice fields, coastal sea temples, holistic yoga sanctuaries, and legendary Indian Ocean sunsets.',
    tagline: 'Terraced paddies, sacred water temples & tropical wellness',
    bestFor: 'Tropical relaxation, temple sanctuaries & sunset beaches',
    tags: JSON.stringify(['Nature', 'Beaches', 'Spirituality', 'Relaxed', 'Food', 'Photography']),
    highlights: JSON.stringify(['Ubud Rice Terraces', 'Uluwatu Sunset Temple', 'Canggu Coastal Cafes', 'Mount Batur Sunrise', 'Tirta Empul Water Temple']),
    isDomestic: false,
    isFeatured: true,
  },
  {
    id: 'city_dubai',
    name: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    latitude: 25.2048,
    longitude: 55.2708,
    costIndex: 2.8,
    popularityRating: 4.85,
    reviewCount: 4600,
    estimatedDailyBudget: 12000,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Ultra-modern architectural marvels, desert dune safaris, luxury shopping hubs, and sparkling marina promenades.',
    tagline: 'Skyline icons, golden desert dunes & waterfront dining',
    bestFor: 'Architectural grandeur, desert stargazing & high-end dining',
    tags: JSON.stringify(['Luxury', 'Architecture', 'Adventure', 'Shopping', 'Food']),
    highlights: JSON.stringify(['Burj Khalifa Observation Deck', 'Desert Dunes Safari', 'Dubai Marina Walk', 'Museum of the Future', 'Palm Jumeirah']),
    isDomestic: false,
    isFeatured: true,
  },
  {
    id: 'city_swiss_alps',
    name: 'Interlaken & Alps',
    country: 'Switzerland',
    region: 'Western Europe',
    latitude: 46.6863,
    longitude: 7.8632,
    costIndex: 3.1,
    popularityRating: 4.94,
    reviewCount: 3400,
    estimatedDailyBudget: 11500,
    currency: 'INR',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Towering alpine peaks, turquoise glacial lakes, high-altitude scenic railways, and storybook Swiss meadows.',
    tagline: 'Glacial summits, alpine trails & emerald mountain lakes',
    bestFor: 'High-altitude hiking, scenic rail journeys & paragliding',
    tags: JSON.stringify(['Mountains', 'Adventure', 'Nature', 'Photography', 'Luxury']),
    highlights: JSON.stringify(['Jungfraujoch Top of Europe', 'Lake Brienz Cruise', 'Grindelwald First Cliff Walk', 'Lauterbrunnen Valley', 'Harder Kulm']),
    isDomestic: false,
    isFeatured: true,
  },
];

export const SEED_ACTIVITIES_CATALOG = [
  // Goa Activities
  {
    cityId: 'city_goa',
    cityName: 'Goa',
    title: 'Fontainhas Portuguese Latin Quarter Heritage Walk',
    category: 'Culture',
    description: 'Stroll through narrow pastel-colored alleyways, terracotta-tiled heritage villas, art galleries, and historic bakeries in Panaji.',
    estimatedCost: 600,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.9,
    reviewCount: 840,
    location: 'Fontainhas, Panaji, Goa',
    latitude: 15.4989,
    longitude: 73.8278,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'Photography', 'Architecture', 'Heritage']),
    bestTime: 'Morning 8:30 AM or Twilight',
  },
  {
    cityId: 'city_goa',
    cityName: 'Goa',
    title: 'Grande Island Scuba Diving & Dolphin Cruise',
    category: 'Adventure',
    description: 'Crystal-clear underwater marine reef diving accompanied by PADI instructors, shipwreck exploration, and coastal dolphin spotting.',
    estimatedCost: 2800,
    currency: 'INR',
    durationMinutes: 240,
    rating: 4.8,
    reviewCount: 1120,
    location: 'Grande Island / Sinquerim Jetty, Goa',
    latitude: 15.3522,
    longitude: 73.7667,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Adventure', 'Water Sports', 'Ocean', 'Marine Life']),
    bestTime: 'Morning 7:00 AM Departure',
  },
  {
    cityId: 'city_goa',
    cityName: 'Goa',
    title: 'Authentic Goan Seafood Thali & Feni at Martin’s Corner',
    category: 'Food',
    description: 'Iconic South Goan culinary landmark serving butter-garlic crab, Kingfish rechado, prawn balchão, and traditional Bebinca dessert.',
    estimatedCost: 1200,
    currency: 'INR',
    durationMinutes: 90,
    rating: 4.8,
    reviewCount: 2300,
    location: 'Betalbatim, South Goa',
    latitude: 15.2917,
    longitude: 73.9189,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Food', 'Seafood', 'Authentic', 'Local Vibe']),
    bestTime: 'Lunch 1:00 PM or Dinner',
  },
  {
    cityId: 'city_goa',
    cityName: 'Goa',
    title: 'Sunset Kayaking in Sal River Mangroves',
    category: 'Nature',
    description: 'Glide gently through peaceful mangrove channels, lotus ponds, and calm backwater sanctuaries as the sun sinks into the Arabian horizon.',
    estimatedCost: 950,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.9,
    reviewCount: 520,
    location: 'Sal Backwaters, Cavelossim, Goa',
    latitude: 15.1764,
    longitude: 73.9482,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Nature', 'Kayaking', 'Sunset', 'Relaxation']),
    bestTime: 'Sunset 4:30 PM',
  },

  // Jaipur Activities
  {
    cityId: 'city_jaipur',
    cityName: 'Jaipur',
    title: 'Amber Fort & Sheesh Mahal Royal Expedition',
    category: 'Culture',
    description: 'Explore the majestic 16th-century hilltop Rajput fort, intricate mirror-mosaic palace of Sheesh Mahal, and grand courtyards.',
    estimatedCost: 500,
    currency: 'INR',
    durationMinutes: 150,
    rating: 4.9,
    reviewCount: 3400,
    location: 'Devisinghpura, Amer, Jaipur',
    latitude: 26.9855,
    longitude: 75.8513,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'History', 'Architecture', 'UNESCO']),
    bestTime: 'Morning 9:00 AM',
  },
  {
    cityId: 'city_jaipur',
    cityName: 'Jaipur',
    title: 'Hot Air Balloon Safari over Aravalli Hills & Desert Forts',
    category: 'Adventure',
    description: 'Drift high above historic palaces, rugged mountain fortresses, and traditional Rajasthani hamlets during golden morning light.',
    estimatedCost: 8500,
    currency: 'INR',
    durationMinutes: 180,
    rating: 4.95,
    reviewCount: 780,
    location: 'Amber / Samode Valley, Jaipur',
    latitude: 27.012,
    longitude: 75.821,
    imageUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Adventure', 'Views', 'Photography', 'Sunrise']),
    bestTime: 'Sunrise 5:30 AM',
  },
  {
    cityId: 'city_jaipur',
    cityName: 'Jaipur',
    title: 'Royal Dal Baati Churma & Folk Night at Chokhi Dhani',
    category: 'Food',
    description: 'Immersive Rajasthani village experience with pure ghee Dal Baati Churma, Ker Sangri, Kalbeliya folk dances, and puppet theatre.',
    estimatedCost: 1100,
    currency: 'INR',
    durationMinutes: 180,
    rating: 4.8,
    reviewCount: 4200,
    location: 'Tonk Road, Jaipur',
    latitude: 26.7663,
    longitude: 75.8362,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Food', 'Culture', 'Traditional', 'Folk Music']),
    bestTime: 'Evening 6:30 PM',
  },
  {
    cityId: 'city_jaipur',
    cityName: 'Jaipur',
    title: 'Nahargarh Fort Sunset Skyline Walk & Padao Lounge',
    category: 'Sightseeing',
    description: 'Watch the entire Pink City bathe in amber dusk from the ramparts of Nahargarh Fort perched high upon the Aravalli ridge.',
    estimatedCost: 200,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.9,
    reviewCount: 2900,
    location: 'Aravalli Hills, Jaipur',
    latitude: 26.9378,
    longitude: 75.8156,
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Sightseeing', 'Sunset', 'City Views', 'Photography']),
    bestTime: 'Sunset 5:00 PM',
  },

  // Udaipur Activities
  {
    cityId: 'city_udaipur',
    cityName: 'Udaipur',
    title: 'Sunset Boat Cruise on Lake Pichola to Jag Mandir',
    category: 'Sightseeing',
    description: 'Cruise past the illuminated City Palace and vintage ghats, disembarking at the 17th-century marble water palace of Jag Mandir.',
    estimatedCost: 900,
    currency: 'INR',
    durationMinutes: 75,
    rating: 4.95,
    reviewCount: 2600,
    location: 'Rameshwar Ghat, City Palace, Udaipur',
    latitude: 24.5764,
    longitude: 73.6835,
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Sightseeing', 'Romantic', 'Lake', 'Palace', 'Sunset']),
    bestTime: 'Sunset 5:15 PM',
  },
  {
    cityId: 'city_udaipur',
    cityName: 'Udaipur',
    title: 'Grand City Palace Complex & Crystal Gallery Tour',
    category: 'Culture',
    description: 'Wander through peacock courtyards, stained-glass balconies, royal armouries, and the world’s single largest private crystal collection.',
    estimatedCost: 450,
    currency: 'INR',
    durationMinutes: 150,
    rating: 4.9,
    reviewCount: 3100,
    location: 'Old City, Udaipur',
    latitude: 24.5762,
    longitude: 73.6837,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'Architecture', 'Heritage', 'Royal']),
    bestTime: 'Morning 9:30 AM',
  },
  {
    cityId: 'city_udaipur',
    cityName: 'Udaipur',
    title: 'Mewari Candlelight Dining at Ambrai Ghat',
    category: 'Food',
    description: 'Dine right at the water’s edge with unobstructed panoramic views of the illuminated City Palace facade and vintage lake ghats.',
    estimatedCost: 1600,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.9,
    reviewCount: 1850,
    location: 'Ambrai Ghat, Chandpole, Udaipur',
    latitude: 24.5798,
    longitude: 73.6806,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Food', 'Romantic', 'Lake View', 'Mewari Cuisine']),
    bestTime: 'Dinner 8:00 PM',
  },

  // Leh-Ladakh Activities
  {
    cityId: 'city_leh_ladakh',
    cityName: 'Leh-Ladakh',
    title: 'Pangong Tso Crystal High Altitude Excursion & Stargazing',
    category: 'Nature',
    description: 'Travel through Chang La pass to witness the world-famous 134km endorheic lake change colors from turquoise to deep azure amidst Himalayan peaks.',
    estimatedCost: 3500,
    currency: 'INR',
    durationMinutes: 360,
    rating: 4.98,
    reviewCount: 2200,
    location: 'Pangong Tso, Ladakh',
    latitude: 33.7595,
    longitude: 78.6674,
    imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Nature', 'High Altitude', 'Stargazing', 'Photography', 'Adventure']),
    bestTime: 'Full Day & Twilight',
  },
  {
    cityId: 'city_leh_ladakh',
    cityName: 'Leh-Ladakh',
    title: 'Khardung La High Pass Motorbike Safari (17,982 ft)',
    category: 'Adventure',
    description: 'Conquer one of the highest motorable mountain passes on Earth on a Royal Enfield bullet with panoramic Karakoram mountain vistas.',
    estimatedCost: 2800,
    currency: 'INR',
    durationMinutes: 240,
    rating: 4.9,
    reviewCount: 1650,
    location: 'Khardung La Pass, Ladakh',
    latitude: 34.2787,
    longitude: 77.6047,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Adventure', 'Motorbiking', 'High Mountain Pass', 'Snow']),
    bestTime: 'Morning 9:00 AM',
  },
  {
    cityId: 'city_leh_ladakh',
    cityName: 'Leh-Ladakh',
    title: 'Sunrise Chanting at Thiksey Tibetan Monastery',
    category: 'Culture',
    description: 'Participate in peaceful morning prayers with maroon-robed monks, resonant gong bells, and panoramic views of the Indus Valley.',
    estimatedCost: 100,
    currency: 'INR',
    durationMinutes: 90,
    rating: 4.95,
    reviewCount: 1400,
    location: 'Thiksey, Leh District',
    latitude: 34.0583,
    longitude: 77.6667,
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'Spirituality', 'Monastery', 'Sunrise']),
    bestTime: 'Dawn 6:00 AM',
  },

  // Kerala Activities
  {
    cityId: 'city_kerala',
    cityName: 'Kerala Backwaters',
    title: 'Overnight Luxury Houseboat Cruise through Alleppey Lagoons',
    category: 'Relaxation',
    description: 'Glide quietly on a traditional Kettuvallam wooden houseboat with private chef serving fresh Karimeen fish fry and coconut curries.',
    estimatedCost: 6500,
    currency: 'INR',
    durationMinutes: 360,
    rating: 4.95,
    reviewCount: 3100,
    location: 'Punnamada Jetty, Alleppey, Kerala',
    latitude: 9.5083,
    longitude: 76.3532,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Relaxation', 'Houseboat', 'Waterways', 'Nature', 'Romantic']),
    bestTime: 'Check-in 12:00 PM',
  },
  {
    cityId: 'city_kerala',
    cityName: 'Kerala Backwaters',
    title: 'Authentic 24-Item Malabar Sadya on Fresh Banana Leaf',
    category: 'Food',
    description: 'Culinary feast featuring red matta rice, avial, sambar, olan, thoran, ginger curry, crisp papadams, and golden payasam.',
    estimatedCost: 550,
    currency: 'INR',
    durationMinutes: 75,
    rating: 4.9,
    reviewCount: 1750,
    location: 'Alleppey Town / Kumarakom',
    latitude: 9.4981,
    longitude: 76.3388,
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Food', 'Authentic', 'Vegetarian', 'Cultural']),
    bestTime: 'Lunch 12:30 PM',
  },
  {
    cityId: 'city_kerala',
    cityName: 'Kerala Backwaters',
    title: 'Ayurvedic Abhyanga & Shirodhara Rejuvenation Session',
    category: 'Relaxation',
    description: 'Therapeutic warm medicated herbal oil full-body massage followed by continuous warm oil flow onto the forehead chakra for deep peace.',
    estimatedCost: 2200,
    currency: 'INR',
    durationMinutes: 90,
    rating: 4.9,
    reviewCount: 950,
    location: 'Kumarakom Wellness Sanctuary',
    latitude: 9.6176,
    longitude: 76.4302,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Wellness', 'Ayurveda', 'Spa', 'Holistic']),
    bestTime: 'Morning 10:00 AM or Afternoon',
  },

  // Varanasi Activities
  {
    cityId: 'city_varanasi',
    cityName: 'Varanasi',
    title: 'Grand Evening Ganga Aarti Ceremony by Wooden Rowboat',
    category: 'Culture',
    description: 'Witness high priests perform synchronized brass lamp rituals, conch horn melodies, and floating earthen oil diyas at Dashashwamedh Ghat.',
    estimatedCost: 400,
    currency: 'INR',
    durationMinutes: 90,
    rating: 4.97,
    reviewCount: 4100,
    location: 'Dashashwamedh Ghat, Varanasi',
    latitude: 25.3076,
    longitude: 83.0104,
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'Spirituality', 'Ganges', 'Ceremony', 'Historic']),
    bestTime: 'Evening 6:00 PM',
  },
  {
    cityId: 'city_varanasi',
    cityName: 'Varanasi',
    title: 'Subah-e-Banaras Dawn Boat Ride across Ancient Ghats',
    category: 'Sightseeing',
    description: 'Drift along the misty riverfront as priests chant morning mantras, bathers greet the golden rising sun, and temple bells ring.',
    estimatedCost: 500,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.95,
    reviewCount: 2800,
    location: 'Assi Ghat to Manikarnika Ghat',
    latitude: 25.2896,
    longitude: 83.0064,
    imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Sightseeing', 'Sunrise', 'Ghats', 'Spirituality', 'Photography']),
    bestTime: 'Dawn 5:30 AM',
  },
  {
    cityId: 'city_varanasi',
    cityName: 'Varanasi',
    title: 'Banarasi Street Food Trail: Kachori, Blue Lassi & Meetha Paan',
    category: 'Food',
    description: 'Taste authentic hot hing kachoris with aloo sabzi at Ram Bhandar, thick clay-cup pomegranate lassi, and royal silver-foiled Banarasi paan.',
    estimatedCost: 350,
    currency: 'INR',
    durationMinutes: 90,
    rating: 4.85,
    reviewCount: 2200,
    location: 'Thatheri Bazaar & Vishwanath Gali',
    latitude: 25.3109,
    longitude: 83.0107,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Food', 'Street Food', 'Traditional', 'Snacks']),
    bestTime: 'Morning 8:00 AM or Evening',
  },

  // Agra Activities
  {
    cityId: 'city_agra',
    cityName: 'Agra',
    title: 'Taj Mahal Sunrise Viewing & Architectural Masterclass',
    category: 'Culture',
    description: 'Experience the pristine ivory-white marble monument bathed in soft morning rose light before crowds arrive, admiring pietra dura inlays.',
    estimatedCost: 600,
    currency: 'INR',
    durationMinutes: 180,
    rating: 4.98,
    reviewCount: 5900,
    location: 'Dharmapuri, Forest Colony, Tajganj, Agra',
    latitude: 27.1751,
    longitude: 78.0421,
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'History', 'UNESCO', 'Architecture', 'Sunrise']),
    bestTime: 'Dawn 5:45 AM',
  },
  {
    cityId: 'city_agra',
    cityName: 'Agra',
    title: 'Mehtab Bagh Twilight Taj Reflection across Yamuna River',
    category: 'Sightseeing',
    description: 'Charbagh Mughal garden providing breathtaking, symmetrical sunset silhouette reflections of the Taj Mahal without crowds.',
    estimatedCost: 250,
    currency: 'INR',
    durationMinutes: 90,
    rating: 4.85,
    reviewCount: 1600,
    location: 'Nagla Devjit, Agra',
    latitude: 27.1802,
    longitude: 78.0416,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Sightseeing', 'Sunset', 'Gardens', 'Photography']),
    bestTime: 'Sunset 5:00 PM',
  },

  // Rishikesh Activities
  {
    cityId: 'city_rishikesh',
    cityName: 'Rishikesh',
    title: 'Grade-III Whitewater River Rafting at Shivpuri',
    category: 'Adventure',
    description: 'Navigate thrilling Himalayan rapids like Roller Coaster, Golf Course, and Club House across 16km of the emerald Ganga river.',
    estimatedCost: 1200,
    currency: 'INR',
    durationMinutes: 180,
    rating: 4.92,
    reviewCount: 2900,
    location: 'Shivpuri to Nim Beach, Rishikesh',
    latitude: 30.1362,
    longitude: 78.3887,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Adventure', 'Water Sports', 'River Rafting', 'Himalayas']),
    bestTime: 'Morning 9:00 AM or 1:30 PM',
  },
  {
    cityId: 'city_rishikesh',
    cityName: 'Rishikesh',
    title: 'The Beatles Ashram (Chaurasi Kutia) Meditation & Graffiti Walk',
    category: 'Culture',
    description: 'Walk through historic stone meditation igloos, lush Rajaji forest trails, and vibrant spiritual street art where The Beatles composed the White Album.',
    estimatedCost: 200,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.88,
    reviewCount: 1800,
    location: 'Swarg Ashram, Rishikesh',
    latitude: 30.1136,
    longitude: 78.3142,
    imageUrl: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'Music', 'History', 'Nature', 'Art']),
    bestTime: 'Morning 10:00 AM',
  },
  {
    cityId: 'city_rishikesh',
    cityName: 'Rishikesh',
    title: 'Riverside Sunset Yoga & Sound Bowl Healing at Parmarth Niketan',
    category: 'Relaxation',
    description: 'Restorative Hatha yoga session accompanied by Tibetan singing bowls overlooking the sacred river, followed by the evening Ganga Aarti.',
    estimatedCost: 600,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.95,
    reviewCount: 1550,
    location: 'Parmarth Niketan Ghat, Rishikesh',
    latitude: 30.1192,
    longitude: 78.3117,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Wellness', 'Yoga', 'Meditation', 'Spirituality']),
    bestTime: 'Evening 4:30 PM',
  },

  // Mumbai Activities
  {
    cityId: 'city_mumbai',
    cityName: 'Mumbai',
    title: 'Gateway of India & South Mumbai Heritage Architecture Walk',
    category: 'Culture',
    description: 'Explore the basalt arch of Gateway of India, Taj Mahal Palace Hotel, Victorian Gothic Bombay High Court, and art deco cinema halls.',
    estimatedCost: 300,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.85,
    reviewCount: 3800,
    location: 'Apollo Bunder, Colaba, Mumbai',
    latitude: 18.922,
    longitude: 72.8347,
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'History', 'Architecture', 'Heritage']),
    bestTime: 'Morning 9:00 AM',
  },
  {
    cityId: 'city_mumbai',
    cityName: 'Mumbai',
    title: 'Legendary Mumbai Street Food Safari: Chowpatty Chaat & Irani Chai',
    category: 'Food',
    description: 'Taste authentic crispy Sev Puri, spicy Pav Bhaji at Girgaon Chowpatty, Vada Pav near CST, and fresh Maska Bun with Irani Chai.',
    estimatedCost: 500,
    currency: 'INR',
    durationMinutes: 120,
    rating: 4.9,
    reviewCount: 2900,
    location: 'Girgaon Chowpatty & Fort, Mumbai',
    latitude: 18.9543,
    longitude: 72.8152,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Food', 'Street Food', 'Authentic', 'Chaat']),
    bestTime: 'Evening 5:30 PM',
  },
  {
    cityId: 'city_mumbai',
    cityName: 'Mumbai',
    title: 'Elephanta Caves UNESCO Rock-Cut Temple Boat Excursion',
    category: 'Culture',
    description: 'Take a scenic ferry across Mumbai Harbour to 5th-century rock-cut basalt cave temples dedicated to Lord Shiva with colossal Trimurti sculptures.',
    estimatedCost: 750,
    currency: 'INR',
    durationMinutes: 240,
    rating: 4.8,
    reviewCount: 1950,
    location: 'Elephanta Island, Mumbai Harbour',
    latitude: 18.9633,
    longitude: 72.9315,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    tags: JSON.stringify(['Culture', 'UNESCO', 'History', 'Boat Excursion']),
    bestTime: 'Morning 9:30 AM',
  },
];

export async function seedCatalogCitiesAndActivities(db: any) {
  try {
    const existingCities = await db.select().from(cities);
    const existingCount = existingCities.length;

    // Idempotently seed every catalog city so missing international rows are repaired.
    if (existingCount < SEED_CITIES_CATALOG.length) {
      console.log(`[Seed] Seeding ${SEED_CITIES_CATALOG.length} catalog destinations (Indian domestic & international)...`);
    }
    for (const city of SEED_CITIES_CATALOG) {
      const [found] = await db.select().from(cities).where(eq(cities.id, city.id));
      if (!found) {
        await db.insert(cities).values(city);
      } else {
        await db.update(cities).set(city).where(eq(cities.id, city.id));
      }
    }
    console.log('[Seed] Catalog cities successfully seeded.');

    const existingActivities = await db.select().from(activities);
    if (existingActivities.length < SEED_ACTIVITIES_CATALOG.length) {
      console.log(`[Seed] Seeding ${SEED_ACTIVITIES_CATALOG.length} curated activities, food spots & cultural adventures...`);
      for (let i = 0; i < SEED_ACTIVITIES_CATALOG.length; i++) {
        const act = SEED_ACTIVITIES_CATALOG[i];
        const actId = `seed_act_${act.cityId}_${i + 1}`;
        const [found] = await db.select().from(activities).where(eq(activities.id, actId));
        if (!found) {
          await db.insert(activities).values({
            id: actId,
            ...act,
          });
        }
      }
      console.log('[Seed] Catalog activities successfully seeded.');
    }
  } catch (err) {
    console.error('[Seed:Warning] Could not seed catalog cities and activities:', err);
  }
}

export async function seedDemoData() {
  const db = await getDb();

  // First seed catalog cities and activities
  await seedCatalogCitiesAndActivities(db);

  const demoEmail = 'explorer@globetrotter.io';

  // Check if demo user already exists
  let [demoUser] = await db.select().from(users).where(eq(users.email, demoEmail));

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('globetrotter2026', salt);
    const userId = 'usr_demo_explorer';

    [demoUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: demoEmail,
        passwordHash,
        name: 'Aarav Mehta',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        preferredCurrency: 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Preferences
    await db.insert(userPreferences).values({
      id: 'pref_demo_explorer',
      userId: demoUser.id,
      interests: JSON.stringify(['Culture', 'Food', 'Mountains', 'Heritage', 'Photography']),
      travelStyle: 'Balanced',
      travelPace: 'Moderate',
      budgetStyle: 'Mid-range',
      companion: 'Friends',
      personality: 'Explorer',
      currency: 'INR',
      updatedAt: new Date(),
    });
  }

  // Also seed Daksh Khamar account if not existing
  const dakshEmail = 'dakshkhamar22@gmail.com';
  let [dakshUser] = await db.select().from(users).where(eq(users.email, dakshEmail));
  if (!dakshUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Daksh123@', salt);
    const dakshId = 'usr_daksh_khamar';

    [dakshUser] = await db
      .insert(users)
      .values({
        id: dakshId,
        email: dakshEmail,
        passwordHash,
        name: 'Daksh Khamar',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daksh%20Khamar',
        preferredCurrency: 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(userPreferences).values({
      id: 'pref_daksh_khamar',
      userId: dakshUser.id,
      interests: JSON.stringify(['Heritage', 'Food', 'Adventure', 'Photography']),
      travelStyle: 'Balanced',
      travelPace: 'Moderate',
      budgetStyle: 'Mid-range',
      companion: 'Friends',
      personality: 'Explorer',
      currency: 'INR',
      updatedAt: new Date(),
    });
  }

  // Also seed Alex Morgan for Google Sign-in demo
  const alexEmail = 'alex.morgan@gmail.com';
  let [alexUser] = await db.select().from(users).where(eq(users.email, alexEmail));
  if (!alexUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('globetrotter2026', salt);
    const alexId = 'usr_alex_morgan';

    [alexUser] = await db
      .insert(users)
      .values({
        id: alexId,
        email: alexEmail,
        passwordHash,
        name: 'Alex Morgan',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        preferredCurrency: 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(userPreferences).values({
      id: 'pref_alex_morgan',
      userId: alexUser.id,
      interests: JSON.stringify(['Culture', 'Food', 'Nature']),
      travelStyle: 'Balanced',
      travelPace: 'Moderate',
      budgetStyle: 'Mid-range',
      companion: 'Solo',
      personality: 'Explorer',
      currency: 'INR',
      updatedAt: new Date(),
    });
  }

  // Create iconic Multi-City Grand North Expedition: Ahmedabad → Delhi → Manali
  const tripId = 'trip_demo_grand_north';
  const existingTrip = await db.select().from(trips).where(eq(trips.id, tripId));

  if (existingTrip.length === 0) {
    const startDate = '2026-10-10';
    const endDate = '2026-10-18';

    const [trip] = await db
      .insert(trips)
      .values({
        id: tripId,
        userId: demoUser.id,
        name: 'Grand North Explorer',
        status: 'planning',
        startDate,
        endDate,
        budget: 75000,
        currency: 'INR',
        isFavorite: true,
        isPinned: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 3 Cities
    const cityList = [
      { cityName: 'Ahmedabad', country: 'India', orderIndex: 0, arrivalDate: '2026-10-10', departureDate: '2026-10-12', stayDurationDays: 2, latitude: 23.0225, longitude: 72.5714 },
      { cityName: 'Delhi', country: 'India', orderIndex: 1, arrivalDate: '2026-10-12', departureDate: '2026-10-15', stayDurationDays: 3, latitude: 28.6139, longitude: 77.2090 },
      { cityName: 'Manali', country: 'India', orderIndex: 2, arrivalDate: '2026-10-15', departureDate: '2026-10-18', stayDurationDays: 3, latitude: 32.2432, longitude: 77.1892 },
    ];

    for (const c of cityList) {
      await db.insert(tripCities).values({
        id: 'city_' + crypto.randomUUID(),
        tripId,
        ...c,
      });
    }

    // Itinerary
    const itineraryId = 'itin_demo_grand_north';
    await db.insert(itineraries).values({
      id: itineraryId,
      tripId,
      title: 'Grand North Multi-City Itinerary',
      destination: 'Ahmedabad → Delhi → Manali',
      country: 'India',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Days & Activities
    const daysData = [
      {
        dayNumber: 1,
        date: '2026-10-10',
        title: 'Day 1: Ahmedabad Heritage & Sabarmati',
        theme: 'Historic Old City & Ashram',
        activities: [
          { title: 'Sabarmati Ashram Visit', category: 'Culture', startTime: '09:30', durationMinutes: 90, cost: 0, location: 'Sabarmati, Ahmedabad', notes: 'Walk through Gandhi Memorial Museum.' },
          { title: 'Gujarati Thali at Agashiye', category: 'Food', startTime: '13:00', durationMinutes: 75, cost: 950, location: 'The House of MG', notes: 'Authentic heritage dining experience.' },
          { title: 'Adalaj Stepwell Exploration', category: 'Sightseeing', startTime: '16:00', durationMinutes: 90, cost: 50, location: 'Adalaj', notes: 'Intricate Solanki architectural carvings.' },
        ],
      },
      {
        dayNumber: 2,
        date: '2026-10-11',
        title: 'Day 2: Ahmedabad Textile & Riverfront',
        theme: 'Modern Architecture & Riverfront',
        activities: [
          { title: 'Calico Museum of Textiles', category: 'Culture', startTime: '10:00', durationMinutes: 120, cost: 0, location: 'Shahibaug, Ahmedabad', notes: 'Pre-booked guided textile tour.' },
          { title: 'Sabarmati Riverfront Evening Walk', category: 'Sightseeing', startTime: '17:30', durationMinutes: 90, cost: 30, location: 'Riverfront Promenade', notes: 'Sunset views and skyline photography.' },
          { title: 'Manek Chowk Night Street Food', category: 'Food', startTime: '20:30', durationMinutes: 90, cost: 450, location: 'Manek Chowk', notes: 'Famous butter bhaji pav and chocolate sandwiches.' },
        ],
      },
      {
        dayNumber: 3,
        date: '2026-10-12',
        title: 'Day 3: Transit to Delhi & Monument Trail',
        theme: 'Mughal Majesty in Capital',
        activities: [
          { title: 'Flight/Express Train to Delhi', category: 'Transport', startTime: '07:30', durationMinutes: 150, cost: 3500, location: 'DEL Airport / NDLS', notes: 'Morning transit to New Delhi.' },
          { title: 'Humayun’s Tomb Garden Walk', category: 'Sightseeing', startTime: '15:00', durationMinutes: 100, cost: 80, location: 'Nizamuddin East, Delhi', notes: 'UNESCO heritage garden tomb.' },
          { title: 'Evening Dinner at Pandara Road', category: 'Food', startTime: '19:30', durationMinutes: 90, cost: 1200, location: 'India Gate vicinity', notes: 'North Indian butter chicken and kebabs.' },
        ],
      },
      {
        dayNumber: 4,
        date: '2026-10-13',
        title: 'Day 4: Old Delhi & Red Fort Majesty',
        theme: 'Chandni Chowk & Mughal History',
        activities: [
          { title: 'Old Delhi Rickshaw Tour & Spice Market', category: 'Activities', startTime: '09:00', durationMinutes: 120, cost: 400, location: 'Khari Baoli, Chandni Chowk', notes: 'Asia’s largest spice market aroma.' },
          { title: 'Qutub Minar Complex', category: 'Sightseeing', startTime: '14:30', durationMinutes: 90, cost: 80, location: 'Mehrauli, Delhi', notes: 'World’s tallest brick minaret.' },
        ],
      },
      {
        dayNumber: 5,
        date: '2026-10-14',
        title: 'Day 5: Delhi to Manali Himalayan Scenic Drive',
        theme: 'Mountain Climb & Beas River Valley',
        activities: [
          { title: 'Himalayan Luxury Coach / Cab to Manali', category: 'Transport', startTime: '06:00', durationMinutes: 480, cost: 2800, location: 'Delhi to Kullu Valley', notes: 'Scenic drive along the Beas River.' },
          { title: 'Check-in & Mall Road Stroll', category: 'Sightseeing', startTime: '18:00', durationMinutes: 90, cost: 0, location: 'Mall Road, Manali', notes: 'Acclimatization, trout dinner and local woolens.' },
        ],
      },
      {
        dayNumber: 6,
        date: '2026-10-15',
        title: 'Day 6: Solang Valley & Atal Tunnel',
        theme: 'High Altitude Thrills & Snow Peaks',
        activities: [
          { title: 'Solang Valley Paragliding & Ropeway', category: 'Activities', startTime: '09:30', durationMinutes: 180, cost: 2200, location: 'Solang Valley', notes: 'Panoramic Himalayan peaks view.' },
          { title: 'Atal Tunnel & Sissu Waterfall Trail', category: 'Sightseeing', startTime: '14:00', durationMinutes: 150, cost: 500, location: 'Lahaul Valley / Sissu', notes: 'Drive through world’s longest highway tunnel above 10,000ft.' },
        ],
      },
      {
        dayNumber: 7,
        date: '2026-10-16',
        title: 'Day 7: Old Manali Cafes & Hadimba Temple',
        theme: 'Pine Forests & Bohemian Vibe',
        activities: [
          { title: 'Hadimba Devi Ancient Cedar Sanctuary', category: 'Culture', startTime: '10:00', durationMinutes: 75, cost: 50, location: 'Dhungri Van Vihar', notes: 'Historic pagoda temple built in 1553.' },
          { title: 'Cafe Hopping in Old Manali', category: 'Food', startTime: '13:00', durationMinutes: 120, cost: 850, location: 'Old Manali Village', notes: 'Woodfired pizzas and mountain apple cider.' },
        ],
      },
    ];

    for (const d of daysData) {
      const dayId = 'day_' + crypto.randomUUID();
      await db.insert(itineraryDays).values({
        id: dayId,
        itineraryId,
        dayNumber: d.dayNumber,
        date: d.date,
        title: d.title,
        theme: d.theme,
      });

      for (let i = 0; i < d.activities.length; i++) {
        const a = d.activities[i];
        await db.insert(itineraryActivities).values({
          id: 'act_' + crypto.randomUUID(),
          itineraryId,
          dayId,
          title: a.title,
          category: a.category,
          startTime: a.startTime,
          durationMinutes: a.durationMinutes,
          cost: a.cost,
          currency: 'INR',
          location: a.location,
          notes: a.notes,
          orderIndex: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Budget Allocations
    const allocations = [
      { category: 'Hotels', percentage: 35, plannedAmount: 26250 },
      { category: 'Transport', percentage: 25, plannedAmount: 18750 },
      { category: 'Food', percentage: 20, plannedAmount: 15000 },
      { category: 'Activities', percentage: 12, plannedAmount: 9000 },
      { category: 'Shopping', percentage: 5, plannedAmount: 3750 },
      { category: 'Other', percentage: 3, plannedAmount: 2250 },
    ];

    for (const alloc of allocations) {
      await db.insert(budgetAllocations).values({
        id: 'alloc_' + crypto.randomUUID(),
        tripId,
        ...alloc,
      });
    }

    // Expenses
    const demoExpenses = [
      { title: 'Boutique Heritage Hotel (Ahmedabad)', category: 'Hotels', amount: 7200, currency: 'INR', date: '2026-10-10', paymentMethod: 'Credit Card', notes: '2 nights stay' },
      { title: 'Agashiye Heritage Thali', category: 'Food', amount: 1900, currency: 'INR', date: '2026-10-10', paymentMethod: 'UPI', notes: 'Dinner for two' },
      { title: 'Flight to Delhi', category: 'Transport', amount: 3500, currency: 'INR', date: '2026-10-12', paymentMethod: 'Credit Card', notes: 'SpiceJet SG-142' },
      { title: 'Hotel in Central Delhi', category: 'Hotels', amount: 8400, currency: 'INR', date: '2026-10-12', paymentMethod: 'Credit Card', notes: '2 nights' },
      { title: 'Solang Adventure Pass', category: 'Activities', amount: 2200, currency: 'INR', date: '2026-10-15', paymentMethod: 'Cash', notes: 'Paragliding and cable car' },
    ];

    for (const exp of demoExpenses) {
      await db.insert(expenses).values({
        id: 'exp_' + crypto.randomUUID(),
        tripId,
        userId: demoUser.id,
        ...exp,
        createdAt: new Date(),
      });
    }
  }

  return {
    demoUser: {
      email: demoUser.email,
      name: demoUser.name,
      demoPassword: 'globetrotter2026',
    },
    tripId,
  };
}

