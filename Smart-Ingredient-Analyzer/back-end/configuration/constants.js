// config/constants.js - Application Constants
export const HARMFUL_INGREDIENTS = new Set([
  "trans fat",
  "partially hydrogenated oil",
  "high fructose corn syrup",
  "aspartame",
  "sodium nitrate",
  "sodium nitrite",
  "bha",
  "bht",
  "artificial colors",
  "red dye 40",
  "yellow 5",
  "yellow 6",
  "monosodium glutamate",
  "msg",
  "carrageenan",
  "sodium benzoate",
]);

export const ALLERGENS = {
  gluten: ["wheat", "barley", "rye", "malt", "triticale"],
  dairy: ["milk", "lactose", "casein", "whey", "butter", "cream"],
  nuts: ["peanut", "almond", "walnut", "cashew", "pecan", "hazelnut"],
  soy: ["soy", "soybean", "lecithin"],
  eggs: ["egg", "albumin", "mayonnaise"],
  shellfish: ["shrimp", "crab", "lobster", "mollusk"],
};

export const CACHE_CONFIG = {
  stdTTL: 172800, // 48 hours
  checkperiod: 3600, // 1 hour
};

export const IMAGE_LIMITS = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  minSizeBytes: 1024, // 1KB
};

export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per window
};

export const GROQ_TIMEOUT = {
  mobile: 20000, // 20 seconds
  fast: 20000, // 20 seconds
  normal: 20000, // 20 seconds
};

export const GROQ_TOKENS = {
  mobile: 5000,
  fast: 5000,
  normal: 5000,
};

export default {
  HARMFUL_INGREDIENTS,
  ALLERGENS,
  CACHE_CONFIG,
  IMAGE_LIMITS,
  RATE_LIMIT_CONFIG,
  GROQ_TIMEOUT,
  GROQ_TOKENS,
};
