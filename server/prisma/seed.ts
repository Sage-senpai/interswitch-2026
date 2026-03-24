import { PrismaClient } from "@prisma/client";

type LessonCategory = 'BUDGETING' | 'SAVING' | 'INVESTING' | 'ENTREPRENEURSHIP' | 'DIGITAL_SAFETY' | 'DEBT_MANAGEMENT';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// ─── Content block helpers ────────────────────────────────────────────────────

function text(body: string) {
  return { type: "text", body };
}

function quiz(
  question: string,
  options: [string, string, string, string],
  answer: 0 | 1 | 2 | 3
) {
  return { type: "quiz", question, options, answer };
}

// ─── Lesson definitions ───────────────────────────────────────────────────────

const lessons = [
  // ── BUDGETING ───────────────────────────────────────────────────────────────
  {
    title: "Your First Budget: The 50-30-20 Rule",
    description:
      "Learn how to divide your monthly income into needs, wants, and savings using a simple rule any Nigerian woman can apply today.",
    category: "BUDGETING",
    difficulty: 1,
    duration: 8,
    order: 1,
    badge: "Budget Starter",
    reward: 50,
    content: [
      text(
        "A budget is simply a plan for your money. Without a plan, money disappears before the end of the month — and you wonder where it all went. The 50-30-20 rule gives you a simple framework to control your naira."
      ),
      text(
        "Here is how the rule works:\n\n• 50% of your income goes to NEEDS — rent, food, transport, school fees, electricity.\n• 30% goes to WANTS — data, outings, new clothes, gifts.\n• 20% goes to SAVINGS and debt repayment.\n\nIf your monthly income is ₦80,000, that means ₦40,000 for needs, ₦24,000 for wants, and ₦16,000 saved or used to pay off loans."
      ),
      text(
        "Nigerian market women have practised a version of this for generations — setting aside a fixed amount from each day's profit before touching the rest. The 50-30-20 rule is just that wisdom made formal. Start by writing down your income and every expense for one week. Patterns will surprise you: small daily purchases like suya, data top-ups, and transport often eat 20–30% of income invisibly."
      ),
      text(
        "Practical tip: Use the PURSE app to set spending categories. Every time you fund your wallet, immediately transfer 20% to your savings goal. This 'pay yourself first' habit is the single most powerful financial move you can make."
      ),
      quiz(
        "Amaka earns ₦60,000 per month. Using the 50-30-20 rule, how much should she save or use for debt repayment each month?",
        ["₦6,000", "₦12,000", "₦18,000", "₦30,000"],
        1
      ),
      quiz(
        "Which of the following is a NEED, not a WANT?",
        [
          "Buying a new wig",
          "Paying school fees for your child",
          "Subscribing to a streaming service",
          "Eating out at a restaurant",
        ],
        1
      ),
    ],
  },
  {
    title: "Zero-Based Budgeting for Traders and Side Hustlers",
    description:
      "If your income changes every month — from trading, petty business, or multiple jobs — zero-based budgeting helps you plan no matter what comes in.",
    category: "BUDGETING",
    difficulty: 3,
    duration: 10,
    order: 2,
    badge: "Hustle Budgeter",
    reward: 75,
    content: [
      text(
        "Many Nigerian women do not earn a fixed salary. A market trader's revenue depends on the day and the season. A freelance tailor gets paid when jobs come. A woman running a food business has good weeks and bad weeks. Fixed-percentage budgets like 50-30-20 break down when income is unpredictable. Zero-based budgeting solves this."
      ),
      text(
        "Zero-based budgeting means you assign every single naira a job until ₦0 is 'unassigned'. You do not budget based on what you hope to earn — you budget based on what you actually received.\n\nStep 1: At the start of each week (or month), count only the money currently in hand.\nStep 2: List every expense you must pay in that period — food, rent, transport, contributions to your WAG, school fees due.\nStep 3: Subtract those from your total. Whatever remains gets assigned to savings, wants, or debt. Nothing is left floating."
      ),
      text(
        "Example: Shade runs a roadside food stall in Ibadan. She earned ₦35,000 last week. She immediately assigns: ₦15,000 for ingredients, ₦3,000 for gas, ₦5,000 for rent contribution, ₦2,000 for her children's transport, ₦5,000 to her WAG contribution, ₦3,000 to her emergency savings goal. That leaves ₦2,000 for personal wants. Every naira has a job."
      ),
      text(
        "The key discipline is doing this exercise BEFORE you spend anything, not after. Keep a small notebook or use the PURSE app to log income immediately when it arrives. At the end of the week, compare what you planned with what you actually spent. The gap between the two is your financial blind spot — and closing it is how wealth is built."
      ),
      quiz(
        "Bisi collected ₦28,000 from her tailoring jobs this week. She has listed expenses totalling ₦22,000. What should she do with the remaining ₦6,000 in a zero-based budget?",
        [
          "Leave it unallocated in case something comes up",
          "Spend it all freely since her bills are paid",
          "Assign it to specific goals like savings or debt payment",
          "Return it to clients as change",
        ],
        2
      ),
      quiz(
        "Why is zero-based budgeting especially useful for Nigerian women with irregular income?",
        [
          "It lets you spend first and save what is left",
          "It works with whatever you actually have, not what you expect",
          "It only works for people who earn salaries",
          "It automatically doubles your income",
        ],
        1
      ),
    ],
  },

  // ── SAVING ──────────────────────────────────────────────────────────────────
  {
    title: "Building an Emergency Fund from Scratch",
    description:
      "Discover why every Nigerian woman needs an emergency fund and the exact steps to build one — even on a small income.",
    category: "SAVING",
    difficulty: 1,
    duration: 7,
    order: 3,
    badge: "Safety Net Builder",
    reward: 50,
    content: [
      text(
        "An emergency fund is money you have saved specifically for unexpected events: a sudden illness, a broken phone that is your business tool, your landlord demanding rent early, or a family member needing help. Without this fund, one emergency can wipe out months of progress and force you into debt."
      ),
      text(
        "The goal is to save 3 to 6 months' worth of your essential expenses. This sounds large, but you build it gradually. If your essential monthly expenses are ₦30,000, your target emergency fund is ₦90,000 to ₦180,000. Start with a mini-goal: ₦10,000. Then ₦25,000. Then ₦50,000. Each milestone matters."
      ),
      text(
        "Three rules for your emergency fund:\n\n1. Keep it separate. Do not mix it with your daily spending money. Use a dedicated savings goal in the PURSE app so the money is accessible but not tempting.\n\n2. Keep it liquid. This money should not be locked away. You need to reach it within 24 hours if needed. Avoid putting emergency funds in fixed-term investments.\n\n3. Replenish it immediately. The moment you use your emergency fund, rebuilding it becomes your top financial priority."
      ),
      text(
        "How to start if money is tight: Save ₦500 per week. That is just ₦71 per day — less than a bottle of malt. In one year you will have ₦26,000. In three years, ₦78,000. Small, consistent deposits beat large sporadic ones every time. Many Nigerian women in WAG groups use group accountability to stay consistent — your PURSE WAG can serve the same purpose."
      ),
      quiz(
        "What is the recommended size of an emergency fund?",
        [
          "1 week of expenses",
          "1 month of expenses",
          "3 to 6 months of essential expenses",
          "1 year of all expenses",
        ],
        2
      ),
      quiz(
        "Ngozi has saved ₦40,000 in her emergency fund. She uses ₦15,000 to fix her generator. What should she do next?",
        [
          "Close the emergency fund — she clearly cannot keep it full",
          "Immediately start rebuilding the ₦15,000 she used",
          "Use the remaining ₦25,000 for a business investment",
          "Wait until next year to add more money",
        ],
        1
      ),
    ],
  },
  {
    title: "Ajo and Esusu: Making Traditional Savings Work Harder",
    description:
      "Understand how Nigeria's traditional rotating savings groups work, their risks, and how digital tools can make them safer and more powerful.",
    category: "SAVING",
    difficulty: 2,
    duration: 9,
    order: 4,
    badge: "Community Saver",
    reward: 60,
    content: [
      text(
        "Ajo (Yoruba), Esusu (Igbo), and Adashi (Hausa) are Nigeria's original savings institutions. For centuries, Nigerian women have pooled money together, rotating the lump sum to each member in turn. This system works because it uses social accountability — you do not want to let down women in your community who are counting on you."
      ),
      text(
        "How a basic Ajo works: 10 women each contribute ₦5,000 weekly. Each week, one woman collects the full ₦50,000 pot. By week 10, every woman has contributed ₦50,000 and received ₦50,000 once. The magic is that the person who collects in week 1 effectively gets an interest-free loan. The person who collects in week 10 is essentially saving ₦5,000 per week with strong discipline enforced by the group."
      ),
      text(
        "The risks of traditional Ajo are real:\n\n• A member can collect early and disappear ('run with the pot')\n• No written records make disputes hard to resolve\n• No insurance against default\n• Collectors near the end of the cycle have no guarantee\n\nThe PURSE WAG feature addresses all of these: contributions are recorded on a transparent ledger, payout schedules are agreed upfront, and smart contract technology ensures funds can only be released according to group rules."
      ),
      text(
        "To maximise your rotating savings group:\n1. Always agree on the rotation order and amounts before the first contribution.\n2. Keep written or digital records of every payment.\n3. Set a group rule that any member who misses two consecutive contributions loses their spot in the rotation.\n4. Consider combining your Ajo with individual savings goals — use your payout to seed a business investment or an emergency fund rather than spending it immediately."
      ),
      quiz(
        "In an Ajo group of 8 women each contributing ₦10,000 monthly, how much does the collector receive each month?",
        ["₦10,000", "₦40,000", "₦80,000", "₦800,000"],
        2
      ),
      quiz(
        "What is the biggest risk in a traditional (non-digital) Ajo arrangement?",
        [
          "The contributions are too small to matter",
          "A member can collect and then default on future contributions",
          "The government taxes all Ajo payouts",
          "Interest rates make Ajo unprofitable",
        ],
        1
      ),
    ],
  },

  // ── INVESTING ───────────────────────────────────────────────────────────────
  {
    title: "Introduction to Investing: Making Your Naira Work",
    description:
      "Learn the basics of investing, why inflation means saving in cash is not enough, and the most accessible investment options for Nigerian women.",
    category: "INVESTING",
    difficulty: 2,
    duration: 10,
    order: 5,
    badge: "First Investor",
    reward: 75,
    content: [
      text(
        "If you keep ₦100,000 under your mattress for one year and Nigeria's inflation rate is 25%, your money can now only buy what ₦75,000 could buy a year ago. Your cash did not grow — it shrank in real value. Investing means putting your money to work so it grows faster than inflation erodes it."
      ),
      text(
        "Three core investing concepts every Nigerian woman should know:\n\n1. RETURN: The profit your investment earns, usually expressed as a percentage per year.\n\n2. RISK: The chance that your investment loses value. Higher potential returns almost always mean higher risk.\n\n3. TIME HORIZON: How long you plan to leave your money invested. Longer time horizons allow you to take more risk and recover from short-term losses."
      ),
      text(
        "Accessible investment options in Nigeria:\n\n• Treasury Bills (T-Bills): Issued by the Central Bank of Nigeria. Very low risk, backed by the federal government. Currently offering around 15-20% per annum. Minimum investment can be as low as ₦50,000 through platforms like NBS or commercial banks.\n\n• Money Market Funds: Pool your money with other investors into government securities. Available through apps with as little as ₦1,000. Returns around 12-18% per annum.\n\n• Mutual Funds: Professional fund managers invest your money across different assets. Suitable for beginners. Accessible through Stanbic IBTC, ARM, and other fund managers.\n\n• Agricultural Investment Platforms: Apps like Thrive Agric let you invest in verified farms. Higher returns (15-25%) but moderate risk."
      ),
      text(
        "Start with the golden rule: never invest money you cannot afford to lose or lock away for the investment period. Your emergency fund must be fully funded before you invest. Once that foundation is in place, even ₦5,000 invested monthly in a money market fund compounds into meaningful wealth over years. Consistency beats timing the market."
      ),
      quiz(
        "If Nigeria's inflation rate is 22% and your savings account pays 5% interest, what is happening to your real purchasing power?",
        [
          "It is growing by 27%",
          "It is staying the same",
          "It is shrinking by 17%",
          "It is growing by 5%",
        ],
        2
      ),
      quiz(
        "Which investment option is considered the SAFEST for a beginner Nigerian investor?",
        [
          "Cryptocurrency",
          "Buying land without title documents",
          "Federal Government Treasury Bills",
          "Lending money to strangers on social media",
        ],
        2
      ),
    ],
  },
  {
    title: "Avoiding Investment Scams Targeting Nigerian Women",
    description:
      "Recognize the warning signs of Ponzi schemes and fake investment platforms, and learn how to protect your money in Nigeria's high-scam environment.",
    category: "INVESTING",
    difficulty: 2,
    duration: 8,
    order: 6,
    badge: "Scam Shield",
    reward: 100,
    content: [
      text(
        "Every year, thousands of Nigerian women lose their savings — often money saved over years — to investment scams. MMM, Loom, MBA Forex, Chinmark Group: the names change but the pattern is always the same. Understanding how these scams work is as important as knowing how real investments work."
      ),
      text(
        "The hallmarks of an investment scam:\n\n• GUARANTEED HIGH RETURNS: No legitimate investment guarantees fixed high returns (e.g., 'earn 50% in 30 days'). Real returns fluctuate with market conditions.\n\n• PRESSURE TO RECRUIT: If your 'returns' depend on bringing in new members, it is a pyramid scheme, not an investment.\n\n• URGENCY: 'This offer closes tonight!' is designed to stop you from thinking critically or consulting anyone.\n\n• NO CLEAR BUSINESS MODEL: If you cannot explain in simple terms how the company makes money to pay your returns, it probably cannot.\n\n• UNREGISTERED: Legitimate investment platforms in Nigeria are registered with the Securities and Exchange Commission (SEC). Always verify at sec.gov.ng."
      ),
      text(
        "Real stories from Nigerian women:\n\nFatima from Kano invested her shop proceeds of ₦200,000 in a platform promising 30% monthly returns. The platform disappeared in month 3. She lost everything.\n\nChidinma from Enugu was invited by a church friend to join an investment group. Returns looked real for two months. When she invested ₦500,000, the group collapsed. Her friendship was damaged and her money gone.\n\nThese are not stories of foolish women. Scammers are professional, sophisticated, and often work through trusted social networks."
      ),
      text(
        "How to protect yourself:\n1. Check SEC registration at sec.gov.ng before investing anything.\n2. Never invest money you would not give away as a gift — if losing it would devastate you, that money is not ready to be invested in anything unverified.\n3. Ask: 'How exactly does this company generate the returns it pays?' If the answer is vague, walk away.\n4. Consult at least one financially literate person outside the group before committing.\n5. If an investment pays you, withdraw your principal (original investment) first before reinvesting profits."
      ),
      quiz(
        "A friend tells you about an investment that pays 40% returns every month, guaranteed. What should you do?",
        [
          "Invest immediately before the offer closes",
          "Ask her to help you put in all your savings",
          "Recognise this as a likely scam — no legitimate investment guarantees 40% monthly",
          "It is probably fine because your friend is trustworthy",
        ],
        2
      ),
      quiz(
        "Which Nigerian government body registers and regulates legitimate investment platforms?",
        [
          "The Central Bank of Nigeria (CBN)",
          "The Securities and Exchange Commission (SEC)",
          "The Nigerian Communications Commission (NCC)",
          "The Federal Inland Revenue Service (FIRS)",
        ],
        1
      ),
    ],
  },

  // ── ENTREPRENEURSHIP ────────────────────────────────────────────────────────
  {
    title: "Separating Business Money from Personal Money",
    description:
      "The single most important financial habit for any Nigerian woman running a business: keeping business and personal finances separate from day one.",
    category: "ENTREPRENEURSHIP",
    difficulty: 1,
    duration: 8,
    order: 7,
    badge: "Business Boundary Setter",
    reward: 75,
    content: [
      text(
        "This is the mistake that silently kills thousands of small businesses in Nigeria: mixing business money with personal money. You make ₦50,000 from your business, use ₦20,000 for family groceries, ₦5,000 for your hair, ₦10,000 to help a relative, and now you have ₦15,000 left — but your business needs to buy stock. You do not know if your business is actually profitable or if it is keeping you in a cycle of poverty."
      ),
      text(
        "Why separation is critical:\n\n• You cannot know your real profit without separating costs. If your business bought 100 bags of rice and you used 2 bags at home, your profit calculation is wrong.\n\n• Banks and investors need clean financial records before lending or investing. Mixing funds makes you unlendable.\n\n• Tax compliance requires clear business accounts.\n\n• When you mix money, your business is subsidising your personal life in hidden ways — often running at a loss without you realising it."
      ),
      text(
        "How to separate immediately, even without a formal bank account:\n\n1. Get a second SIM card and mobile money wallet exclusively for business.\n2. Decide on a salary for yourself — a fixed amount you 'pay' yourself from the business weekly or monthly. This is your personal money. Everything else stays in the business.\n3. Track every business naira in and out in a notebook or the PURSE app. Date, amount, and what it was for.\n4. Restock the business before you pay yourself. Business expenses come first."
      ),
      text(
        "As your business grows:\n• Open a business bank account. CAC registration (Corporate Affairs Commission) costs as little as ₦10,000 for a business name registration and opens doors to business accounts and formal loans.\n• Keep receipts for all business purchases.\n• Review your business profit and loss monthly — total income minus all business expenses equals your profit. Your salary is a business expense.\n\nThe women who build lasting businesses are not necessarily the ones with the biggest ideas. They are the ones who treat business money with discipline from the very first naira."
      ),
      quiz(
        "Kemi runs a small cosmetics business. She earns ₦80,000 in revenue and spends ₦55,000 on products and transport. She takes ₦30,000 for family expenses from the business account. What is her actual business profit?",
        ["₦80,000", "₦25,000", "-₦5,000", "₦50,000"],
        1
      ),
      quiz(
        "What is the FIRST step Kemi should take to separate her business and personal finances?",
        [
          "Wait until the business is making ₦500,000 per month",
          "Designate a fixed salary she pays herself from business profits",
          "Close her business and get a salaried job",
          "Stop all personal spending immediately",
        ],
        1
      ),
    ],
  },
  {
    title: "Accessing Business Finance: Loans, Grants, and WAGs",
    description:
      "A practical guide to funding options for Nigerian women entrepreneurs — from government schemes to cooperative lending and digital microloans.",
    category: "ENTREPRENEURSHIP",
    difficulty: 3,
    duration: 12,
    order: 8,
    badge: "Funding Navigator",
    reward: 100,
    content: [
      text(
        "Access to capital is the most cited barrier for Nigerian women entrepreneurs. Banks historically require collateral that many women do not own (land titles are often in husbands' names), demand extensive documentation, and take weeks to decide. But formal bank loans are not your only option — and for most small businesses, they are not even the best first option."
      ),
      text(
        "Option 1: Government Programmes\n\n• TraderMoni (Conditional Grant for Traders): Grants starting at ₦10,000 for market traders, scalable to ₦100,000 with repayment history. Apply through your Local Government Area.\n\n• CBN AGSMEIS Fund: Agricultural and SME loans at 9% interest (well below commercial rates) for businesses registered with CAC. Maximum ₦10 million.\n\n• BOI (Bank of Industry) Women's Fund: Specifically for women-owned businesses. Loans from ₦500,000 to ₦5 million at subsidised rates. Requires a business plan and CAC registration.\n\n• NIRSAL Microfinance Bank: Offers loans through the AGSMEIS scheme. Apply at any NIRSAL branch."
      ),
      text(
        "Option 2: Cooperative and WAG Lending\n\nYour Women's Affinity Group on PURSE can lend to members at terms you collectively agree on. This is often faster, cheaper, and more flexible than any formal institution. Some WAG groups charge 5% monthly on loans while others charge nothing within the group. Negotiate terms together. The trust and accountability within a well-run WAG often produces better repayment rates than formal institutions."
      ),
      text(
        "Option 3: Microfinance Banks and Digital Lenders\n\nMicrofinance banks (MFBs) are regulated specifically to serve small businesses. They lend without requiring the collateral traditional banks demand. Digital lending platforms like FairMoney, PalmCredit, and Carbon offer instant loans but at high rates (often 5-10% per month). Use these only for very short-term gaps and only if your business return clearly exceeds the interest cost.\n\nBefore taking ANY loan:\n1. Calculate your loan repayment as a percentage of your monthly business income.\n2. If repayments will exceed 30% of monthly revenue, the loan will likely strangle your business.\n3. Borrow only for revenue-generating purposes (stock, equipment, expansion) — never for operating expenses that your business should already cover."
      ),
      quiz(
        "Adaeze wants to grow her catering business. She is considering a ₦200,000 loan at 8% per month. Her catering business earns ₦150,000 per month in revenue. What should she do?",
        [
          "Take the loan immediately — the business needs growth capital",
          "Be very cautious: ₦16,000 monthly interest plus principal is a large share of ₦150,000 revenue",
          "Take the loan but use it for household expenses first",
          "It does not matter — all loans are the same",
        ],
        1
      ),
      quiz(
        "Which funding option is most appropriate for a very small market trader with no CAC registration and no collateral?",
        [
          "A ₦5 million Bank of Industry loan",
          "A TraderMoni government grant or WAG group loan",
          "A mortgage from a commercial bank",
          "A foreign currency loan",
        ],
        1
      ),
    ],
  },

  // ── DIGITAL_SAFETY ──────────────────────────────────────────────────────────
  {
    title: "Protecting Your Money Online: Fraud Prevention Basics",
    description:
      "Understand the most common digital financial frauds targeting Nigerian women and the exact steps to protect your wallet, BVN, and bank accounts.",
    category: "DIGITAL_SAFETY",
    difficulty: 1,
    duration: 8,
    order: 9,
    badge: "Digital Guardian",
    reward: 75,
    content: [
      text(
        "Nigeria loses billions of naira annually to digital financial fraud. Women — especially those new to digital banking and mobile money — are disproportionately targeted. Fraudsters are skilled, patient, and manipulative. But they rely on a small number of tricks that, once you know them, are easy to recognise."
      ),
      text(
        "The most common scams targeting Nigerian women:\n\n1. BVN PHISHING: A caller claims to be from your bank and says your account will be blocked unless you confirm your BVN, account number, and PIN. Your bank will NEVER ask for these by phone or SMS.\n\n2. OTP THEFT: You receive a legitimate OTP on your phone (meaning someone is attempting to access your account). A caller then says they 'sent it by mistake' and needs you to read it to them. The OTP belongs to your account. Never share it.\n\n3. FAKE BANK ALERTS: A buyer sends a fake bank credit alert (created in any phone app) for goods. The money never arrives. Always confirm in your banking app, not via SMS alone.\n\n4. SOCIAL MEDIA IMPERSONATION: Fake accounts of your contacts or your bank ask for money or account details. Verify through a separate call to the real person."
      ),
      text(
        "Your five-point digital financial safety checklist:\n\n✓ PIN/Password: Use a unique 6-digit PIN for each financial app. Never use birthdates or 1234.\n\n✓ OTP Rule: An OTP is like a key to your account. Never read it aloud to anyone, ever, for any reason.\n\n✓ Verify Separately: If you receive an alert or message about your account, call your bank's official number (printed on your card) — do not use any number provided in the message.\n\n✓ App Lock: Enable fingerprint or face lock on your banking apps.\n\n✓ Alert Settings: Set up transaction alerts for every naira movement in your account. You will know immediately if something goes wrong."
      ),
      text(
        "If you are defrauded:\n1. Call your bank immediately using the number on your card to freeze your account.\n2. File a report with the EFCC (Economic and Financial Crimes Commission) online at efcc.gov.ng or call 0800-326-5255.\n3. Report to the Nigerian Police Force Cybercrime Unit.\n4. Screenshot all evidence before deleting anything.\n\nRecovery is not guaranteed, but acting within the first hour gives you the best chance. Speed is everything."
      ),
      quiz(
        "A man calls claiming to be from Access Bank and says your account will be suspended. He asks for your BVN and ATM PIN to verify your identity. What should you do?",
        [
          "Give him the BVN only, not the PIN",
          "Give both — banks need this to protect your account",
          "Hang up and call Access Bank on the number printed on your card",
          "Send him a screenshot of your account balance instead",
        ],
        2
      ),
      quiz(
        "You receive an OTP on your phone from GTBank. A woman then calls saying she accidentally sent it to your number and needs it urgently. What does this mean?",
        [
          "She made a genuine mistake — help her out",
          "Someone is trying to access your GTBank account and wants you to hand them the key",
          "GTBank is testing your security awareness",
          "It is safe to share the OTP since it was sent to your number",
        ],
        1
      ),
    ],
  },
  {
    title: "Safe Mobile Money: Using USSD and Apps Without Getting Robbed",
    description:
      "Practical rules for staying safe when using mobile money, USSD banking, and payment apps in public spaces across Nigeria.",
    category: "DIGITAL_SAFETY",
    difficulty: 2,
    duration: 7,
    order: 10,
    badge: "Mobile Money Pro",
    reward: 60,
    content: [
      text(
        "Mobile money and USSD banking have given millions of Nigerian women access to financial services without ever entering a bank branch. But transacting on your phone in a market, bus, or on the street comes with unique risks that a bank branch does not. Understanding these risks means you can use these powerful tools safely."
      ),
      text(
        "Physical safety rules when transacting on your phone:\n\n1. SHIELD YOUR SCREEN: When entering your PIN, cover the keypad with your other hand. Shoulder surfing — someone watching you type — is one of the simplest thefts there is.\n\n2. STEP AWAY: Before dialling a USSD code or opening your banking app, move to a corner, face a wall, or step into a shop. Never complete a financial transaction while walking or in a crowd.\n\n3. CONFIRM PRIVATELY: After sending money, do not announce the amount or recipient aloud. Confirm the success message quietly.\n\n4. LOW BATTERY DANGER: Do not top up mobile money when your battery is nearly dead. Interrupted transactions can cause problems that take days to resolve. Always have a power bank or charge before transacting."
      ),
      text(
        "SIM card and phone security:\n\n• Immediately report a lost or stolen SIM to your network provider (MTN: 180, Airtel: 111, Glo: 121, 9mobile: 200). A fraudster with your SIM can intercept your OTPs and drain your accounts.\n\n• Enable SIM swap notification: Your network provider should alert you before completing a SIM swap. If you receive such a notification you did not request, call immediately.\n\n• Set a PIN on your SIM card itself (separate from your phone PIN) through your phone's SIM security settings.\n\n• If your phone is stolen, call your bank immediately to freeze your account — do not wait."
      ),
      text(
        "Choosing a secure PIN:\n\n• Avoid: 1234, 0000, your birth year (e.g., 1990), your phone number digits, your name's corresponding numbers.\n\n• Use: A random 6-digit number you memorise. A pattern on the keypad that looks complex to others.\n\n• Change your PIN every 3-6 months, or immediately after any suspected security incident.\n\nRemember: Your bank cannot return money lost because you shared or exposed your PIN. Protecting it is your responsibility."
      ),
      quiz(
        "Titi is in a busy Oshodi market and needs to send money urgently. What is the safest approach?",
        [
          "Complete the transaction quickly while walking to save time",
          "Ask someone nearby to help her use the app",
          "Step away from the crowd, shield her screen, and complete the transaction facing a wall",
          "Shout out her account details so people know where to send the money",
        ],
        2
      ),
      quiz(
        "Sola's phone is snatched from her hand. What is the FIRST thing she should do?",
        [
          "Buy a new phone",
          "Call her bank immediately to freeze her accounts",
          "Post about it on social media",
          "Wait to see if the thief uses the phone before acting",
        ],
        1
      ),
    ],
  },

  // ── DEBT_MANAGEMENT ─────────────────────────────────────────────────────────
  {
    title: "Understanding Good Debt vs Bad Debt",
    description:
      "Not all debt is equal. Learn to tell the difference between debt that builds your future and debt that drains it — and how Nigerian women can use debt wisely.",
    category: "DEBT_MANAGEMENT",
    difficulty: 2,
    duration: 9,
    order: 11,
    badge: "Debt Decoder",
    reward: 60,
    content: [
      text(
        "In Nigeria, 'debt' often carries shame. Many women hide loans from family members and feel embarrassed about owing money. But the truth is more nuanced: debt itself is not the problem. The problem is the WRONG kind of debt, borrowed for the WRONG reasons, at the WRONG cost. Understanding the difference is a crucial financial skill."
      ),
      text(
        "Good debt: Borrowing that creates value or income equal to or greater than its cost.\n\n• A ₦150,000 loan at 3% monthly to buy stock that will sell for ₦300,000 in the same month — the profit exceeds the interest.\n\n• A student loan to fund a qualification that significantly increases earning power.\n\n• A business equipment loan that reduces production costs or increases capacity.\n\nThe key test: Will this loan generate enough return to cover its interest AND leave me better off than before?"
      ),
      text(
        "Bad debt: Borrowing that funds consumption or loses value immediately.\n\n• Borrowing at 10% monthly to fund a wedding, knowing you have no clear repayment plan.\n\n• Using a 'buy now pay later' service to purchase a phone, shoes, or household items you cannot afford.\n\n• Rolling over one loan into another to cover the first (debt cycles).\n\nThe danger: Nigerian digital lending apps make bad debt extremely accessible. A loan at 10% per month is 120% per year — meaning you pay back more than double over 12 months. No salary or small business grows at 120% annually to justify this."
      ),
      text(
        "Evaluating any debt opportunity:\n\n1. What is the total cost? Multiply the monthly rate by the loan term to see the full picture. A ₦50,000 loan at 8% per month for 6 months costs ₦24,000 in interest — you repay ₦74,000.\n\n2. What is the purpose? If it is not generating income or building an appreciating asset, it is likely bad debt.\n\n3. Can you repay from income? The repayment amount should fit within your budget without sacrificing essentials.\n\n4. What happens if your plan fails? Have a fallback — a way to service the debt even in a bad month."
      ),
      quiz(
        "Hauwa takes a ₦200,000 loan at 5% monthly to expand her fabric business. She expects to earn ₦80,000 extra profit per month from the expansion. Is this good or bad debt?",
        [
          "Bad debt — all loans are bad",
          "Good debt — the extra profit (₦80,000) clearly exceeds the monthly interest (₦10,000)",
          "Bad debt — because fabric prices are unpredictable",
          "Good debt — only because it is a large amount",
        ],
        1
      ),
      quiz(
        "Which of these is the CLEAREST example of bad debt?",
        [
          "Borrowing to buy equipment that halves your production costs",
          "Borrowing at 15% monthly to fund a birthday party you cannot afford",
          "A business loan to purchase stock ahead of the Christmas rush",
          "A school fee loan for a professional certification course",
        ],
        1
      ),
    ],
  },
  {
    title: "Getting Out of the Debt Trap: A Step-by-Step Plan",
    description:
      "If you are already in debt or a debt cycle, this lesson gives you a realistic, actionable plan to break free without losing your business or your sanity.",
    category: "DEBT_MANAGEMENT",
    difficulty: 3,
    duration: 11,
    order: 12,
    badge: "Debt Freedom Fighter",
    reward: 100,
    content: [
      text(
        "The debt trap is a cycle many Nigerian women know too well: you borrow to cover a shortfall, the repayment creates another shortfall, so you borrow again — often from a new lender to pay the old one. Each loan is smaller than the last but the stress grows. Breaking this cycle requires a clear plan, not willpower alone."
      ),
      text(
        "Step 1: Write it all down.\n\nThe first act of taking back control is knowing exactly what you owe. Make a list:\n\n• Lender name (person, bank, app, WAG)\n• Outstanding balance\n• Monthly interest rate\n• Minimum payment or due date\n\nMany women avoid this step because the total is frightening. But you cannot fight an enemy you refuse to look at. Once you see the full picture, it usually feels more manageable than the vague dread of not knowing."
      ),
      text(
        "Step 2: Choose your payoff strategy.\n\nTwo proven methods:\n\nAVALANCHE METHOD: Pay minimum amounts on all debts, then throw all extra money at the debt with the HIGHEST interest rate. This saves you the most money overall.\n\nSNOWBALL METHOD: Pay minimum on all debts, then throw all extra money at the SMALLEST debt balance. Once that is cleared, attack the next smallest. This builds psychological momentum — especially important if debt has made you feel hopeless.\n\nFor most Nigerian women in a debt trap, the Snowball Method works better psychologically. Choose what you will actually stick with."
      ),
      text(
        "Step 3: Increase income or cut expenses — or both.\n\nYou cannot repay faster than your budget allows. Look for:\n• Any expense you can cut for the next 3-6 months\n• Any additional income: a skill to monetise, extra market days, items to sell\n• Your WAG — can the group offer you a 0% internal loan to pay off a high-interest external debt?\n\nStep 4: Communicate with lenders.\n\nIf you cannot meet a payment, tell the lender BEFORE the due date. Most lenders — even digital ones — prefer a restructured repayment plan to a complete default. Ghosting lenders almost always makes the situation worse.\n\nStep 5: Build your buffer.\n\nAs each debt clears, redirect half the freed payment to savings. Even ₦2,000 monthly in an emergency fund is your shield against the next unexpected expense that would otherwise send you back into debt."
      ),
      quiz(
        "Blessing owes money to three lenders: ₦15,000 at 3% monthly, ₦8,000 at 10% monthly, and ₦25,000 at 5% monthly. Using the Avalanche Method, which debt should she attack first?",
        [
          "The ₦25,000 debt (largest balance)",
          "The ₦8,000 debt (highest interest rate at 10%)",
          "The ₦15,000 debt (middle balance)",
          "Pay them all equally",
        ],
        1
      ),
      quiz(
        "Blessing cannot meet her payment to a digital lender this month. What is the BEST action?",
        [
          "Ignore the lender and hope the debt disappears",
          "Take a new loan from another lender to pay this one",
          "Contact the lender before the due date to discuss restructuring",
          "Delete the lender's app from her phone",
        ],
        2
      ),
    ],
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────

async function main() {
  console.log("Starting financial literacy seed...\n");

  // Clear existing lessons
  const deleted = await prisma.lesson.deleteMany({});
  console.log(`Cleared ${deleted.count} existing lesson(s).`);

  // Insert all 12 lessons
  const created = await prisma.lesson.createMany({
    data: lessons.map((lesson) => ({
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      order: lesson.order,
      badge: lesson.badge,
      reward: lesson.reward,
      content: lesson.content,
      isActive: true,
    })),
  });

  console.log(`Successfully inserted ${created.count} lessons:\n`);

  // Log a summary grouped by category
  const categories: LessonCategory[] = [
    "BUDGETING",
    "SAVING",
    "INVESTING",
    "ENTREPRENEURSHIP",
    "DIGITAL_SAFETY",
    "DEBT_MANAGEMENT",
  ];

  for (const category of categories) {
    const categoryLessons = lessons.filter((l) => l.category === category);
    const titles = categoryLessons.map((l) => `  - ${l.title}`).join("\n");
    console.log(`${category} (${categoryLessons.length}):\n${titles}\n`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
