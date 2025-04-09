'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useVoiceDialogStore } from '@/lib/store';
import { useEffect, useRef, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Hand, Mic, Pause, Play, Trash } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Topic } from '@/lib/types';

export function VoiceRecordDialog() {
  const { isOpen, close } = useVoiceDialogStore();
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [topic, setTopic] = useState<Topic | ''>('');
  const [isPending, startTransition] = useTransition();
  const generateUploadUrl = useMutation(api.voiceNotes.generateUploadUrl);
  const sendVoiceNote = useMutation(api.voiceNotes.sendVoiceNote);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current); // clear the interval when the component unmounts
      }

      if (audioURL) {
        URL.revokeObjectURL(audioURL); // revoke the object URL when the component unmounts
        setAudioURL(null);
      }
    };
  }, [audioURL, isOpen]);

  // reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearRecording();
      setTopic('');
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (isOpen) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);

          // Audio element for playback
          const audio = new Audio(url);
          audioRef.current = audio;
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime > 29) {
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
              setIsPaused(false);
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 30;
          }
          return prevTime + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(
        'Could not access microphone. Please check your browser permissions.'
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setIsRecording(true);

      // resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime > 29) {
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
              setIsPaused(false);
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 30;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    setIsPaused(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isRecording || isPaused) {
      mediaRecorderRef.current.stop();

      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  };

  const clearRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Reset all refs
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];

    setAudioURL(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleVoiceNoteUpload = async () => {
    startTransition(async () => {
      if (!user || !topic) return;
      const voiceNoteUrl = await generateUploadUrl();
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm',
      });
      const result = await fetch(voiceNoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: audioBlob,
      });
      const { storageId } = await result.json();
      const { success, message } = await sendVoiceNote({
        clerkId: user.id,
        storageId,
        topic: topic,
        duration: recordingTime,
      });
      if (success) {
        toast.success(message);
        close();
      } else {
        toast.error(message);
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogTrigger className="hidden">Open</DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle className="text-left">Voice Record</DialogTitle>
          <DialogDescription>
            Select a topic and press the microphone to start recording. You have
            30 seconds to record your note.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 w-full">
          <label
            htmlFor="room-select"
            className="block text-sm font-medium mb-2"
          >
            Select Topic
          </label>
          <Select
            value={topic}
            onValueChange={(value) => setTopic(value as Topic)}
          >
            <SelectTrigger id="room-select" className="w-full">
              <SelectValue placeholder="Select the topic" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="twenty-somethings">
                Twenty-somethings
              </SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="politics">Politics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-center gap-4">
          {/* Timer */}

          <div className="flex justify-center items-center gap-2">
            {!audioURL && (
              <span
                className={cn(
                  'text-lg font-thin',
                  isRecording && recordingTime > 19
                    ? 'text-red-500 animate-pulse'
                    : isRecording && recordingTime > 14
                      ? 'text-yellow-400 animate-pulse'
                      : isRecording && 'text-primary animate-pulse'
                )}
              >
                {formatTime(recordingTime)}
              </span>
            )}

            {isRecording && (
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>

          {/* Controls */}
          <div>
            {!audioURL ? (
              <div className="flex items-center justify-center gap-4">
                {!isRecording && !isPaused ? (
                  <Button
                    variant={'ghost'}
                    onClick={startRecording}
                    className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-500/70 text-xl"
                  >
                    <Mic className="text-white" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      onClick={stopRecording}
                      className="h-14 w-14 rounded-full"
                    >
                      <Hand className="text-red-500" />
                    </Button>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="h-14 w-14 rounded-full"
                    >
                      <span className="text-xl">
                        {isPaused ? <Play /> : <Pause />}
                      </span>
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-4 mb-6">
                  <audio src={audioURL} controls />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full"
                    onClick={clearRecording}
                  >
                    <Trash className="text-red-500" />
                  </Button>
                </div>
                <Button
                  onClick={handleVoiceNoteUpload}
                  disabled={!audioURL || !topic}
                  className="w-full"
                >
                  {isPending ? (
                    <span className="animate-pulse">Uploading...</span>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
