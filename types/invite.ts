export type PartyInvite = {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  role: string;
  game: string;
  note: string;
  status: "pending" | "accepted" | "declined";
  direction: "incoming" | "outgoing";
  createdAt: string;
};
