import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { TopicEnum } from '@/lib/types';
import { Id } from './_generated/dataModel';

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
    topic: v.string(),
    duration: v.number(),
    isReply: v.boolean(),
    parentId: v.optional(v.id('voiceNotes')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    if (!Object.values(TopicEnum).includes(args.topic as TopicEnum)) {
      throw new Error('Invalid topic');
    }

    try {
      await ctx.db.insert('voiceNotes', {
        clerkId: args.clerkId,
        storageId: args.storageId,
        topic: args.topic,
        duration: args.duration,
        isReply: args.isReply,
        parentId: args.parentId,
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
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Fetch all voice notes for the topic, including replies
    const allVoiceNotes = await ctx.db
      .query('voiceNotes')
      .withIndex('by_topic', (q) => q.eq('topic', args.topic))
      .order('desc')
      .collect();

    // Step 2: Organize notes by ID for quick lookup
    const notesById = new Map<string, any>(
      allVoiceNotes.map((note) => [note._id, { ...note, replies: [] }])
    );

    // Step 3: Build the tree by linking replies to parents
    const topLevelNotes: any[] = [];
    for (const note of allVoiceNotes) {
      if (!note.isReply || !note.parentId) {
        // Top-level note (not a reply)
        topLevelNotes.push(notesById.get(note._id));
      } else if (note.parentId && notesById.has(note.parentId)) {
        // Reply: add to parent's replies array
        const parent = notesById.get(note.parentId);
        if (parent) {
          parent.replies.push(notesById.get(note._id));
        }
      }
    }

    // Step 4: Collect unique clerkIds across all notes
    const clerkIds = [...new Set(allVoiceNotes.map((note) => note.clerkId))];

    // Step 5: Fetch user data in bulk
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

    // Step 6: Enrich notes with URLs and user data, recursively
    const enrichNote = async (note: any): Promise<any> => {
      const user = userMap.get(note.clerkId);
      const url = await ctx.storage.getUrl(note.storageId as Id<'_storage'>);
      return {
        ...note,
        url,
        user,
        replies: await Promise.all(note.replies.map(enrichNote)),
      };
    };

    // Step 7: Return enriched top-level notes
    return Promise.all(topLevelNotes.map(enrichNote));
  },
});

export const getAllParentVoiceNotes = query({
  args: {},
  handler: async (ctx) => {
    const topics = [
      'twenty-somethings',
      'technology',
      'sports',
      'politics',
    ] as const;

    const voiceNotes = await ctx.db
      .query('voiceNotes')
      .filter((q) => q.eq(q.field('isReply'), false))
      .collect();

    const counts = Object.fromEntries(
      topics.map((topic) => [
        topic,
        voiceNotes.filter((note) => note.topic === topic).length,
      ])
    );

    return counts;
  },
});
