import { VoiceNotesWrapper } from '@/components/voiceNotes/voice-notes-wrapper';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';

export default async function PoliticsTopic() {
  const preloadedVoiceNotes = await preloadQuery(api.voiceNotes.getVoiceNotes, {
    topic: 'politics',
  });
  return <VoiceNotesWrapper preloadedVoiceNotes={preloadedVoiceNotes} />;
}
