import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model khuyên dùng: llama-3.3-70b-versatile (Rất thông minh)
// hoặc llama-3.1-8b-instant (Siêu nhanh)
export const GROQ_MODEL = "llama-3.3-70b-versatile";
