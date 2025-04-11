import { VoiceNote } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getTimeAgo } from '@/lib/helpers';
import { Checkmark } from './voice-note';
import { Clock, CornerDownRight } from 'lucide-react';
import { Button } from '../ui/button';
interface ReplyVoiceNoteProps {
  voiceNote: VoiceNote;
}

export default function ReplyVoiceNote({ voiceNote }: ReplyVoiceNoteProps) {
  const timeStamp = getTimeAgo(voiceNote._creationTime);
  return (
    <div>
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
            <audio src={voiceNote.url} controls />
          </div>
        ) : (
          <span className="text-xs text-red-500">
            Sorry this audio is not available.
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button variant="ghost" className="w-fit flex items-center gap-2 ">
          <CornerDownRight className="w-4 h-4" /> <span>Reply</span>
        </Button>
        {voiceNote.replies.length > 0 && (
          <Button variant="ghost" className="w-fit flex items-center gap-2 ">
            <span>
              {`Show ${voiceNote.replies.length} ${voiceNote.replies.length > 1 ? 'replies' : 'reply'}`}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
