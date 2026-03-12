import { GoogleGenerativeAI } from "@google/generative-ai";

// ===============================
// Init
// ===============================
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key missing");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// ===============================
// Error Handler
// ===============================
const handleAPIError = (error) => {
  console.error("Gemini API Error:", error);

  if (error.message?.includes("API key")) {
    return "❌ Invalid API key.";
  }
  if (error.message?.includes("quota")) {
    return "⚠️ Free-tier quota exceeded.";
  }
  if (error.message?.includes("rate")) {
    return "⚠️ Too many requests. Slow down.";
  }
  return "⚠️ Gemini is temporarily unavailable.";
};

// ===============================
// Helpers
// ===============================
const formatHistory = (history = []) =>
  history
    .filter((m) => m?.text)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

// ===============================
// Core Chat (2.5 Flash)
// ===============================
export const chatWithAI = async (
  message,
  conversationHistory = []
) => {
  try {
    if (!message || message.trim().length < 2) {
      return "Please ask a valid question 🙂";
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // FIRST MESSAGE (no history)
    if (!conversationHistory.length) {
      const result = await model.generateContent(message);
      return result.response.text();
    }

    // FOLLOW-UP CHAT
    const chat = model.startChat({
      history: formatHistory(conversationHistory),
      generationConfig: {
        maxOutputTokens: 8174, // 🔥 REQUIRED for free tier
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    return handleAPIError(error);
  }
};

// ===============================
// Mock Interview
// ===============================
export const generateMockInterview = async (
  type,
  experience,
  role
) => {
  const prompt = `
You are an experienced ${role} interviewer.

Rules:
- Ask ONE question at a time
- Wait for candidate reply
- Be realistic and concise
- No solutions

Interview Type: ${type}
Experience: ${experience}

Start with greeting and first question.
`;
  return chatWithAI(prompt);
};

// ===============================
// DSA Problem Generator
// ===============================
export const generateDSAProblem = async (
  difficulty,
  topic
) => {
  const prompt = `
Generate a ${difficulty} DSA problem on ${topic}.

Include:
- Problem Statement
- Input/Output
- Constraints
- Example
- Hints (no solution)
`;
  return chatWithAI(prompt);
};

// ===============================
// Code Analysis
// ===============================
export const analyzeCode = async (
  code,
  problem
) => {
  const prompt = `
Analyze this solution for: ${problem}

Code:
${code}

Give:
1. Correctness
2. Time Complexity
3. Space Complexity
4. Improvements
5. Edge cases
`;
  return chatWithAI(prompt);
};

// ===============================
// Resume Analysis
// ===============================
export const analyzeResume = async (resumeText) => {
  const prompt = `
Analyze this resume for placements:

${resumeText}

Provide:
- Score (1–10)
- Strengths
- Weaknesses
- ATS tips
- Top 3 improvements
`;
  return chatWithAI(prompt);
};

// ===============================
// Resume Builder
// ===============================
export const generateResumeSection = async (
  sectionType,
  userInfo
) => {
  const prompts = {
    summary: `
Create a resume summary.
Experience: ${userInfo.experience}
Skills: ${userInfo.skills}
Target Role: ${userInfo.targetRole}
`,
    project: `
Write resume bullets:
Project: ${userInfo.projectName}
Tech: ${userInfo.technologies}
Description: ${userInfo.description}
`,
    achievement: `
Rewrite using STAR method:
${userInfo.achievement}
`,
  };

  return chatWithAI(prompts[sectionType]);
};

// ===============================
// Study Roadmap
// ===============================
export const generateStudyRoadmap = async (
  companies,
  timeframe,
  level
) => {
  const prompt = `
Create a ${timeframe} roadmap.

Target Companies: ${companies.join(", ")}
Current Level: ${level}

Include:
- Weekly DSA
- Projects
- Mock interviews
- Daily schedule
`;
  return chatWithAI(prompt);
};

// ===============================
// Company Prep
// ===============================
export const getCompanyPrepGuide = async (company) => {
  const prompt = `
Interview prep guide for ${company}.

Include:
- Rounds
- Technical focus
- HR questions
- Tips
`;
  return chatWithAI(prompt);
};

// ===============================
// Hint Generator
// ===============================
export const getHint = async (
  problem,
  approach
) => {
  const prompt = `
Problem: ${problem}
Current approach: ${approach}

Give ONE hint (no solution).
`;
  return chatWithAI(prompt);
};
