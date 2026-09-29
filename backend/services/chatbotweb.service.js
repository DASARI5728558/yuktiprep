import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * AI Study Planner Service
 * Responsible for generating personalized, practical, and exam-focused study plans using Google Gemini.
 * Follows strict security guidelines: API keys are accessed only on the server.
 */

const STUDY_PLANNER_SYSTEM_INSTRUCTION = `You are an AI Study Planner.

Your job is to create personalized, practical and exam-focused study plans.

Understand the user's:
- exam
- subject
- target
- available study time
- duration
- current preparation level
- priorities

Create structured plans with:
- daily tasks
- weekly goals
- revision
- practice questions
- mock tests
- review periods
- important priorities

Do not invent information about the user's schedule.
If important information is missing, make reasonable assumptions and clearly state them.

Keep the response easy to read in a chat interface.

Use headings, bullet points and tables when useful.

The user may ask follow-up questions.
Use the previous conversation to maintain context.

Works for any exam or target: UPSC, TNPSC, SSC, NEET, JEE, Banking, CAT, College exams, School exams, or any custom exam or subject.`;

/**
 * Gets or initializes the Google Gemini AI client
 */
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates an educational study plan or answers follow-up study planner questions
 * @param {string} prompt - The user prompt or follow-up question
 * @param {Array<{role: string, content: string}>} conversationHistory - Prior conversation turns
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function generateStudyPlan(prompt, conversationHistory = []) {
  try {
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return {
        success: false,
        message: "Please provide a valid study plan goal or question.",
      };
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.warn("[chatbotweb.service] GEMINI_API_KEY is not configured.");
      return {
        success: false,
        message: "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment.",
      };
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // Format previous turns for Gemini SDK chats API
    // Gemini chat expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
    const formattedHistory = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (!msg || !msg.content) continue;
        const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
        formattedHistory.push({
          role,
          parts: [{ text: String(msg.content) }],
        });
      }
    }

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: STUDY_PLANNER_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({
      message: prompt.trim(),
    });

    const generatedText = response?.text;

    if (!generatedText) {
      throw new Error("No response text returned from Gemini API");
    }

    return {
      success: true,
      message: generatedText,
    };
  } catch (error) {
    console.error("Gemini Study Planner Error:", error?.message || error);
    return {
      success: false,
      message: "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment.",
    };
  }
}

const AI_TUTOR_SYSTEM_INSTRUCTION = `You are Guru AI, the expert AI Tutor for YuktiPrep, an exam preparation platform for competitive exams (UPSC, CSAT, State PSCs, SSC, Banking, Aptitude, etc.).

Your role is to help students as Guru AI with:

1. Explaining questions step by step with clear reasoning and shortcut tricks.
2. Generating high-yield practice tests on specific topics with questions, options, correct answers, and explanations.
3. Teaching smart shortcut tricks and time-saving techniques (especially for CSAT, Quant, and Reasoning).
4. Analyzing common candidate mistakes and giving practical improvement tips.
5. Conducting concise, comprehensive concept revisions with summaries and key takeaways.

Formatting Guidelines:
- Use clean, well-spaced standard Markdown.
- Use standard Markdown headings (###, ####), bullet points, and numbered lists.
- For tables, use standard GitHub-Flavored Markdown tables (| Col 1 | Col 2 |).
- For mathematical expressions and formulas:
  - For inline math, use standard dollar signs like $x + y = 10$ or $\\frac{a}{b}$.
  - For standalone formulas or block equations, use double dollar signs on their own lines:
    $$
    \\text{Work} = \\text{Efficiency} \\times \\text{Time}
    $$
- For ascii diagrams or alignment trees (e.g. mixture alligation), format them inside fenced code blocks (\`\`\`text ... \`\`\`) so indentation and spacing render cleanly.
- Keep explanations crisp, structured, exam-focused, and easy to read.`;


/**
 * General AI Tutor interaction for Question Explanation, Tests, Shortcuts, Mistake Analysis, and Concept Revision.
 * @param {string} prompt - The question or directive
 * @param {Array<{role: string, content: string}>} conversationHistory - Prior conversation turns
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function askAiTutor(prompt, conversationHistory = []) {
  try {
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return {
        success: false,
        message: "Please provide a valid question or topic.",
      };
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.warn("[chatbotweb.service] GEMINI_API_KEY is not configured.");
      return {
        success: false,
        message: "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment.",
      };
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const formattedHistory = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (!msg || !msg.content) continue;
        const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
        formattedHistory.push({
          role,
          parts: [{ text: String(msg.content) }],
        });
      }
    }

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: AI_TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({
      message: prompt.trim(),
    });

    const generatedText = response?.text;
    if (!generatedText) {
      throw new Error("No response text returned from Gemini API");
    }

    return {
      success: true,
      message: generatedText,
    };
  } catch (error) {
    console.error("Gemini AI Tutor Error:", error?.message || error);
    return {
      success: false,
      message: "Sorry, I couldn't generate a reply right now (AI service is temporarily unavailable). Please try again in a moment.",
    };
  }
}

