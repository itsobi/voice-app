import { TopicsCardWrapper } from '@/components/voiceNotes/topics-card-wrapper';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';

export default async function Home() {
  const preloadedVoiceNotesCount = await preloadQuery(
    api.voiceNotes.getAllParentVoiceNotes
  );

  return (
    <TopicsCardWrapper preloadedVoiceNotesCount={preloadedVoiceNotesCount} />
  );
}
