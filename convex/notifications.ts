import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createNotification = mutation({
  args: {
    recipientClerkId: v.string(),
    senderClerkId: v.string(),
    voiceNoteId: v.id('voiceNotes'),
    type: v.union(v.literal('like'), v.literal('reply')),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    if (args.recipientClerkId === args.senderClerkId) {
      return;
    }

    await ctx.db.insert('notifications', {
      recipientClerkId: args.recipientClerkId,
      senderClerkId: args.senderClerkId,
      voiceNoteId: args.voiceNoteId,
      type: args.type,
      topic: args.topic,
      read: false,
    });
  },
});

export const getNotifications = query({
  args: {
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_recipient_clerk_id', (q) =>
        q.eq('recipientClerkId', args.recipientClerkId)
      )
      .filter((q) => q.eq(q.field('read'), false))
      .order('desc')
      .collect();

    const clerkIds = [
      ...new Set(
        notifications.map((notification) => notification.senderClerkId)
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
      sender: userMap.get(notification.senderClerkId),
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
