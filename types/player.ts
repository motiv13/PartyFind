export type Player = {
  id: number;
  name: string;
  game: string;
  role: string;
  country: string;
  online: boolean;
  voice: boolean;
  ilvl?: number;
  rank?: string;
};