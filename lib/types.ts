import { Id } from '@/convex/_generated/dataModel';

export type Topic = 'twenty-somethings' | 'technology' | 'sports' | 'politics';

export enum TopicEnum {
  TWENTY_SOMETHINGS = 'twenty-somethings',
  TECHNOLOGY = 'technology',
  SPORTS = 'sports',
  POLITICS = 'politics',
}

export const voiceNoteTopicMap = {
  [TopicEnum.TWENTY_SOMETHINGS]: '👨‍🎓 Twenty-somethings',
  [TopicEnum.TECHNOLOGY]: '💻 Technology',
  [TopicEnum.SPORTS]: '🏃‍♂️ Sports',
  [TopicEnum.POLITICS]: '🗣️ Politics',
};

export type VoiceNote = {
  _id: Id<'voiceNotes'>;
  clerkId: string;
  storageId: Id<'_storage'>;
  url: string | null;
  _creationTime: number;
  topic: string;
  duration: number;
  parentId: string;
  replies: VoiceNote[] | [];
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
