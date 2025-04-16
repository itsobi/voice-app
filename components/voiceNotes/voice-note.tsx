'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { ChevronDown, Clock, Heart, Mic, Trash } from 'lucide-react';

import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

import {
  Topic,
  voiceNoteTopicMap,
  VoiceNote as VoiceNoteType,
} from '@/lib/types';
import { getTimeAgo } from '@/lib/helpers';
import { useState } from 'react';
import { useVoiceDialogStore } from '@/lib/store';
import ReplyVoiceNote from './reply-voice-note';
import { cn } from '@/lib/utils';
import { DeleteButton } from './delete-button';
import { useUser } from '@clerk/clerk-react';

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
  const timeStamp = getTimeAgo(voiceNote._creationTime);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const { user } = useUser();

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
          <p className="flex items-center gap-1 text-sm text-muted-foreground p-2">
            <Clock className="w-4 h-4" />{' '}
            {Math.floor(voiceNote.duration / 1000)}s
          </p>
          {/* <audio src={voiceNote.url ?? ''} controls className="w-full" /> */}
          <AudioPlayer src={voiceNote.url} />
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex gap-2">
              <Button variant={'outline'}>
                <Heart />
              </Button>

              <Button
                variant={'outline'}
                onClick={() => open(voiceNote._id, voiceNote.topic as Topic)}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            {user?.id === voiceNote.clerkId && (
              <div>
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
