import { Id } from '@/convex/_generated/dataModel';

export type Topic = 'twenty-somethings' | 'technology' | 'sports' | 'politics';

export type VoiceNote = {
  _id: Id<'voiceNotes'>;
  clerkId: string;
  storageId: Id<'_storage'>;
  url: string | null;
  _creationTime: number;
  topic: Topic;
  duration: number;
  user?: {
    _id: Id<'users'>;
    clerkId: string;
    email: string;
    username: string;
    imageUrl: string;
    isPro: boolean;
    _creationTime: number;
  };
};
