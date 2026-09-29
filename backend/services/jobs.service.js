import { GoogleGenAI, Type } from "@google/genai";
import { JobCategory, JobType } from "../data/mockJobsData.js";
import { VERIFIED_OFFICIAL_PORTALS } from "../data/verifiedSourcesData.js";
import prisma from "../config/prisma.js";

const getAI = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  return key ? new GoogleGenAI({ apiKey: key }) : null;
};

export const filterVerifiedJobs = async (filters) => {
  const { query, state, category, qualification, jobType } = filters;
  const q = (query || "").toLowerCase().trim();

  const allJobs = await prisma.job.findMany();

  return allJobs.filter((job) => {
    if (q) {
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchOrg = job.organization.toLowerCase().includes(q);
      const matchDept = job.department.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      const matchLoc = job.location.toLowerCase().includes(q);
      const matchState = job.state.toLowerCase().includes(q);
      if (
        !matchTitle &&
        !matchOrg &&
        !matchDept &&
        !matchDesc &&
        !matchLoc &&
        !matchState
      ) {
        return false;
      }
    }

    if (
      state &&
      state !== "All India" &&
      job.state !== "All India" &&
      job.state !== state
    ) {
      return false;
    }

    if (category && category !== JobCategory.ALL) {
      if (job.category && job.category !== category) {
        return false;
      }
    }

    if (qualification && qualification !== "Any") {
      const qualList = Array.isArray(job.qualification)
        ? job.qualification
        : [];
      const hasQual = qualList.some(
        (item) =>
          item.toLowerCase().includes(qualification.toLowerCase()) ||
          qualification.toLowerCase().includes(item.toLowerCase()),
      );
      if (!hasQual) {
        return false;
      }
    }

    if (jobType && jobType !== JobType.ALL) {
      if (job.employmentType && job.employmentType !== jobType) {
        return false;
      }
    }

    return true;
  });
};

const buildGroundingSources = (jobs, filters) => {
  const relevantPortals = VERIFIED_OFFICIAL_PORTALS.filter((portal) => {
    if (filters.category && filters.category !== JobCategory.ALL) {
      return portal.category === filters.category;
    }
    return true;
  });

  const sample =
    relevantPortals.length > 0
      ? relevantPortals.slice(0, 5)
      : VERIFIED_OFFICIAL_PORTALS.slice(0, 5);

  return sample.map((p) => ({
    web: {
      uri: p.url,
      title: `${p.name} - Official Recruitment Portal (${p.domain})`,
    },
  }));
};

