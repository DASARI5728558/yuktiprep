import prisma from "../config/prisma.js";
import { generateMCQQuestions } from "../services/testGenerator.service.js";

export const sampleTestsData = [
  {
    slug: "upsc-csat-full-length-1",
    title: "UPSC Prelims CSAT - Full Length 1",
    duration: "120 mins",
    questionsCount: "80 Qs",
    usersCount: "12.4k users",
    difficulty: "HARD",
    exam: "UPSC Civil Services",
    type: "mock",
    questions: [
      {
        question: "Which of the following schedules of the Constitution of India contains provisions regarding anti-defection?",
        options: [
          { id: "A", text: "Second Schedule" },
          { id: "B", text: "Fifth Schedule" },
          { id: "C", text: "Eighth Schedule" },
          { id: "D", text: "Tenth Schedule" },
        ],
        correctAnswer: "D",
        explanation: "The Tenth Schedule of the Constitution of India contains provisions regarding disqualification on grounds of defection, added by the 52nd Amendment Act, 1985."
      },
      {
        question: "Consider the following statements regarding the Attorney General of India:\n1. Appointed by the President.\n2. Must have qualifications of a Supreme Court Judge.\nWhich of the statements given above is/are correct?",
        options: [
          { id: "A", text: "1 only" },
          { id: "B", text: "2 only" },
          { id: "C", text: "Both 1 and 2" },
          { id: "D", text: "Neither 1 nor 2" },
        ],
        correctAnswer: "C",
        explanation: "Under Article 76, the Attorney General is appointed by the President and must be a person qualified to be appointed as a Judge of the Supreme Court."
      },
      {
        question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        options: [
          { id: "A", text: "120 metres" },
          { id: "B", text: "150 metres" },
          { id: "C", text: "180 metres" },
          { id: "D", text: "324 metres" },
        ],
        correctAnswer: "B",
        explanation: "Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres."
      },
      {
        question: "What comes next in the sequence: 4, 9, 25, 49, 121, ?",
        options: [
          { id: "A", text: "144" },
          { id: "B", text: "169" },
          { id: "C", text: "196" },
          { id: "D", text: "225" },
        ],
        correctAnswer: "B",
        explanation: "The sequence consists of squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, and 13^2 = 169."
      },
      {
        question: "The Comptroller and Auditor General (CAG) of India submits audit reports relating to the accounts of the Union to:",
        options: [
          { id: "A", text: "The President" },
          { id: "B", text: "The Prime Minister" },
          { id: "C", text: "The Speaker of Lok Sabha" },
          { id: "D", text: "The Finance Minister" },
        ],
        correctAnswer: "A",
        explanation: "Under Article 151(1), the CAG submits reports relating to the accounts of the Union to the President, who causes them to be laid before each House of Parliament."
      }
    ]
  },
  {
    slug: "ssc-cgl-english",
    title: "SSC CGL Tier 1 - English Language",
    duration: "15 mins",
    questionsCount: "25 Qs",
    usersCount: "45.1k users",
    difficulty: "MEDIUM",
    exam: "SSC (CGL, CHSL, MTS)",
    type: "mock",
    questions: [
      {
        question: "Select the most appropriate synonym of the given word: BENEVOLENT",
        options: [
          { id: "A", text: "Kind" },
          { id: "B", text: "Hostile" },
          { id: "C", text: "Cruel" },
          { id: "D", text: "Selfish" },
        ],
        correctAnswer: "A",
        explanation: "'Benevolent' means well-meaning and kindly. Its closest synonym is 'Kind'."
      },
      {
        question: "Select the correctly spelt word:",
        options: [
          { id: "A", text: "Accomodate" },
          { id: "B", text: "Accommodate" },
          { id: "C", text: "Acommodate" },
          { id: "D", text: "Acomodate" },
        ],
        correctAnswer: "B",
        explanation: "The correct spelling is 'Accommodate' with double 'c' and double 'm'."
      },
      {
        question: "Select the option that can be used as a one-word substitution: 'A person who hates or distrusts humankind'",
        options: [
          { id: "A", text: "Philanthropist" },
          { id: "B", text: "Misanthrope" },
          { id: "C", text: "Altruist" },
          { id: "D", text: "Optimist" },
        ],
        correctAnswer: "B",
        explanation: "A 'Misanthrope' is a person who dislikes humankind and avoids human society."
      },
      {
        question: "Choose the correct idiom meaning for: 'To burn the midnight oil'",
        options: [
          { id: "A", text: "To waste resources recklessly" },
          { id: "B", text: "To work or study late into the night" },
          { id: "C", text: "To cause an accidental fire" },
          { id: "D", text: "To give up easily" },
        ],
        correctAnswer: "B",
        explanation: "'To burn the midnight oil' signifies working or studying late into the night."
      },
      {
        question: "Identify the segment that contains a grammatical error: 'Neither she nor her friends is coming to the farewell party.'",
        options: [
          { id: "A", text: "Neither she" },
          { id: "B", text: "nor her friends" },
          { id: "C", text: "is coming" },
          { id: "D", text: "to the farewell party" },
        ],
        correctAnswer: "C",
        explanation: "When two subjects are joined by 'neither... nor', the verb agrees with the subject closest to it ('her friends' is plural, so it should be 'are coming')."
      }
    ]
  },
  {
    slug: "ibps-po-quant",
    title: "IBPS PO Prelims - Quantitative Aptitude",
    duration: "20 mins",
    questionsCount: "35 Qs",
    usersCount: "32k users",
    difficulty: "HARD",
    exam: "Banking (IBPS, SBI PO/Clerk)",
    type: "mock",
    questions: [
      {
        question: "The ratio of the speed of a boat in still water to that of current is 8:1. If the boat takes 4 hours 30 mins to go 36 km downstream and return upstream, what is the speed of boat in still water?",
        options: [
          { id: "A", text: "16 km/hr" },
          { id: "B", text: "18 km/hr" },
          { id: "C", text: "20 km/hr" },
          { id: "D", text: "24 km/hr" },
        ],
        correctAnswer: "A",
        explanation: "Let speed in still water = 8x, current = x. Downstream speed = 9x, Upstream speed = 7x. 36/(9x) + 36/(7x) = 4.5 => 4/x + 36/(7x) = 4.5 => 64/(7x) = 4.5 => x = 2. Speed of boat = 8 * 2 = 16 km/hr."
      },
      {
        question: "A sum invested under compound interest amounts to Rs. 7,200 in 2 years and Rs. 8,640 in 3 years. Find the rate of interest per annum.",
        options: [
          { id: "A", text: "15%" },
          { id: "B", text: "20%" },
          { id: "C", text: "25%" },
          { id: "D", text: "10%" },
        ],
        correctAnswer: "B",
        explanation: "Interest earned in the 3rd year = 8640 - 7200 = Rs. 1440. Rate = (1440 / 7200) * 100 = 20%."
      }
    ]
  },
  {
    slug: "rrb-general-awareness",
    title: "RRB NTPC CBT 1 - General Awareness",
    duration: "15 mins",
    questionsCount: "40 Qs",
    usersCount: "56k users",
    difficulty: "EASY",
    exam: "Railways (RRB NTPC, Group D)",
    type: "mock",
    questions: [
      {
        question: "Where is the headquarters of the Indian Railway located?",
        options: [
          { id: "A", text: "Mumbai" },
          { id: "B", text: "New Delhi" },
          { id: "C", text: "Kolkata" },
          { id: "D", text: "Chennai" },
        ],
        correctAnswer: "B",
        explanation: "The headquarters of the Indian Railway and the Railway Board is located at Rail Bhavan, New Delhi."
      },
      {
        question: "What is the chemical symbol for Gold?",
        options: [
          { id: "A", text: "Ag" },
          { id: "B", text: "Au" },
          { id: "C", text: "Fe" },
          { id: "D", text: "Pb" },
        ],
        correctAnswer: "B",
        explanation: "The symbol 'Au' comes from the Latin word 'Aurum', meaning shining dawn or gold."
      }
    ]
  },
  {
    slug: "upsc-history",
    title: "UPSC GS Paper 1 - Sectional (History)",
    duration: "60 mins",
    questionsCount: "50 Qs",
    usersCount: "8.2k users",
    difficulty: "MEDIUM",
    exam: "UPSC Civil Services",
    type: "previous-year",
    questions: [
      {
        question: "With reference to the Indian freedom struggle, the 'Cripps Mission' came to India in which year?",
        options: [
          { id: "A", text: "1940" },
          { id: "B", text: "1942" },
          { id: "C", text: "1945" },
          { id: "D", text: "1946" },
        ],
        correctAnswer: "B",
        explanation: "Sir Stafford Cripps headed the Cripps Mission in March 1942 to secure Indian cooperation in World War II."
      }
    ]
  },
  {
    slug: "nda-general-ability",
    title: "NDA General Ability Test - Mock 1",
    duration: "150 mins",
    questionsCount: "150 Qs",
    usersCount: "15k users",
    difficulty: "MEDIUM",
    exam: "Defence (NDA, CDS, AFCAT)",
    type: "mock",
    questions: [
      {
        question: "Which gland in the human body is also known as the 'Master Gland'?",
        options: [
          { id: "A", text: "Thyroid Gland" },
          { id: "B", text: "Pituitary Gland" },
          { id: "C", text: "Adrenal Gland" },
          { id: "D", text: "Pancreas" },
        ],
        correctAnswer: "B",
        explanation: "The pituitary gland produces hormones that control the functions of other endocrine glands, hence called the master gland."
      }
    ]
  },
  {
    slug: "upsc-prelims-2023",
    title: "UPSC Prelims Paper 1 (2023)",
    duration: "120 mins",
    questionsCount: "100 Qs",
    usersCount: "150k users",
    difficulty: "HARD",
    exam: "UPSC Civil Services",
    type: "previous-year",
    questions: [
      {
        question: "Consider the following statements regarding Carbon Capture and Storage (CCS):\n1. It captures CO2 at the source.\n2. Captured CO2 is stored in geological rock formations underground.\nWhich is correct?",
        options: [
          { id: "A", text: "1 only" },
          { id: "B", text: "2 only" },
          { id: "C", text: "Both 1 and 2" },
          { id: "D", text: "Neither 1 nor 2" },
        ],
        correctAnswer: "C",
        explanation: "CCS involves capturing CO2 emissions from point sources such as power plants and safely sequestering them in deep geological formations."
      }
    ]
  },
  {
    slug: "ssc-cgl-2022",
    title: "SSC CGL Tier 1 (2022)",
    duration: "60 mins",
    questionsCount: "100 Qs",
    usersCount: "260k users",
    difficulty: "MEDIUM",
    exam: "SSC (CGL, CHSL, MTS)",
    type: "previous-year",
    questions: [
      {
        question: "Which Article of the Indian Constitution empowers High Courts to issue writs?",
        options: [
          { id: "A", text: "Article 32" },
          { id: "B", text: "Article 226" },
          { id: "C", text: "Article 124" },
          { id: "D", text: "Article 214" },
        ],
        correctAnswer: "B",
        explanation: "Article 226 grants High Courts the power to issue writs for the enforcement of Fundamental Rights and for any other purpose."
      }
    ]
  },
  {
    slug: "ssc-cgl-2021",
    title: "SSC CGL Tier 1 (2021)",
    duration: "60 mins",
    questionsCount: "100 Qs",
    usersCount: "280k users",
    difficulty: "EASY",
    exam: "SSC (CGL, CHSL, MTS)",
    type: "previous-year",
    questions: [
      {
        question: "What is the capital of Australia?",
        options: [
          { id: "A", text: "Sydney" },
          { id: "B", text: "Melbourne" },
          { id: "C", text: "Canberra" },
          { id: "D", text: "Brisbane" },
        ],
        correctAnswer: "C",
        explanation: "Canberra is the federal capital of Australia, chosen as a compromise between Sydney and Melbourne."
      }
    ]
  },
  {
    slug: "ibps-po-2023",
    title: "IBPS PO Prelims (2023)",
    duration: "60 mins",
    questionsCount: "50 Qs",
    usersCount: "140k users",
    difficulty: "MEDIUM",
    exam: "Banking (IBPS, SBI PO/Clerk)",
    type: "previous-year",
    questions: [
      {
        question: "In banking terminology, what does 'NPA' stand for?",
        options: [
          { id: "A", text: "Non-Performing Asset" },
          { id: "B", text: "National Pension Account" },
          { id: "C", text: "Net Profit Amount" },
          { id: "D", text: "Non-Promoter Allotment" },
        ],
        correctAnswer: "A",
        explanation: "A Non-Performing Asset (NPA) is a loan or advance for which the principal or interest payment remained overdue for a period of 90 days."
      }
    ]
  }
];

