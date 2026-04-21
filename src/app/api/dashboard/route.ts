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

  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: true,
      userB: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          template: true,
          feedbacks: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  const matchData = matches.map((match) => {
    const partner = match.userAId === userId ? match.userB : match.userA;
    const session = match.sessions[0] ?? null;

    let sessionData = null;
    if (session) {
      const myFeedback = session.feedbacks.find((f) => f.userId === userId) ?? null;
      const partnerFeedback = session.feedbacks.find((f) => f.userId === partner.id) ?? null;
      sessionData = {
        id: session.id,
        status: session.status,
        template: {
          ...session.template,
          reflectionPrompts: JSON.parse(session.template.reflectionPrompts) as string[],
        },
        myFeedback,
        partnerFeedback,
      };
    }

    return {
      id: match.id,
      status: match.status,
      partner,
      session: sessionData,
    };
  });

  return NextResponse.json({ user, matches: matchData });
}
