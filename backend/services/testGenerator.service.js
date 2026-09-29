import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * AI Test Generator Service
 * Supports Google Gemini, OpenAI, or Ollama.
 * Capable of generating 5, 10, 15, 25, 50+ questions with auto-batching for high quality.
 */

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Single prompt builder for batch MCQ generation
 */
function buildMCQPrompt(exam, topic, difficulty, batchCount, startIndex = 1) {
  return `You are a premier competitive exam question creator for India (specializing in ${exam}).
Generate exactly ${batchCount} distinct multiple-choice questions (MCQs) for the topic/subject: "${topic}".
Difficulty level: ${difficulty}.
Starting question number: ${startIndex}.

Requirements:
1. Provide standard 4 options (A, B, C, D) for each question.
2. Ensure realistic, high-quality exam standard questions with an unambiguous correct answer.
3. Include an insightful, educational explanation for why the answer is correct.
4. Return ONLY valid JSON in this exact structure without markdown backticks or commentary:
[
  {
    "question": "Question text here...",
    "options": [
      { "id": "A", "text": "Option A text" },
      { "id": "B", "text": "Option B text" },
      { "id": "C", "text": "Option C text" },
      { "id": "D", "text": "Option D text" }
    ],
    "correctAnswer": "A",
    "explanation": "Detailed explanation why A is correct..."
  }
]`;
}

/**
 * Helper to clean and parse JSON array
 */
function parseJsonArray(text) {
  if (!text) return [];
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  let rawList = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (Array.isArray(parsed.questions)) {
    rawList = parsed.questions;
  } else if (Array.isArray(parsed.mcqs)) {
    rawList = parsed.mcqs;
  } else if (Array.isArray(parsed.data)) {
    rawList = parsed.data;
  } else if (parsed && typeof parsed === "object" && (parsed.question || parsed.questionText)) {
    rawList = [parsed];
  }

  // Normalize options to ensure standard format [{ id: 'A', text: '...' }]
  return rawList.map((item, idx) => {
    let opts = item.options || [];
    if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === "string") {
      opts = opts.map((optStr, i) => {
        const id = String.fromCharCode(65 + i); // 'A', 'B', 'C', 'D'
        const cleanText = optStr.replace(/^[A-D]\)\s*/i, "").replace(/^[A-D]\.\s*/i, "").trim();
        return { id, text: cleanText };
      });
    }

    const correctAnswer = item.correctAnswer || item.answer || item.correct_answer || "A";
    const cleanCorrect = String(correctAnswer).replace(/^[A-D]\)\s*/i, "").trim().charAt(0).toUpperCase();

    return {
      question: item.question || item.questionText || `Question ${idx + 1}`,
      options: opts,
      correctAnswer: cleanCorrect || "A",
      explanation: item.explanation || item.reason || "",
    };
  });
}

/**
 * Generate questions using Ollama (Local)
 */
async function generateWithOllama(prompt, model = null) {
  let targetModel = model || process.env.OLLAMA_MODEL;
  if (!targetModel) {
    try {
      const tagsRes = await fetch("http://127.0.0.1:11434/api/tags");
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const models = tagsData.models?.map((m) => m.name) || [];
        targetModel = models.find((m) => m.includes("qwen") || m.includes("mistral") || m.includes("llama")) || models[0] || "qwen2.5:7b";
      }
    } catch {
      targetModel = "qwen2.5:7b";
    }
  }

  const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: targetModel,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.3,
        num_predict: 4096,
      },
    }),
  });

  if (!ollamaRes.ok) {
    throw new Error(`Ollama returned status ${ollamaRes.status}`);
  }

  const data = await ollamaRes.json();
  return parseJsonArray(data.response);
}

/**
 * Generate questions using OpenAI
 */
async function generateWithOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured in .env");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an Indian competitive exam question creator. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.questions || parsed.data || [];
}

/**
 * Generate questions using Google Gemini
 */
async function generateWithGemini(prompt) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY not configured in .env");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim() || "";
  return parseJsonArray(text);
}

/**
 * Core function to generate MCQs: handles batching when count is 15, 25, 50, etc.
 * Supports: 'gemini' | 'ollama' | 'openai'
 */
