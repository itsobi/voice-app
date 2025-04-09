'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import {
  Clock,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash,
  Trash2,
} from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

import { Id } from '@/convex/_generated/dataModel';
import { VoiceNote as VoiceNoteType } from '@/lib/types';
import { getTimeAgo } from '@/lib/helpers';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';

function Checkmark() {
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

export function VoiceNote({ voiceNote }: { voiceNote: VoiceNoteType }) {
  const timeStamp = getTimeAgo(voiceNote._creationTime);

  if (voiceNote.url) {
    return (
      <Card>
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
              👨‍🎓 Twenty-somethings
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-1 text-sm text-muted-foreground p-2">
            <Clock className="w-4 h-4" /> {voiceNote.duration}s
          </p>
          {/* <audio src={voiceNote.url ?? ''} controls className="w-full" /> */}
          <AudioPlayer src={voiceNote.url} />
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <Button variant={'outline'}>
                <Heart />
              </Button>

              <Button variant={'outline'}>
                <MessageCircle className="text-green-500" />
              </Button>
            </div>
            <div>
              <Button
                variant={'outline'}
                onClick={() =>
                  window.confirm('Are you sure you want to delete this note?')
                }
              >
                <Trash className="text-red-500" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  } else return null;
}
