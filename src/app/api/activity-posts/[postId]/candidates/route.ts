import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeCandidates } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  const post = await prisma.activityPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const allUsers = await prisma.user.findMany();

  // Find user IDs already in a pending match
  const pendingMatches = await prisma.match.findMany({
    where: { status: 'pending-quest' },
  });
  const pendingMatchUserIds = new Set<string>();
  for (const m of pendingMatches) {
    pendingMatchUserIds.add(m.userAId);
    pendingMatchUserIds.add(m.userBId);
  }

  const candidates = computeCandidates(
    {
      authorId: post.authorId,
      activityType: post.activityType,
      latitude: post.latitude,
      longitude: post.longitude,
    },
    allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      major: u.major,
      latitude: u.latitude,
      longitude: u.longitude,
      locationLabel: u.locationLabel,
      activityTags: u.activityTags,
      interests: u.interests,
    })),
    pendingMatchUserIds
  );

  return NextResponse.json(candidates);
}
