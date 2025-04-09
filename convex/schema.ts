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
    topic: v.union(
      v.literal('twenty-somethings'),
      v.literal('technology'),
      v.literal('sports'),
      v.literal('politics')
    ),
    duration: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_topic', ['topic']),
});
