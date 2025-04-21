'use client';

import { usePathname } from 'next/navigation';

const headerDetails = {
  '/': {
    header: '🏠 Welcome to Talk-It',
    description: `Words on a screen won't tell you the whole story. Take a second, listen, understand, and respond to others across the world. You'll be surprised to what you learn.`,
  },
  '/twenty-somethings': {
    header: '👨‍🎓 Twenty-somethings',
    description:
      'Your twenties are an interesting time. Chime in on the conversation!',
  },
  '/technology': {
    header: '💻 Technology',
    description:
      'We are in the golden age of technology. Join in on the conversation!',
  },
  '/sports': {
    header: '🏃‍♂️ Sports',
    description:
      'Can never go wrong with sports! Interact with other sport fans across the world',
  },
  '/politics': {
    header: '🗳️ Politics',
    description:
      'Different viewpoints and perspectives from different cultures. Join in on the conversation!',
  },
} as const;
export function PageHeader() {
  const pathname = usePathname();
  const details = headerDetails[pathname as keyof typeof headerDetails];

  const hasId = pathname?.split('/').length > 2;

  return (
    <div className="flex flex-col mb-6 lg:mb-8">
      <h1 className="text-2xl font-semibold">
        {hasId ? 'Voice Note' : details?.header}
      </h1>
      {details?.description && (
        <p className="text-sm text-muted-foreground">{details?.description}</p>
      )}
    </div>
  );
}
