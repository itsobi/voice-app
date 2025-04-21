import { VoiceNotesWrapper } from '@/components/voiceNotes/voice-notes-wrapper';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';

export default async function SportsTopic() {
  const preloadedVoiceNotes = await preloadQuery(api.voiceNotes.getVoiceNotes, {
    topic: 'sports',
  });
  return <VoiceNotesWrapper preloadedVoiceNotes={preloadedVoiceNotes} />;
}
