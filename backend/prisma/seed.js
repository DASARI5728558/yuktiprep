import prisma from "../config/prisma.js";

const LANGUAGES = [
  { code: "as", azureCode: "as", englishName: "Assamese", nativeName: "অসমীয়া" },
  { code: "bn", azureCode: "bn", englishName: "Bengali", nativeName: "বাংলা" },
  { code: "gu", azureCode: "gu", englishName: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "hi", azureCode: "hi", englishName: "Hindi", nativeName: "हिन्दी" },
  { code: "kn", azureCode: "kn", englishName: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", azureCode: "ml", englishName: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr", azureCode: "mr", englishName: "Marathi", nativeName: "मराठी" },
  { code: "ne", azureCode: "ne", englishName: "Nepali", nativeName: "नेपाली" },
  { code: "or", azureCode: "or", englishName: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", azureCode: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ta", azureCode: "ta", englishName: "Tamil", nativeName: "தமிழ்" },
  { code: "te", azureCode: "te", englishName: "Telugu", nativeName: "తెలుగు" },
  { code: "ur", azureCode: "ur", englishName: "Urdu", nativeName: "اردو" },
  { code: "en", azureCode: "en", englishName: "English", nativeName: "English" },
];

const PLANS = [
  {
    key: "premium",
    name: "Premium",
    subtitle: "Best for serious aspirants",
    price: 499,
    currency: "INR",
    billingInterval: "monthly",
    badgeText: "Most Popular",
    badgeType: "popular",
    theme: "premium",
    sortOrder: 1,
    isActive: true,
    features: [
      { text: "Unlimited Tests", sortOrder: 1 },
      { text: "Advanced AI Tutor", sortOrder: 2 },
      { text: "Detailed Analytics", sortOrder: 3 },
      { text: "Priority Support", sortOrder: 4 },
    ],
  },
  {
    key: "standard",
    name: "Standard",
    subtitle: "Great for consistent learners",
    price: 299,
    currency: "INR",
    billingInterval: "monthly",
    badgeText: "Save 40%",
    badgeType: "discount",
    theme: "standard",
    sortOrder: 2,
    isActive: true,
    features: [
      { text: "All Standard Tests", sortOrder: 1 },
      { text: "Basic AI Tutor Access", sortOrder: 2 },
      { text: "Performance Analytics", sortOrder: 3 },
      { text: "Email Support", sortOrder: 4 },
    ],
  },
  {
    key: "basic",
    name: "Basic",
    subtitle: "Try premium at your pace",
    price: 50,
    currency: "INR",
    billingInterval: "monthly",
    badgeText: null,
    badgeType: null,
    theme: "basic",
    sortOrder: 3,
    isActive: true,
    features: [
      { text: "Limited Tests Access", sortOrder: 1 },
      { text: "Basic Analytics", sortOrder: 2 },
      { text: "Email Support", sortOrder: 3 },
    ],
  },
];

const EXAMS = [
  { name: "UPSC", slug: "upsc", isActive: true, sortOrder: 1 },
  { name: "SSC", slug: "ssc", isActive: true, sortOrder: 2 },
  { name: "Banking", slug: "banking", isActive: true, sortOrder: 3 },
  { name: "Railways", slug: "railways", isActive: true, sortOrder: 4 },
  { name: "Defence", slug: "defence", isActive: true, sortOrder: 5 },
  { name: "Teaching", slug: "teaching", isActive: true, sortOrder: 6 },
  { name: "State PSC", slug: "state-psc", isActive: true, sortOrder: 7 },
  { name: "Police", slug: "police", isActive: true, sortOrder: 8 },
  { name: "Engineering", slug: "engineering", isActive: true, sortOrder: 9 },
  { name: "Management", slug: "management", isActive: true, sortOrder: 10 },
  { name: "Law", slug: "law", isActive: true, sortOrder: 11 },
  { name: "Medical", slug: "medical", isActive: true, sortOrder: 12 },
  { name: "CUET", slug: "cuet", isActive: true, sortOrder: 13 },
  { name: "State Specific", slug: "state-specific", isActive: true, sortOrder: 14 }
];

const seed = async () => {
  try {
    for (const language of LANGUAGES) {
      await prisma.language.upsert({
        where: { code: language.code },
        update: language,
        create: language,
      });
    }

    console.log("Seed languages completed.");

    for (const planData of PLANS) {
      const { features, ...planFields } = planData;
      const plan = await prisma.plan.upsert({
        where: { key: planData.key },
        update: planFields,
        create: planFields,
      });

      await prisma.planFeature.deleteMany({ where: { planId: plan.id } });

      for (const feature of features) {
        await prisma.planFeature.create({
          data: { ...feature, planId: plan.id },
        });
      }
    }

    console.log("Seed plans completed.");

    for (const exam of EXAMS) {
      await prisma.targetExamTitle.upsert({
        where: { slug: exam.slug },
        update: exam,
        create: exam,
      });
    }

    console.log("Seed exams completed.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
