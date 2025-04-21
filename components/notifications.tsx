'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { getTimeAgo } from '@/lib/helpers';
import Link from 'next/link';

export function Notifications() {
  const { user } = useUser();
  const notifications = useQuery(api.notifications.getNotifications, {
    userId: user?.id ?? '',
  });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button variant="outline">
            <span className="text-lg">🔔</span>
          </Button>
          {notifications?.length ? (
            <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-xs flex items-center justify-center bg-red-500 rounded-full text-white">
              {notifications?.length}
            </span>
          ) : null}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
        <div className="flex justify-center items-center">
          {notifications?.length ? (
            <Button
              onClick={() => {
                if (notifications.length) {
                  markAllAsRead({
                    notificationIds: notifications.map(
                      (notification) => notification._id
                    ),
                  });
                }
              }}
              variant="link"
              className="w-fit text-sm font-normal"
            >
              Mark all as read
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">No notifications</p>
          )}
        </div>

        {notifications?.map((notification) => (
          <DropdownMenuItem key={notification._id}>
            <Link
              href={`/${notification.topic}/${notification.voiceNoteId}`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead({ notificationId: notification._id });
                }
              }}
              className="flex flex-col gap-y-2"
            >
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
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
