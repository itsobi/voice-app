'use client';

import { useVoiceDialogStore } from '@/lib/store';
import { Button } from './ui/button';
export function Header() {
  const { open } = useVoiceDialogStore();
  return (
    <div>
      <Button variant="outline" onClick={open}>
        <span className="text-xl">🎙️</span>
      </Button>
    </div>
  );
}
