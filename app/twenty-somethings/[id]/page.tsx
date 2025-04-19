import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { VoiceNoteWrapper } from '@/components/voiceNotes/voice-note-wrapper';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { preloadQuery } from 'convex/nextjs';
import Link from 'next/link';

export default async function VoiceNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Add try-catch block to handle invalid IDs
  try {
    const preloadedVoiceNote = await preloadQuery(
      api.voiceNotes.getVoiceNoteById,
      {
        voiceNoteId: id as Id<'voiceNotes'>,
      }
    );

    if (!preloadedVoiceNote) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <p>Voice note not found</p>
        </div>
      );
    }
    return <VoiceNoteWrapper preloadedVoiceNote={preloadedVoiceNote} />;
  } catch (error) {
    return (
      <AlertDialog open={true}>
        <AlertDialogTrigger className="hidden">Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid voice note ID</AlertDialogTitle>
            <AlertDialogDescription>
              Sorry, this voice note does not exist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link href="/">OK</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
}
