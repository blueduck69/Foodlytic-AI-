
import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { LanguageCode } from '../types';
import { uiTranslations } from '../translations';

interface ManualInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  language: LanguageCode;
}

const ManualInput: React.FC<ManualInputProps> = ({ onAnalyze, isLoading, language }) => {
  const [text, setText] = useState('');
  const t = uiTranslations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAnalyze(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <FileText size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{t.manualTitle}</h3>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
      />
      <button
        disabled={isLoading || !text.trim()}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {isLoading ? t.scanning.replace('...', '') : t.analyzeBtn}
      </button>
    </form>
  );
};

export default ManualInput;
