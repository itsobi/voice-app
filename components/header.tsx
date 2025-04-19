'use client';

import { useVoiceDialogStore } from '@/lib/store';
import { Button } from './ui/button';
import { SidebarTrigger } from './ui/sidebar';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Notifications } from './notifications';
export function Header() {
  const { open } = useVoiceDialogStore();
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <SidebarTrigger />

      <div className="flex items-center gap-4">
        <SignedOut>
          <Button
            variant="outline"
            onClick={() =>
              toast.info('You must be signed in to create a voice note!', {
                position: 'top-center',
              })
            }
          >
            <span className="text-xl">🎙️</span>
          </Button>
          <SignInButton mode="modal">
            <Button variant="outline" className="text-xs font-light">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button
            variant="outline"
            onClick={() => open(undefined, undefined, undefined)}
          >
            <span className="text-lg">🎙️</span>
          </Button>
          <Notifications />
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
