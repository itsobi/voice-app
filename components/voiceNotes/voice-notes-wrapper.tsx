'use client';

import { api } from '@/convex/_generated/api';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { VoiceNote } from './voice-note';

interface VoiceNotesWrapperProps {
  preloadedVoiceNotes: Preloaded<typeof api.voiceNotes.getVoiceNotes>;
}

export function VoiceNotesWrapper({
  preloadedVoiceNotes,
}: VoiceNotesWrapperProps) {
  const voiceNotes = usePreloadedQuery(preloadedVoiceNotes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {voiceNotes.map((voiceNote) =>
        voiceNote.url ? (
          <VoiceNote key={voiceNote._id} voiceNote={voiceNote} />
        ) : (
          <div key={voiceNote._id}>
            <div>No audio available</div>
          </div>
        )
      )}
    </div>
  );
}
