import { Mic } from 'lucide-react';
import { Heart } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';

export function VoiceNoteSkeleton() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col gap-y-8 p-4 rounded min-w-[400px] lg:min-w-[600px]">
        {/* User info skeleton */}
        <div className="flex gap-1">
          <div className="animate-pulse">
            <Avatar>
              <AvatarFallback className="bg-muted" />
            </Avatar>
          </div>
          <div className="flex flex-col">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded mt-1 animate-pulse" />
          </div>
        </div>

        {/* Audio player skeleton */}
        <div>
          <div className="h-3 w-8 bg-muted rounded animate-pulse mb-2" />
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            <div className="relative">
              <Button variant="outline" disabled className="opacity-50">
                <Heart />
              </Button>
            </div>
            <Button variant="outline" disabled className="opacity-50">
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
        </div>

        <hr className="w-full" />

        {/* Replies section skeleton */}
        <h4 className="text-lg font-semibold">Replies</h4>

        <div className="flex flex-col gap-y-4">
          {/* Generate 3 reply skeletons */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-2">
              <div className="animate-pulse">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted" />
                </Avatar>
              </div>
              <div className="flex flex-col w-full">
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-2 w-12 bg-muted rounded mt-1 animate-pulse" />
                <div className="h-8 w-full bg-muted rounded mt-2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
