import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isPro: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
        .first();
      if (user) {
        console.log('User already exists');
        return;
      }
      await ctx.db.insert('users', {
        clerkId: args.clerkId,
        username: args.username,
        email: args.email,
        imageUrl: args.imageUrl,
        isPro: args.isPro,
      });
    } catch (error) {
      console.error('Error: Could not create user', error);
      throw new Error('Could not create user');
    }
  },
});
