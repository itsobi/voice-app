import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createNotification = mutation({
  args: {
    userId: v.string(),
    senderUserId: v.string(),
    voiceNoteId: v.id('voiceNotes'),
    type: v.union(v.literal('like'), v.literal('reply')),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    if (args.userId === args.senderUserId) {
      return;
    }

    await ctx.db.insert('notifications', {
      userId: args.userId,
      senderUserId: args.senderUserId,
      voiceNoteId: args.voiceNoteId,
      type: args.type,
      topic: args.topic,
      read: false,
    });
  },
});

export const getNotifications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('read'), false))
      .order('desc')
      .collect();

    const clerkIds = [
      ...new Set(
        notifications.map((notification) => notification.senderUserId)
      ),
    ];

    const users = await Promise.all(
      clerkIds.map(async (clerkId) =>
        ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
          .first()
      )
    );

    const userMap = new Map(users.map((user) => [user?.clerkId, user]));

    const enrichedNotifications = notifications.map((notification) => ({
      ...notification,
      sender: userMap.get(notification.senderUserId),
    }));

    return enrichedNotifications;
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

export const markAllAsRead = mutation({
  args: {
    notificationIds: v.array(v.id('notifications')),
  },
  handler: async (ctx, args) => {
    for (const notificationId of args.notificationIds) {
      await ctx.db.patch(notificationId, {
        read: true,
      });
    }
  },
});
