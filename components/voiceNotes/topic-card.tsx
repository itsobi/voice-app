'use client';

import { TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const topicMap = {
  'twenty-somethings': {
    emoji: '👨‍🎓',
    title: 'Twenty-somethings',
    description:
      'Your twenties are an interesting time. Chime in on the conversation!',
  },
  technology: {
    emoji: '💻',
    title: 'Technology',
    description:
      'We are in the golden age of technology. Join in on the conversation!',
  },
  sports: {
    emoji: '🏃‍♂️',
    title: 'Sports',
    description:
      'Can never go wrong with sports! Interact with other sport fans across the world',
  },
  politics: {
    emoji: '🗳️',
    title: 'Politics',
    description:
      'Different viewpoints and perspectives from different cultures. Join in on the conversation!',
  },
};

interface TopicCardProps {
  topic: string;
  count: number;
}

export function TopicCard({ topic, count }: TopicCardProps) {
  return (
    <div className="border rounded">
      <div className="bg-muted-foreground/10 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <p>{topicMap[topic as keyof typeof topicMap].emoji}</p>
            <p className="font-semibold uppercase">
              {topicMap[topic as keyof typeof topicMap].title}
            </p>
          </div>
          {count > 0 && (
            <div className="flex items-center gap-1 text-sm border rounded-full py-1 px-2 bg-green-500 text-white">
              <TrendingUp className="w-4 h-4" />
              <p className="font-semibold  text-xs">Popular</p>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {topicMap[topic as keyof typeof topicMap].description}
        </p>
      </div>
      <div className="flex justify-end text-sm text-muted-foreground p-4">
        <p>
          {count} voice {count === 1 ? 'note' : 'notes'}
        </p>
      </div>

      <div className="px-4 pb-4">
        <Button className="w-full" asChild>
          <Link href={`/${topic}`}>View Room</Link>
        </Button>
      </div>
    </div>
  );
}
