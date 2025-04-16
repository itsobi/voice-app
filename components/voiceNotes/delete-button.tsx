'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Trash } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeleteButtonProps {
  voiceNoteId: Id<'voiceNotes'>;
  voiceNoteClerkId: string;
  storageId: Id<'_storage'>;
}

export function DeleteButton({
  voiceNoteId,
  voiceNoteClerkId,
  storageId,
}: DeleteButtonProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deleteVoiceNote = useMutation(api.voiceNotes.deleteVoiceNote);

  const handleDeleteVoiceNote = async () => {
    startTransition(async () => {
      const { success, message } = await deleteVoiceNote({
        voiceNoteId,
        storageId: storageId,
        clerkId: user?.id ?? '',
        voiceNoteClerkId,
      });

      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant={'outline'}>
          <Trash className="text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            audio note.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row w-full">
          <Button
            onClick={() => setIsOpen(false)}
            variant={'secondary'}
            className="w-1/2"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVoiceNote}
            variant={'destructive'}
            className={cn('w-1/2', isPending && 'animate-pulse')}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
