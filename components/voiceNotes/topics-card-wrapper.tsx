'use client';

import { Preloaded, usePreloadedQuery } from 'convex/react';
import { TopicCard } from './topic-card';
import { api } from '@/convex/_generated/api';

interface TopicsCardWrapperProps {
  preloadedVoiceNotesCount: Preloaded<
    typeof api.voiceNotes.getAllParentVoiceNotes
  >;
}

export function TopicsCardWrapper({
  preloadedVoiceNotesCount,
}: TopicsCardWrapperProps) {
  const voiceNotesCount = usePreloadedQuery(preloadedVoiceNotesCount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Object.entries(voiceNotesCount)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([topic, count]) => (
          <TopicCard key={topic} topic={topic} count={count} />
        ))}
    </div>
  );
}
