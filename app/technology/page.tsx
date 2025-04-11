import { VoiceNotesWrapper } from '@/components/voiceNotes/voice-notes-wrapper';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';

export default async function TechnologyPage() {
  const preloadedVoiceNotes = await preloadQuery(api.voiceNotes.getVoiceNotes, {
    topic: 'technology',
  });
  return <VoiceNotesWrapper preloadedVoiceNotes={preloadedVoiceNotes} />;
}
