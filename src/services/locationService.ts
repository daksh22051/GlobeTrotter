/**
 * Location & Coordinate Resolution Service
 * Provides precise geographical coordinate mapping, landmark resolution,
 * and travel time estimation for itinerary activities.
 */

import { Coordinates } from '../types/map';
import { ItineraryActivity } from '../types/itinerary';
import { Recommendation } from '../types/recommendation';
import { MAP_CONFIG } from '../config/mapConfig';

/**
 * Structured Landmark & Place Coordinates Database
 * Accurate coordinates for curated recommendations across all destinations.
 */
const KNOWN_PLACE_COORDINATES: Record<string, Coordinates> = {
  // TOKYO
  tokyo_rec_place_1: { latitude: 35.7147, longitude: 139.7967 }, // Senso-ji Temple & Asakusa
  tokyo_rec_place_2: { latitude: 35.6595, longitude: 139.7005 }, // Shibuya Sky & Scramble
  tokyo_rec_place_3: { latitude: 35.6852, longitude: 139.7100 }, // Shinjuku Gyoen National Garden
  tokyo_rec_place_4: { latitude: 35.6764, longitude: 139.6993 }, // Meiji Jingu Shrine
  tokyo_rec_place_5: { latitude: 35.6712, longitude: 139.7649 }, // Tsukiji Outer Market
  tokyo_rec_food_1: { latitude: 35.7118, longitude: 139.7960 },  // Asakusa Imahan Sukiyaki
  tokyo_rec_food_2: { latitude: 35.6598, longitude: 139.7020 },  // Ichiran Shibuya Ramen
  tokyo_rec_food_3: { latitude: 35.6695, longitude: 139.7672 },  // Sushizanmai Tsukiji
  tokyo_rec_food_4: { latitude: 35.6938, longitude: 139.7034 },  // Omoide Yokocho Yakitori
  tokyo_rec_exp_1: { latitude: 35.6491, longitude: 139.7898 },   // teamLab Planets Toyosu
  tokyo_rec_exp_2: { latitude: 35.7100, longitude: 139.8107 },   // Sumida River Cruise
  tokyo_rec_exp_3: { latitude: 35.6700, longitude: 139.7050 },   // Harajuku Street Fashion Tour
  tokyo_rec_hotel_1: { latitude: 35.6868, longitude: 139.7690 }, // Palace Hotel Tokyo (Marunouchi)
  tokyo_rec_hotel_2: { latitude: 35.6601, longitude: 139.7012 }, // TRUNK Hotel Shibuya
  tokyo_rec_hotel_3: { latitude: 35.6909, longitude: 139.6921 }, // Park Hyatt Tokyo

  // PARIS
  paris_rec_place_1: { latitude: 48.8606, longitude: 2.3376 },   // Louvre Museum
  paris_rec_place_2: { latitude: 48.8584, longitude: 2.2945 },   // Eiffel Tower
  paris_rec_place_3: { latitude: 48.8867, longitude: 2.3431 },   // Sacré-Cœur & Montmartre
  paris_rec_place_4: { latitude: 48.8530, longitude: 2.3499 },   // Sainte-Chapelle & Notre-Dame
  paris_rec_place_5: { latitude: 48.8462, longitude: 2.3372 },   // Jardin du Luxembourg
  paris_rec_food_1: { latitude: 48.8540, longitude: 2.3330 },    // Café de Flore
  paris_rec_food_2: { latitude: 48.8566, longitude: 2.3580 },    // Le Marais Bistro
  paris_rec_food_3: { latitude: 48.8672, longitude: 2.3275 },    // Angelina Paris Chocolat
  paris_rec_exp_1: { latitude: 48.8610, longitude: 2.2980 },    // Seine River Evening Cruise
  paris_rec_exp_2: { latitude: 48.8570, longitude: 2.3540 },    // Pastry Masterclass Le Marais
  paris_rec_hotel_1: { latitude: 48.8678, longitude: 2.3292 },  // Le Meurice Paris
  paris_rec_hotel_2: { latitude: 48.8550, longitude: 2.3610 },  // Hotel Pavillon de la Reine

  // BALI
  bali_rec_place_1: { latitude: -8.4333, longitude: 115.2813 },  // Tegallalang Rice Terraces
  bali_rec_place_2: { latitude: -8.8291, longitude: 115.0849 },  // Uluwatu Cliff Temple
  bali_rec_place_3: { latitude: -8.5192, longitude: 115.2606 },  // Sacred Monkey Forest Ubud
  bali_rec_place_4: { latitude: -8.6212, longitude: 115.0868 },  // Tanah Lot Sea Temple
  bali_rec_food_1: { latitude: -8.5130, longitude: 115.2650 },   // Locavore Ubud
  bali_rec_food_2: { latitude: -8.6539, longitude: 115.1308 },   // La Brisa Beach Club Echo Beach
  bali_rec_exp_1: { latitude: -8.2420, longitude: 115.3780 },   // Mount Batur Sunrise Hike
  bali_rec_exp_2: { latitude: -8.4720, longitude: 115.2750 },   // Ayung River White Water Rafting
  bali_rec_hotel_1: { latitude: -8.4850, longitude: 115.2410 },  // Maya Ubud Resort
  bali_rec_hotel_2: { latitude: -8.8100, longitude: 115.1550 },  // Bulgari Resort Uluwatu

  // DUBAI
  dubai_rec_place_1: { latitude: 25.1972, longitude: 55.2744 },  // Burj Khalifa & Dubai Mall
  dubai_rec_place_2: { latitude: 25.0760, longitude: 55.1330 },  // Dubai Marina & JBR
  dubai_rec_place_3: { latitude: 25.1412, longitude: 55.1852 },  // Burj Al Arab
  dubai_rec_place_4: { latitude: 25.2630, longitude: 55.2972 },  // Al Fahidi Historical Quarter
  dubai_rec_food_1: { latitude: 25.1980, longitude: 55.2790 },   // Time Out Market Downtown
  dubai_rec_exp_1: { latitude: 24.8350, longitude: 55.5700 },   // Red Dune Desert Safari
  dubai_rec_hotel_1: { latitude: 25.1304, longitude: 55.1171 }, // Atlantis The Palm

  // MANALI
  manali_hadimba: { latitude: 32.2470, longitude: 77.1818 },
  manali_solang: { latitude: 32.3167, longitude: 77.1583 },
  manali_rohtang: { latitude: 32.3716, longitude: 77.2466 },
  manali_jogini: { latitude: 32.2630, longitude: 77.1870 },
  manali_old_village: { latitude: 32.2580, longitude: 77.1850 },
  manali_hotel_himalayan: { latitude: 32.2450, longitude: 77.1800 },
  manali_hotel_larisa: { latitude: 32.1850, longitude: 77.1720 },
  manali_cafe_1947: { latitude: 32.2575, longitude: 77.1860 },
  manali_dham_siddu: { latitude: 32.2396, longitude: 77.1887 },
  manali_paragliding_solang: { latitude: 32.3200, longitude: 77.1600 },
  manali_beas_rafting: { latitude: 31.9500, longitude: 77.1200 },
  manali_rec_place_1: { latitude: 32.3167, longitude: 77.1583 }, // Solang Valley Adventure Park
  manali_rec_place_2: { latitude: 32.2470, longitude: 77.1818 }, // Hadimba Devi Temple
  manali_rec_place_3: { latitude: 32.2580, longitude: 77.1850 }, // Old Manali Village
  manali_rec_place_4: { latitude: 32.3716, longitude: 77.2466 }, // Rohtang Pass / Atal Tunnel
  manali_rec_food_1: { latitude: 32.2575, longitude: 77.1860 },  // Cafe 1947 Old Manali
  manali_rec_food_2: { latitude: 32.2396, longitude: 77.1887 },  // Chopsticks Restaurant Mall Road
  manali_rec_exp_1: { latitude: 32.3200, longitude: 77.1600 },  // Beas River Paragliding
  manali_rec_exp_2: { latitude: 32.2630, longitude: 77.1870 },  // Jogini Waterfall Trek
  manali_rec_hotel_1: { latitude: 32.2450, longitude: 77.1800 }, // The Himalayan Luxury Resort
  manali_rec_hotel_2: { latitude: 32.2550, longitude: 77.1820 }, // Apple Country Resort & Spa

  // PUDUCHERRY / PONDICHERRY
  puducherry_promenade: { latitude: 11.9338, longitude: 79.8359 },
  puducherry_auroville: { latitude: 12.0070, longitude: 79.8106 },
  puducherry_french_quarter: { latitude: 11.9325, longitude: 79.8340 },
  puducherry_paradise_beach: { latitude: 11.8744, longitude: 79.8167 },
  puducherry_sri_aurobindo_ashram: { latitude: 11.9366, longitude: 79.8347 },
  puducherry_cafe_des_arts: { latitude: 11.9315, longitude: 79.8335 },
  puducherry_hotel_palais_de_mahe: { latitude: 11.9310, longitude: 79.8348 },
  puducherry_scuba_temple_reef: { latitude: 11.9280, longitude: 79.8420 },
  puducherry_rec_place_1: { latitude: 11.9338, longitude: 79.8359 },
  puducherry_rec_place_2: { latitude: 12.0070, longitude: 79.8106 },
  puducherry_rec_place_3: { latitude: 11.9325, longitude: 79.8340 },
  puducherry_rec_food_1: { latitude: 11.9315, longitude: 79.8335 },
  puducherry_rec_exp_1: { latitude: 11.9280, longitude: 79.8420 },
  puducherry_rec_hotel_1: { latitude: 11.9310, longitude: 79.8348 },
  pondicherry_rec_place_1: { latitude: 11.9338, longitude: 79.8359 },
  pondicherry_rec_place_2: { latitude: 12.0070, longitude: 79.8106 },

  // LEH-LADAKH
  ladakh_pangong: { latitude: 33.7595, longitude: 78.6674 },
  ladakh_nubra: { latitude: 34.5448, longitude: 77.5644 },
  ladakh_thiksey: { latitude: 34.0578, longitude: 77.6669 },
  ladakh_hotel_grand_dragon: { latitude: 34.1560, longitude: 77.5750 },
  ladakh_tibetan_kitchen: { latitude: 34.1645, longitude: 77.5840 },
  ladakh_khardung_la_ride: { latitude: 34.2787, longitude: 77.6046 },
  ladakh_shanti_stupa: { latitude: 34.1697, longitude: 77.5768 },
  ladakh_leh_palace: { latitude: 34.1659, longitude: 77.5861 },
  ladakh_magnetic_hill: { latitude: 34.1865, longitude: 77.3547 },
  ladakh_rec_place_1: { latitude: 33.7595, longitude: 78.6674 },
  ladakh_rec_place_2: { latitude: 34.5448, longitude: 77.5644 },
  ladakh_rec_place_3: { latitude: 34.0578, longitude: 77.6669 },
  ladakh_rec_food_1: { latitude: 34.1645, longitude: 77.5840 },
  ladakh_rec_exp_1: { latitude: 34.2787, longitude: 77.6046 },
  ladakh_rec_hotel_1: { latitude: 34.1560, longitude: 77.5750 },

  // UDAIPUR
  udaipur_city_palace: { latitude: 24.5764, longitude: 73.6835 },
  udaipur_lake_pichola: { latitude: 24.5799, longitude: 73.6801 },
  udaipur_hotel_lake_palace: { latitude: 24.5756, longitude: 73.6803 },
  udaipur_amrai: { latitude: 24.5790, longitude: 73.6780 },
  udaipur_dharohar_dance: { latitude: 24.5800, longitude: 73.6810 },
  udaipur_fateh_sagar: { latitude: 24.6026, longitude: 73.6744 },
  udaipur_saheliyon_ki_bari: { latitude: 24.6045, longitude: 73.6853 },
  udaipur_jag_mandir: { latitude: 24.5677, longitude: 73.6781 },
  udaipur_rec_place_1: { latitude: 24.5764, longitude: 73.6835 },
  udaipur_rec_place_2: { latitude: 24.5799, longitude: 73.6801 },
  udaipur_rec_food_1: { latitude: 24.5790, longitude: 73.6780 },
  udaipur_rec_exp_1: { latitude: 24.5800, longitude: 73.6810 },
  udaipur_rec_hotel_1: { latitude: 24.5756, longitude: 73.6803 },

  // KERALA BACKWATERS / KOCHI / MUNNAR
  kerala_alleppey_backwaters: { latitude: 9.4981, longitude: 76.3388 },
  kerala_marari_beach: { latitude: 9.6006, longitude: 76.2996 },
  kerala_hotel_kumarakom_lake_resort: { latitude: 9.6175, longitude: 76.4277 },
  kerala_food_karimeen: { latitude: 9.5010, longitude: 76.3420 },
  kerala_ayurveda_panchakarma: { latitude: 9.6100, longitude: 76.4300 },
  kerala_munnar_tea_gardens: { latitude: 10.0889, longitude: 77.0595 },
  kerala_kochi_fort: { latitude: 9.9656, longitude: 76.2421 },
  kerala_rec_place_1: { latitude: 9.4981, longitude: 76.3388 },
  kerala_rec_place_2: { latitude: 9.6006, longitude: 76.2996 },
  kerala_rec_food_1: { latitude: 9.5010, longitude: 76.3420 },
  kerala_rec_exp_1: { latitude: 9.6100, longitude: 76.4300 },
  kerala_rec_hotel_1: { latitude: 9.6175, longitude: 76.4277 },

  // MUMBAI
  mumbai_gateway_of_india: { latitude: 18.9220, longitude: 72.8347 },
  mumbai_marine_drive: { latitude: 18.9438, longitude: 72.8233 },
  mumbai_hotel_taj_mahal: { latitude: 18.9217, longitude: 72.8333 },
  mumbai_street_food_tour: { latitude: 18.9540, longitude: 72.8130 },
  mumbai_elephanta_caves: { latitude: 18.9633, longitude: 72.9315 },
  mumbai_cst_station: { latitude: 18.9400, longitude: 72.8353 },
  mumbai_rec_place_1: { latitude: 18.9220, longitude: 72.8347 },
  mumbai_rec_place_2: { latitude: 18.9438, longitude: 72.8233 },
  mumbai_rec_food_1: { latitude: 18.9540, longitude: 72.8130 },
  mumbai_rec_exp_1: { latitude: 18.9633, longitude: 72.9315 },
  mumbai_rec_hotel_1: { latitude: 18.9217, longitude: 72.8333 },

  // VARANASI
  varanasi_dashashwamedh: { latitude: 25.3076, longitude: 83.0104 },
  varanasi_kashi_vishwanath: { latitude: 25.3109, longitude: 83.0107 },
  varanasi_assi_ghat: { latitude: 25.2885, longitude: 83.0062 },
  varanasi_sarnath: { latitude: 25.3811, longitude: 83.0214 },
  varanasi_manikarnika: { latitude: 25.3108, longitude: 83.0142 },
  varanasi_rec_place_1: { latitude: 25.3076, longitude: 83.0104 },
  varanasi_rec_place_2: { latitude: 25.3109, longitude: 83.0107 },
  varanasi_rec_food_1: { latitude: 25.3050, longitude: 83.0080 },
  varanasi_rec_exp_1: { latitude: 25.3076, longitude: 83.0104 },
  varanasi_rec_hotel_1: { latitude: 25.3120, longitude: 83.0090 },

  // AGRA
  agra_taj_mahal: { latitude: 27.1751, longitude: 78.0421 },
  agra_agra_fort: { latitude: 27.1795, longitude: 78.0211 },
  agra_mehtab_bagh: { latitude: 27.1800, longitude: 78.0420 },
  agra_fatehpur_sikri: { latitude: 27.0945, longitude: 77.6679 },
  agra_rec_place_1: { latitude: 27.1751, longitude: 78.0421 },
  agra_rec_place_2: { latitude: 27.1795, longitude: 78.0211 },
  agra_rec_food_1: { latitude: 27.1700, longitude: 78.0200 },
  agra_rec_exp_1: { latitude: 27.1800, longitude: 78.0420 },
  agra_rec_hotel_1: { latitude: 27.1650, longitude: 78.0400 },

  // RISHIKESH
  rishikesh_lakshman_jhula: { latitude: 30.1362, longitude: 78.3284 },
  rishikesh_ram_jhula: { latitude: 30.1232, longitude: 78.3150 },
  rishikesh_triveni_ghat: { latitude: 30.1037, longitude: 78.2933 },
  rishikesh_beatles_ashram: { latitude: 30.1167, longitude: 78.3139 },
  rishikesh_rafting_shivpuri: { latitude: 30.1380, longitude: 78.3880 },
  rishikesh_rec_place_1: { latitude: 30.1362, longitude: 78.3284 },
  rishikesh_rec_place_2: { latitude: 30.1037, longitude: 78.2933 },
  rishikesh_rec_food_1: { latitude: 30.1250, longitude: 78.3200 },
  rishikesh_rec_exp_1: { latitude: 30.1380, longitude: 78.3880 },
  rishikesh_rec_hotel_1: { latitude: 30.1300, longitude: 78.3250 },

  // AMRITSAR
  amritsar_golden_temple: { latitude: 31.6200, longitude: 74.8765 },
  amritsar_wagah_border: { latitude: 31.6047, longitude: 74.5732 },
  amritsar_jallianwala_bagh: { latitude: 31.6205, longitude: 74.8801 },

  // SHIMLA
  shimla_rec_place_1: { latitude: 31.1048, longitude: 77.1734 }, // The Mall Road & Ridge
  shimla_rec_place_2: { latitude: 31.1010, longitude: 77.1850 }, // Jakhoo Temple & Hanuman Statue
  shimla_rec_place_3: { latitude: 31.1040, longitude: 77.1400 }, // Viceregal Lodge (Rashtrapati Niwas)
  shimla_rec_place_4: { latitude: 31.0980, longitude: 77.2650 }, // Kufri Fun World & Snow Point
  shimla_rec_food_1: { latitude: 31.1045, longitude: 77.1730 },  // Wake & Bake Cafe Mall Road
  shimla_rec_food_2: { latitude: 31.1050, longitude: 77.1740 },  // Cafe Simla Times
  shimla_rec_exp_1: { latitude: 31.1030, longitude: 77.1650 },   // Kalka-Shimla Heritage Toy Train
  shimla_rec_exp_2: { latitude: 31.1020, longitude: 77.1720 },   // Heritage Colonial Walking Tour
  shimla_rec_hotel_1: { latitude: 31.1055, longitude: 77.1760 }, // The Oberoi Cecil Shimla
  shimla_rec_hotel_2: { latitude: 31.1040, longitude: 77.1735 }, // Wildflower Hall Resort

  // DELHI
  delhi_rec_place_1: { latitude: 28.5245, longitude: 77.1855 }, // Qutub Minar Complex
  delhi_rec_place_2: { latitude: 28.5933, longitude: 77.2507 }, // Humayun's Tomb
  delhi_rec_place_3: { latitude: 28.6129, longitude: 77.2295 }, // India Gate & Kartavya Path
  delhi_rec_place_4: { latitude: 28.6562, longitude: 77.2410 }, // Red Fort (Lal Qila)
  delhi_rec_food_1: { latitude: 28.6506, longitude: 77.2304 },  // Chandni Chowk & Paranthe Wali Gali
  delhi_rec_food_2: { latitude: 28.6010, longitude: 77.2230 },  // Bukhara at ITC Maurya
  delhi_rec_exp_1: { latitude: 28.6500, longitude: 77.2300 },   // Old Delhi Street Food & Rickshaw Safari
  delhi_rec_exp_2: { latitude: 28.5300, longitude: 77.1900 },   // Mehrauli Archaeological Park Walk
  delhi_rec_hotel_1: { latitude: 28.6020, longitude: 77.2200 }, // The Leela Palace New Delhi
  delhi_rec_hotel_2: { latitude: 28.6250, longitude: 77.2180 }, // The Imperial New Delhi (Janpath)

  // AHMEDABAD
  ahmedabad_rec_place_1: { latitude: 23.0605, longitude: 72.5800 }, // Sabarmati Ashram
  ahmedabad_rec_place_2: { latitude: 23.1667, longitude: 72.6333 }, // Adalaj Stepwell (Vav)
  ahmedabad_rec_place_3: { latitude: 23.0300, longitude: 72.5700 }, // Sabarmati Riverfront Promenade
  ahmedabad_rec_place_4: { latitude: 23.0240, longitude: 72.5890 }, // Jama Masjid & Heritage Old City
  ahmedabad_rec_food_1: { latitude: 23.0250, longitude: 72.5870 },  // Manek Chowk Night Food Market
  ahmedabad_rec_food_2: { latitude: 23.0310, longitude: 72.5600 },  // Agashiye - The House of MG
  ahmedabad_rec_exp_1: { latitude: 23.0245, longitude: 72.5880 },  // Ahmedabad UNESCO Heritage Walk
  ahmedabad_rec_exp_2: { latitude: 23.0500, longitude: 72.6000 },  // Calico Textile Museum Tour
  ahmedabad_rec_hotel_1: { latitude: 23.0280, longitude: 72.5850 }, // The House of MG Heritage Hotel
  ahmedabad_rec_hotel_2: { latitude: 23.0350, longitude: 72.5100 }, // ITC Narmada Luxury Collection

  // JAIPUR
  jaipur_rec_place_1: { latitude: 26.9855, longitude: 75.8513 }, // Amber Fort & Palace
  jaipur_rec_place_2: { latitude: 26.9239, longitude: 75.8267 }, // Hawa Mahal (Palace of Winds)
  jaipur_rec_place_3: { latitude: 26.9258, longitude: 75.8236 }, // City Palace & Jantar Mantar
  jaipur_rec_food_1: { latitude: 26.9180, longitude: 75.8150 },  // Laxmi Mishtan Bhandar (LMB)
  jaipur_rec_exp_1: { latitude: 26.9900, longitude: 75.8500 },   // Hot Air Balloon Safari Amber
  jaipur_rec_hotel_1: { latitude: 26.9000, longitude: 75.8000 }, // Rambagh Palace Jaipur

  // GOA
  goa_rec_place_1: { latitude: 15.4989, longitude: 73.8343 },   // Fontainhas Latin Quarter
  goa_rec_place_2: { latitude: 15.4920, longitude: 73.7737 },   // Fort Aguada & Lighthouse
  goa_rec_place_3: { latitude: 15.0100, longitude: 74.0230 },   // Palolem Beach South Goa
  goa_rec_place_4: { latitude: 15.5494, longitude: 73.7535 },   // Anjuna Flea Market
  goa_rec_food_1: { latitude: 15.5700, longitude: 73.7420 },    // Thalassa Greek Restaurant Vagator
  goa_rec_exp_1: { latitude: 15.3144, longitude: 74.3143 },    // Dudhsagar Waterfalls Trek
  goa_rec_hotel_1: { latitude: 15.4800, longitude: 73.8050 },   // Taj Fort Aguada Resort
};

