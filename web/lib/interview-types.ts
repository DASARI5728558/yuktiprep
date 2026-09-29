export const levels = ["BASIC", "MEDIUM", "HIGH", "PROFESSIONAL"] as const;
export const modes = [
  "AI_TUTOR",
  "MOCK_INTERVIEW",
  "ORAL_MOCK_TEST",
  "HUMAN_INTERVIEW",
  "PRACTICE",
] as const;
export const locales = [
  "en-IN",
  "hi-IN",
  "te-IN",
  "ta-IN",
  "kn-IN",
  "ml-IN",
  "mr-IN",
  "bn-IN",
  "gu-IN",
] as const;

export type Level = typeof levels[number];
export type Mode = typeof modes[number];
export type Locale = typeof locales[number];

export const examStreamKeys = [
  "CIVIL_SERVICES",
  "DEFENSE_ARMED_FORCES",
  "MANAGEMENT_MBA",
  "BANKING_REGULATORY",
  "ENGINEERING_PSU",
  "JUDICIARY_LAW",
  "MEDICAL_HEALTHCARE",
  "TECH_CONSULTING",
  "ACADEMIA_TEACHING",
] as const;

export type ExamStreamKey = typeof examStreamKeys[number];

export interface ExamTrack {
  id: string;
  stream: ExamStreamKey;
  name: string;
  description: string;
  panelPersona: string;
  defaultTopic: string;
  sampleTopics: string[];
  keyFocusAreas: string[];
}

export const EXAM_STREAMS: Record<ExamStreamKey, { name: string; description: string }> = {
  CIVIL_SERVICES: {
    name: "Civil Services & Governance",
    description: "UPSC CSE, State PSCs, and Indian Forest Service personality tests",
  },
  DEFENSE_ARMED_FORCES: {
    name: "Defense & Armed Forces (SSB)",
    description: "Officer Intelligence, Personal Interview & Situational Reactions",
  },
  MANAGEMENT_MBA: {
    name: "Management & Business Schools",
    description: "IIMs, XLRI, FMS, and Executive MBA interviews",
  },
  BANKING_REGULATORY: {
    name: "Banking & Financial Regulators",
    description: "RBI Grade B, SBI/IBPS PO, SEBI, NABARD, and Insurance Boards",
  },
  ENGINEERING_PSU: {
    name: "Engineering, PSUs & Scientific Research",
    description: "ISRO, BARC, DRDO, GATE-based PSUs, and IIT Ph.D. Viva",
  },
  JUDICIARY_LAW: {
    name: "Judiciary & Legal Services",
    description: "Civil Judge (PCS-J), Public Prosecutor, and Corporate Counsel",
  },
  MEDICAL_HEALTHCARE: {
    name: "Medical & Healthcare Boards",
    description: "AIIMS Residency, NEET-SS, and Specialist Clinical Vivas",
  },
  TECH_CONSULTING: {
    name: "Tech, Product, Consulting & Leadership",
    description: "FAANG System Design, McKinsey/BCG Cases, PM, and C-Suite",
  },
  ACADEMIA_TEACHING: {
    name: "Higher Academia & Research",
    description: "UGC-NET, CSIR-JRF, Assistant Professor, and University Faculty",
  },
};

