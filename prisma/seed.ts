import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questTemplates = [
  {
    title: 'Campus Café Conversation',
    description:
      'Grab a drink at the campus café together. Sit down for 30 minutes and answer the reflection prompts out loud to each other. No phones allowed during the conversation.',
    suggestedDurationMinutes: 30,
    suggestedContext: 'Campus café or coffee shop',
    reflectionPrompts: JSON.stringify([
      "What's one thing you're genuinely excited about this semester?",
      'Describe your ideal Saturday — no obligations, no plans. What does it look like?',
      "What's something most people wouldn't guess about you?",
    ]),
  },
  {
    title: 'Art Walk & Observe',
    description:
      'Walk to the campus art installation or a nearby gallery together. Spend 20 minutes looking around, then find a bench and share your observations.',
    suggestedDurationMinutes: 45,
    suggestedContext: 'Campus art installation or outdoor space',
    reflectionPrompts: JSON.stringify([
      'Pick one piece of art and describe what emotion it gives you.',
      'If you could add something to this space, what would it be and why?',
      "What does 'good taste' mean to you?",
    ]),
  },
  {
    title: 'Bookstore Scavenger',
    description:
      "Visit the campus bookstore or a nearby bookshop. Each person picks one book they'd gift the other — you have 10 minutes. Then explain your choice.",
    suggestedDurationMinutes: 30,
    suggestedContext: 'Campus bookstore or library',
    reflectionPrompts: JSON.stringify([
      'Why did you pick that book for me?',
      'What book has changed the way you think about something?',
      'If your life were a book, what genre would it be?',
    ]),
  },
  {
    title: 'Sunset Stroll',
    description:
      'Take a 20-minute walk around campus at dusk. No destination required — just walk, observe, and talk.',
    suggestedDurationMinutes: 30,
    suggestedContext: 'Campus grounds or nearby park',
    reflectionPrompts: JSON.stringify([
      'What do you notice that you normally walk past without thinking?',
      "What's something you're working toward right now that matters a lot to you?",
      "What's your relationship with being spontaneous vs. having a plan?",
    ]),
  },
  {
    title: 'Food Truck Roulette',
    description:
      "Find a food truck or street food vendor neither of you has tried. Order something new and eat together while discussing the prompts.",
    suggestedDurationMinutes: 40,
    suggestedContext: 'Campus food trucks or nearby street food',
    reflectionPrompts: JSON.stringify([
      "What's the most adventurous thing you've eaten, and would you do it again?",
      'Describe your relationship with trying new things — exciting or stressful?',
      'If you could teleport to eat one meal anywhere in the world right now, where would you go?',
    ]),
  },
];

const users = [
  {
    name: 'Maya Chen',
    age: 20,
    major: 'Computer Science',
    interests: 'hiking, indie music, cooking, photography',
    bio: 'Junior CS major who spends weekends on hiking trails and weeknights experimenting with new recipes. Big fan of film photography and live shows.',
  },
  {
    name: 'Jordan Rivera',
    age: 21,
    major: 'Environmental Studies',
    interests: 'rock climbing, podcasts, sustainable fashion, board games',
    bio: 'Passionate about climate solutions by day, competitive board game player by night. Always down for a good long-form podcast recommendation.',
  },
  {
    name: 'Sam Park',
    age: 19,
    major: 'Architecture',
    interests: 'sketching, coffee, jazz, urban design',
    bio: 'Sophomore architecture student with a sketchbook always in hand. Obsessed with city planning and the perfect pour-over coffee.',
  },
  {
    name: 'Priya Nair',
    age: 22,
    major: 'Psychology',
    interests: 'reading, yoga, documentary films, volunteer work',
    bio: 'Senior psych major fascinated by human behavior. Spends free time at the library or volunteering at the campus wellness center.',
  },
  {
    name: 'Alex Torres',
    age: 20,
    major: 'Music Production',
    interests: 'DJing, basketball, philosophy, street art',
    bio: 'Producing tracks between classes and studying philosophy for the big questions. Will always challenge you to a 1-on-1 on the court.',
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.microQuestFeedback.deleteMany();
  await prisma.microQuestSession.deleteMany();
  await prisma.match.deleteMany();
  await prisma.microQuestTemplate.deleteMany();
  await prisma.user.deleteMany();

  const templates = await Promise.all(
    questTemplates.map((t) => prisma.microQuestTemplate.create({ data: t }))
  );
  console.log(`Created ${templates.length} quest templates`);

  const createdUsers = await Promise.all(
    users.map((u) => prisma.user.create({ data: u }))
  );
  console.log(`Created ${createdUsers.length} users`);

  // Maya & Jordan, Sam & Priya, Alex & Maya
  const matchPairs: [number, number][] = [
    [0, 1],
    [2, 3],
    [4, 0],
  ];

  const matches = await Promise.all(
    matchPairs.map(([a, b]) =>
      prisma.match.create({
        data: {
          userAId: createdUsers[a].id,
          userBId: createdUsers[b].id,
          status: 'pending-quest',
        },
      })
    )
  );
  console.log(`Created ${matches.length} matches`);

  const sessions = await Promise.all(
    matches.map((match, i) =>
      prisma.microQuestSession.create({
        data: {
          matchId: match.id,
          questTemplateId: templates[i % templates.length].id,
          status: 'assigned',
        },
      })
    )
  );
  console.log(`Created ${sessions.length} quest sessions`);

  // Sam & Priya — both complete Art Walk (sessions[1]), real date recommended
  const samPriyaSession = sessions[1];
  await prisma.microQuestFeedback.create({
    data: {
      questSessionId: samPriyaSession.id,
      userId: createdUsers[2].id,
      chemistry: 4,
      comfort: 5,
      wouldDoRealDate: 'yes',
      comment: 'Great conversation! Really enjoyed the book picks.',
    },
  });
  await prisma.microQuestFeedback.create({
    data: {
      questSessionId: samPriyaSession.id,
      userId: createdUsers[3].id,
      chemistry: 4,
      comfort: 4,
      wouldDoRealDate: 'yes',
      comment: 'Sam has great taste. Would definitely meet up again.',
    },
  });
  await prisma.microQuestSession.update({
    where: { id: samPriyaSession.id },
    data: { status: 'completed-both' },
  });
  await prisma.match.update({
    where: { id: matches[1].id },
    data: { status: 'real-date-recommended' },
  });

  // Alex submits for Bookstore Scavenger (sessions[2]), Maya hasn't yet
  const alexMayaSession = sessions[2];
  await prisma.microQuestFeedback.create({
    data: {
      questSessionId: alexMayaSession.id,
      userId: createdUsers[4].id,
      chemistry: 3,
      comfort: 4,
      wouldDoRealDate: 'maybe',
      comment: 'Good vibes, would need to hang out more to be sure.',
    },
  });
  await prisma.microQuestSession.update({
    where: { id: alexMayaSession.id },
    data: { status: 'completed-one' },
  });

  console.log('Seed complete!');
  console.log('\nDemo users:');
  createdUsers.forEach((u) => console.log(`  ${u.name} — id: ${u.id}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
