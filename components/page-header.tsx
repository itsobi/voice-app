'use client';

import { usePathname } from 'next/navigation';

const headerDetails = {
  '/': {
    header: '🏠 Home',
    description: undefined,
  },
  '/twenty-somethings': {
    header: '👨‍🎓 Twenty-somethings',
    description:
      'Your twenties are an interesting time. Chime in on the conversation!',
  },
} as const;
export function PageHeader() {
  const pathname = usePathname();
  const details = headerDetails[pathname as keyof typeof headerDetails];
  return (
    <div className="flex flex-col mb-6 lg:mb-8">
      <h1 className="text-2xl">{details?.header}</h1>
      {details?.description && (
        <p className="text-sm text-muted-foreground">{details?.description}</p>
      )}
    </div>
  );
}