export const fetchJobs = async (
  filters,
  locationContext = "",
  forceSync = false,
) => {
  // Step 1: Search existing verified jobs in database
  const localJobs = await filterVerifiedJobs(filters);

  const ai = getAI();

  const { query, state, category, qualification, jobType } = filters;

  // Step 2: Return database jobs if available
  if (localJobs && localJobs.length > 0 && !forceSync) {
    return {
      jobs: localJobs,
      sources: buildGroundingSources(localJobs, filters),
      isLiveAIBased: false,
    };
  }

  // Step 3: If Gemini is not configured
  if (!ai) {
    return {
      jobs: [],
      sources: [],
      isLiveAIBased: false,
    };
  }

  const searchPrompt = `
Find exactly 3 actual and currently ACTIVE official government
job recruitment notifications in India.

IMPORTANT:
- Today is ${new Date().toISOString().split("T")[0]}.
- Use Google Search to find current information.
- Prefer official government websites only.
- Do not include expired or closed notifications.
- Return exactly 3 jobs when at least 3 valid active jobs exist.
- Never invent job information.
- If a field cannot be verified, use null or an empty string.

SEARCH FILTERS:

Keywords: ${query || "Active Government Recruitment"}
State: ${state || "All India"}
Category: ${category || "All Categories"}
Job Type: ${jobType || "Any"}
Qualification: ${qualification || "Any"}
User Location: ${locationContext || "India"}
`;

  try {
    // Only ONE Gemini API request
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",

      contents: searchPrompt,

      config: {
        tools: [
          {
            googleSearch: {},
          },
        ],

        responseMimeType: "application/json",

        maxOutputTokens: 4096,

        responseSchema: {
          type: Type.ARRAY,

          items: {
            type: Type.OBJECT,

            properties: {
              id: {
                type: Type.STRING,
              },

              title: {
                type: Type.STRING,
              },

              department: {
                type: Type.STRING,
              },

              organization: {
                type: Type.STRING,
              },

              location: {
                type: Type.STRING,
              },

              state: {
                type: Type.STRING,
              },

              category: {
                type: Type.STRING,
              },

              postDate: {
                type: Type.STRING,
              },

              lastDate: {
                type: Type.STRING,
              },

              qualification: {
                type: Type.ARRAY,

                items: {
                  type: Type.STRING,
                },
              },

              totalPosts: {
                type: Type.STRING,
              },

              salary: {
                type: Type.STRING,
              },

              status: {
                type: Type.STRING,
              },

              officialPdfUrl: {
                type: Type.STRING,
              },

              description: {
                type: Type.STRING,
              },

              sourceUrl: {
                type: Type.STRING,
              },

              uniqueCapabilities: {
                type: Type.STRING,
              },

              publicationSource: {
                type: Type.STRING,
              },

              employmentType: {
                type: Type.STRING,
              },

              examProjectedDate: {
                type: Type.STRING,
              },

              expectedResultsDate: {
                type: Type.STRING,
              },

              applyByDate: {
                type: Type.STRING,
              },
            },

            required: [
              "id",
              "title",
              "organization",
              "location",
              "state",
              "postDate",
              "lastDate",
              "qualification",
              "totalPosts",
              "description",
              "sourceUrl",
            ],
          },
        },
      },
    });

    // Step 4: Get Google Search grounding sources
    const sources =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Step 5: Get Gemini JSON response
    const jobsText = response.text || "[]";

    let parsedJobs;

    try {
      parsedJobs = JSON.parse(jobsText);
    } catch (error) {
      console.warn("Failed to parse Gemini JSON:", error.message);

      return {
        jobs: [],
        sources,
        isLiveAIBased: false,
      };
    }

    // Step 6: Validate response
    if (!Array.isArray(parsedJobs) || parsedJobs.length === 0) {
      return {
        jobs: [],
        sources,
        isLiveAIBased: false,
      };
    }

    // Step 7: Limit to exactly 3
    const jobs = parsedJobs.slice(0, 3);

    // Step 8: Save jobs in database
    for (const job of jobs) {
      const jobId = job.id || `job-${Date.now()}-${Math.random()}`;

      await prisma.job.upsert({
        where: {
          id: jobId,
        },

        update: {
          title: job.title || "Unknown Title",

          department: job.department || "Unknown Department",

          organization: job.organization || "Unknown Organization",

          location: job.location || "India",

          state: job.state || "All India",

          category: job.category || "All Categories",

          postDate: job.postDate || new Date().toISOString().split("T")[0],

          lastDate: job.lastDate || "TBD",

          applyByDate: job.applyByDate,

          qualification: job.qualification || [],

          totalPosts: job.totalPosts || "Varies",

          salary: job.salary,

          ageLimit: job.ageLimit,

          applicationFee: job.applicationFee,

          selectionProcess: job.selectionProcess,

          officialPdfUrl: job.officialPdfUrl,

          sourceUrl: job.sourceUrl || "https://india.gov.in",

          status: job.status || "Active",

          publicationSource: job.publicationSource,

          employmentType: job.employmentType,

          examProjectedDate: job.examProjectedDate,

          expectedResultsDate: job.expectedResultsDate,

          uniqueCapabilities: job.uniqueCapabilities,

          description: job.description || "No description provided.",
        },

        create: {
          id: jobId,

          title: job.title || "Unknown Title",

          department: job.department || "Unknown Department",

          organization: job.organization || "Unknown Organization",

          location: job.location || "India",

          state: job.state || "All India",

          category: job.category || "All Categories",

          postDate: job.postDate || new Date().toISOString().split("T")[0],

          lastDate: job.lastDate || "TBD",

          applyByDate: job.applyByDate,

          qualification: job.qualification || [],

          totalPosts: job.totalPosts || "Varies",

          salary: job.salary,

          ageLimit: job.ageLimit,

          applicationFee: job.applicationFee,

          selectionProcess: job.selectionProcess,

          officialPdfUrl: job.officialPdfUrl,

          sourceUrl: job.sourceUrl || "https://india.gov.in",

          status: job.status || "Active",

          publicationSource: job.publicationSource,

          employmentType: job.employmentType,

          examProjectedDate: job.examProjectedDate,

          expectedResultsDate: job.expectedResultsDate,

          uniqueCapabilities: job.uniqueCapabilities,

          description: job.description || "No description provided.",
        },
      });
    }

    return {
      jobs,
      sources,
      isLiveAIBased: true,
    };
  } catch (aiError) {
    console.warn("AI Live Search encountered an issue:", aiError?.message);

    return {
      jobs: [],
      sources: [],
      isLiveAIBased: false,
    };
  }
};

