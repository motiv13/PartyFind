export type Player = {
  id: number;

  name: string;
  avatar: string;

  game: string;
  role: string;

  country: string;

  online: boolean;
  voice: boolean;

  ilvl?: number;
  rank?: string;

  // Профиль
  bio: string;
  discord: string;
  languages: string[];
  favoriteGames: string[];
  lookingFor: string[];
};