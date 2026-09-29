import { createHash } from "crypto";
import { ScoredItem } from "./models.js";
import { GoogleGenAI, Type } from "@google/genai";

export const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

export const THEMES = {
  "Polity, Constitution & Governance": [
    "constitution",
    "constitutional",
    "article ",
    "parliament",
    "lok sabha",
    "rajya sabha",
    "supreme court",
    "judgment",
    "election commission",
    "bill",
    "ordinance",
    "governance",
    "fundamental right",
    "directive principles",
    "caste",
    "marginalised",
    "labour",
    "employment",
    "social justice",
    "social issues",
    "poverty",
    "inequality",
    "welfare scheme",
    "rozgar",
    "recruitment",
    "civil services",
    "e-governance",
  ],
  "Economy, Banking & Finance": [
    "rbi",
    "repo",
    "monetary policy",
    "inflation",
    "gdp",
    "gva",
    "fiscal",
    "budget",
    "sebi",
    "banking",
    "bond",
    "forex",
    "gst",
    "tax",
    "current account",
    "fdi",
    "industrial growth",
    "trade deficit",
    "infrastructure",
    "startup",
    "economic reform",
    "digital currency",
    "taxation",
    "disinvestment",
  ],
  "International Relations & Organisations": [
    "bilateral",
    "multilateral",
    "summit",
    "treaty",
    "united nations",
    "g20",
    "brics",
    "quad",
    "asean",
    "sco",
    "indo-pacific",
    "strategic partnership",
    "wef",
    "world economic forum",
    "sipri",
    "global governance",
    "arms control",
    "disarmament",
  ],
  "Environment, Ecology & Climate": [
    "climate",
    "biodiversity",
    "species",
    "wildlife",
    "forest",
    "ramsar",
    "wetland",
    "national park",
    "biosphere",
    "carbon",
    "emission",
    "cop",
    "conservation",
    "climate change",
    "pollution",
    "waste management",
    "renewable energy",
    "solar",
    "wind",
    "water conservation",
    "disaster management",
  ],
  "Science, Technology & Space": [
    "isro",
    "space",
    "satellite",
    "launch vehicle",
    "artificial intelligence",
    "quantum",
    "semiconductor",
    "biotechnology",
    "genome",
    "nuclear",
    "technology",
    "nano-technology",
    "cyber security",
    "5g",
    "6g",
    "deep ocean",
  ],
  "Defence & Internal Security": [
    "defence",
    "army",
    "navy",
    "air force",
    "missile",
    "drdo",
    "cybersecurity",
    "terrorism",
    "border",
    "military exercise",
    "defense spending",
    "maritime security",
  ],
  "Agriculture & Food Security": [
    "agriculture",
    "farmer",
    "crop",
    "msp",
    "irrigation",
    "fertiliser",
    "food security",
    "fisheries",
    "livestock",
    "organic farming",
    "horticulture",
  ],
  "Health & Human Development": [
    "health",
    "who",
    "disease",
    "vaccine",
    "virus",
    "outbreak",
    "epidemic",
    "pandemic",
    "nutrition",
    "mortality",
    "malnutrition",
    "healthcare",
  ],
  "Reports, Indices & Data": [
    "report",
    "index",
    "ranking",
    "survey",
    "assessment",
    "outlook",
    "statistics",
    "census",
    "telemetry",
  ],
};

export const STATIC_LINKS = {
  "Polity, Constitution & Governance":
    "Constitution, Parliament, constitutional/statutory bodies, rights, federalism and governance.",
  "Economy, Banking & Finance":
    "Macroeconomics, monetary policy, banking, fiscal policy, markets, inflation and external sector.",
  "International Relations & Organisations":
    "International organisations, groupings, treaties, India's external relations and global governance.",
  "Environment, Ecology & Climate":
    "Ecology, biodiversity, protected areas, conventions, climate mechanisms and environmental governance.",
  "Science, Technology & Space":
    "Basic science, space technology, emerging technologies, biotechnology and applications.",
  "Defence & Internal Security":
    "Defence systems, exercises, border management, cyber security and internal-security institutions.",
  "Agriculture & Food Security":
    "Agricultural economics, cropping, MSP, irrigation, food security and allied sectors.",
  "Health & Human Development":
    "Public health, diseases, nutrition, health institutions and human-development indicators.",
  "Reports, Indices & Data":
    "Institution, methodology, indicator, India position, trend and syllabus relevance.",
};

export const HIGH_IMPACT = [
  "supreme court",
  "constitutional",
  "parliament passes",
  "cabinet approves",
  "monetary policy",
  "repo",
  "union budget",
  "economic survey",
  "gdp",
  "inflation",
  "new species",
  "ramsar",
  "unesco",
  "world heritage",
  "isro",
  "drdo",
  "imf",
  "world bank",
  "wto",
  "who",
  "unfccc",
  "report",
  "index",
  "yojana",
  "kurukshetra",
  "epw",
  "employment news",
  "rozgar",
  "down to earth",
  "science reporter",
  "united nations",
  "wef",
  "world economic forum",
  "sipri",
];

