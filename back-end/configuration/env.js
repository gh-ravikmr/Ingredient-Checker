import dotenv from "dotenv";

dotenv.config();

// Default Groq model. Overridable with GROQ_MODEL so the deployment does not
// break when Groq retires a model id.
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
  GROQ_BASE_URL:
    process.env.GROQ_BASE_URL ||
    "https://api.groq.com/openai/v1/chat/completions",
};

// Validate required environment variables
export function validateEnv() {
  if (!env.GROQ_API_KEY) {
    console.error(
      "❌ GROQ_API_KEY is not set. Copy .env.example to .env and add your key."
    );
    process.exit(1);
  }

  if (!process.env.GROQ_MODEL) {
    console.warn(`⚠️  GROQ_MODEL not set, defaulting to ${DEFAULT_GROQ_MODEL}`);
  }

  if (!env.GEMINI_API_KEY) {
    console.warn(
      "⚠️  GEMINI_API_KEY not set — OCR will use the slower Tesseract fallback."
    );
  }

  console.log("✅ Environment variables validated");
}

export default env;
