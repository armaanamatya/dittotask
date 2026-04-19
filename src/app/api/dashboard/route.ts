import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const allUsers = await prisma.user.findMany();
  const usersOnMap = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    major: u.major,
    latitude: u.latitude,
    longitude: u.longitude,
    locationLabel: u.locationLabel,
    activityTags: u.activityTags,
  }));

  const activePosts = await prisma.activityPost.findMany({
    where: { status: { in: ['active', 'matched'] } },
    include: { author: true, matchedUser: true },
    orderBy: { createdAt: 'desc' },
  });

  const serializedPosts = activePosts.map((p) => ({
    id: p.id,
    authorId: p.authorId,
    authorName: p.author.name,
    body: p.body,
    activityType: p.activityType,
    latitude: p.latitude,
    longitude: p.longitude,
    locationLabel: p.locationLabel,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    matchedUserId: p.matchedUserId,
    matchedUserName: p.matchedUser?.name ?? null,
  }));

  return NextResponse.json({
    currentUser: user,
    usersOnMap,
    activePosts: serializedPosts,
  });
}
