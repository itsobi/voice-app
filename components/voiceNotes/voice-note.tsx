'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { ChevronDown, Clock, Heart, Mic } from 'lucide-react';

import {
  Topic,
  voiceNoteTopicMap,
  VoiceNote as VoiceNoteType,
} from '@/lib/types';
import { getTimeAgo } from '@/lib/helpers';
import { useState, useTransition } from 'react';
import { useVoiceDialogStore } from '@/lib/store';
import ReplyVoiceNote from './reply-voice-note';
import { cn } from '@/lib/utils';
import { DeleteButton } from './delete-button';
import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function Checkmark() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.25 6.75L9.75 17.25L4.5 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

interface VoiceNoteProps {
  voiceNote: VoiceNoteType;
}

export function VoiceNote({ voiceNote }: VoiceNoteProps) {
  const { open } = useVoiceDialogStore();
  const { user } = useUser();
  const timeStamp = getTimeAgo(voiceNote._creationTime);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const likeVoiceNote = useMutation(api.voiceNotes.likeVoiceNote);

  const handleLikeVoiceNote = async () => {
    startTransition(async () => {
      const response = await likeVoiceNote({
        voiceNoteId: voiceNote._id,
        likingClerkId: user?.id ?? '',
        voiceNoteClerkId: voiceNote.clerkId,
        topic: voiceNote.topic,
      });

      if (response && !response.success) {
        toast.error(response.message);
      }
    });
  };

  if (voiceNote.url) {
    return (
      <Card className="w-full h-fit">
        <CardHeader className="flex justify-between">
          <div className="flex gap-1">
            <Avatar>
              <AvatarImage src={voiceNote.user?.imageUrl} />
              <AvatarFallback>{voiceNote.user?.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                @{voiceNote.user?.username}{' '}
                {voiceNote.user?.isPro && <Checkmark />}
              </p>
              <p className="text-xs text-muted-foreground">{timeStamp}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {
                voiceNoteTopicMap[
                  voiceNote.topic as keyof typeof voiceNoteTopicMap
                ]
              }
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {pathname === '/' ||
            (pathname === `/${voiceNote.topic}` && (
              <Link
                href={`/${voiceNote.topic}/${voiceNote._id}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                Go to voice note
              </Link>
            ))}
          <p className="flex items-center gap-1 text-sm text-muted-foreground p-2 justify-end">
            <Clock className="w-4 h-4" />{' '}
            {Math.floor(voiceNote.duration / 1000)}s
          </p>
          <audio src={voiceNote.url ?? ''} controls className="w-full" />
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex gap-2">
              <div className="relative">
                {voiceNote.likedBy?.length ? (
                  <div className="absolute flex items-center justify-center w-5 h-5 -top-2 -right-1 rounded-full bg-green-500 z-10">
                    <span
                      className={cn(
                        voiceNote.likedBy.length && 'text-white text-sm'
                      )}
                    >
                      {voiceNote.likedBy.length}
                    </span>
                  </div>
                ) : null}
                <Button
                  onClick={handleLikeVoiceNote}
                  variant={'outline'}
                  disabled={!user?.id || isPending}
                >
                  <Heart />
                </Button>
              </div>

              <Button
                variant={'outline'}
                onClick={() =>
                  open(
                    voiceNote._id,
                    voiceNote.topic as Topic,
                    voiceNote.clerkId
                  )
                }
                disabled={!user?.id || isPending}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>

            {user?.id === voiceNote.clerkId && (
              <div className="ml-auto">
                <DeleteButton
                  voiceNoteId={voiceNote._id}
                  voiceNoteClerkId={voiceNote.clerkId}
                  storageId={voiceNote.storageId}
                />
              </div>
            )}
          </div>

          {voiceNote.replies.length > 0 && (
            <button
              onClick={() => setIsRepliesOpen(!isRepliesOpen)}
              className="flex justify-between w-full items-center hover:bg-muted p-2 rounded-md cursor-pointer"
            >
              <span className="text-xs font-semibold">
                {`${voiceNote.replies.length} ${voiceNote.replies.length > 1 ? 'replies' : 'reply'}`}{' '}
              </span>
              <ChevronDown
                className={cn('w-4 h-4', isRepliesOpen && 'rotate-180')}
              />
            </button>
          )}

          {isRepliesOpen && (
            <div className="flex flex-col gap-2 w-full max-h-[300px] overflow-y-auto">
              <hr className="w-full my-4" />
              {voiceNote.replies.map((reply, index) => (
                <ReplyVoiceNote
                  key={reply._id}
                  voiceNote={reply}
                  showSeparator={index !== voiceNote.replies.length - 1}
                  level={0}
                />
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    );
  } else return null;
}
