import { TopicsCardWrapper } from '@/components/voiceNotes/topics-card-wrapper';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';

export default async function Home() {
  const preloadedVoiceNotesCount = await preloadQuery(
    api.voiceNotes.getAllParentVoiceNotes
  );

  if (!preloadedVoiceNotesCount) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">No voice notes found</h1>
      </div>
    );
  }

  return (
    <TopicsCardWrapper preloadedVoiceNotesCount={preloadedVoiceNotesCount} />
  );
}
