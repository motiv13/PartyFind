import CommunityDetailsPage from "@/components/communities/CommunityDetailsPage";

export default async function CommunityPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  return <CommunityDetailsPage communityId={communityId} />;
}