/**
 * Text-based landmark coordinate dictionary for lookup by title/location keywords
 */
const KEYWORD_COORDINATES: Array<{ keywords: string[]; coords: Coordinates }> = [
  // Tokyo
  { keywords: ['senso-ji', 'sensoji', 'asakusa'], coords: { latitude: 35.7147, longitude: 139.7967 } },
  { keywords: ['shibuya sky', 'scramble', 'shibuya crossing'], coords: { latitude: 35.6595, longitude: 139.7005 } },
  { keywords: ['shinjuku gyoen', 'gyoen garden'], coords: { latitude: 35.6852, longitude: 139.7100 } },
  { keywords: ['meiji', 'yoyogi'], coords: { latitude: 35.6764, longitude: 139.6993 } },
  { keywords: ['tsukiji', 'sushi'], coords: { latitude: 35.6712, longitude: 139.7649 } },
  { keywords: ['teamlab', 'planets', 'toyosu'], coords: { latitude: 35.6491, longitude: 139.7898 } },
  { keywords: ['tokyo tower', 'roppongi'], coords: { latitude: 35.6586, longitude: 139.7454 } },
  { keywords: ['akihabara', 'electronics'], coords: { latitude: 35.6983, longitude: 139.7731 } },
  { keywords: ['ginza', 'shopping'], coords: { latitude: 35.6719, longitude: 139.7650 } },
  { keywords: ['sumida', 'skytree'], coords: { latitude: 35.7100, longitude: 139.8107 } },
  
  // Paris
  { keywords: ['louvre', 'mona lisa'], coords: { latitude: 48.8606, longitude: 2.3376 } },
  { keywords: ['eiffel', 'champ de mars'], coords: { latitude: 48.8584, longitude: 2.2945 } },
  { keywords: ['sacre-coeur', 'sacre coeur', 'montmartre'], coords: { latitude: 48.8867, longitude: 2.3431 } },
  { keywords: ['notre dame', 'notre-dame', 'sainte-chapelle'], coords: { latitude: 48.8530, longitude: 2.3499 } },
  { keywords: ['luxembourg', 'latin quarter'], coords: { latitude: 48.8462, longitude: 2.3372 } },
  { keywords: ['arc de triomphe', 'champs-elysees'], coords: { latitude: 48.8738, longitude: 2.2950 } },
  { keywords: ['orsay', 'd\'orsay'], coords: { latitude: 48.8599, longitude: 2.3265 } },
  { keywords: ['seine', 'bistro', 'flore'], coords: { latitude: 48.8540, longitude: 2.3330 } },

  // Bali
  { keywords: ['ubud', 'rice terrace', 'tegallalang'], coords: { latitude: -8.4333, longitude: 115.2813 } },
  { keywords: ['uluwatu', 'cliff', 'kecak'], coords: { latitude: -8.8291, longitude: 115.0849 } },
  { keywords: ['monkey forest'], coords: { latitude: -8.5192, longitude: 115.2606 } },
  { keywords: ['tanah lot'], coords: { latitude: -8.6212, longitude: 115.0868 } },
  { keywords: ['canggu', 'echo beach', 'seminyak'], coords: { latitude: -8.6539, longitude: 115.1308 } },
  { keywords: ['batur', 'kintamani'], coords: { latitude: -8.2420, longitude: 115.3780 } },

  // Dubai
  { keywords: ['burj khalifa', 'dubai mall'], coords: { latitude: 25.1972, longitude: 55.2744 } },
  { keywords: ['dubai marina', 'jbr'], coords: { latitude: 25.0760, longitude: 55.1330 } },
  { keywords: ['burj al arab'], coords: { latitude: 25.1412, longitude: 55.1852 } },
  { keywords: ['palm jumeirah', 'atlantis'], coords: { latitude: 25.1304, longitude: 55.1171 } },
  { keywords: ['desert safari'], coords: { latitude: 24.8350, longitude: 55.5700 } },

  // Manali
  { keywords: ['solang', 'adventure'], coords: { latitude: 32.3167, longitude: 77.1583 } },
  { keywords: ['hadimba', 'hidimba'], coords: { latitude: 32.2470, longitude: 77.1818 } },
  { keywords: ['old manali', 'cafe 1947'], coords: { latitude: 32.2580, longitude: 77.1850 } },
  { keywords: ['rohtang', 'atal tunnel'], coords: { latitude: 32.3716, longitude: 77.2466 } },
  { keywords: ['jogini', 'vashisht'], coords: { latitude: 32.2630, longitude: 77.1870 } },
  { keywords: ['mall road manali', 'chopsticks'], coords: { latitude: 32.2396, longitude: 77.1887 } },

  // Shimla
  { keywords: ['mall road shimla', 'ridge', 'the ridge'], coords: { latitude: 31.1048, longitude: 77.1734 } },
  { keywords: ['jakhoo', 'hanuman'], coords: { latitude: 31.1010, longitude: 77.1850 } },
  { keywords: ['viceregal', 'rashtrapati niwas'], coords: { latitude: 31.1040, longitude: 77.1400 } },
  { keywords: ['kufri'], coords: { latitude: 31.0980, longitude: 77.2650 } },
  { keywords: ['toy train', 'kalka'], coords: { latitude: 31.1030, longitude: 77.1650 } },
  { keywords: ['oberoi cecil', 'wildflower'], coords: { latitude: 31.1055, longitude: 77.1760 } },

  // Delhi
  { keywords: ['qutub', 'qutb'], coords: { latitude: 28.5245, longitude: 77.1855 } },
  { keywords: ['humayun'], coords: { latitude: 28.5933, longitude: 77.2507 } },
  { keywords: ['india gate', 'kartavya'], coords: { latitude: 28.6129, longitude: 77.2295 } },
  { keywords: ['red fort', 'lal qila'], coords: { latitude: 28.6562, longitude: 77.2410 } },
  { keywords: ['chandni chowk', 'paranthe'], coords: { latitude: 28.6506, longitude: 77.2304 } },
  { keywords: ['bukhara', 'itc maurya'], coords: { latitude: 28.6010, longitude: 77.2230 } },

  // Ahmedabad
  { keywords: ['sabarmati ashram', 'gandhi ashram'], coords: { latitude: 23.0605, longitude: 72.5800 } },
  { keywords: ['adalaj', 'stepwell'], coords: { latitude: 23.1667, longitude: 72.6333 } },
  { keywords: ['riverfront', 'sabarmati riverfront'], coords: { latitude: 23.0300, longitude: 72.5700 } },
  { keywords: ['manek chowk'], coords: { latitude: 23.0250, longitude: 72.5870 } },
  { keywords: ['agashiye', 'house of mg'], coords: { latitude: 23.0310, longitude: 72.5600 } },
  { keywords: ['jama masjid ahmedabad'], coords: { latitude: 23.0240, longitude: 72.5890 } },

  // Jaipur
  { keywords: ['amber fort', 'amer fort'], coords: { latitude: 26.9855, longitude: 75.8513 } },
  { keywords: ['hawa mahal'], coords: { latitude: 26.9239, longitude: 75.8267 } },
  { keywords: ['city palace jaipur', 'jantar mantar'], coords: { latitude: 26.9258, longitude: 75.8236 } },
  { keywords: ['nahargarh', 'jaigarh'], coords: { latitude: 26.9373, longitude: 75.8155 } },
  { keywords: ['chokhi dhani'], coords: { latitude: 26.7663, longitude: 75.8349 } },
  { keywords: ['lmb', 'rambagh'], coords: { latitude: 26.9180, longitude: 75.8150 } },

  // Udaipur
  { keywords: ['city palace udaipur', 'city palace'], coords: { latitude: 24.5764, longitude: 73.6835 } },
  { keywords: ['lake pichola', 'pichola'], coords: { latitude: 24.5799, longitude: 73.6801 } },
  { keywords: ['lake palace', 'taj lake palace'], coords: { latitude: 24.5756, longitude: 73.6803 } },
  { keywords: ['fateh sagar'], coords: { latitude: 24.6026, longitude: 73.6744 } },
  { keywords: ['saheliyon ki bari'], coords: { latitude: 24.6045, longitude: 73.6853 } },
  { keywords: ['amrai', 'bagore ki haveli', 'dharohar'], coords: { latitude: 24.5800, longitude: 73.6810 } },

  // Puducherry / Pondicherry
  { keywords: ['promenade beach', 'rock beach', 'gandhi statue pondy'], coords: { latitude: 11.9338, longitude: 79.8359 } },
  { keywords: ['auroville', 'matrimandir'], coords: { latitude: 12.0070, longitude: 79.8106 } },
  { keywords: ['french quarter', 'white town', 'villa shanti'], coords: { latitude: 11.9325, longitude: 79.8340 } },
  { keywords: ['paradise beach pondy', 'chunnambar'], coords: { latitude: 11.8744, longitude: 79.8167 } },
  { keywords: ['sri aurobindo ashram', 'aurobindo'], coords: { latitude: 11.9366, longitude: 79.8347 } },
  { keywords: ['cafe des arts', 'baker street pondy'], coords: { latitude: 11.9315, longitude: 79.8335 } },
  { keywords: ['palais de mahe'], coords: { latitude: 11.9310, longitude: 79.8348 } },
  { keywords: ['temple reef', 'scuba pondy'], coords: { latitude: 11.9280, longitude: 79.8420 } },

  // Leh-Ladakh
  { keywords: ['pangong tso', 'pangong lake', 'pangong'], coords: { latitude: 33.7595, longitude: 78.6674 } },
  { keywords: ['nubra valley', 'hunder', 'diskit'], coords: { latitude: 34.5448, longitude: 77.5644 } },
  { keywords: ['thiksey monastery', 'thiksey'], coords: { latitude: 34.0578, longitude: 77.6669 } },
  { keywords: ['khardung la', 'khardungla'], coords: { latitude: 34.2787, longitude: 77.6046 } },
  { keywords: ['shanti stupa leh', 'shanti stupa'], coords: { latitude: 34.1697, longitude: 77.5768 } },
  { keywords: ['leh palace'], coords: { latitude: 34.1659, longitude: 77.5861 } },
  { keywords: ['magnetic hill ladakh', 'magnetic hill'], coords: { latitude: 34.1865, longitude: 77.3547 } },
  { keywords: ['tibetan kitchen leh'], coords: { latitude: 34.1645, longitude: 77.5840 } },

  // Kerala / Alleppey
  { keywords: ['alleppey backwaters', 'alappuzha backwaters', 'houseboat', 'vembanad'], coords: { latitude: 9.4981, longitude: 76.3388 } },
  { keywords: ['marari beach'], coords: { latitude: 9.6006, longitude: 76.2996 } },
  { keywords: ['kumarakom'], coords: { latitude: 9.6175, longitude: 76.4277 } },
  { keywords: ['munnar', 'tea garden', 'tea estate', 'eravikulam'], coords: { latitude: 10.0889, longitude: 77.0595 } },
  { keywords: ['fort kochi', 'chinese fishing nets', 'mattancherry'], coords: { latitude: 9.9656, longitude: 76.2421 } },

  // Mumbai
  { keywords: ['gateway of india'], coords: { latitude: 18.9220, longitude: 72.8347 } },
  { keywords: ['marine drive', 'queens necklace', 'nariman point'], coords: { latitude: 18.9438, longitude: 72.8233 } },
  { keywords: ['taj mahal palace mumbai', 'taj colaba'], coords: { latitude: 18.9217, longitude: 72.8333 } },
  { keywords: ['elephanta caves'], coords: { latitude: 18.9633, longitude: 72.9315 } },
  { keywords: ['chhatrapati shivaji terminus', 'cst station', 'vt station'], coords: { latitude: 18.9400, longitude: 72.8353 } },
  { keywords: ['bandra fort', 'bandstand'], coords: { latitude: 19.0430, longitude: 72.8190 } },

  // Varanasi
  { keywords: ['dashashwamedh', 'ganga aarti varanasi'], coords: { latitude: 25.3076, longitude: 83.0104 } },
  { keywords: ['kashi vishwanath', 'golden temple varanasi'], coords: { latitude: 25.3109, longitude: 83.0107 } },
  { keywords: ['assi ghat'], coords: { latitude: 25.2885, longitude: 83.0062 } },
  { keywords: ['sarnath', 'dhamek stupa'], coords: { latitude: 25.3811, longitude: 83.0214 } },
  { keywords: ['manikarnika'], coords: { latitude: 25.3108, longitude: 83.0142 } },

  // Agra
  { keywords: ['taj mahal'], coords: { latitude: 27.1751, longitude: 78.0421 } },
  { keywords: ['agra fort'], coords: { latitude: 27.1795, longitude: 78.0211 } },
  { keywords: ['mehtab bagh'], coords: { latitude: 27.1800, longitude: 78.0420 } },
  { keywords: ['fatehpur sikri'], coords: { latitude: 27.0945, longitude: 77.6679 } },

  // Rishikesh
  { keywords: ['lakshman jhula', 'laxman jhula'], coords: { latitude: 30.1362, longitude: 78.3284 } },
  { keywords: ['ram jhula'], coords: { latitude: 30.1232, longitude: 78.3150 } },
  { keywords: ['triveni ghat', 'ganga aarti rishikesh'], coords: { latitude: 30.1037, longitude: 78.2933 } },
  { keywords: ['beatles ashram', 'chaurasi kutia'], coords: { latitude: 30.1167, longitude: 78.3139 } },
  { keywords: ['shivpuri rafting', 'ganga rafting'], coords: { latitude: 30.1380, longitude: 78.3880 } },

  // Amritsar
  { keywords: ['golden temple amritsar', 'harmandir sahib'], coords: { latitude: 31.6200, longitude: 74.8765 } },
  { keywords: ['wagah border'], coords: { latitude: 31.6047, longitude: 74.5732 } },
  { keywords: ['jallianwala bagh'], coords: { latitude: 31.6205, longitude: 74.8801 } },

  // Goa
  { keywords: ['fontainhas', 'panaji'], coords: { latitude: 15.4989, longitude: 73.8343 } },
  { keywords: ['aguada', 'candolim'], coords: { latitude: 15.4920, longitude: 73.7737 } },
  { keywords: ['palolem', 'canacona'], coords: { latitude: 15.0100, longitude: 74.0230 } },
  { keywords: ['anjuna', 'vagator', 'thalassa'], coords: { latitude: 15.5700, longitude: 73.7420 } },
  { keywords: ['bom jesus', 'old goa'], coords: { latitude: 15.5009, longitude: 73.9116 } },
  { keywords: ['dudhsagar waterfall'], coords: { latitude: 15.3144, longitude: 74.3143 } },
];

