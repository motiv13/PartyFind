export type FeedPost = {
  id: string;
  game: string;
  activity: string;
  title: string;
  body: string;
  eventAt: string | null;
  imageUrl: string | null;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

export type FeedComment = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
};
