import React from "react";

const ProcessingStatus = ({ status, progress, ocrText }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 space-y-4 w-full max-w-md shadow-lg">
    <div className="flex items-center gap-3">
      <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
      <span className="font-semibold text-blue-800 text-sm sm:text-base flex-1">{status}</span>
    </div>

    {progress > 0 && (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-blue-700">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )}

    {ocrText && (
      <div className="mt-4 p-4 bg-white rounded-xl border shadow-sm">
        <p className="text-xs text-gray-600 mb-2 font-medium">📝 Detected ingredients:</p>
        <p className="text-xs sm:text-sm text-gray-800 italic leading-relaxed">
          "{ocrText.substring(0, 150)}{ocrText.length > 150 ? '...' : ''}"
        </p>
      </div>
    )}
    
    <div className="text-center">
      <p className="text-xs text-blue-600">
        🤖 AI is analyzing your ingredients...
      </p>
    </div>
  </div>
);

export default ProcessingStatus;