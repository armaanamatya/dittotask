import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const templates = await prisma.microQuestTemplate.findMany({
    include: {
      sessions: {
        include: { feedbacks: true },
      },
    },
    orderBy: { title: 'asc' },
  });

  const insights = templates.map((template) => {
    const { sessions } = template;
    const completedSessions = sessions.filter((s) => s.status === 'completed-both');
    const allFeedbacks = completedSessions.flatMap((s) => s.feedbacks);

    const avgChemistry =
      allFeedbacks.length > 0
        ? round1(allFeedbacks.reduce((sum, f) => sum + f.chemistry, 0) / allFeedbacks.length)
        : null;

    const avgComfort =
      allFeedbacks.length > 0
        ? round1(allFeedbacks.reduce((sum, f) => sum + f.comfort, 0) / allFeedbacks.length)
        : null;

    const bothPositiveSessions = completedSessions.filter((s) =>
      s.feedbacks.every(
        (f) => f.wouldDoRealDate === 'yes' || f.wouldDoRealDate === 'maybe'
      )
    );

    const bothPositivePercent =
      completedSessions.length > 0
        ? Math.round((bothPositiveSessions.length / completedSessions.length) * 100)
        : null;

    return {
      templateId: template.id,
      title: template.title,
      suggestedContext: template.suggestedContext,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      avgChemistry,
      avgComfort,
      bothPositivePercent,
    };
  });

  return NextResponse.json(insights);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
