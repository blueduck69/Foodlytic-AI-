
import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Info, 
  Leaf, 
  Baby, 
  HeartPulse, 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { FoodAnalysis, HealthLabel, SafetyLevel } from '../types';

interface ResultsProps {
  data: FoodAnalysis;
}

const Results: React.FC<ResultsProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 4) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getSafetyIcon = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE: return <ShieldCheck className="text-green-500" size={20} />;
      case SafetyLevel.CAUTION: return <ShieldAlert className="text-yellow-500" size={20} />;
      case SafetyLevel.AVOID: return <ShieldX className="text-red-500" size={20} />;
    }
  };

  const getSafetyBadge = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE: return 'bg-green-100 text-green-800';
      case SafetyLevel.CAUTION: return 'bg-yellow-100 text-yellow-800';
      case SafetyLevel.AVOID: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Score Section */}
      <div className={`p-8 rounded-3xl border-2 flex flex-col md:flex-row items-center gap-8 shadow-sm ${getScoreColor(data.score)}`}>
        <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64" cy="64" r="58"
              stroke="currentColor" strokeWidth="8"
              fill="transparent" className="opacity-10"
            />
            <circle
              cx="64" cy="64" r="58"
              stroke="currentColor" strokeWidth="8"
              fill="transparent"
              strokeDasharray={364.4}
              strokeDashoffset={364.4 - (364.4 * data.score) / 10}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{data.score}</span>
            <span className="text-xs uppercase tracking-widest font-semibold opacity-70">Score</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Verdict: {data.label}</h2>
          <p className="text-lg opacity-90 leading-relaxed font-medium">
            {data.verdict}
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detected Ingredients */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info className="text-blue-500" /> Detected Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.ingredients.map((ing, idx) => (
              <div key={idx} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex flex-col">
                <span className="font-bold">{ing.name}</span>
                {ing.code && <span className="text-[10px] text-gray-500 uppercase">{ing.code}</span>}
                <span className="text-[10px] text-blue-600 font-bold">{ing.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <HeartPulse className="text-rose-500" /> Health Insights
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600 h-fit"><Baby size={18} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">For Children</p>
                <p className="text-sm font-medium text-gray-700">{data.healthInsights.childrenFriendly}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600 h-fit"><Leaf size={18} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Pregnancy Safety</p>
                <p className="text-sm font-medium text-gray-700">{data.healthInsights.pregnancySafe}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 h-fit"><AlertTriangle size={18} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Allergy Warnings</p>
                <p className="text-sm font-medium text-gray-700">{data.healthInsights.allergies}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Additives Deep Dive */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" /> Additive Safety Breakdown
        </h3>
        <div className="space-y-6">
          {data.additives.length > 0 ? data.additives.map((add, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-start">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                {getSafetyIcon(add.safetyLevel)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-800">{add.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSafetyBadge(add.safetyLevel)}`}>
                    {add.safetyLevel}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div><span className="text-gray-400 font-semibold mr-1">Purpose:</span> {add.purpose}</div>
                  <div><span className="text-gray-400 font-semibold mr-1">Regulator:</span> {add.regulatoryStatus}</div>
                  <div className="md:col-span-2 mt-1 italic text-gray-600">
                    <span className="text-gray-400 font-semibold not-italic mr-1">Impact:</span> {add.sideEffects}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-500">No harmful additives detected! Great choice.</div>
          )}
        </div>
      </div>

      {/* Alternatives */}
      <div className="bg-green-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <ChefHat className="absolute -right-4 -bottom-4 opacity-10 w-48 h-48" />
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles size={24} /> Healthier Alternatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.alternatives.map((alt, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="text-green-300 mt-1 flex-shrink-0" size={18} />
                <span className="font-medium text-sm">{alt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
