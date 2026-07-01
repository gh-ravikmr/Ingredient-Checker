import React from "react";

const AnalysisResult = ({
  analysis,
  healthScore,
  allergens,
  processingTime,
}) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  // const getScoreGradient = (score) => {
  //   if (score >= 80) return "from-green-500 to-green-600";
  //   if (score >= 60) return "from-yellow-500 to-yellow-600";
  //   return "from-red-500 to-red-600";
  // };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 max-w-full">
      {/* Enhanced Health Score Card */}
      {healthScore && (
        <div
          className={`${getScoreBg(
            healthScore.score
          )} p-6 sm:p-8 rounded-2xl border-2 shadow-xl`}
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <div
                className={`text-5xl sm:text-6xl font-black ${getScoreColor(
                  healthScore.score
                )} mb-2`}
              >
                {healthScore.score}
                <span className="text-2xl sm:text-3xl">/100</span>
              </div>
              <div className="text-lg sm:text-xl text-gray-700 font-semibold">
                Health Score
              </div>
            </div>

            {/* Score breakdown */}
            {healthScore.breakdown && (
              <div className="flex justify-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    {healthScore.breakdown.good}
                  </div>
                  <div className="text-xs text-gray-600">Good</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-600">
                    {healthScore.breakdown.neutral}
                  </div>
                  <div className="text-xs text-gray-600">Neutral</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-red-600">
                    {healthScore.breakdown.bad}
                  </div>
                  <div className="text-xs text-gray-600">Bad</div>
                </div>
              </div>
            )}

            {processingTime && (
              <div className="text-sm text-gray-600 bg-white bg-opacity-50 rounded-lg px-3 py-1 inline-block">
                ⚡ Analyzed in {processingTime}ms
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Allergens Alert */}
      {allergens && allergens.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 shadow-lg">
          <h3 className="font-bold text-red-800 mb-4 text-base sm:text-lg flex items-center gap-2">
            ⚠️ Allergen Alert
            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
              {allergens.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {allergens.map((allergen, idx) => (
              <span
                key={idx}
                className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold border border-red-200 shadow-sm"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Detailed Analysis */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
        <h2 className="font-bold text-green-800 text-lg sm:text-xl flex items-center gap-3">
          🧠 Detailed Analysis
          <span className="text-sm font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {analysis?.length || 0} ingredients
          </span>
        </h2>

        <div className="grid gap-3 sm:gap-4">
          {Array.isArray(analysis) &&
            analysis.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-102"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-1 capitalize">
                    {item.ingredient}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                      item.status === "Good"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : item.status === "Bad"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3">
                  {item.reason}
                </p>
                {item.concerns && item.concerns.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.concerns.map((concern, cidx) => (
                      <span
                        key={cidx}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs border"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Summary footer */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-700">
          💡 <strong>Analysis complete!</strong> Make informed choices for
          better health.
        </p>
      </div>
    </div>
  );
};

export default AnalysisResult;
