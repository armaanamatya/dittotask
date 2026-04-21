import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  let body: {
    userId?: string;
    chemistry?: number;
    comfort?: number;
    wouldDoRealDate?: string;
    comment?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userId, chemistry, comfort, wouldDoRealDate, comment } = body;

  if (!userId || chemistry == null || comfort == null || !wouldDoRealDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['yes', 'maybe', 'no'].includes(wouldDoRealDate)) {
    return NextResponse.json({ error: 'Invalid wouldDoRealDate value' }, { status: 400 });
  }

  if (chemistry < 1 || chemistry > 5 || comfort < 1 || comfort > 5) {
    return NextResponse.json({ error: 'Ratings must be between 1 and 5' }, { status: 400 });
  }

  const session = await prisma.microQuestSession.findUnique({
    where: { id: sessionId },
    include: { match: true, feedbacks: true },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const { match } = session;

  if (match.userAId !== userId && match.userBId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const alreadySubmitted = session.feedbacks.some((f) => f.userId === userId);
  if (alreadySubmitted) {
    return NextResponse.json({ error: 'Feedback already submitted' }, { status: 409 });
  }

  const feedback = await prisma.microQuestFeedback.create({
    data: {
      questSessionId: sessionId,
      userId,
      chemistry,
      comfort,
      wouldDoRealDate,
      comment: comment ?? null,
    },
  });

  const allFeedbacks = [...session.feedbacks, feedback];
  const userASubmitted = allFeedbacks.some((f) => f.userId === match.userAId);
  const userBSubmitted = allFeedbacks.some((f) => f.userId === match.userBId);
  const bothSubmitted = userASubmitted && userBSubmitted;

  if (bothSubmitted) {
    await prisma.microQuestSession.update({
      where: { id: sessionId },
      data: { status: 'completed-both' },
    });

    const isPositive = (d: string) => d === 'yes' || d === 'maybe';
    const bothPositive = allFeedbacks.every((f) => isPositive(f.wouldDoRealDate));

    await prisma.match.update({
      where: { id: match.id },
      data: { status: bothPositive ? 'real-date-recommended' : 'quest-completed' },
    });
  } else {
    await prisma.microQuestSession.update({
      where: { id: sessionId },
      data: { status: 'completed-one' },
    });
  }

  return NextResponse.json({ feedback, bothSubmitted });
}
