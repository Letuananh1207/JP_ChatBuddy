import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const GEMINI_API_KEY: string = (() => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY is not defined");
  }
  return process.env.GEMINI_API_KEY;
})();

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in env");
  process.exit(1);
}