export const EXAM_CATALOG: ExamTrack[] = [
  {
    id: "UPSC_CSE",
    stream: "CIVIL_SERVICES",
    name: "UPSC Civil Services Personality Test",
    description: "High-stakes interview assessing intellectual caliber, moral integrity, and administrative acumen.",
    panelPersona: "UPSC Board Chairperson & Senior Bureaucrats (IAS/IPS/IFS retirees)",
    defaultTopic: "Balancing welfare redistribution with fiscal consolidation in developing economies",
    sampleTopics: [
      "Balancing welfare redistribution with fiscal consolidation in developing economies",
      "Ethical dilemmas in maintaining public order vs civil liberties during protests",
      "India's multilateral diplomatic stance amid changing geopolitical alliances",
      "Disaster management response strategy for extreme urban climate events",
    ],
    keyFocusAreas: ["Constitutional values", "Balanced judgment", "Policy feasibility", "Integrity under pressure"],
  },
  {
    id: "STATE_PSC",
    stream: "CIVIL_SERVICES",
    name: "State Public Service Commission (UPPSC/BPSC/MPSC/TNPSC/KPSC)",
    description: "State administrative and police service selection interviews.",
    panelPersona: "State PSC Board Members & Senior Administrative Officers",
    defaultTopic: "Rural agrarian revitalization and state infrastructure bottleneck resolution",
    sampleTopics: [
      "Rural agrarian revitalization and state infrastructure bottleneck resolution",
      "Local governance empowerment (Panchayati Raj) and digital public services delivery",
      "Addressing regional developmental disparities and industrial promotion",
    ],
    keyFocusAreas: ["State policy mastery", "Grassroots administration", "Socio-economic awareness"],
  },
  {
    id: "SSB_INTERVIEW",
    stream: "DEFENSE_ARMED_FORCES",
    name: "SSB (Army / Navy / Air Force / NDA / CDS / AFCAT)",
    description: "Officer Like Qualities (OLQ) evaluation through in-depth Personal Interview.",
    panelPersona: "Services Selection Board Interviewing Officer (Brigadier / Colonel rank)",
    defaultTopic: "Officer Like Qualities: Leadership in crisis, self-discipline, and tactical decision-making",
    sampleTopics: [
      "Leadership in high-pressure tactical scenarios and crisis decision-making",
      "Handling ethical dilemmas and moral courage in military command",
      "Self-awareness, personal motivation, and overcoming adversity",
    ],
    keyFocusAreas: ["Effective intelligence", "Courage & initiative", "Social adaptability", "Integrity"],
  },
  {
    id: "IIM_CAT_PI",
    stream: "MANAGEMENT_MBA",
    name: "IIM / Top B-School Personal Interview (WAT-PI)",
    description: "Rigorous case analysis, business intuition, and candidate profile defense.",
    panelPersona: "IIM Professors of Strategy & Executive Industry Alumni",
    defaultTopic: "Disruption of traditional banking by FinTech platforms and credit risk management",
    sampleTopics: [
      "Disruption of traditional banking by FinTech platforms and credit risk management",
      "Sustainability vs profitability: Strategy for decarbonizing supply chains",
      "AI disruption in employment and strategic workforce transformation",
      "Valuation metrics and unit economics in consumer internet startups",
    ],
    keyFocusAreas: ["Business logic", "MECE framework", "Structured reasoning", "Self-awareness"],
  },
  {
    id: "RBI_GRADE_B",
    stream: "BANKING_REGULATORY",
    name: "Reserve Bank of India (RBI) Grade B",
    description: "Central banking, macroeconomic policy, monetary transmission, and financial stability.",
    panelPersona: "RBI Executive Directors & Financial Economists",
    defaultTopic: "Monetary policy transmission mechanisms and inflation targeting in India",
    sampleTopics: [
      "Monetary policy transmission mechanisms and inflation targeting in India",
      "Central Bank Digital Currencies (e-Rupee) and cross-border settlement architecture",
      "Non-performing asset (NPA) management and resolution frameworks (IBC)",
    ],
    keyFocusAreas: ["Macroeconomic depth", "Financial sector regulation", "Analytical precision"],
  },
  {
    id: "JUDICIAL_SERVICES",
    stream: "JUDICIARY_LAW",
    name: "Judicial Services / Civil Judge Examination (PCS-J)",
    description: "Judicial temperament, statutory interpretation, constitutional law, and courtroom ethics.",
    panelPersona: "High Court Judges & Senior Advocates",
    defaultTopic: "Principles of natural justice and balancing procedural law with substantive justice",
    sampleTopics: [
      "Principles of natural justice and balancing procedural law with substantive justice",
      "Admissibility of electronic and digital evidence under the Indian Evidence Act",
      "Sentencing discretion, victim compensation, and restorative justice models",
    ],
    keyFocusAreas: ["Judicial temperament", "Statutory interpretation", "Constitutional morality"],
  },
  {
    id: "MEDICAL_VIVA",
    stream: "MEDICAL_HEALTHCARE",
    name: "AIIMS / NEET-SS Medical Specialist Residency Viva",
    description: "Clinical case management, emergency triage, medical ethics, and pharmacology.",
    panelPersona: "Professor & Head of Department of Medicine/Surgery",
    defaultTopic: "Differential diagnosis and protocol for acute septic shock with multi-organ dysfunction",
    sampleTopics: [
      "Differential diagnosis and protocol for acute septic shock with multi-organ dysfunction",
      "Ethical decision-making in end-of-life care and informed consent in critical emergencies",
      "Antibiotic stewardship and infection control in intensive care units",
    ],
    keyFocusAreas: ["Diagnostic accuracy", "Clinical decision tree", "Medical ethics", "Patient empathy"],
  },
  {
    id: "TECH_LEAD_FAANG",
    stream: "TECH_CONSULTING",
    name: "Big Tech / FAANG (System Design & Behavioral Bar Raiser)",
    description: "Distributed systems, architectural trade-offs, and Amazon-style Leadership Principles.",
    panelPersona: "Staff Software Engineer & Principal Bar Raiser",
    defaultTopic: "Designing a globally distributed, low-latency event streaming and payment reconciliation platform",
    sampleTopics: [
      "Designing a globally distributed, low-latency event streaming and payment reconciliation platform",
      "Leadership Principle: Customer obsession vs engineering perfection under tight delivery timelines",
      "Incident post-mortem: Root cause analysis of a critical multi-region outage",
    ],
    keyFocusAreas: ["Scalability trade-offs", "Ownership", "Conflict resolution", "Technical depth"],
  },
  {
    id: "ENGINEERING_PSU",
    stream: "ENGINEERING_PSU",
    name: "Engineering & PSU (ISRO/BARC/DRDO)",
    description: "Scientific research institutions, PSU engineering roles, and technology defense organizations.",
    panelPersona: "Scientific Panel / Technical Board of Eminent Scientists & Engineers",
    defaultTopic: "From first principles, derive the thermodynamic and fluid-structure interactions governing a critical engineering system.",
    sampleTopics: [
      "From first principles, derive the thermodynamic and fluid-structure interactions governing a critical engineering system.",
      "Sustainable propulsion systems for next-generation space launch vehicles",
      "Autonomous navigation and guidance algorithms for planetary rovers",
    ],
    keyFocusAreas: ["First-principles reasoning", "Technical depth", "Applied mathematics", "Research integrity"],
  },
  {
    id: "ACADEMIA_TEACHING",
    stream: "ACADEMIA_TEACHING",
    name: "Higher Academia & Research (UGC-NET/CSIR-JRF)",
    description: "University faculty selection, research aptitude, pedagogy, and scholarly communication.",
    panelPersona: "Academic Selection Committee / Eminent Professors & Subject Experts",
    defaultTopic: "Regarding an advanced topic in your discipline, defend your theoretical framework against recent critique in high-impact peer-reviewed literature.",
    sampleTopics: [
      "Regarding an advanced topic in your discipline, defend your theoretical framework against recent critique in high-impact peer-reviewed literature.",
      "Research ethics, data integrity, and handling allegations of academic misconduct",
      "Pedagogical innovation and curriculum design for interdisciplinary STEM education",
    ],
    keyFocusAreas: ["Theoretical rigor", "Research ethics", "Pedagogical philosophy", "Scholarly communication"],
  },
];

