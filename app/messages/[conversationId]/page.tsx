import ConversationPage from "@/components/messages/ConversationPage";

export default async function MessageConversationRoute({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  return <ConversationPage conversationId={conversationId} />;
}
