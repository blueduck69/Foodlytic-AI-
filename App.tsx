
import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, ScanLine, Type, History, AlertCircle, Leaf, Globe, ChevronDown } from 'lucide-react';
import Scanner from './components/Scanner';
import ManualInput from './components/ManualInput';
import Results from './components/Results';
import { analyzeFoodIngredients } from './services/geminiService';
import { FoodAnalysis, LanguageCode, SUPPORTED_LANGUAGES } from './types';
import { uiTranslations } from './translations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = uiTranslations[language];

  const handleAnalysis = async (input: string | { data: string; mimeType: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const isImage = typeof input !== 'string';
      const data = await analyzeFoodIngredients(input, isImage, language);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please ensure the text is clear or try manual entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);

  return (
    <div className="min-h-screen pb-12 font-sans text-gray-900 bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setResult(null); setError(null); }}>
            <div className="p-2 bg-green-600 text-white rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800 hidden sm:block">
              Food<span className="text-green-600">lytic</span> AI
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors"
              >
                <Globe size={18} className="text-green-600" />
                <span className="hidden xs:inline">{currentLang?.nativeName}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in duration-200">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                        if (result) {
                           // Option: Re-analyze or just keep existing until next scan
                        }
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-green-50 flex items-center justify-between ${language === lang.code ? 'text-green-700 bg-green-50' : 'text-gray-600'}`}
                    >
                      <span>{lang.nativeName}</span>
                      {language === lang.code && <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-500">
              <a href="#" className="hover:text-green-600 transition-colors">{t.howItWorks}</a>
              <button className="bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2">
                <History size={16} /> {t.history}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            {t.heroTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            {t.heroSubtitle}
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
                <ScanLine size={18} /> {t.scanTab}
              </button>
              <button 
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:bg-gray-300/50'}`}
              >
                <Type size={18} /> {t.manualTab}
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
                <Scanner onScan={handleAnalysis} isLoading={isLoading} language={language} />
              ) : (
                <ManualInput onAnalyze={handleAnalysis} isLoading={isLoading} language={language} />
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <button 
                  onClick={() => { setResult(null); setError(null); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full transition-colors flex items-center gap-2 shadow-sm"
                >
                  <ScanLine size={16} /> {t.anotherProduct}
                </button>
              </div>
              <Results data={result} language={language} />
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
              <h4 className="font-bold">{t.dyesTitle}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{t.dyesDesc}</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold">{t.preservativesTitle}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{t.preservativesDesc}</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold">{t.alternativesTitle}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{t.alternativesDesc}</p>
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
            {t.disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