export function getExamTrack(examId: string): ExamTrack | undefined {
  return EXAM_CATALOG.find(
    (e) => e.id.toLowerCase() === examId.toLowerCase() || e.name.toLowerCase() === examId.toLowerCase()
  );
}

export interface CandidateProfile {
  fullName: string;
  education: string;
  currentRole: string;
  experienceYears: number;
  specialization: string;
  homeState: string;
  targetRole: string;
  keyAccomplishments?: string;
}

export const MODE_CONFIGS: Record<Mode, { id: Mode; title: string; tagline: string; persona: string }> = {
  AI_TUTOR: {
    id: "AI_TUTOR",
    title: "Socratic AI Tutor",
    tagline: "Step-by-step concept learning with adaptive hints and guided questioning",
    persona: "Encouraging, pedagogical mentor focused on deep understanding and constructive feedback.",
  },
  MOCK_INTERVIEW: {
    id: "MOCK_INTERVIEW",
    title: "360° Critical Mock Interview",
    tagline: "Authentic board panel simulation with counter-probing, stress handling & holistic scoring",
    persona: "Experienced Multi-Member Interview Panel. Authoritative, observant, balanced, and discerning.",
  },
  ORAL_MOCK_TEST: {
    id: "ORAL_MOCK_TEST",
    title: "Oral Mock Viva & Speed Test",
    tagline: "Timed oral examination evaluating factual precision and rapid structured recall",
    persona: "Strict academic examiner evaluating syllabus accuracy, terminology precision, and time discipline.",
  },
  HUMAN_INTERVIEW: {
    id: "HUMAN_INTERVIEW",
    title: "Co-Pilot Human Panel",
    tagline: "AI assistant supporting a human panelist with live rubrics and question suggestions",
    persona: "Objective co-pilot synthesizing candidate answers and highlighting key competencies.",
  },
  PRACTICE: {
    id: "PRACTICE",
    title: "Self-Paced Practice Studio",
    tagline: "Low-stakes sandbox for speaking fluency, articulation, and vocabulary practice",
    persona: "Helpful speaking coach focused on language fluency, pacing, and confidence.",
  },
};

export const LEVEL_POLICY: Record<
  Level,
  { pace: number; hintBudget: number; rubric: string; passThreshold: number }
