import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Financial Literacy Lessons ────────────────────────

  const lessons = [
    // BUDGETING
    {
      title: 'What is a Budget?',
      description: 'Learn why budgets matter and how to create your first one',
      category: 'BUDGETING' as const,
      difficulty: 1,
      order: 1,
      duration: 5,
      badge: 'Budget Starter',
      reward: 50,
      content: {
        sections: [
          {
            type: 'text',
            content: 'A budget is a plan for your money. It tells each naira where to go, so you are in control — not the other way around.',
          },
          {
            type: 'tip',
            content: 'Think of a budget like a recipe. Just as a recipe tells you how much of each ingredient to use, a budget tells you how much to spend on each thing.',
          },
          {
            type: 'text',
            content: 'The 50-30-20 rule is simple: 50% of your money for needs (food, rent, transport), 30% for wants (clothes, entertainment), and 20% for savings.',
          },
          {
            type: 'quiz',
            question: 'If you earn ₦10,000, how much should you save using the 50-30-20 rule?',
            options: ['₦1,000', '₦2,000', '₦3,000', '₦5,000'],
            answer: 1,
          },
        ],
      },
    },
    {
      title: 'Tracking Your Spending',
      description: 'Simple ways to see where your money actually goes',
      category: 'BUDGETING' as const,
      difficulty: 1,
      order: 2,
      duration: 5,
      badge: 'Money Tracker',
      reward: 50,
      content: {
        sections: [
          {
            type: 'text',
            content: 'Before you can budget well, you need to know where your money goes. For one week, write down every single thing you spend money on.',
          },
          {
            type: 'tip',
            content: 'Use a small notebook or the Purse app to track spending. You might be surprised — small daily purchases often add up to big amounts!',
          },
          {
            type: 'quiz',
            question: 'If you buy ₦200 of chin-chin every day, how much do you spend in a month?',
            options: ['₦2,000', '₦4,000', '₦6,000', '₦8,000'],
            answer: 2,
          },
        ],
      },
    },
    // SAVING
    {
      title: 'Why Save Money?',
      description: 'Discover the power of saving, even small amounts',
      category: 'SAVING' as const,
      difficulty: 1,
      order: 1,
      duration: 5,
      badge: 'Savings Champion',
      reward: 100,
      content: {
        sections: [
          {
            type: 'text',
            content: 'Saving money means keeping some of your earnings for the future instead of spending everything today. It gives you a safety net for emergencies.',
          },
          {
            type: 'story',
            content: 'Amina from Kebbi saved just ₦100 every day. After one year, she had ₦36,500 — enough to start a small provision store that now earns her ₦5,000 per week!',
          },
          {
            type: 'tip',
            content: 'Start small! Even ₦50 per day is ₦1,500 per month and ₦18,250 per year. The most important thing is to start.',
          },
          {
            type: 'quiz',
            question: 'If you save ₦100 every day, how much will you have after 6 months?',
            options: ['₦10,000', '₦12,000', '₦18,000', '₦36,000'],
            answer: 2,
          },
        ],
      },
    },
    {
      title: 'Setting Savings Goals',
      description: 'Learn to set clear, achievable goals that motivate you',
      category: 'SAVING' as const,
      difficulty: 2,
      order: 2,
      duration: 7,
      badge: 'Goal Setter',
      reward: 75,
      content: {
        sections: [
          {
            type: 'text',
            content: 'A savings goal gives your money a purpose. Instead of just "saving money," save FOR something specific: school fees, a business, or an emergency fund.',
          },
          {
            type: 'text',
            content: 'Make your goal SMART: Specific (what exactly?), Measurable (how much?), Achievable (can you do it?), Relevant (does it matter to you?), Time-bound (by when?).',
          },
          {
            type: 'example',
            content: 'SMART goal: "Save ₦50,000 for my daughter\'s school fees by August 2026 by putting away ₦2,000 every week."',
          },
          {
            type: 'quiz',
            question: 'Which is a SMART savings goal?',
            options: [
              'I want to save money',
              'Save ₦30,000 for business stock by December',
              'Save a lot of money someday',
              'I hope to be rich',
            ],
            answer: 1,
          },
        ],
      },
    },
    // INVESTING
    {
      title: 'Introduction to Investing',
      description: 'What investing means and how it differs from saving',
      category: 'INVESTING' as const,
      difficulty: 3,
      order: 1,
      duration: 8,
      badge: 'Investor Beginner',
      reward: 100,
      content: {
        sections: [
          {
            type: 'text',
            content: 'Investing means putting your money to work so it grows over time. Unlike saving (which keeps your money safe), investing can help your money multiply — but it also carries some risk.',
          },
          {
            type: 'tip',
            content: 'Always build an emergency fund (3-6 months of expenses) BEFORE you start investing. Investing is for money you won\'t need for at least 1-2 years.',
          },
          {
            type: 'quiz',
            question: 'When should you start investing?',
            options: [
              'Before saving any money',
              'After you have an emergency fund',
              'Only when you are very rich',
              'Never — it is too risky',
            ],
            answer: 1,
          },
        ],
      },
    },
    // ENTREPRENEURSHIP
    {
      title: 'Starting a Small Business',
      description: 'Practical steps to turn your skills into income',
      category: 'ENTREPRENEURSHIP' as const,
      difficulty: 2,
      order: 1,
      duration: 10,
      badge: 'Business Builder',
      reward: 150,
      content: {
        sections: [
          {
            type: 'text',
            content: 'Many successful businesses started small. You don\'t need millions — you need a good idea, some savings, and determination. Think about what you are good at and what people around you need.',
          },
          {
            type: 'story',
            content: 'Blessing from Ogun State started by selling zobo drink for ₦5,000 starting capital. She saved her profits, and within 6 months expanded to selling 5 different drinks. Now she employs 2 helpers!',
          },
          {
            type: 'text',
            content: 'Steps to start: 1) Identify what you can sell or what service you can offer. 2) Calculate how much you need to start. 3) Save that amount. 4) Start small, track every kobo. 5) Reinvest profits to grow.',
          },
          {
            type: 'quiz',
            question: 'What is the FIRST step before starting a business?',
            options: [
              'Borrow a large loan',
              'Rent a big shop',
              'Save enough starting capital',
              'Quit your current work immediately',
            ],
            answer: 2,
          },
        ],
      },
    },
    // DIGITAL SAFETY
    {
      title: 'Protecting Your Money Online',
      description: 'Stay safe from fraud and scams when using digital payments',
      category: 'DIGITAL_SAFETY' as const,
      difficulty: 1,
      order: 1,
      duration: 6,
      badge: 'Safety Shield',
      reward: 75,
      content: {
        sections: [
          {
            type: 'text',
            content: 'As you use digital payments, you must protect yourself from fraud. Scammers are clever, but you can be smarter!',
          },
          {
            type: 'warning',
            content: 'NEVER share your OTP, PIN, or password with anyone — not even someone who claims to be from your bank or from Purse. We will NEVER ask for your PIN.',
          },
          {
            type: 'text',
            content: 'Common scams to watch for: 1) "You won a prize" messages asking for your details. 2) People asking you to send money to "unlock" a bigger amount. 3) Fake bank or app messages asking for your PIN.',
          },
          {
            type: 'quiz',
            question: 'Someone calls saying they are from your bank and asks for your OTP. What should you do?',
            options: [
              'Give them the OTP quickly',
              'Tell them your account number only',
              'Hang up immediately — banks never ask for OTP',
              'Send the OTP by text instead',
            ],
            answer: 2,
          },
        ],
      },
    },
    // DEBT MANAGEMENT
    {
      title: 'Understanding Debt',
      description: 'Learn the difference between good debt and bad debt',
      category: 'DEBT_MANAGEMENT' as const,
      difficulty: 2,
      order: 1,
      duration: 7,
      badge: 'Debt Smart',
      reward: 75,
      content: {
        sections: [
          {
            type: 'text',
            content: 'Not all debt is bad. Good debt helps you earn more money (like a loan for a profitable business). Bad debt buys things that lose value (like borrowing to buy expensive clothes).',
          },
          {
            type: 'tip',
            content: 'Before borrowing, ask yourself: "Will this loan help me earn money?" If yes, it might be good debt. If no, try to save for it instead.',
          },
          {
            type: 'text',
            content: 'If you have debt, pay off the most expensive debt first (the one with the highest interest). Always pay at least the minimum on all debts to avoid penalties.',
          },
          {
            type: 'quiz',
            question: 'Which is an example of "good debt"?',
            options: [
              'Borrowing to buy the latest phone',
              'A loan to buy stock for your growing business',
              'Borrowing to throw a big party',
              'Taking a loan to gamble',
            ],
            answer: 1,
          },
        ],
      },
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { id: lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: lesson,
      create: {
        ...lesson,
        id: lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      },
    });
  }

  console.log(`Seeded ${lessons.length} lessons`);
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