export async function generateMCQQuestions({
  exam = "General Studies",
  topic = "General Knowledge",
  difficulty = "MEDIUM",
  count = 5,
  provider = "gemini",
  ollamaModel = null,
}) {
  const targetCount = Number(count) || 5;

  // Batch size: Large LLMs perform best producing 10 to 15 questions per call
  // For 25 questions -> 2 batches (15 + 10)
  // For 50 questions -> 4 batches (15 + 15 + 10 + 10)
  const BATCH_SIZE = 15;
  const batches = [];
  let remaining = targetCount;
  let startIndex = 1;

  while (remaining > 0) {
    const currentBatchCount = Math.min(remaining, BATCH_SIZE);
    batches.push({ count: currentBatchCount, startIndex });
    startIndex += currentBatchCount;
    remaining -= currentBatchCount;
  }

  const allQuestions = [];
  let actualProvider = provider;
  let fallbackFrom = null;
  let fallbackReason = null;

  for (const batch of batches) {
    const prompt = buildMCQPrompt(
      exam,
      topic,
      difficulty,
      batch.count,
      batch.startIndex,
    );
    let batchQuestions = [];

    // 1. Try selected provider
    try {
      if (provider === "ollama") {
        batchQuestions = await generateWithOllama(prompt, ollamaModel);
        actualProvider = "Ollama";
      } else if (provider === "openai") {
        batchQuestions = await generateWithOpenAI(prompt);
        actualProvider = "OpenAI";
      } else {
        // Default: Gemini
        batchQuestions = await generateWithGemini(prompt);
        actualProvider = "Gemini";
      }
    } catch (primaryErr) {
      fallbackFrom = provider;
      fallbackReason = primaryErr?.message || "Service unavailable";
      console.warn(
        `Primary provider '${provider}' failed:`,
        primaryErr?.message,
      );

      // Fallback chain: if Ollama or OpenAI fails, try Gemini; if Gemini fails, try Ollama
      try {
        if (provider !== "gemini") {
          console.log("Falling back to Gemini...");
          batchQuestions = await generateWithGemini(prompt);
          actualProvider = "Gemini (Fallback)";
        } else {
          console.log("Falling back to Ollama...");
          batchQuestions = await generateWithOllama(prompt, ollamaModel);
          actualProvider = "Ollama (Fallback)";
        }
      } catch (fallbackErr) {
        console.error(
          "All AI generators failed for batch:",
          fallbackErr?.message,
        );
      }
    }

    if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
      allQuestions.push(...batchQuestions);
    }
  }

  // If AI generation yielded results, return them
  if (allQuestions.length > 0) {
    const questions = allQuestions.slice(0, targetCount);
    // Attach metadata property
    questions._meta = {
      actualProvider,
      fallbackFrom,
      fallbackReason,
      requestedProvider: provider,
    };
    return questions;
  }

  // Final emergency fallback if totally offline and no AI returned questions
  const fallback = generateFallbackQuestions(exam, topic, difficulty, targetCount);
  fallback._meta = {
    actualProvider: "Offline Template (Fallback)",
    fallbackFrom: provider,
    fallbackReason: "All AI providers unavailable",
    requestedProvider: provider,
  };
  return fallback;
}

function generateFallbackQuestions(exam, topic, difficulty, count) {
  const fallbackBank = [
    {
      question: `Under the Constitution of India, which Article guarantees the Right to Equality before Law? (${exam} - ${topic})`,
      options: [
        { id: "A", text: "Article 14" },
        { id: "B", text: "Article 19" },
        { id: "C", text: "Article 21" },
        { id: "D", text: "Article 32" },
      ],
      correctAnswer: "A",
      explanation:
        "Article 14 of the Indian Constitution ensures equality before the law and equal protection of the laws within the territory of India.",
    },
    {
      question: `Which institution publishes the Consumer Price Index (CPI) for industrial workers in India? (${exam})`,
      options: [
        { id: "A", text: "Reserve Bank of India" },
        { id: "B", text: "Labour Bureau" },
        { id: "C", text: "Central Statistics Office" },
        { id: "D", text: "NITI Aayog" },
      ],
      correctAnswer: "B",
      explanation:
        "The Labour Bureau, an attached office of the Ministry of Labour and Employment, compiles and disseminates the CPI for Industrial Workers.",
    },
    {
      question: `In the context of Indian economy, what does 'Repo Rate' represent? (${exam})`,
      options: [
        { id: "A", text: "Rate at which commercial banks lend to RBI" },
        {
          id: "B",
          text: "Rate at which RBI lends money to commercial banks against government securities",
        },
        { id: "C", text: "Rate of interest offered on public provident fund" },
        { id: "D", text: "Exchange rate between Indian Rupee and US Dollar" },
      ],
      correctAnswer: "B",
      explanation:
        "Repo Rate is the key monetary policy rate at which the Reserve Bank of India lends short-term funds to commercial banks against pledged securities.",
    },
    {
      question: `Which of the following rivers does NOT originate in the Himalayas? (${exam} - ${topic})`,
      options: [
        { id: "A", text: "Ganga" },
        { id: "B", text: "Indus" },
        { id: "C", text: "Godavari" },
        { id: "D", text: "Brahmaputra" },
      ],
      correctAnswer: "C",
      explanation:
        "Godavari originates from Trimbakeshwar near Nasik in Maharashtra in the Western Ghats, not the Himalayas.",
    },
    {
      question: `Who among the following was the founder of the Maurya Empire? (${exam})`,
      options: [
        { id: "A", text: "Ashoka the Great" },
        { id: "B", text: "Chandragupta Maurya" },
        { id: "C", text: "Bindusara" },
        { id: "D", text: "Brihadratha" },
      ],
      correctAnswer: "B",
      explanation:
        "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the strategic guidance of Chanakya (Kautilya).",
    },
  ];

  // Repeat or slice to meet requested count
  const result = [];
  while (result.length < count) {
    for (const q of fallbackBank) {
      if (result.length >= count) break;
      result.push({
        ...q,
        question: `[Q${result.length + 1}] ${q.question}`,
      });
    }
  }
  return result;
}
