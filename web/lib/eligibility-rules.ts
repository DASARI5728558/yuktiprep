export type CategoryType = "UR" | "OBC" | "SC" | "ST" | "EWS" | "PwBD";
export type GenderType = "ALL" | "MALE" | "FEMALE" | "OTHER";
export type EducationLevel =
  | "10TH"
  | "12TH_ANY"
  | "12TH_SCIENCE"
  | "DIPLOMA"
  | "GRAD_ANY"
  | "GRAD_ENGG"
  | "GRAD_COMMERCE"
  | "GRAD_LAW"
  | "POST_GRAD";

export interface UserCriteria {
  dob: string; // YYYY-MM-DD
  age?: number;
  category: CategoryType;
  gender: GenderType;
  education: EducationLevel;
  percentage?: number;
  attemptsUsed?: number;
  state?: string;
}

export interface ExamRule {
  id: string;
  name: string;
  shortName: string;
  conductingBody: string;
  category: "Civil Services" | "Staff Selection" | "Banking & Finance" | "Railways" | "Defence" | "Regulatory & Others";
  description: string;
  minAge: number;
  maxAgeGeneral: number;
  ageRelaxation: {
    OBC?: number;
    SC?: number;
    ST?: number;
    PwBD?: number;
    EWS?: number;
  };
  allowedEducations: EducationLevel[];
  minPercentage?: number;
  allowedGenders?: GenderType[];
  maxAttemptsGeneral?: number;
  attemptsRelaxation?: {
    OBC?: number;
    SC?: number; // SC/ST usually unlimited up to age limit
    ST?: number;
    PwBD?: number;
  };
  stateSpecific?: string; // e.g. "All India" or "Tamil Nadu"
  officialUrl: string;
  calendarPath?: string;
  keyHighlights: string[];
}

export interface EligibilityEvaluation {
  exam: ExamRule;
  status: "ELIGIBLE" | "CONDITIONALLY_ELIGIBLE" | "NOT_ELIGIBLE";
  reasons: string[];
  matchedCriteria: {
    ageOk: boolean;
    educationOk: boolean;
    percentageOk: boolean;
    genderOk: boolean;
    attemptsOk: boolean;
    stateOk: boolean;
  };
  calculatedAge: number;
  effectiveMaxAge: number;
  effectiveAttempts: number | "Unlimited";
}

