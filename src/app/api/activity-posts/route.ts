import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { classifyActivity } from '@/lib/activity';

export async function POST(req: NextRequest) {
  let body: { userId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId, text } = body;
  if (!userId || !text?.trim()) {
    return NextResponse.json({ error: 'userId and text required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const activityType = classifyActivity(text);

  const post = await prisma.activityPost.create({
    data: {
      authorId: userId,
      body: text.trim(),
      activityType,
      latitude: user.latitude,
      longitude: user.longitude,
      locationLabel: user.locationLabel,
      status: 'active',
    },
  });

  return NextResponse.json({
    id: post.id,
    authorId: post.authorId,
    authorName: user.name,
    body: post.body,
    activityType: post.activityType,
    latitude: post.latitude,
    longitude: post.longitude,
    locationLabel: post.locationLabel,
    status: post.status,
    createdAt: post.createdAt.toISOString(),
    matchedUserId: null,
    matchedUserName: null,
  });
}
