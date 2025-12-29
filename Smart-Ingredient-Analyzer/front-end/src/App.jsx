// App.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import WebcamCapture from "./components/WebcamCapture";
import ImageUploader from "./components/ImageUploader";
import ModeSelection from "./components/ModeSelection";
import ImagePreview from "./components/ImagePreview";
import AnalysisResult from "./components/AnalysisResult";
import HowItWorks from "./components/HowItWorks";
import { compressImage, detectDeviceCapabilities } from "./utils/imageUtils";

function App() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [mode, setMode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState(null);

  // Enhanced state for background processing
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    status: "",
    progress: 0,
    ocrText: null,
    analysisPromise: null,
  });

  const [analysisReady, setAnalysisReady] = useState(false);
  const [fullResults, setFullResults] = useState(null);

  // Detect device capabilities on mount
  useEffect(() => {
    const capabilities = detectDeviceCapabilities();
    setDeviceCapabilities(capabilities);
    console.log('📱 Device capabilities:', capabilities);
  }, []);

  // Get API URL with fallback
  const getApiUrl = useCallback(() => {
    // Try multiple possible API URLs
    const possibleUrls = [
      import.meta.env.VITE_API_URL,
      import.meta.env.VITE_API,
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "https://smart-ingredient-analyzer.onrender.com"
    ];
    
    const apiUrl = possibleUrls.find(url => url && url.trim()) || "http://localhost:5000";
    console.log('🌐 Using API URL:', apiUrl);
    return apiUrl;
  }, []);

  // Enhanced background processing function
  const startBackgroundProcessing = useCallback(async (imageData) => {
    setProcessingState({
      isProcessing: true,
      status: "🔄 Optimizing image...",
      progress: 10,
      ocrText: null,
      analysisPromise: null,
    });

    try {
      // Get optimal settings based on device
      const settings = deviceCapabilities || detectDeviceCapabilities();
      
      setProcessingState(prev => ({
        ...prev,
        status: "📝 Extracting text...",
        progress: 30,
      }));

      const API = getApiUrl();

      // Create request with timeout based on device
      const timeoutMs = settings.isMobile ? 15000 : 20000;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      console.log(`🌐 Making request to: ${API}/api/analyze`);
      console.log(`📊 Request settings: fastMode=${settings.fastMode}, isMobile=${settings.isMobile}`);

      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          image: imageData,
          fastMode: settings.fastMode,
          isMobile: settings.isMobile
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Response status: ${response.status}`);

      setProcessingState(prev => ({
        ...prev,
        status: "🧠 AI analyzing ingredients...",
        progress: 70,
      }));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Server responded with an error",
          code: "UNKNOWN",
        }));

        console.error("🔴 Analysis failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        let userFriendlyMessage = "❌ Analysis failed, please try again.";
        
        if (response.status === 413) {
          userFriendlyMessage = "❌ Image too large. Please try a smaller image.";
        } else if (response.status === 429) {
          userFriendlyMessage = "❌ Too many requests. Please wait a moment.";
        } else if (response.status === 0 || !response.status) {
          userFriendlyMessage = "❌ Cannot connect to server. Please check if the backend is running.";
        } else if (errorData.code === "INSUFFICIENT_INGREDIENTS") {
          userFriendlyMessage = "❌ No ingredient list found. Please focus on the ingredients section.";
        } else if (errorData.code === "INVALID_IMAGE_DATA") {
          userFriendlyMessage = "❌ Invalid image format. Please try a different image.";
        } else if (errorData.code === "OCR_FAILED") {
          userFriendlyMessage = "❌ Could not read text from image. Please try a clearer photo.";
        } else if (errorData.code === "GEMINI_API_ERROR") {
          userFriendlyMessage = "❌ AI analysis failed. Please try again in a moment.";
        } else if (errorData.code === "QUOTA_EXCEEDED") {
          userFriendlyMessage = "❌ Service temporarily unavailable. Please try again later.";
        }

        setProcessingState(prev => ({
          ...prev,
          status: userFriendlyMessage,
          progress: 0,
        }));

        setErrorMessage(userFriendlyMessage);

        setTimeout(() => {
          setProcessingState(prev => ({
            ...prev,
            isProcessing: false,
          }));
        }, 3000);

        return;
      }

      const result = await response.json();

      setProcessingState(prev => ({
        ...prev,
        status: "✅ Analysis complete!",
        progress: 100,
        ocrText: result.ingredientsText,
        analysisPromise: Promise.resolve(result),
      }));

      setFullResults(result);
      setAnalysisReady(true);

      setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          isProcessing: false,
        }));
      }, 1500);

    } catch (error) {
      console.error("🔴 Background processing error:", error);

      let errorMsg = "❌ Could not reach the server. Please check your connection.";
      
      if (error.name === 'AbortError') {
        errorMsg = "❌ Request timed out. Please try with a clearer, smaller image.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMsg = "❌ Network error. Please check your internet connection.";
      }

      setProcessingState(prev => ({
        ...prev,
        status: errorMsg,
        progress: 0,
      }));

      setErrorMessage(errorMsg);

      setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          isProcessing: false,
        }));
      }, 3000);
    }
  }, [deviceCapabilities, getApiUrl]);

  // Enhanced capture function
  const captureImage = useCallback(async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        setErrorMessage("❌ Could not capture image. Please allow camera access.");
        return;
      }

      // Use high quality settings for OCR
      const settings = deviceCapabilities || detectDeviceCapabilities();
      
      // Maximum quality for webcam captures
      const ocrSettings = {
        ...settings,
        quality: 0.98, // Very high quality for webcam
        maxWidth: Math.max(settings.maxWidth, 2000) // High resolution
      };
      
      const compressedImage = await compressImage(
        imageSrc, 
        ocrSettings.quality, 
        ocrSettings.maxWidth
      );
      
      setImageSrc(compressedImage);
      startBackgroundProcessing(compressedImage);
    } catch (error) {
      console.error('Capture error:', error);
      setErrorMessage("❌ Failed to capture image. Please try again.");
    }
  }, [deviceCapabilities, startBackgroundProcessing]);

  // Enhanced upload handler
  const handleUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enhanced file validation
    const maxSize = deviceCapabilities?.isMobile ? 8 * 1024 * 1024 : 10 * 1024 * 1024; // 8MB mobile, 10MB desktop
    
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setErrorMessage(`❌ File too large. Please select an image under ${maxSizeMB}MB.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("❌ Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const settings = deviceCapabilities || detectDeviceCapabilities();
        
        // High quality for uploaded images
        const compressedImage = await compressImage(
          reader.result, 
          0.95, // High quality
          Math.max(settings.maxWidth, 2000) // High resolution
        );
        
        setImageSrc(compressedImage);
        startBackgroundProcessing(compressedImage);
      } catch (error) {
        console.error('Upload processing error:', error);
        setErrorMessage("❌ Failed to process image. Please try another image.");
      }
    };
    reader.readAsDataURL(file);
  }, [deviceCapabilities, startBackgroundProcessing]);

  // Instant analysis function
  const analyzeImage = useCallback(async () => {
    if (analysisReady && fullResults) {
      setAnalysis(fullResults.analysis);
    } else if (processingState.analysisPromise) {
      try {
        const response = await processingState.analysisPromise;
        setFullResults(response);
        setAnalysis(response.analysis);
        setAnalysisReady(true);
      } catch (error) {
        console.error("Error analyzing image:", error);
        setErrorMessage("❌ Failed to analyze image. Please try again.");
      }
    }
  }, [analysisReady, fullResults, processingState.analysisPromise]);

  const reset = useCallback(() => {
    setImageSrc(null);
    setAnalysis(null);
    setMode(null);
    setAnalysisReady(false);
    setFullResults(null);
    setProcessingState({
      isProcessing: false,
      status: "",
      progress: 0,
      ocrText: null,
      analysisPromise: null,
    });
    setErrorMessage(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-2 sm:p-4 font-sans">
      <div className="max-w-4xl mx-auto shadow-2xl bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-4 sm:space-y-8">
        <a href="/" className="block">
          <div className="text-center space-y-2 py-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V8.5C15 9.6 14.1 10.5 13 10.5S11 9.6 11 8.5V7.5L9 7.5V8.5C9 9.6 8.1 10.5 7 10.5S5 9.6 5 8.5V7.5L3 7V9C3 10.1 3.9 11 5 11V12.5C5 13.6 5.9 14.5 7 14.5S9 13.6 9 12.5V11H15V12.5C15 13.6 15.9 14.5 17 14.5S19 13.6 19 12.5V11C20.1 11 21 10.1 21 9ZM7.5 18C7.5 18.8 8.2 19.5 9 19.5S10.5 18.8 10.5 18V16.5H13.5V18C13.5 18.8 14.2 19.5 15 19.5S16.5 18.8 16.5 18V16.5H7.5V18Z" />
                </svg>
                <img alt="" src="../public/greenlogo.jpg"></img>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 via-slate-700 to-green-700 bg-clip-text text-transparent leading-tight">
                <span className="inline-block transform hover:scale-105 transition-all duration-500 hover:text-blue-800">
                  AI
                </span>
                <span className="mx-1 sm:mx-2">Ingredient</span>
                <span className="inline-block transform hover:scale-105 transition-all duration-500 hover:text-green-800">
                  Analyzer
                </span>
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-700 font-medium opacity-90 hover:opacity-100 transition-opacity duration-300">
              Instant health analysis of food ingredients
            </p>
          </div>
        </a>

        {!mode && <HowItWorks />}
        {!mode && <ModeSelection setMode={setMode} />}

        {mode === "camera" && !imageSrc && (
          <WebcamCapture
            webcamRef={webcamRef}
            onCapture={captureImage}
            onBack={reset}
          />
        )}

        {mode === "upload" && !imageSrc && (
          <ImageUploader handleUpload={handleUpload} onBack={reset} />
        )}

        {imageSrc && (
          <ImagePreview
            imageSrc={imageSrc}
            onAnalyze={analyzeImage}
            onReset={reset}
            processingState={processingState}
            analysisReady={analysisReady}
          />
        )}

        {errorMessage && (
          <div className="text-red-600 font-medium text-center bg-red-100 border border-red-300 px-4 py-3 rounded-xl shadow-sm animate-pulse text-sm">
            {errorMessage}
            <button 
              onClick={() => setErrorMessage(null)}
              className="ml-3 text-red-800 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {analysis && fullResults && (
          <AnalysisResult
            analysis={analysis}
            healthScore={fullResults.healthScore}
            allergens={fullResults.allergens}
            processingTime={fullResults.processingTime}
          />
        )}
      </div>
    </div>
  );
}

export default App;