
import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';

interface ManualInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const ManualInput: React.FC<ManualInputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');

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
        <h3 className="text-lg font-bold text-gray-800">Manual Ingredient List</h3>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste ingredients here... (e.g., Sugar, Wheat Flour, Sodium Benzoate, Yellow 5...)"
        className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
      />
      <button
        disabled={isLoading || !text.trim()}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {isLoading ? 'Analyzing...' : 'Analyze Ingredients'}
      </button>
    </form>
  );
};

export default ManualInput;
