'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useVoiceDialogStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function VoiceRecordDialog() {
  const { isOpen, close } = useVoiceDialogStore();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current); // clear the interval when the component unmounts
      }

      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
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
            type: 'audio/wav',
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
    setPlaybackTime(recordingTime); // Changed from 5 to recordingTime

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

  const playRecording = () => {
    if (audioRef.current && audioURL) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setPlaybackTime(recordingTime); // Reset playback time correctly
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setPlaybackTime(recordingTime); // Ensure the playback timer starts fresh

        playbackTimerRef.current = setInterval(() => {
          setPlaybackTime((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(playbackTimerRef.current!);
              setIsPlaying(false);
              return recordingTime; // Reset time after finishing
            }
            return prevTime - 1;
          });
        }, 1000);

        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlaybackTime(recordingTime); // Reset to full duration
          if (playbackTimerRef.current) {
            clearInterval(playbackTimerRef.current);
            playbackTimerRef.current = null;
          }
        };
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
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
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
    setPlaybackTime(0);
    setIsPlaying(false);
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
            Click the microphone to start recording. You have 30 seconds to
            record your note.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2">
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
              {formatTime(isPlaying ? playbackTime : recordingTime)}
            </span>
            {isRecording && (
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!audioURL ? (
              <>
                {!isRecording && !isPaused ? (
                  <Button
                    variant={'ghost'}
                    onClick={startRecording}
                    className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-500/70 text-xl"
                  >
                    <span className="text-xl">🎙️</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      onClick={stopRecording}
                      className="h-14 w-14 rounded-full"
                    >
                      <span className="text-xl">🛑</span>
                    </Button>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="h-14 w-14 rounded-full"
                    >
                      <span className="text-xl">{isPaused ? '▶️' : '⏸️'}</span>
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size={'icon'}
                  className="h-12 w-12 rounded-full"
                  onClick={playRecording}
                >
                  <span className="text-xl">👂</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={clearRecording}
                >
                  <span className="text-xl">🗑️</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
