import { Id } from '@/convex/_generated/dataModel';
import { create } from 'zustand';
import { Topic } from './types';

interface VoiceDialogState {
  isOpen: boolean;
  close: () => void;
  open: (
    parentId: Id<'voiceNotes'> | undefined,
    topic: Topic | undefined
  ) => void;
  parentId: Id<'voiceNotes'> | undefined;
  topic: Topic | undefined;
}

export const useVoiceDialogStore = create<VoiceDialogState>((set) => ({
  isOpen: false,
  close: () => set({ isOpen: false }),
  open: (parentId, topic) => set({ isOpen: true, parentId, topic }),
  parentId: undefined,
  topic: undefined,
}));
