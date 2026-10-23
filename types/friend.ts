export type FriendRelationship = {
  requestId: string;
  playerId: string;
  name: string;
  avatar: string;
  game: string;
  role: string;
  country: string;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing" | "friend";
};
