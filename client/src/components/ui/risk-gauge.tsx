/**
 * Risk Gauge Component
 * Visual representation of policy risk level
 */

interface RiskGaugeProps {
  riskLevel: "Low" | "Medium" | "High";
  score?: number; // 0-100
}

export function RiskGauge({ riskLevel, score }: RiskGaugeProps) {
  const riskScore = score || (riskLevel === "High" ? 75 : riskLevel === "Medium" ? 50 : 25);
  const rotation = (riskScore / 100) * 180 - 90; // -90 to 90 degrees
  
  const color = riskLevel === "High" 
    ? "from-red-500 to-pink-600" 
    : riskLevel === "Medium" 
    ? "from-amber-500 to-orange-600" 
    : "from-emerald-500 to-green-600";
    
  const textColor = riskLevel === "High" 
    ? "text-red-600" 
    : riskLevel === "Medium" 
    ? "text-amber-600" 
    : "text-emerald-600";

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Gauge background */}
      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(riskScore / 100) * 251} 251`}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={riskLevel === "High" ? "stop-red-500" : riskLevel === "Medium" ? "stop-amber-500" : "stop-emerald-500"} />
              <stop offset="100%" className={riskLevel === "High" ? "stop-pink-600" : riskLevel === "Medium" ? "stop-orange-600" : "stop-green-600"} />
            </linearGradient>
          </defs>
          
          {/* Needle */}
          <g transform="translate(100, 90)">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-65"
              stroke="#374151"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}
              className="transition-transform duration-1000 ease-out"
            />
            <circle cx="0" cy="0" r="6" fill="#374151" />
            <circle cx="0" cy="0" r="3" fill="white" />
          </g>
        </svg>
      </div>
      
      {/* Score display */}
      <div className="text-center -mt-4">
        <div className={`text-4xl font-bold ${textColor}`}>
          {riskScore}
        </div>
        <div className="text-sm font-semibold text-muted-foreground mt-1">
          Risk Score
        </div>
        <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mt-2 ${
          riskLevel === "High" 
            ? "bg-red-100 text-red-700" 
            : riskLevel === "Medium" 
            ? "bg-amber-100 text-amber-700" 
            : "bg-emerald-100 text-emerald-700"
        }`}>
          {riskLevel} Risk
        </div>
      </div>
    </div>
  );
}