export const syncAllSources = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const totalJobs = await prisma.job.count();
  return {
    totalJobs,
    totalPortals: VERIFIED_OFFICIAL_PORTALS.length,
    lastSyncTime: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};

const generateSmartLocalResponse = (message) => {
  const m = message.toLowerCase();

  if (
    m.includes("upsc") ||
    m.includes("ias") ||
    m.includes("ips") ||
    m.includes("civil services")
  ) {
    return `### **UPSC Civil Services Examination (CSE)**
- **Eligibility**: Bachelor's Degree in any discipline from a recognized university.
- **Age Limit**: General / EWS: 21 to 32 years
- **Official Website**: [upsc.gov.in](https://upsc.gov.in)`;
  }

  if (
    m.includes("ssc") ||
    m.includes("cgl") ||
    m.includes("chsl") ||
    m.includes("mts") ||
    m.includes("gd")
  ) {
    return `### **Staff Selection Commission (SSC) Portals & Exams**
- **SSC CGL**: Graduate Level - Inspector, ASO, Auditor.
- **SSC CHSL**: 10+2 / 12th Level.
- **Official Portal**: [ssc.gov.in](https://ssc.gov.in).`;
  }

  if (
    m.includes("bank") ||
    m.includes("sbi") ||
    m.includes("ibps") ||
    m.includes("rbi") ||
    m.includes("po")
  ) {
    return `### **Banking & Financial Sector Recruitments**
- **SBI PO**: Highest paying public sector bank PO entry.
- **IBPS PO / Clerk**: Common test for 11 Nationalized Banks.
- **Official Links**: [sbi.co.in/careers](https://sbi.co.in/web/careers), [ibps.in](https://www.ibps.in).`;
  }

  return `I can help you navigate all active Indian Government job recruitments! Here is what you can ask me:
1. **Specific Exam Details**: e.g., *"How do I apply for SSC CGL?"*
2. **Eligibility & Age Limits**: e.g., *"What is the age limit for SBI PO?"*
3. **Department Info**: Details on ISRO, Defence, Railways, Banking.`;
};

export const chatWithGemini = async (message, history) => {
  const ai = getAI();
  if (ai) {
    try {
      const chat = ai.chats.create({
        model: "gemma-4-26b-a4b-it",
        config: {
          systemInstruction:
            "You are the expert career assistant for GovJobs India.",
        },
        history: history,
      });

      const response = await chat.sendMessage({ message });
      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn("Chat model fallback:", error?.message);
    }
  }

  return generateSmartLocalResponse(message);
};

export const getSavedJobs = async (userId) => {
  const savedRecords = await prisma.savedJob.findMany({
    where: { userId },
    select: { jobId: true }
  });
  return savedRecords.map(r => r.jobId);
};

export const saveJob = async (userId, jobId) => {
  await prisma.savedJob.upsert({
    where: {
      userId_jobId: { userId, jobId }
    },
    update: {},
    create: { userId, jobId }
  });
  return true;
};

export const unsaveJob = async (userId, jobId) => {
  try {
    await prisma.savedJob.delete({
      where: {
        userId_jobId: { userId, jobId }
      }
    });
  } catch(e) {
    // Ignore if not found
  }
  return true;
};