> = {
  BASIC: { pace: 0.75, hintBudget: 5, rubric: "Recall, clarity and foundational understanding", passThreshold: 60 },
  MEDIUM: { pace: 1.0, hintBudget: 3, rubric: "Application, accuracy and structured reasoning", passThreshold: 70 },
  HIGH: { pace: 1.1, hintBudget: 2, rubric: "Analysis, synthesis, trade-offs and time discipline", passThreshold: 75 },
  PROFESSIONAL: { pace: 1.15, hintBudget: 1, rubric: "Expert judgment, constitutional/ethical depth, evidence, and executive presence", passThreshold: 80 },
};

export const interviewPhases = [
  "PROFILE_INCEPTION",
  "DOMAIN_DEEP_DIVE",
  "SITUATIONAL_DILEMMA",
  "STRESS_CROSS_EXAMINATION",
  "CONCLUDING_SYNTHESIS",
] as const;

export type InterviewPhase = typeof interviewPhases[number];

export interface PhaseConfig {
  id: InterviewPhase;
  name: string;
  focus: string;
  targetDurationSec: number;
}

export const INTERVIEW_PHASE_CONFIGS: Record<InterviewPhase, PhaseConfig> = {
  PROFILE_INCEPTION: {
    id: "PROFILE_INCEPTION",
    name: "Phase 1: Profile & DAF Inception",
    focus: "Candidate background, academic degree translation, motivation, and regional awareness.",
    targetDurationSec: 180,
  },
  DOMAIN_DEEP_DIVE: {
    id: "DOMAIN_DEEP_DIVE",
    name: "Phase 2: Core Domain Deep-Dive",
    focus: "Theoretical mastery, conceptual accuracy, first-principles derivation, and current policy.",
    targetDurationSec: 360,
  },
  SITUATIONAL_DILEMMA: {
    id: "SITUATIONAL_DILEMMA",
    name: "Phase 3: Situational Case & Ethical Dilemma",
    focus: "Administrative trade-offs, crisis management, STAR structure, and moral courage under conflicting priorities.",
    targetDurationSec: 360,
  },
  STRESS_CROSS_EXAMINATION: {
    id: "STRESS_CROSS_EXAMINATION",
    name: "Phase 4: Counter-Probing & Stress Cross-Examination",
    focus: "Cognitive resilience, defending trade-offs, intellectual agility, and emotional poise when challenged.",
    targetDurationSec: 300,
  },
  CONCLUDING_SYNTHESIS: {
    id: "CONCLUDING_SYNTHESIS",
    name: "Phase 5: Vision, Reforms & Concluding Synthesis",
    focus: "Long-term policy vision, leadership philosophy, summarizing recommendations, and formal closure.",
    targetDurationSec: 180,
  },
};

export interface FeedbackDimensions {
  knowledge: number;
  professionalJudgment: number;
  ethicalReasoning: number;
  emotionalIntelligence: number;
  psychologicalResilience: number;
  communication: number;
  clarity: number;
  accuracy: number;
  reasoning: number;
  composure: number;
}

export interface PhaseScores {
  profileInception: number;
  domainDeepDive: number;
  situationalDilemma: number;
  stressCrossExam: number;
  concludingSynthesis: number;
}

export interface ConversationalDynamics {
  consistencyIndex: number;
  composureStability: number;
  averageTurnLatencySec: number;
  totalTurns: number;
}

export interface DimensionFeedback {
  knowledgeNotes: string;
  professionalNotes: string;
  ethicalNotes: string;
  emotionalNotes: string;
  psychologicalNotes: string;
  communicationNotes: string;
}

export interface FeedbackAnalytics {
  estimatedWpm: number;
  totalWords: number;
  fillerCount: number;
  turnsCount: number;
  passedThreshold: boolean;
  stressHandlingIndex?: number;
  conversationalDynamics?: ConversationalDynamics;
}

export interface FeedbackResult {
  overall: number;
  dimensions: FeedbackDimensions;
  phaseScores?: PhaseScores;
  dimensionFeedback?: DimensionFeedback;
  analytics?: FeedbackAnalytics;
  strengths: string[];
  improvements: string[];
  nextActions: string[];
  modelVersion: string;
}

export interface RecentInterviewSession {
  id: string;
  examId: string;
  topic: string;
  level: string;
  mode: string;
  score?: number;
  dimensions?: FeedbackDimensions;
  dimensionFeedback?: DimensionFeedback;
  at: string;
  durationMinutes?: number;
  startedAt?: string;
  endedAt?: string;
}

export interface InterviewAnalytics {
  completed: number;
  averageScore: number | null;
  byLevel: Record<string, number>;
  recent: RecentInterviewSession[];
}

export interface StartSessionPayload {
  mode: Mode;
  level: Level;
  locale: string;
  examId: string;
  topic: string;
  media: "AUDIO" | "VIDEO" | "TEXT";
  candidateProfile?: CandidateProfile;
}