export const COMPETITIVE_EXAM_RULES: ExamRule[] = [
  {
    id: "upsc-cse",
    name: "Civil Services Examination (IAS/IPS/IFS)",
    shortName: "UPSC CSE",
    conductingBody: "Union Public Service Commission",
    category: "Civil Services",
    description: "Premier examination for recruitment to administrative, police, and foreign services in India.",
    minAge: 21,
    maxAgeGeneral: 32,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    maxAttemptsGeneral: 6,
    attemptsRelaxation: { OBC: 9, SC: 99, ST: 99, PwBD: 9 },
    stateSpecific: "All India",
    officialUrl: "https://upsc.gov.in",
    calendarPath: "/exams?category=Central+Government",
    keyHighlights: ["Any recognized Bachelor degree", "Prelims + Mains + Interview", "Gazetted Group A Posts"],
  },
  {
    id: "ssc-cgl",
    name: "Combined Graduate Level Examination (CGL)",
    shortName: "SSC CGL",
    conductingBody: "Staff Selection Commission",
    category: "Staff Selection",
    description: "Recruitment to Group B and Group C posts in central ministries, departments, and attached offices.",
    minAge: 18,
    maxAgeGeneral: 30, // some posts up to 32
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://ssc.gov.in",
    calendarPath: "/exams?category=Central+Government",
    keyHighlights: ["Inspector, ASO, Tax Assistant, Auditor", "Tier 1 + Tier 2 CBT", "No attempt limit up to age limit"],
  },
  {
    id: "ssc-chsl",
    name: "Combined Higher Secondary Level (10+2)",
    shortName: "SSC CHSL",
    conductingBody: "Staff Selection Commission",
    category: "Staff Selection",
    description: "Recruitment of Lower Division Clerks (LDC), Junior Secretarial Assistants (JSA), and Data Entry Operators (DEO).",
    minAge: 18,
    maxAgeGeneral: 27,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["12TH_ANY", "12TH_SCIENCE", "DIPLOMA", "GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://ssc.gov.in",
    calendarPath: "/exams?category=Central+Government",
    keyHighlights: ["12th standard pass from recognized board", "Tier 1 CBT + Tier 2 Skill/Typing", "Central Government payroll"],
  },
  {
    id: "ssc-mts",
    name: "Multi-Tasking (Non-Technical) Staff & Havaldar",
    shortName: "SSC MTS",
    conductingBody: "Staff Selection Commission",
    category: "Staff Selection",
    description: "General central service Group C non-gazetted, non-ministerial posts.",
    minAge: 18,
    maxAgeGeneral: 25, // 27 for Havaldar in CBIC
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["10TH", "12TH_ANY", "12TH_SCIENCE", "DIPLOMA", "GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://ssc.gov.in",
    calendarPath: "/exams?category=Central+Government",
    keyHighlights: ["Class 10th (Matriculation) pass", "Single-stage CBT exam", "High job security in Central Govt"],
  },
  {
    id: "ibps-po",
    name: "Probationary Officer / Management Trainee (CWE PO/MT)",
    shortName: "IBPS PO",
    conductingBody: "Institute of Banking Personnel Selection",
    category: "Banking & Finance",
    description: "Officer level recruitment across 11 participating Public Sector Banks in India.",
    minAge: 20,
    maxAgeGeneral: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://ibps.in",
    calendarPath: "/exams?category=Banking",
    keyHighlights: ["Graduation in any discipline", "Prelims + Mains + Interview", "Fast promotions to Scale II & III"],
  },
  {
    id: "sbi-po",
    name: "State Bank of India Probationary Officer",
    shortName: "SBI PO",
    conductingBody: "State Bank of India",
    category: "Banking & Finance",
    description: "Premier banking officer examination offering highest entry-level packages in public banking.",
    minAge: 21,
    maxAgeGeneral: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    maxAttemptsGeneral: 4,
    attemptsRelaxation: { OBC: 7, SC: 99, ST: 99, PwBD: 7 },
    stateSpecific: "All India",
    officialUrl: "https://sbi.co.in/careers",
    calendarPath: "/exams?category=Banking",
    keyHighlights: ["Any degree graduate", "Attempt limit: General 4, OBC 7, SC/ST unlimited", "Attractive remuneration"],
  },
  {
    id: "ibps-clerk",
    name: "Clerical Cadre Recruitment (CWE Clerk)",
    shortName: "IBPS Clerk",
    conductingBody: "Institute of Banking Personnel Selection",
    category: "Banking & Finance",
    description: "Customer service associates and clerical staff across leading nationalized banks.",
    minAge: 20,
    maxAgeGeneral: 28,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://ibps.in",
    calendarPath: "/exams?category=Banking",
    keyHighlights: ["Any graduate degree", "Proficiency in local state language required", "No interview round"],
  },
  {
    id: "rbi-grade-b",
    name: "Reserve Bank of India Officers in Grade 'B'",
    shortName: "RBI Grade B",
    conductingBody: "Reserve Bank of India",
    category: "Banking & Finance",
    description: "Elite central banking leadership role shaping monetary policy and banking supervision.",
    minAge: 21,
    maxAgeGeneral: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    minPercentage: 60,
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    maxAttemptsGeneral: 6,
    attemptsRelaxation: { OBC: 99, SC: 99, ST: 99, PwBD: 99 },
    stateSpecific: "All India",
    officialUrl: "https://opportunities.rbi.org.in",
    calendarPath: "/exams?category=Banking",
    keyHighlights: ["Minimum 60% in Graduation (50% for SC/ST/PwBD)", "Phase I + Phase II + Interview", "Prestigious policy role"],
  },
  {
    id: "rrb-ntpc-grad",
    name: "Non-Technical Popular Categories (Graduate)",
    shortName: "RRB NTPC Graduate",
    conductingBody: "Railway Recruitment Board",
    category: "Railways",
    description: "Station Master, Goods Train Manager, Senior Clerk, and Commercial Apprentice in Indian Railways.",
    minAge: 18,
    maxAgeGeneral: 33, // 36 with 2024-2026 pandemic relaxation
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://rrbcdg.gov.in",
    calendarPath: "/exams?category=Railway",
    keyHighlights: ["Any Graduation", "CBT 1 + CBT 2 + CBAT / Typing", "Railway quarters & healthcare benefits"],
  },
  {
    id: "rrb-ntpc-ug",
    name: "Non-Technical Popular Categories (Under-Graduate)",
    shortName: "RRB NTPC (12th)",
    conductingBody: "Railway Recruitment Board",
    category: "Railways",
    description: "Junior Clerk cum Typist, Accounts Clerk, and Trains Clerk across Railway divisions.",
    minAge: 18,
    maxAgeGeneral: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 10, EWS: 0 },
    allowedEducations: ["12TH_ANY", "12TH_SCIENCE", "DIPLOMA", "GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://rrbcdg.gov.in",
    calendarPath: "/exams?category=Railway",
    keyHighlights: ["12th pass with minimum 50% marks for General", "CBT 1 + CBT 2 + Typing Skill Test"],
  },
  {
    id: "rrb-alp",
    name: "Assistant Loco Pilot (ALP)",
    shortName: "RRB ALP",
    conductingBody: "Railway Recruitment Board",
    category: "Railways",
    description: "Driver of express, passenger, and freight locomotive trains across Indian Railways.",
    minAge: 18,
    maxAgeGeneral: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 0, EWS: 0 },
    allowedEducations: ["10TH", "DIPLOMA", "GRAD_ENGG"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://rrbcdg.gov.in",
    calendarPath: "/exams?category=Railway",
    keyHighlights: ["Matriculation + ITI / Diploma / Degree in Engineering", "A1 Medical Standard (6/6 vision without glasses mandatory)"],
  },
  {
    id: "nda",
    name: "National Defence Academy & Naval Academy Examination",
    shortName: "UPSC NDA",
    conductingBody: "Union Public Service Commission",
    category: "Defence",
    description: "Cadet training entry for Army, Navy, and Air Force wings of the NDA.",
    minAge: 16.5,
    maxAgeGeneral: 19.5,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PwBD: 0, EWS: 0 }, // Strict age bar for armed forces cadet entry
    allowedEducations: ["12TH_ANY", "12TH_SCIENCE"],
    allowedGenders: ["ALL", "MALE", "FEMALE"],
    stateSpecific: "All India",
    officialUrl: "https://upsc.gov.in",
    calendarPath: "/exams?category=Defence",
    keyHighlights: ["12th appearing or passed (Physics & Maths required for Navy/Air Force)", "Written Exam + 5-day SSB Interview", "Commissioned as Lieutenant / Sub-Lieutenant"],
  },
  {
    id: "cds",
    name: "Combined Defence Services Examination",
    shortName: "UPSC CDS",
    conductingBody: "Union Public Service Commission",
    category: "Defence",
    description: "Direct entry for graduates into IMA, OTA, INA, and Air Force Academy.",
    minAge: 19,
    maxAgeGeneral: 24, // 25 for OTA
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PwBD: 0, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE"],
    stateSpecific: "All India",
    officialUrl: "https://upsc.gov.in",
    calendarPath: "/exams?category=Defence",
    keyHighlights: ["Graduation degree (Engg degree for Naval & Air Force)", "Written test + SSB Interview + Medical", "Permanent & Short Service Commission"],
  },
  {
    id: "capf-ac",
    name: "Central Armed Police Forces (Assistant Commandants)",
    shortName: "UPSC CAPF (AC)",
    conductingBody: "Union Public Service Commission",
    category: "Defence",
    description: "Direct entry Gazetted Officers for BSF, CRPF, CISF, ITBP, and SSB.",
    minAge: 20,
    maxAgeGeneral: 25,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 0, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE"],
    stateSpecific: "All India",
    officialUrl: "https://upsc.gov.in",
    calendarPath: "/exams?category=Defence",
    keyHighlights: ["Bachelor degree in any subject", "Written test + Physical Efficiency Test (PET) + Interview", "Commandant leadership role in border and security forces"],
  },
  {
    id: "state-psc-gen",
    name: "State Public Service Commission (Combined Civil Services)",
    shortName: "State PCS / PSC",
    conductingBody: "State Public Service Commissions (UPPSC, BPSC, MPSC, TNPSC, APPSC)",
    category: "Civil Services",
    description: "Sub-Divisional Magistrate (SDM), Deputy SP, Tehsildar, and Block Development Officer in states.",
    minAge: 21,
    maxAgeGeneral: 40, // standard upper age limit in most states like UP, MP, Rajasthan
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PwBD: 15, EWS: 0 },
    allowedEducations: ["GRAD_ANY", "GRAD_ENGG", "GRAD_COMMERCE", "GRAD_LAW", "POST_GRAD"],
    allowedGenders: ["ALL", "MALE", "FEMALE", "OTHER"],
    stateSpecific: "All India",
    officialUrl: "https://uppsc.up.nic.in",
    calendarPath: "/exams?category=State+Government",
    keyHighlights: ["Bachelor degree in any stream", "State quota reservations apply for state domicile holders", "Group A & B state civil administration"],
  }
];

