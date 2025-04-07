import { v } from 'convex/values';
import { mutation } from './_generated/server';

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
    username: v.string(),
    storageId: v.id('_storage'),
    topic: v.union(
      v.literal('twenty-somethings'),
      v.literal('technology'),
      v.literal('sports'),
      v.literal('politics')
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    try {
      await ctx.db.insert('voiceNotes', {
        clerkId: args.clerkId,
        username: args.username,
        storageId: args.storageId,
        topic: args.topic,
      });
      return { success: true, message: 'Voice note sent successfully' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Failed to send voice note' };
    }
  },
});
