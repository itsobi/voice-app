import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { TopicEnum } from '@/lib/types';
import { Id } from './_generated/dataModel';
import { api } from './_generated/api';

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
    voiceNoteClerkId: v.optional(v.string()),
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
      const voiceNoteId = await ctx.db.insert('voiceNotes', {
        clerkId: args.clerkId,
        storageId: args.storageId,
        topic: args.topic,
        duration: args.duration,
        isReply: args.isReply,
        parentId: args.parentId,
      });

      if (args.isReply && args.voiceNoteClerkId) {
        await ctx.runMutation(api.notifications.createNotification, {
          userId: args.voiceNoteClerkId,
          senderUserId: args.clerkId,
          voiceNoteId: voiceNoteId,
          topic: args.topic,
          type: 'reply',
        });
      }

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

export const getVoiceNoteById = query({
  args: {
    voiceNoteId: v.id('voiceNotes'),
  },
  handler: async (ctx, args) => {
    const voiceNote = await ctx.db.get(args.voiceNoteId);
    if (!voiceNote) {
      return null;
    }

    // Get all replies (both direct and nested) for this voice note
    const allReplies = await ctx.db
      .query('voiceNotes')
      .filter((q) =>
        q.or(
          q.eq(q.field('parentId'), args.voiceNoteId),
          q.eq(q.field('isReply'), true)
        )
      )
      .collect();

    // Organize notes by ID for quick lookup
    const notesById = new Map<string, any>(
      allReplies.map((note) => [note._id, { ...note, replies: [] }])
    );

    // Build the reply tree
    const topLevelReplies: any[] = [];
    for (const reply of allReplies) {
      if (reply.parentId === args.voiceNoteId) {
        // Direct reply to the main voice note
        topLevelReplies.push(notesById.get(reply._id));
      } else if (reply.parentId && notesById.has(reply.parentId)) {
        // Nested reply: add to parent's replies array
        const parent = notesById.get(reply.parentId);
        if (parent) {
          parent.replies.push(notesById.get(reply._id));
        }
      }
    }

    // Collect unique clerkIds from voiceNote and all replies
    const clerkIds = [
      ...new Set([
        voiceNote.clerkId,
        ...allReplies.map((note) => note.clerkId),
      ]),
    ];

    // Fetch user data in bulk
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

    // Enrich notes with URLs and user data, recursively
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

    // Return enriched voice note with replies
    const enrichedNote = await enrichNote({
      ...voiceNote,
      replies: topLevelReplies,
    });

    return enrichedNote;
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

export const deleteVoiceNote = mutation({
  args: {
    voiceNoteId: v.id('voiceNotes'),
    storageId: v.id('_storage'),
    clerkId: v.string(),
    voiceNoteClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error('Unauthorized');
      }

      if (identity.subject !== args.clerkId && args.voiceNoteClerkId) {
        throw new Error('You are not authorized to delete this voice note');
      }

      const getAllReplyIds = async (
        parentId: Id<'voiceNotes'>
      ): Promise<{
        noteIds: Id<'voiceNotes'>[];
        storageIds: Id<'_storage'>[];
      }> => {
        const replies = await ctx.db
          .query('voiceNotes')
          .withIndex('by_parent_id', (q) => q.eq('parentId', parentId))
          .collect();

        let allVoiceNoteIds: Id<'voiceNotes'>[] = [];
        let allStorageIds: Id<'_storage'>[] = [];

        allVoiceNoteIds.push(...replies.map((reply) => reply._id));
        allStorageIds.push(...replies.map((reply) => reply.storageId));

        for (const reply of replies) {
          const nestedReplies = await getAllReplyIds(reply._id);
          allVoiceNoteIds.push(...nestedReplies.noteIds);
          allStorageIds.push(...nestedReplies.storageIds);
        }

        return { noteIds: allVoiceNoteIds, storageIds: allStorageIds };
      };

      // Get all reply IDs and storage IDs
      const replyIds = await getAllReplyIds(args.voiceNoteId);

      // Delete all replies and their storage files
      await ctx.db.delete(args.voiceNoteId);
      for (const noteId of replyIds.noteIds) {
        await ctx.db.delete(noteId);
      }
      await ctx.storage.delete(args.storageId);
      for (const storageId of replyIds.storageIds) {
        await ctx.storage.delete(storageId);
      }

      return {
        success: true,
        message: 'Successfully deleted voice note.',
      };
    } catch {
      return {
        success: false,
        message: 'Failed to delete voice note.',
      };
    }
  },
});

export const likeVoiceNote = mutation({
  args: {
    voiceNoteId: v.id('voiceNotes'),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    const voiceNote = await ctx.db.get(args.voiceNoteId);

    const likedBy = voiceNote?.likedBy ?? [];
    const likedBySet = new Set(likedBy);

    if (likedBySet?.has(args.clerkUserId)) {
      await ctx.db.patch(args.voiceNoteId, {
        likedBy: likedBy.filter((id) => id !== args.clerkUserId),
      });
    } else {
      await ctx.db.patch(args.voiceNoteId, {
        likedBy: [...likedBy, args.clerkUserId],
      });
    }
  },
});