/**
 * Generates a deterministic geo-offset for unknown items in a destination
 * based on string hashing, ensuring stability without random jitter across renders.
 */
function getDeterministicOffset(seed: string, scaleKm: number = 2.5): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const angle = Math.abs(hash % 360) * (Math.PI / 180);
  const dist = ((Math.abs(hash >> 3) % 100) / 100) * scaleKm;
  
  // 1 degree latitude ~ 111 km
  const dLat = (dist * Math.cos(angle)) / 111;
  const dLng = (dist * Math.sin(angle)) / (111 * 0.85); // approx cos(lat)
  
  return { dLat, dLng };
}

export const locationService = {
  /**
   * Returns whether coordinates are finite, within the world, and local to the
   * requested destination. A generous city-area box keeps nearby excursions
   * valid while rejecting coordinates from another country or continent.
   */
  isCoordinateNearDestination(
    latitude: number,
    longitude: number,
    destinationName: string = 'Manali'
  ): boolean {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;

    const destination = this.getDestinationCenter(destinationName);
    const latitudeDelta = Math.abs(latitude - destination.lat);
    const longitudeDelta = Math.abs(longitude - destination.lng);

    return latitudeDelta <= 2 && longitudeDelta <= 2.5;
  },

  /**
   * Resolves the canonical geographic center and zoom level for a given destination name.
   */
  getDestinationCenter(destinationName: string = 'Manali'): { lat: number; lng: number; zoom: number } {
    if (!destinationName) {
      return MAP_CONFIG.defaultDestinations.manali || { lat: 32.2432, lng: 77.1892, zoom: 13 };
    }

    const clean = destinationName
      .toLowerCase()
      .replace(/india|japan|france|indonesia|uae|trip|road trip|vacation|getaway|holiday|tour/gi, '')
      .replace(/[^a-z0-9]/g, '');

    // Map common aliases
    let matchKey = clean;
    if (clean.includes('manali')) matchKey = 'manali';
    else if (clean.includes('puducherry') || clean.includes('pondy') || clean.includes('pondicherry')) matchKey = 'puducherry';
    else if (clean.includes('ladakh') || clean.includes('leh')) matchKey = 'ladakh';
    else if (clean.includes('kerala') || clean.includes('alleppey') || clean.includes('alappuzha') || clean.includes('munnar') || clean.includes('kochi') || clean.includes('cochin')) matchKey = 'kerala';
    else if (clean.includes('goa')) matchKey = 'goa';
    else if (clean.includes('jaipur')) matchKey = 'jaipur';
    else if (clean.includes('udaipur')) matchKey = 'udaipur';
    else if (clean.includes('mumbai') || clean.includes('bombay')) matchKey = 'mumbai';
    else if (clean.includes('varanasi') || clean.includes('kashi') || clean.includes('benaras')) matchKey = 'varanasi';
    else if (clean.includes('agra')) matchKey = 'agra';
    else if (clean.includes('rishikesh')) matchKey = 'rishikesh';
    else if (clean.includes('amritsar')) matchKey = 'amritsar';
    else if (clean.includes('delhi')) matchKey = 'delhi';
    else if (clean.includes('ahmedabad')) matchKey = 'ahmedabad';
    else if (clean.includes('bengaluru') || clean.includes('bangalore')) matchKey = 'bengaluru';
    else if (clean.includes('kolkata') || clean.includes('calcutta')) matchKey = 'kolkata';
    else if (clean.includes('chennai') || clean.includes('madras')) matchKey = 'chennai';
    else if (clean.includes('shimla')) matchKey = 'shimla';
    else if (clean.includes('tokyo')) matchKey = 'tokyo';
    else if (clean.includes('paris')) matchKey = 'paris';
    else if (clean.includes('bali')) matchKey = 'bali';
    else if (clean.includes('dubai')) matchKey = 'dubai';

    const destEntry = (MAP_CONFIG.defaultDestinations as Record<string, any>)[matchKey];
    if (destEntry) {
      return { lat: destEntry.lat, lng: destEntry.lng, zoom: destEntry.zoom || 13 };
    }

    // Direct substring scan fallback
    for (const [key, dest] of Object.entries(MAP_CONFIG.defaultDestinations)) {
      if (key !== 'default' && (clean.includes(key) || key.includes(clean))) {
        return { lat: dest.lat, lng: dest.lng, zoom: dest.zoom || 13 };
      }
    }

    return MAP_CONFIG.defaultDestinations.default || { lat: 28.6139, lng: 77.2090, zoom: 5 };
  },

  /**
   * Resolves coordinates for any activity or recommendation.
   * Priority order:
   * 1. Already provided latitude and longitude on the item
   * 2. Direct recommendationId lookup in KNOWN_PLACE_COORDINATES
   * 3. Keyword match in title and location
   * 4. Destination center + deterministic local offset
   */
  resolveCoordinates(
    item: {
      id?: string;
      recommendationId?: string;
      title?: string;
      name?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
    },
    destinationName: string = 'Manali'
  ): Coordinates {
    // 1. Direct coordinates on item
    if (
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      !isNaN(item.latitude) &&
      !isNaN(item.longitude) &&
      item.latitude !== 0 &&
      item.longitude !== 0 &&
      this.isCoordinateNearDestination(item.latitude, item.longitude, destinationName)
    ) {
      return { latitude: item.latitude, longitude: item.longitude };
    }

    const destClean = (destinationName || 'manali').toLowerCase();
    const destKey = destClean.includes('ladakh') || destClean.includes('leh') ? 'ladakh'
      : destClean.includes('puducherry') || destClean.includes('pondy') || destClean.includes('pondicherry') ? 'puducherry'
      : destClean.includes('jaipur') ? 'jaipur'
      : destClean.includes('udaipur') ? 'udaipur'
      : destClean.includes('manali') ? 'manali'
      : destClean.includes('tokyo') ? 'tokyo'
      : destClean.includes('paris') ? 'paris'
      : destClean.includes('bali') ? 'bali'
      : destClean.includes('dubai') ? 'dubai'
      : destClean.includes('goa') ? 'goa'
      : destClean.includes('mumbai') ? 'mumbai'
      : destClean.includes('agra') ? 'agra'
      : destClean.includes('varanasi') ? 'varanasi'
      : destClean.includes('rishikesh') ? 'rishikesh'
      : destClean.includes('amritsar') ? 'amritsar'
      : destClean.includes('shimla') ? 'shimla'
      : destClean.includes('delhi') ? 'delhi'
      : destClean.includes('ahmedabad') ? 'ahmedabad'
      : destClean.includes('kerala') || destClean.includes('alleppey') || destClean.includes('munnar') ? 'kerala'
      : 'general';

    // 2. Known Place ID matching destination prefix
    const recId = item.recommendationId || item.id;
    if (recId && KNOWN_PLACE_COORDINATES[recId]) {
      const lowerRecId = recId.toLowerCase();
      const matchesDest = 
        lowerRecId.includes(destKey) ||
        (destKey === 'ladakh' && (lowerRecId.startsWith('ladakh_') || lowerRecId.startsWith('leh_'))) ||
        (destKey === 'puducherry' && (lowerRecId.startsWith('puducherry_') || lowerRecId.startsWith('pondicherry_'))) ||
        (destKey === 'kerala' && lowerRecId.startsWith('kerala_')) ||
        (destKey === 'manali' && lowerRecId.startsWith('manali_')) ||
        (destKey === 'jaipur' && lowerRecId.startsWith('jaipur_')) ||
        (destKey === 'udaipur' && lowerRecId.startsWith('udaipur_')) ||
        (destKey === 'goa' && lowerRecId.startsWith('goa_')) ||
        (destKey === 'mumbai' && lowerRecId.startsWith('mumbai_')) ||
        (destKey === 'agra' && lowerRecId.startsWith('agra_')) ||
        (destKey === 'varanasi' && lowerRecId.startsWith('varanasi_')) ||
        (destKey === 'rishikesh' && lowerRecId.startsWith('rishikesh_')) ||
        (destKey === 'amritsar' && lowerRecId.startsWith('amritsar_')) ||
        (destKey === 'shimla' && lowerRecId.startsWith('shimla_')) ||
        (destKey === 'delhi' && lowerRecId.startsWith('delhi_')) ||
        (destKey === 'ahmedabad' && lowerRecId.startsWith('ahmedabad_')) ||
        (destKey === 'tokyo' && lowerRecId.startsWith('tokyo_')) ||
        (destKey === 'paris' && lowerRecId.startsWith('paris_')) ||
        (destKey === 'bali' && lowerRecId.startsWith('bali_')) ||
        (destKey === 'dubai' && lowerRecId.startsWith('dubai_'));

      if (matchesDest) {
        return KNOWN_PLACE_COORDINATES[recId];
      }
    }

    // 3. Keyword Match in Title / Location (restricted or matched intelligently)
    const searchText = `${item.title || item.name || ''} ${item.location || ''}`.toLowerCase();
    
    // Define destination-specific keyword clusters to prevent cross-city matches
    const isTokyoMatch = searchText.includes('tokyo') || searchText.includes('senso') || searchText.includes('shibuya') || searchText.includes('asakusa');
    const isParisMatch = searchText.includes('paris') || searchText.includes('louvre') || searchText.includes('eiffel') || searchText.includes('montmartre');
    const isBaliMatch = searchText.includes('bali') || searchText.includes('ubud') || searchText.includes('uluwatu');
    const isDubaiMatch = searchText.includes('dubai') || searchText.includes('burj khalifa');

    if (destKey === 'ladakh' && (isTokyoMatch || isParisMatch || isBaliMatch || isDubaiMatch)) {
      // Skip foreign keyword matches for Ladakh trips
    } else {
      for (const entry of KEYWORD_COORDINATES) {
        if (entry.keywords.some((kw) => searchText.includes(kw))) {
          if (this.isCoordinateNearDestination(entry.coords.latitude, entry.coords.longitude, destinationName)) {
            return entry.coords;
          }
        }
      }
    }

    // 4. Destination Center with Deterministic Local Offset
    const baseCenter = this.getDestinationCenter(destinationName);

    const seed = `${item.id || ''}_${item.title || item.name || 'place'}`;
    const offset = getDeterministicOffset(seed, 2.5);

    return {
      latitude: baseCenter.lat + offset.dLat,
      longitude: baseCenter.lng + offset.dLng,
    };
  },

  /**
   * Calculates Haversine distance in Kilometers between two coordinates
   */
  calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  },

  /**
   * Estimates urban travel time in minutes based on distance.
   * Assumes ~15-25 km/h urban average speed (transit + walking buffer) + 5 min transfer buffer.
   */
  estimateTravelTimeMinutes(distanceKm: number): number {
    if (distanceKm <= 0.3) return 5;
    if (distanceKm <= 1.0) return 10;
    // ~20 km/h average city transit speed + 5 min walking/waiting buffer
    const minutes = Math.round((distanceKm / 20) * 60 + 5);
    return Math.max(5, Math.min(minutes, 180));
  },

  /**
   * Formats travel minutes to readable display, e.g. "1h 20m" or "25 min"
   */
  formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },
};
