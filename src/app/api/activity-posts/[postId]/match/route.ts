import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  let body: { matchedUserId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { matchedUserId } = body;
  if (!matchedUserId) {
    return NextResponse.json({ error: 'matchedUserId required' }, { status: 400 });
  }

  const post = await prisma.activityPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  if (post.status !== 'active') {
    return NextResponse.json({ error: 'Post is not active' }, { status: 400 });
  }

  const matchedUser = await prisma.user.findUnique({ where: { id: matchedUserId } });
  if (!matchedUser) {
    return NextResponse.json({ error: 'Matched user not found' }, { status: 404 });
  }

  // Check for existing pending match between this pair
  const existingMatch = await prisma.match.findFirst({
    where: {
      status: 'pending-quest',
      OR: [
        { userAId: post.authorId, userBId: matchedUserId },
        { userAId: matchedUserId, userBId: post.authorId },
      ],
    },
  });
  if (existingMatch) {
    return NextResponse.json({ error: 'Duplicate pending match for this pair' }, { status: 409 });
  }

  // Find the spontaneous-invite template
  const spontaneousTemplate = await prisma.microQuestTemplate.findFirst({
    where: { title: 'Spontaneous Activity Invite' },
  });
  if (!spontaneousTemplate) {
    return NextResponse.json({ error: 'Spontaneous template not found' }, { status: 500 });
  }

  // Create match
  const match = await prisma.match.create({
    data: {
      userAId: post.authorId,
      userBId: matchedUserId,
      status: 'pending-quest',
    },
  });

  // Create MicroQuestSession linked to the activity post
  await prisma.microQuestSession.create({
    data: {
      matchId: match.id,
      questTemplateId: spontaneousTemplate.id,
      status: 'assigned',
      activityPostId: post.id,
    },
  });

  // Mark post as matched
  await prisma.activityPost.update({
    where: { id: postId },
    data: { status: 'matched', matchedUserId },
  });

  // Expire any other active posts by either matched user to avoid double-booking
  await prisma.activityPost.updateMany({
    where: {
      status: 'active',
      id: { not: postId },
      authorId: { in: [post.authorId, matchedUserId] },
    },
    data: { status: 'expired' },
  });

  return NextResponse.json({
    matchId: match.id,
    postId: post.id,
    status: 'matched',
  });
}
