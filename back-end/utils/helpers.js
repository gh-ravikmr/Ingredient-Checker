// utils/helpers.js - Helper Functions
import { HARMFUL_INGREDIENTS, ALLERGENS } from "../configuration/constants.js";

export class AnalysisHelpers {
  static extractIngredients(text) {
    if (!text || text.trim().length === 0) {
      return "";
    }

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return text.trim();
    }

    let ingredientLines = [];
    let startFound = false;

    for (let line of lines) {
      if (!startFound && /ingredients?|contents?|contains?/i.test(line)) {
        startFound = true;
        const cleanLine = line.replace(/^ingredients?:?\s*/i, "");
        if (cleanLine) ingredientLines.push(cleanLine);
        continue;
      }

      if (startFound) {
        if (
          /^(nutritional|nutrition|storage|manufactured|marketed|packed|usage|instructions|allergy|net weight|best before|expiry)/i.test(
            line
          )
        ) {
          break;
        }
        ingredientLines.push(line);
      }
    }

    if (!startFound && ingredientLines.length === 0) {
      ingredientLines = lines.filter((line) => {
        const lowerLine = line.toLowerCase();
        return (
          lowerLine.includes("water") ||
          lowerLine.includes("sugar") ||
          lowerLine.includes("salt") ||
          lowerLine.includes("oil") ||
          lowerLine.includes("spices") ||
          lowerLine.includes("ins") ||
          /\d+\.?\d*%/.test(line) ||
          line.includes(",")
        );
      });
    }

    if (ingredientLines.length === 0) {
      ingredientLines = lines;
    }

    const result = ingredientLines
      .join(" ")
      .replace(/[{}[\]]/g, "")
      .replace(/\s+/g, " ")
      .replace(/[^\w\s,().%\-:]/g, "")
      .replace(/\b(?!ins)\d+(?!\d*%|ins)\b/gi, "")
      .replace(/\b[a-zA-Z]{1}\b/g, "")
      .replace(/,\s*,/g, ",")
      .replace(/\(\s*\)/g, "")
      .trim();

    return result;
  }

  static detectAllergens(ingredients) {
    const detectedAllergens = [];
    const ingredientsLower = ingredients.toLowerCase();

    for (const [allergen, keywords] of Object.entries(ALLERGENS)) {
      if (keywords.some((keyword) => ingredientsLower.includes(keyword))) {
        detectedAllergens.push(allergen);
      }
    }

    return detectedAllergens;
  }

  static calculateHealthScore(analysis) {
    let score = 100;
    let goodCount = 0;
    let badCount = 0;
    let neutralCount = 0;

    analysis.forEach((item) => {
      switch (item.status.toLowerCase()) {
        case "good":
          goodCount++;
          break;
        case "bad":
          badCount++;
          score -= 10;
          break;
        case "neutral":
          neutralCount++;
          score -= 4;
          break;
        default:
          break;
      }
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown: { good: goodCount, bad: badCount, neutral: neutralCount },
    };
  }

  static detectHarmfulIngredients(analysis) {
    return analysis.filter((item) =>
      HARMFUL_INGREDIENTS.has(item.ingredient.toLowerCase())
    );
  }
}

export default AnalysisHelpers;
