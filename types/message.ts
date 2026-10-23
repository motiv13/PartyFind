export type ConversationSummary = {
  id: string;
  playerId: string;
  name: string;
  avatar: string;
  game: string;
  role: string;
  lastMessage: string;
  updatedAt: string;
};

export type PrivateMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

export type ConversationDetails = {
  conversationId: string;
  otherPlayer: Pick<ConversationSummary, "playerId" | "name" | "avatar" | "game" | "role">;
  messages: PrivateMessage[];
};
