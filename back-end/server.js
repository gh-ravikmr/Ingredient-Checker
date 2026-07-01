// server.js - Main Express Server (PRODUCTION LEVEL)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});


// Config
import { env, validateEnv } from "./configuration/env.js";
import { RATE_LIMIT_CONFIG } from "./configuration/constants.js";

// Services & Utils
import groqService from "./services/groqService.js";
import cacheManager from "./utils/cache.js";
import Validators from "./utils/validators.js";
import AnalysisHelpers from "./utils/helpers.js";
import ErrorHandler from "./middleware/errorHandler.js";




// OCR functions
import {
  preprocessImage,
  performOCRWithMultipleVersions,
  performSmartOCR,
  ultraFastPreprocess,
} from "./optimized-ocr.js";

// Validate environment
validateEnv();

const app = express();
const PORT = env.PORT;

// ============= MIDDLEWARE =============

// Security middleware
app.use(helmet());
app.use(cors({
  origin: "*", // for hackathon/demo
  methods: ["GET", "POST"],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.max,
  message: { error: "Too many requests, please try again later" },
});
app.use(limiter);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));


// CORS
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Ingredient Checker backend is running 🚀"
  });
});


// app.options("*", cors());
// app.use(
//   cors({
//     origin:
//       env.NODE_ENV === "production"
//         ? [
//             "https://smart-ingredient-analyzer.vercel.app",
//             "https://ai-ingredient-analyzer.vercel.app",
//             /\.vercel\.app$/,
//           ]
//         : [
//             "http://localhost:3000",
//             "http://localhost:5173",
//             "http://localhost:4173",
//             "http://127.0.0.1:5173",
//           ],
//     credentials: true,
//   })
// );

// Body parser
app.use(bodyParser.json({ limit: "10mb" }));

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});




// ============= ROUTES =============

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.post("/api/analyze", async (req, res, next) => {
  try {
    const startTime = Date.now();

    // 1️⃣ Validate request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        valid: false,
        error: "No request body",
        code: "NO_REQUEST_BODY",
      });
    }

    const { image, fastMode = true, isMobile = false } = req.body;

    // 2️⃣ Validate image field
    if (!image || typeof image !== "string") {
      return res.status(400).json({
        valid: false,
        error: "Image field missing or invalid",
        code: "INVALID_IMAGE_FIELD",
      });
    }

    // 3️⃣ Extract base64 safely
    let imageBuffer;
    try {
      const base64Data = image.includes(",")
        ? image.split(",")[1]
        : image;

      if (!base64Data || base64Data.length < 100) {
        return res.status(400).json({
          valid: false,
          error: "Invalid base64 image data",
          code: "INVALID_BASE64",
        });
      }

      imageBuffer = Buffer.from(base64Data, "base64");
    } catch (err) {
      return res.status(400).json({
        valid: false,
        error: "Failed to decode base64 image",
        code: "BASE64_DECODE_FAILED",
      });
    }

    // 4️⃣ Size checks
    const sizeKB = imageBuffer.length / 1024;
    console.log(`📊 Image size: ${sizeKB.toFixed(1)} KB`);

    if (imageBuffer.length < 1024) {
      return res.status(400).json({
        error: "Image too small",
        code: "IMAGE_TOO_SMALL",
      });
    }

    if (imageBuffer.length > 15 * 1024 * 1024) {
      return res.status(413).json({
        error: "Image too large",
        code: "IMAGE_TOO_LARGE",
      });
    }

    // 5️⃣ OCR processing
    let bestOcrResult;
    try {
      console.log("🔍 Starting OCR...");

      try {
        const processed = await ultraFastPreprocess(imageBuffer, isMobile);
        bestOcrResult = await performSmartOCR(processed);
        console.log("⚡ Fast OCR success");
      } catch {
        const processedImages = await preprocessImage(imageBuffer);
        bestOcrResult = await performOCRWithMultipleVersions(processedImages);
        console.log("🧠 Standard OCR success");
      }

      if (!bestOcrResult?.text) {
        return res.status(400).json({
          error: "No text detected in image",
          code: "NO_TEXT_DETECTED",
        });
      }
    } catch (err) {
      return res.status(400).json({
        error: "OCR failed",
        code: "OCR_FAILED",
        details: err.message,
      });
    }

    // 6️⃣ Extract ingredients
    let finalIngredients =
      AnalysisHelpers.extractIngredients(bestOcrResult.text);

    if (!finalIngredients || finalIngredients.length < 5) {
      finalIngredients = bestOcrResult.text
        .replace(/nutrition.*$/i, "")
        .replace(/serving.*$/i, "")
        .trim();
    }

    if (!finalIngredients || finalIngredients.length < 10) {
      return res.status(400).json({
        error: "No ingredients found",
        code: "INSUFFICIENT_INGREDIENTS",
      });
    }

    // 7️⃣ Cache check
    const cacheKey = cacheManager.generateKey(finalIngredients);
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // 8️⃣ AI Analysis
    const aiStart = Date.now();
    const groqResult = await groqService.analyze(finalIngredients, {
      fastMode,
      isMobile,
    });

    const aiTime = Date.now() - aiStart;
    const totalTime = Date.now() - startTime;

    const result = {
      ingredientsText: finalIngredients,
      analysis: groqResult.analysis,
      allergens: AnalysisHelpers.detectAllergens(finalIngredients),
      healthScore: AnalysisHelpers.calculateHealthScore(
        groqResult.analysis
      ),
      harmfulIngredients:
        AnalysisHelpers.detectHarmfulIngredients(groqResult.analysis),
      ocrConfidence: bestOcrResult.confidence,
      ocrMethod: bestOcrResult.method,
      processingTime: totalTime,
      aiTime,
      fastMode,
      isMobile,
      cached: false,
    };

    cacheManager.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((error, req, res, next) => {
  ErrorHandler.handle(error, req, res);
});

// ============= GRACEFUL SHUTDOWN =============

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  cacheManager.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  cacheManager.close();
  process.exit(0);
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`🚀 Smart Food Analyzer API running on port ${PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🤖 AI Model: ${env.GROQ_MODEL}`);
});

export default app;
