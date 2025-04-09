import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendVoiceNote = mutation({
  args: {
    clerkId: v.string(),
    storageId: v.id('_storage'),
    topic: v.union(
      v.literal('twenty-somethings'),
      v.literal('technology'),
      v.literal('sports'),
      v.literal('politics')
    ),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    try {
      await ctx.db.insert('voiceNotes', {
        clerkId: args.clerkId,
        storageId: args.storageId,
        topic: args.topic,
        duration: args.duration,
      });
      return { success: true, message: 'Voice note sent successfully' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Failed to send voice note' };
    }
  },
});

export const getVoiceNotes = query({
  args: {
    topic: v.union(
      v.literal('twenty-somethings'),
      v.literal('technology'),
      v.literal('sports'),
      v.literal('politics')
    ),
  },
  handler: async (ctx, args) => {
    const voiceNotes = await ctx.db
      .query('voiceNotes')
      .withIndex('by_topic', (q) => q.eq('topic', args.topic))
      .order('desc')
      .collect();

    const clerkIds = [
      ...new Set(voiceNotes.map((voiceNote) => voiceNote.clerkId)),
    ];

    const users = await Promise.all(
      clerkIds.map(async (clerkId) =>
        ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
          .first()
      )
    );

    const userMap = new Map(
      users.filter((user) => user !== null).map((user) => [user.clerkId, user])
    );

    return Promise.all(
      voiceNotes.map(async (voiceNote) => {
        const user = userMap.get(voiceNote.clerkId);
        return {
          ...voiceNote,
          url: await ctx.storage.getUrl(voiceNote.storageId),
          user: user,
        };
      })
    );
  },
});

// ... existing code ...

export const getAllTopicCounts = query({
  args: {},
  handler: async (ctx) => {
    const topics = [
      'twenty-somethings',
      'technology',
      'sports',
      'politics',
    ] as const;

    const voiceNotes = await ctx.db.query('voiceNotes').collect();

    const counts = Object.fromEntries(
      topics.map((topic) => [
        topic,
        voiceNotes.filter((note) => note.topic === topic).length,
      ])
    );

    return counts;
  },
});
