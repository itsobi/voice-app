'use client';

import { Topic, VoiceNote } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getTimeAgo } from '@/lib/helpers';
import { Checkmark } from './voice-note';
import { ChevronDown, Clock, CornerDownRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useVoiceDialogStore } from '@/lib/store';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SignedIn, useUser } from '@clerk/nextjs';

interface ReplyVoiceNoteProps {
  voiceNote: VoiceNote;
  showSeparator: boolean;
  level: number;
}

export default function ReplyVoiceNote({
  voiceNote,
  showSeparator,
  level,
}: ReplyVoiceNoteProps) {
  const timeStamp = getTimeAgo(voiceNote._creationTime);
  const { open } = useVoiceDialogStore();
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  return (
    <div
      className={cn('p-4', level > 0 && 'pl-4 border-l-2 border-muted ml-3')}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Avatar className="mr-0.5">
            <AvatarImage src={voiceNote.user?.imageUrl} />
            <AvatarFallback>
              {voiceNote.user?.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium mr-1.5">
            @{voiceNote.user?.username}
            {voiceNote.user?.isPro && <Checkmark />}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{timeStamp}</span>
      </div>
      <div className="mt-2">
        {voiceNote.url ? (
          <div>
            <span className="flex items-center gap-1 text-sm text-muted-foreground p-2">
              <Clock className="w-4 h-4" />{' '}
              {Math.floor(voiceNote.duration / 1000)}s
            </span>
            <audio src={voiceNote.url} controls className="w-full" />
          </div>
        ) : (
          <span className="text-xs text-red-500">
            Sorry this audio is not available.
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <SignedIn>
          <Button
            onClick={() => {
              open(voiceNote._id, voiceNote.topic as Topic, voiceNote.clerkId);
            }}
            variant="ghost"
            className="w-fit flex items-center gap-2 text-xs"
          >
            <CornerDownRight className="w-4 h-4" /> <span>Reply</span>
          </Button>
        </SignedIn>
        {voiceNote.replies.length > 0 && (
          <Button
            onClick={() => {
              setIsRepliesOpen(!isRepliesOpen);
            }}
            variant="ghost"
            className="w-fit flex items-center gap-2 text-xs"
          >
            <ChevronDown
              className={cn('w-4 h-4', isRepliesOpen && 'rotate-180')}
            />{' '}
            <span>
              {isRepliesOpen
                ? 'Hide replies'
                : `Show ${voiceNote.replies.length} ${voiceNote.replies.length > 1 ? 'replies' : 'reply'}`}
            </span>
          </Button>
        )}
      </div>
      {isRepliesOpen &&
        voiceNote.replies.map((reply, index) => (
          <ReplyVoiceNote
            key={reply._id}
            level={level + 1}
            showSeparator={index !== voiceNote.replies.length - 1}
            voiceNote={reply}
          />
        ))}
      {showSeparator && <hr className="my-4" />}
    </div>
  );
}
