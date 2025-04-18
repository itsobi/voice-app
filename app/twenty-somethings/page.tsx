import { VoiceNotesWrapper } from '@/components/voiceNotes/voice-notes-wrapper';
import { api } from '@/convex/_generated/api';
import { preloadQuery } from 'convex/nextjs';

export default async function TwentySomethingsTopic() {
  const preloadedVoiceNotes = await preloadQuery(api.voiceNotes.getVoiceNotes, {
    topic: 'twenty-somethings',
  });
  return <VoiceNotesWrapper preloadedVoiceNotes={preloadedVoiceNotes} />;
}
