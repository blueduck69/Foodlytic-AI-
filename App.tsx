
import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, ScanLine, Type, History, AlertCircle, Leaf } from 'lucide-react';
import Scanner from './components/Scanner';
import ManualInput from './components/ManualInput';
import Results from './components/Results';
import { analyzeFoodIngredients } from './services/geminiService';
import { FoodAnalysis } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (input: string | { data: string; mimeType: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const isImage = typeof input !== 'string';
      const data = await analyzeFoodIngredients(input, isImage);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please ensure the text is clear or try manual entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 font-sans text-gray-900 bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 bg-green-600 text-white rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800">
              Food<span className="text-green-600">lytic</span> AI
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-500">
            <a href="#" className="hover:text-green-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-green-600 transition-colors">Safety Standards</a>
            <button className="bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
              <History size={16} /> History
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            Know exactly what you're eating.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Instantly decode complicated food labels. Our AI identifies hidden chemicals, preservatives, and potential health risks.
          </p>
        </div>

        {/* Action Tabs */}
        {!result && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-200/50 p-1.5 rounded-2xl flex gap-1">
              <button 
                onClick={() => setActiveTab('scan')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'scan' ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:bg-gray-300/50'}`}
              >
                <ScanLine size={18} /> Label Scanner
              </button>
              <button 
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:bg-gray-300/50'}`}
              >
                <Type size={18} /> Manual Entry
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-700 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="flex-shrink-0" />
            <p className="font-semibold">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-xs underline font-bold uppercase tracking-widest">Dismiss</button>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-12">
          {!result ? (
            <div className="max-w-2xl mx-auto">
              {activeTab === 'scan' ? (
                <Scanner onScan={handleAnalysis} isLoading={isLoading} />
              ) : (
                <ManualInput onAnalyze={handleAnalysis} isLoading={isLoading} />
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <button 
                  onClick={() => { setResult(null); setError(null); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full transition-colors flex items-center gap-2 shadow-sm"
                >
                  <ScanLine size={16} /> Scan Another Product
                </button>
              </div>
              <Results data={result} />
            </>
          )}
        </div>

        {/* Footer info blocks if no results yet */}
        {!result && !isLoading && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <HeartPulse size={20} />
              </div>
              <h4 className="font-bold">Identify Harmful Dyes</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Find artificial colors linked to hyperactivity in children like E102, E129, and more.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold">Check Preservatives</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Understand the role of Sodium Benzoate, Nitrates, and BHA in your favorite snacks.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold">Better Alternatives</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Get personalized recommendations for cleaner, whole-food options with fewer additives.</p>
            </div>
          </div>
        )}
      </main>

      {/* Floating Support Info */}
      <footer className="mt-32 border-t border-gray-200 py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="p-1.5 bg-green-600 text-white rounded-lg"><ShieldCheck size={18} /></div>
             <span className="font-bold text-gray-400">Foodlytic AI v1.0</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            This tool is for educational purposes only. Always consult a healthcare professional for dietary advice or medical concerns. Safety data derived from WHO, FDA, and EFSA guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