export const INDIA_TERMS = [
  "india",
  "indian",
  "new delhi",
  "south asia",
  "indo-pacific",
  "g20",
  "brics",
  "quad",
  "sco",
];

function normaliseTitle(title) {
  const text = title.toLowerCase();
  const cleaned = text
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

export function eventKey(title) {
  const words = normaliseTitle(title)
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 14);
  const material = words.join(" ");
  return createHash("sha256").update(material).digest("hex").slice(0, 24);
}

export function itemId(sourceKey, url) {
  return createHash("sha256").update(`${sourceKey}|${url}`).digest("hex");
}

export function classifyTheme(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  const scores = {};

  for (const [theme, terms] of Object.entries(THEMES)) {
    scores[theme] = terms.reduce(
      (count, term) => (text.includes(term) ? count + 1 : count),
      0,
    );
  }

  const theme = Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b,
  );
  return [theme, scores[theme]];
}

export function scoreItem(source, raw) {
  const text = `${raw.title} ${raw.summary}`.toLowerCase();
  const [theme, hits] = classifyTheme(raw.title, raw.summary);

  if (hits === 0) {
    return null;
  }

  let score = source.priority * 4;
  score += Math.min(hits * 6, 30);

  for (const term of HIGH_IMPACT) {
    if (text.includes(term)) {
      score += 4;
    }
  }

  if (source.region === "International") {
    const indiaHits = INDIA_TERMS.reduce(
      (count, term) => (text.includes(term) ? count + 1 : count),
      0,
    );

    if (indiaHits) {
      score += Math.min(15, indiaHits * 5);
    } else {
      const globalExamTerms = [
        "global",
        "climate",
        "pandemic",
        "world economy",
        "international treaty",
        "biodiversity",
        "financial stability",
        "world heritage",
      ];

      if (!globalExamTerms.some((term) => text.includes(term))) {
        score -= 20;
      }
    }
  }

  score = Math.max(0, Math.min(score, 100));

  const prelims = true;
  const mains = [
    "Polity, Constitution & Governance",
    "Economy, Banking & Finance",
    "International Relations & Organisations",
    "Environment, Ecology & Climate",
    "Science, Technology & Space",
    "Defence & Internal Security",
    "Agriculture & Food Security",
    "Health & Human Development",
  ].includes(theme);

  const banking = theme === "Economy, Banking & Finance";
  const ssc = [
    "Polity, Constitution & Governance",
    "Economy, Banking & Finance",
    "Science, Technology & Space",
    "Environment, Ecology & Climate",
    "Reports, Indices & Data",
  ].includes(theme);
  const pcs = true;
  const sourceConfidence = Math.min(100, 75 + source.priority * 2);

  return new ScoredItem({
    source_key: source.key,
    title: raw.title,
    summary: raw.summary,
    url: raw.url,
    published_at: raw.published_at,
    theme,
    score,
    source_confidence: sourceConfidence,
    prelims,
    mains,
    pcs,
    ssc,
    banking,
    static_link: STATIC_LINKS[theme],
  });
}

export function expectedQuestions(item, sourceName) {
  const priority = item.score;
  const questions = [];

  questions.push({
    exam: "UPSC/State PCS",
    type: "Prelims",
    priority,
    question: `With reference to "${item.title}", consider its associated institution, mandate, legal/status framework and related factual features. Which statements are correct?`,
  });

  if (item.mains) {
    questions.push({
      exam: "UPSC/State PCS",
      type: "Mains",
      priority,
      question: `Examine the significance of the development "${item.title}" in the context of ${item.theme}. Discuss its implications for India.`,
    });
  }

  if (item.banking) {
    questions.push({
      exam: "Banking/Regulatory",
      type: "Objective",
      priority,
      question: `Which regulatory/economic concept is most directly connected with the development "${item.title}"?`,
    });
  }

  if (item.ssc) {
    questions.push({
      exam: "SSC/Railway",
      type: "Objective",
      priority: Math.max(1, priority - 5),
      question: `Identify the organisation, sector or static-GK fact associated with "${item.title}".`,
    });
  }

  for (const q of questions) {
    q.answer_basis = `Primary-source event: ${item.title}; Theme: ${item.theme}; Static link: ${item.static_link}; Source: ${sourceName}`;
  }

  return questions;
}

