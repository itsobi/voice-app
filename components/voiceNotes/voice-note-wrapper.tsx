'use client';

import { api } from '@/convex/_generated/api';
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getTimeAgo } from '@/lib/helpers';
import { Button } from '../ui/button';
import { Heart, Mic } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useUser } from '@clerk/clerk-react';
import { DeleteButton } from './delete-button';
import { Topic } from '@/lib/types';
import { useVoiceDialogStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function Reply({ reply }: { reply: any }) {
  const [showNestedReplies, setShowNestedReplies] = useState(false);
  const { user } = useUser();
  const { open } = useVoiceDialogStore();
  const [isPending, startTransition] = useTransition();

  const likeVoiceNote = useMutation(api.voiceNotes.likeVoiceNote);

  const handleLikeVoiceNote = async () => {
    startTransition(async () => {
      const response = await likeVoiceNote({
        likingClerkId: user?.id ?? '',
        voiceNoteClerkId: reply.clerkId,
        voiceNoteId: reply._id,
        topic: reply.topic,
      });

      if (response && !response.success) {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-2">
        <Avatar>
          <AvatarImage src={reply.user.imageUrl} />
          <AvatarFallback>{reply.user.username?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p>@{reply.user.username}</p>
          <p className="text-xs text-muted-foreground">
            {getTimeAgo(reply._creationTime)}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {Math.floor(reply.duration / 1000)}s
      </p>
      <audio src={reply.url} controls className="w-full" />
      <div className="flex justify-between gap-x-2 mt-4">
        <div className="flex gap-x-2">
          <div className="relative">
            {reply.likedBy?.length ? (
              <div className="absolute flex items-center justify-center w-5 h-5 -top-2 -right-1 rounded-full bg-green-500 z-10">
                <span
                  className={cn(reply.likedBy.length && 'text-white text-sm')}
                >
                  {reply.likedBy.length}
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
            onClick={() => open(reply._id, reply.topic as Topic, reply.clerkId)}
            disabled={!user?.id || isPending}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        {user?.id === reply.clerkId && (
          <DeleteButton
            voiceNoteId={reply._id}
            voiceNoteClerkId={reply.clerkId}
            storageId={reply.storageId}
          />
        )}
      </div>
      {reply.replies?.length > 0 && (
        <div className="flex flex-col gap-y-4">
          <Button
            variant="link"
            onClick={() => setShowNestedReplies(!showNestedReplies)}
          >
            {showNestedReplies ? 'Hide Replies' : 'Show Replies'}
          </Button>
          {showNestedReplies && (
            <div className="flex flex-col gap-y-4 ml-8">
              {reply.replies
                .sort((a: any, b: any) => b._creationTime - a._creationTime)
                .map((nestedReply: any) => (
                  <Reply key={nestedReply._id} reply={nestedReply} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VoiceNoteWrapperProps {
  preloadedVoiceNote: Preloaded<typeof api.voiceNotes.getVoiceNoteById>;
}

export function VoiceNoteWrapper({
  preloadedVoiceNote,
}: VoiceNoteWrapperProps) {
  const voiceNote = usePreloadedQuery(preloadedVoiceNote);
  const { user } = useUser();
  const { open } = useVoiceDialogStore();
  const [isPending, startTransition] = useTransition();

  const likeVoiceNote = useMutation(api.voiceNotes.likeVoiceNote);

  const handleLikeVoiceNote = async () => {
    startTransition(async () => {
      const response = await likeVoiceNote({
        likingClerkId: user?.id ?? '',
        voiceNoteClerkId: voiceNote.clerkId,
        voiceNoteId: voiceNote._id,
        topic: voiceNote.topic,
      });

      if (response && !response.success) {
        toast.error(response.message);
      }
    });
  };

  if (!voiceNote) {
    return (
      <div className="flex justify-center items-center">
        <p>Voice note not found</p>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col gap-y-8 p-4 rounded min-w-[400px] lg:min-w-[600px]">
        <div className="flex gap-1">
          <Avatar>
            <AvatarImage src={voiceNote?.user?.imageUrl} />
            <AvatarFallback>{voiceNote?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p>@{voiceNote?.user?.username}</p>
            <p className="text-xs text-muted-foreground">
              {getTimeAgo(voiceNote?._creationTime)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {Math.floor(voiceNote?.duration / 1000)}s
          </p>
          <audio src={voiceNote?.url} controls className="w-full" />
        </div>

        <div className="flex justify-between">
          <div className="flex gap-x-2">
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
                open(voiceNote._id, voiceNote.topic as Topic, voiceNote.clerkId)
              }
              disabled={!user?.id}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          {user?.id === voiceNote.clerkId && (
            <DeleteButton
              voiceNoteId={voiceNote._id}
              voiceNoteClerkId={voiceNote.clerkId}
              storageId={voiceNote.storageId}
            />
          )}
        </div>
        <hr className="w-full" />
        <h4 className="text-lg font-semibold">Replies</h4>

        {voiceNote.replies.length > 0 && (
          <div className="flex flex-col gap-y-4">
            {voiceNote.replies
              .sort((a: any, b: any) => b._creationTime - a._creationTime)
              .map((reply: any) => (
                <Reply key={reply._id} reply={reply} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