export function calculateAgeFromDob(dobString: string): number {
  if (!dobString) return 0;
  const birth = new Date(dobString);
  const now = new Date();
  if (isNaN(birth.getTime())) return 0;

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function evaluateExamEligibility(
  rule: ExamRule,
  criteria: UserCriteria
): EligibilityEvaluation {
  const age = criteria.age ?? calculateAgeFromDob(criteria.dob);
  const category = criteria.category || "UR";
  const userEdu = criteria.education;
  const userGender = criteria.gender || "ALL";
  const userAttempts = criteria.attemptsUsed ?? 0;
  const userPercentage = criteria.percentage;

  // 1. Age check with category relaxation
  let relaxationYears = 0;
  if (category === "OBC") relaxationYears = rule.ageRelaxation.OBC ?? 0;
  else if (category === "SC") relaxationYears = rule.ageRelaxation.SC ?? 0;
  else if (category === "ST") relaxationYears = rule.ageRelaxation.ST ?? 0;
  else if (category === "PwBD") relaxationYears = rule.ageRelaxation.PwBD ?? 0;
  else if (category === "EWS") relaxationYears = rule.ageRelaxation.EWS ?? 0;

  const effectiveMaxAge = rule.maxAgeGeneral + relaxationYears;
  const ageOk = age >= rule.minAge && age <= effectiveMaxAge;

  // 2. Education check
  const educationOk = rule.allowedEducations.includes(userEdu);

  // 3. Percentage check
  let percentageOk = true;
  if (rule.minPercentage && userPercentage !== undefined && userPercentage > 0) {
    // Check if relaxation applies for SC/ST
    const targetPct = (category === "SC" || category === "ST" || category === "PwBD")
      ? Math.max(50, rule.minPercentage - 10)
      : rule.minPercentage;
    percentageOk = userPercentage >= targetPct;
  }

  // 4. Gender check
  const genderOk = !rule.allowedGenders || rule.allowedGenders.includes("ALL") || rule.allowedGenders.includes(userGender);

  // 5. Attempts check
  let maxAttempts: number | "Unlimited" = "Unlimited";
  let attemptsOk = true;
  if (rule.maxAttemptsGeneral !== undefined) {
    let allowedAttempts = rule.maxAttemptsGeneral;
    if (category === "OBC" && rule.attemptsRelaxation?.OBC !== undefined) {
      allowedAttempts = rule.attemptsRelaxation.OBC;
    } else if ((category === "SC" || category === "ST") && rule.attemptsRelaxation?.SC !== undefined) {
      allowedAttempts = rule.attemptsRelaxation.SC;
    } else if (category === "PwBD" && rule.attemptsRelaxation?.PwBD !== undefined) {
      allowedAttempts = rule.attemptsRelaxation.PwBD;
    }
    maxAttempts = allowedAttempts >= 90 ? "Unlimited" : allowedAttempts;

    if (typeof maxAttempts === "number") {
      attemptsOk = userAttempts < maxAttempts;
    }
  }

  // 6. Reasons compilation
  const reasons: string[] = [];

  if (age < rule.minAge) {
    reasons.push(`Minimum age required is ${rule.minAge} years (current: ${age} yrs).`);
  } else if (age > effectiveMaxAge) {
    const relaxNote = relaxationYears > 0 ? ` with ${relaxationYears} yrs ${category} relaxation` : "";
    reasons.push(`Maximum age limit is ${effectiveMaxAge} years${relaxNote} (current: ${age} yrs).`);
  }

  if (!educationOk) {
    reasons.push(`Requires ${formatEducationNames(rule.allowedEducations)}.`);
  }

  if (!percentageOk && rule.minPercentage) {
    reasons.push(`Requires minimum ${rule.minPercentage}% marks in qualification.`);
  }

  if (!genderOk) {
    reasons.push(`Open only for specified gender candidates.`);
  }

  if (!attemptsOk && typeof maxAttempts === "number") {
    reasons.push(`Maximum attempts allowed for ${category} category is ${maxAttempts} (used: ${userAttempts}).`);
  }

  let status: EligibilityEvaluation["status"] = "ELIGIBLE";
  if (!ageOk || !educationOk || !percentageOk || !genderOk || !attemptsOk) {
    status = "NOT_ELIGIBLE";
  } else if (relaxationYears > 0 && age > rule.maxAgeGeneral) {
    status = "CONDITIONALLY_ELIGIBLE";
    reasons.push(`Eligible under ${category} category age relaxation (${rule.maxAgeGeneral} + ${relaxationYears} yrs).`);
  }

  return {
    exam: rule,
    status,
    reasons,
    matchedCriteria: {
      ageOk,
      educationOk,
      percentageOk,
      genderOk,
      attemptsOk,
      stateOk: true,
    },
    calculatedAge: age,
    effectiveMaxAge,
    effectiveAttempts: maxAttempts,
  };
}

function formatEducationNames(edus: EducationLevel[]): string {
  if (edus.includes("10TH")) return "10th pass / Matriculation";
  if (edus.includes("12TH_ANY")) return "12th Standard / Higher Secondary";
  if (edus.includes("GRAD_ANY")) return "Graduation / Bachelor's degree";
  if (edus.includes("GRAD_ENGG")) return "Engineering Degree / Diploma";
  return "Eligible qualification";
}
