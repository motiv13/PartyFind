import type { Player } from "@/types/player";

export const players: Player[] = [
{
  id: 1,
  name: "ZNOVVIN",
  avatar: "https://api.dicebear.com/9.x/pixel-art/png?seed=ZNOVVIN",
  game: "World of Warcraft",
  role: "Tank",
  ilvl: 722,
  country: "Ukraine",
  online: true,
  voice: true,

  bio: "Looking for Mythic+ groups, Heroic raids and friendly teammates. Usually online after 19:00.",

  discord: "ZNOVVIN#1234",

  languages: [
    "Ukrainian",
    "English",
  ],

  favoriteGames: [
    "World of Warcraft",
    "Counter-Strike 2",
    "Valorant",
  ],

  lookingFor: [
    "Mythic+",
    "Heroic Raid",
    "PvE",
  ],
},

{
  id: 2,
  name: "Alex",
  avatar: "https://api.dicebear.com/9.x/pixel-art/png?seed=Alex",
  game: "Valorant",
  role: "Duelist",
  rank: "Immortal",
  country: "Poland",
  online: true,
  voice: true,

  bio: "Competitive Valorant player looking for a consistent ranked team. Active every evening.",

  discord: "Alex#9281",

  languages: [
    "English",
    "Polish",
  ],

  favoriteGames: [
    "Valorant",
    "Counter-Strike 2",
    "Apex Legends",
  ],

  lookingFor: [
    "Ranked",
    "Premier",
    "Voice Chat",
  ],
},

{
  id: 3,
  name: "Kate",
  avatar: "https://api.dicebear.com/9.x/pixel-art/png?seed=Kate",
  game: "League of Legends",
  role: "Support",
  rank: "Diamond",
  country: "Germany",
  online: false,
  voice: true,

  bio: "Support main. Looking for ADC duo and Clash teammates. Friendly and tilt-free.",

  discord: "Kate#5510",

  languages: [
    "English",
    "German",
  ],

  favoriteGames: [
    "League of Legends",
    "Valorant",
    "Overwatch 2",
  ],

  lookingFor: [
    "Ranked",
    "Clash",
    "Duo",
  ],
},

{
  id: 4,
  name: "John",
  avatar: "https://api.dicebear.com/9.x/pixel-art/png?seed=John",
  game: "Counter-Strike 2",
  role: "AWPer",
  rank: "Faceit 10",
  country: "France",
  online: true,
  voice: false,

  bio: "Experienced AWPer searching for serious Faceit teammates. Calm communication preferred.",

  discord: "John#4412",

  languages: [
    "French",
    "English",
  ],

  favoriteGames: [
    "Counter-Strike 2",
    "Valorant",
    "PUBG",
  ],

  lookingFor: [
    "Faceit",
    "Premier",
    "Competitive",
  ],
},

{
  id: 5,
  name: "Mike",
  avatar: "https://api.dicebear.com/9.x/pixel-art/png?seed=Mike",
  game: "Apex Legends",
  role: "Fragger",
  rank: "Predator",
  country: "USA",
  online: true,
  voice: true,

  bio: "Predator player looking for an active squad to grind ranked every season.",

  discord: "Mike#8732",

  languages: [
    "English",
  ],

  favoriteGames: [
    "Apex Legends",
    "Call of Duty",
    "Valorant",
  ],

  lookingFor: [
    "Ranked",
    "Battle Royale",
    "Voice Chat",
  ],
},

{
  id: 6,
  name: "Sarah",
  avatar: "https://api.dicebear.com/9.x/pixel-art/png?seed=Sarah",
  game: "Destiny 2",
  role: "Warlock",
  rank: "Guardian",
  country: "Canada",
  online: false,
  voice: true,

  bio: "PvE player looking for raid groups and relaxed people to complete weekly activities.",

  discord: "Sarah#1458",

  languages: [
    "English",
  ],

  favoriteGames: [
    "Destiny 2",
    "World of Warcraft",
    "Diablo IV",
  ],

  lookingFor: [
    "Raid",
    "PvE",
    "Weekly Activities",
  ],
},
];