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

  if (voiceNotes.length === 0) {
    return (
      <div className="flex justify-center items-center mt-20 text-muted-foreground text-sm">
        <p>No voice notes</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {voiceNotes.map((voiceNote) =>
        voiceNote.url ? (
          <VoiceNote key={voiceNote._id} voiceNote={voiceNote} />
        ) : (
          <div key={voiceNote._id}>
            <div className="text-red-500 text-sm">No audio available</div>
          </div>
        )
      )}
    </div>
  );
}