export async function generateAIQuestions(item, sourceName) {
  const ai = getAI();
  const fallback = expectedQuestions(item, sourceName);

  if (!ai) {
    console.warn(
      "No GEMINI_API_KEY found. Falling back to hardcoded templates.",
    );
    return fallback;
  }

  const prompt = `
    You are an expert exam setter for Indian competitive exams (UPSC, SSC, Banking) generate 10 questions.
    Based on the following current affairs news item, generate high-quality, exam-style questions.
    
    News Item Title: "${item.title}"
    News Item Summary: "${item.summary}"
    Theme: "${item.theme}"
    Source: "${sourceName}"
    
    Rules:
    1. If the item is marked for UPSC/State PCS prelims, generate a multi-statement objective question.
    2. If marked for Mains, generate an analytical subjective question.
    3. If marked for Banking/SSC, generate direct objective questions.
    4. Provide the answer_basis which includes static linkage.
    
    Item flags:
    - Prelims: ${item.prelims}
    - Mains: ${item.mains}
    - Banking: ${item.banking}
    - SSC: ${item.ssc}
    
    Return exactly a JSON array of question objects, containing:
    - exam: (e.g. "UPSC/State PCS", "Banking/Regulatory", "SSC/Railway")
    - type: (e.g. "Prelims", "Mains", "Objective")
    - priority: (number, base it around ${item.score})
    - question: (the question text)
    - answer_basis: (the explanation/basis string)
  `;

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              exam: { type: Type.STRING },
              type: { type: Type.STRING },
              priority: { type: Type.INTEGER },
              question: { type: Type.STRING },
              answer_basis: { type: Type.STRING },
            },
            required: ["exam", "type", "priority", "question", "answer_basis"],
          },
        },
      },
    });

    let resultText = response.text || "";
    if (resultText.includes("\`\`\`json")) {
      resultText = resultText.split("\`\`\`json")[1].split("\`\`\`")[0];
    } else if (resultText.includes("\`\`\`")) {
      resultText = resultText.split("\`\`\`")[1].split("\`\`\`")[0];
    }

    const questions = JSON.parse(resultText.trim());
    if (Array.isArray(questions) && questions.length > 0) {
      return questions;
    }

    console.warn("AI returned empty questions array. Falling back.");
    return fallback;
  } catch (error) {
    console.warn(
      "AI Question generation failed:",
      error?.message || error,
      ". Falling back to templates.",
    );
    return fallback;
  }
}

export async function summarizeItemWithAI(title, rawSummary) {
  const ai = getAI();
  if (!ai) return { title, summary: rawSummary }; // Fallback to raw summary if no AI

  const prompt = `
    You are an expert news editor for competitive exams (UPSC, SSC, Banking).
    Based on the following content, generate:
    1. A detailed 5-6 line factual summary. Focus on the "What", "Why", and "Significance".
    2. A comprehensive 2-line title/headline for the news.
    
    Return ONLY a valid JSON object with keys "title" and "summary". Do not include any other text or markdown outside the JSON.
    
    Original Title: "${title}"
    Raw Content/Summary: "${rawSummary.slice(0, 3000)}"
  `;

  try {
    const { Type } = await import("@google/genai");
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["title", "summary"],
        },
      },
    });

    let resultText = response.text || "";
    if (resultText.includes("\`\`\`json"))
      resultText = resultText.split("\`\`\`json")[1].split("\`\`\`")[0];
    else if (resultText.includes("\`\`\`"))
      resultText = resultText.split("\`\`\`")[1].split("\`\`\`")[0];

    try {
      const parsed = JSON.parse(resultText.trim());
      return parsed;
    } catch (parseError) {
      console.warn(
        "AI Summarization JSON parse failed. Raw text was:",
        resultText,
      );
      throw parseError;
    }
  } catch (error) {
    console.warn(
      "AI Summarization failed:",
      error?.message || error,
      ". Falling back to raw summary.",
    );
    return { title, summary: rawSummary };
  }
}

export async function translateItemWithAI(title, summary, targetLangCode) {
  const ai = getAI();
  if (!ai) return { title, summary }; // Fallback to English

  const prompt = `
    You are an expert translator. Translate the following news title and summary into the language with code: "${targetLangCode}".
    Ensure the translation is natural, accurate, and suitable for competitive exam preparation.
    
    Return ONLY a valid JSON object with keys "title" and "summary" containing the translated text. Do not include any other text.
    
    Title to translate: "${title}"
    Summary to translate: "${summary}"
  `;

  try {
    const { Type } = await import("@google/genai");
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["title", "summary"],
        },
      },
    });

    let resultText = response.text || "";
    if (resultText.includes("\`\`\`json"))
      resultText = resultText.split("\`\`\`json")[1].split("\`\`\`")[0];
    else if (resultText.includes("\`\`\`"))
      resultText = resultText.split("\`\`\`")[1].split("\`\`\`")[0];

    const parsed = JSON.parse(resultText.trim());
    return parsed;
  } catch (error) {
    console.error("AI Translation failed:", error?.message || error);
    return { title, summary };
  }
}
