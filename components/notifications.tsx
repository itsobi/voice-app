'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { getTimeAgo } from '@/lib/helpers';

export function Notifications() {
  const { user } = useUser();
  const notifications = useQuery(api.notifications.getNotifications, {
    userId: user?.id ?? '',
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button variant="outline">
            <span className="text-lg">🔔</span>
          </Button>
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 text-xs flex items-center justify-center bg-red-500 rounded-full text-white">
            {notifications?.length}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex justify-center items-center">
          <Button variant="link" className="w-fit text-sm font-normal">
            Mark all as read
          </Button>
        </div>

        {notifications?.map((notification) => (
          <DropdownMenuItem key={notification._id}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {notification.type === 'reply' ? 'New Reply' : 'New Like'}
                </p>
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                @{notification.sender?.username} replied to you!
              </p>
              <p className="text-xs text-muted-foreground">
                {getTimeAgo(notification._creationTime)}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
