'use client';

import { api } from '@/convex/_generated/api';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getTimeAgo } from '@/lib/helpers';
import { Button } from '../ui/button';
import { HeartIcon, Mic, Trash } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { DeleteButton } from './delete-button';

function Reply({ reply }: { reply: any }) {
  const [showNestedReplies, setShowNestedReplies] = useState(false);
  const { user } = useUser();
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
          <Button variant="outline">
            <HeartIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline">
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
            <Button variant="outline">
              <HeartIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline">
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
