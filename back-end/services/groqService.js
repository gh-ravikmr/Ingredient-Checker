// services/groqService.js - Groq AI Service
import fetch from "node-fetch";
import { env } from "../configuration/env.js";
import { GROQ_TIMEOUT, GROQ_TOKENS } from "../configuration/constants.js";

export class GroqService {
  constructor() {
    this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    this.apiKey = env.GROQ_API_KEY;
    this.model = env.GROQ_MODEL;
  }

  createPrompt(ingredients) {
    return `You are a certified nutritionist and food safety expert. Analyze these food ingredients and provide a comprehensive health assessment.

IMPORTANT JSON RULES:
- Return ONLY a valid JSON array that can be parsed with JavaScript JSON.parse.
- Do NOT wrap the JSON in markdown or code fences.
- Do NOT include any text before or after the JSON.
- Do NOT use double quotes inside any string values. If you need quotes, use single quotes instead.
- All keys MUST be in double quotes.
- All string values MUST be in double quotes.
- No trailing commas are allowed.

Special notes for Indian food additives:
- INS codes (like INS1422, INS415, etc.) are food additive codes used in India
- Treat these as stabilizers, emulsifiers, or preservatives based on their function
- Jaggery is unrefined sugar, healthier than white sugar but still sugar
- Tamarind is a natural fruit extract, generally good

For each ingredient, determine:
- Health impact (Good/Bad/Neutral)
- Brief scientific reason
- Specific health concerns if any

Ingredients to analyze:
${ingredients}

Expected JSON format:
[{
  "ingredient": "sugar",
  "status": "Bad",
  "reason": "High glycemic index, linked to obesity and diabetes",
  "concerns": ["diabetes", "obesity", "dental health"]
}]`;
  }

  async analyze(ingredients, options = {}) {
    const { isMobile = false, fastMode = true } = options;

    try {
      const prompt = this.createPrompt(ingredients);
      const timeout = isMobile
        ? GROQ_TIMEOUT.mobile
        : fastMode
        ? GROQ_TIMEOUT.fast
        : GROQ_TIMEOUT.normal;
      const maxTokens = isMobile
        ? GROQ_TOKENS.mobile
        : fastMode
        ? GROQ_TOKENS.fast
        : GROQ_TOKENS.normal;

      const startTime = Date.now();

      const response = await Promise.race([
        this.sendRequest(prompt, maxTokens),
        this.createTimeoutPromise(timeout),
      ]);

      const aiTime = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = `Groq API HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `: ${errorData.error?.message || "Unknown error"}`;
        } catch {
          // ignore JSON parse errors for error responses
        }
        const err = new Error(errorMessage);
        err.code = "GROQ_HTTP_ERROR";
        throw err;
      }

      const data = await response.json();

      if (data.error) {
        const err = new Error(data.error.message || "Groq API error");
        err.code = "GROQ_API_ERROR";
        throw err;
      }

      let groqText = data.choices?.[0]?.message?.content || "";

      if (!groqText) {
        const err = new Error("Empty response from Groq API");
        err.code = "GROQ_EMPTY_CONTENT";
        throw err;
      }

      // --- Clean & extract JSON array safely ---

      // Remove any code fences if they appear
      let cleaned = groqText
        .trim()
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      // Try to grab the main JSON array: [ ... ]
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        const err = new Error("Groq did not return a JSON array");
        err.code = "GROQ_NO_JSON";
        throw err;
      }

      const jsonText = arrayMatch[0];

      let analysis;
      try {
        // Primary parse attempt
        analysis = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn(
          "Primary JSON.parse failed, attempting salvage:",
          parseError.message
        );

        // Salvage: collect all complete { ... } objects and build an array
        const objectMatches = jsonText.match(/{[^}]*}/g) || [];

        if (objectMatches.length === 0) {
          const err = new Error(
            `Failed to parse Groq response: ${parseError.message}`
          );
          err.code = "GROQ_PARSE_ERROR";
          throw err;
        }

        const safeArrayText = `[${objectMatches.join(",")}]`;

        try {
          analysis = JSON.parse(safeArrayText);
        } catch (error2) {
          const err = new Error(
            `Failed to parse Groq response after salvage: ${error2.message}`
          );
          err.code = "GROQ_PARSE_ERROR";
          throw err;
        }
      }

      // Normalize result
      if (!Array.isArray(analysis)) {
        analysis = [analysis];
      }

      if (analysis.length === 0) {
        const err = new Error("Empty analysis array");
        err.code = "GROQ_EMPTY_ANALYSIS";
        throw err;
      }

      return {
        analysis,
        aiTime,
        success: true,
      };
    } catch (error) {
      console.error("❌ Groq Service Error:", error);
      throw error;
    }
  }

  async sendRequest(prompt, maxTokens) {
    return fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.1,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
  }

  createTimeoutPromise(timeoutMs) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Groq timeout")), timeoutMs)
    );
  }
}

export default new GroqService();
