import { api } from '@/convex/_generated/api';
import { WebhookEvent } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  console.log('INSIDE CLERK WEBHOOK');
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('CLERK_SIGNING_SECRET is not set');
  }

  const webhook = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: WebhookEvent;

  try {
    event = webhook.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error('Error: Could not verify webhook:', error);
    return new Response('Error: Could not verify webhook', {
      status: 400,
    });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
  }
  console.log('CREATING USER');

  switch (event.type) {
    case 'user.created':
      console.log('User created', event.data);
      const { id, username, email_addresses, image_url } = event.data;
      const email = email_addresses[0].email_address;
      await convex.mutation(api.users.createUser, {
        clerkId: id,
        username: username || '',
        email: email,
        imageUrl: image_url || '',
        isPro: false,
      });
      return new Response('Webhook received', { status: 200 });
    case 'user.updated':
      console.log('User updated', event.data);
      return new Response('Webhook received', { status: 200 });
    case 'user.deleted':
      console.log('User deleted', event.data);
      return new Response('Webhook received', { status: 200 });
  }
}
