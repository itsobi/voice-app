import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isPro: v.boolean(),
  }).index('by_clerk_id', ['clerkId']),
  voiceNotes: defineTable({
    clerkId: v.string(),
    storageId: v.id('_storage'),
    topic: v.string(),
    duration: v.number(),
    isReply: v.boolean(),
    parentId: v.optional(v.id('voiceNotes')),
    likes: v.optional(v.number()),
    replies: v.optional(v.number()),
    likedBy: v.optional(v.array(v.string())),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_topic', ['topic'])
    .index('by_parent_id', ['parentId']),
});