export async function seedMockTestsDatabase({ useAI = false, provider = "ollama", count = 5 } = {}) {
  console.log(`Seeding Mock Tests to database (useAI: ${useAI}, provider: ${provider})...`);
  for (const item of sampleTestsData) {
    const { questions, ...testMeta } = item;
    const test = await prisma.mockTest.upsert({
      where: { slug: testMeta.slug },
      update: {
        ...testMeta,
        isActive: true,
      },
      create: {
        ...testMeta,
        isActive: true,
      },
    });

    let finalQuestions = questions || [];

    // If useAI is selected, generate fresh questions for the test using the chosen model (e.g. Ollama)
    if (useAI) {
      try {
        console.log(`Generating ${count} AI questions for ${testMeta.title} using ${provider}...`);
        const aiQuestions = await generateMCQQuestions({
          exam: testMeta.exam,
          topic: testMeta.title,
          difficulty: testMeta.difficulty,
          count: count,
          provider: provider,
        });
        if (aiQuestions && aiQuestions.length > 0) {
          finalQuestions = aiQuestions;
        }
      } catch (err) {
        console.warn(`AI generation for seed ${testMeta.slug} failed, using default questions:`, err?.message);
      }
    }

    if (finalQuestions && finalQuestions.length > 0) {
      // Clear existing default questions if any and re-insert
      await prisma.mockTestQuestion.deleteMany({
        where: { testId: test.id },
      });

      for (let i = 0; i < finalQuestions.length; i++) {
        const q = finalQuestions[i];
        await prisma.mockTestQuestion.create({
          data: {
            testId: test.id,
            orderIndex: i + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          },
        });
      }

      await prisma.mockTest.update({
        where: { id: test.id },
        data: {
          questionsCount: `${finalQuestions.length} Qs`,
        },
      });
    }
  }

  // Seed sample attempts if none exist
  const existingAttempts = await prisma.mockTestAttempt.count();
  if (existingAttempts === 0) {
    const rrbTest = await prisma.mockTest.findFirst({ where: { slug: "rrb-general-awareness" } });
    const upscTest = await prisma.mockTest.findFirst({ where: { slug: "upsc-csat-full-length-1" } });

    if (rrbTest) {
      await prisma.mockTestAttempt.create({
        data: {
          testId: rrbTest.id,
          title: "RRB NTPC CBT 1 - General Awareness",
          exam: "Railways (RRB NTPC, Group D)",
          score: "73%",
          correct: "29/40",
          status: "Submitted",
          badge: "AI",
          timeTakenSec: 143,
          userAnswers: {},
        },
      });
    }

    if (upscTest) {
      await prisma.mockTestAttempt.create({
        data: {
          testId: upscTest.id,
          title: "UPSC Prelims CSAT - Full Length 1",
          exam: "UPSC Civil Services",
          score: "40%",
          correct: "20/50",
          status: "Submitted",
          badge: "AI",
          timeTakenSec: 320,
          userAnswers: {},
        },
      });
    }
  }

  console.log("Mock tests seeded successfully!");
}
