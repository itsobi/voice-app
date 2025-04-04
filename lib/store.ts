import { create } from 'zustand';

interface VoiceDialogState {
  isOpen: boolean;
  close: () => void;
  open: () => void;
}

export const useVoiceDialogStore = create<VoiceDialogState>((set) => ({
  isOpen: false,
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
}));
