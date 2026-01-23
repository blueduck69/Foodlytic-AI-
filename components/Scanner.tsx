
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Sparkles, Lock, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import { LanguageCode } from '../types';
import { uiTranslations } from '../translations';

interface ScannerProps {
  onScan: (data: { data: string; mimeType: string }) => void;
  isLoading: boolean;
  language: LanguageCode;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, isLoading, language }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [error, setError] = useState<{ type: 'permission' | 'other'; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef<boolean>(false);
  
  const langRef = useRef(language);
  useEffect(() => {
    langRef.current = language;
  }, [language]);

  const t = uiTranslations[language];

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (isStartingRef.current) return;
    if (streamRef.current?.active) return;
    
    isStartingRef.current = true;
    setError(null);

    // Attempt with high quality first, fallback to basic if it fails
    const attemptStream = async (constraints: MediaStreamConstraints) => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await new Promise((resolve) => {
            if (videoRef.current) videoRef.current.onloadedmetadata = resolve;
          });
          await videoRef.current?.play();
          return true;
        }
      } catch (e) {
        return false;
      }
      return false;
    };

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      // Try High-Def first
      let success = await attemptStream({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });

      // Try Standard-Def fallback
      if (!success) {
        success = await attemptStream({
          video: { facingMode: 'environment' }
        });
      }

      if (!success) throw new Error("Could not initialize camera stream.");

    } catch (err: any) {
      const errorName = err.name || '';
      const errorMessage = err.message || '';
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorMessage.toLowerCase().includes('denied')) {
        setError({ type: 'permission', message: t.cameraDenied });
      } else {
        setError({ type: 'other', message: errorMessage || "Unknown camera hardware error." });
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [t.cameraDenied]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
        const base64 = dataUrl.split(',')[1];
        onScan({ data: base64, mimeType: 'image/jpeg' });
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        onScan({ data: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500">
      <div className="flex border-b border-gray-50 bg-gray-50/30">
        <button 
          type="button"
          onClick={() => setMode('camera')}
          className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'camera' ? 'bg-white text-green-700 shadow-[inset_0_-3px_0_0_rgba(21,128,61,1)]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
        >
          <Camera size={18} /> {t.scanTab}
        </button>
        <button 
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'upload' ? 'bg-white text-green-700 shadow-[inset_0_-3px_0_0_rgba(21,128,61,1)]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
        >
          <Upload size={18} /> {t.uploadInstead.split(' ')[0]}
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {mode === 'camera' ? (
          <div className="relative aspect-[4/3] sm:aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner group">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-y-auto">
                {error.type === 'permission' ? (
                  <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex p-4 bg-red-500/10 rounded-3xl mb-4 border border-red-500/20">
                      <Lock className="text-red-400" size={32} />
                    </div>
                    <h4 className="text-xl font-black mb-2 text-red-50">Permission Denied</h4>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                      To scan food labels, we need camera access. Don't worry, we don't save your photos.
                    </p>
                    
                    <div className="bg-white/5 rounded-2xl p-4 text-left mb-6 border border-white/10">
                      <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Settings size={12} /> How to fix:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex gap-3 text-xs text-gray-300 items-start">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                          <span>Click the <strong className="text-white">Lock icon</strong> in your browser's address bar.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-gray-300 items-start">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                          <span>Ensure <strong className="text-white">Camera</strong> is set to "Allow".</span>
                        </li>
                        <li className="flex gap-3 text-xs text-gray-300 items-start">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                          <span>Refresh this page to start scanning.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        type="button"
                        onClick={() => { stopCamera(); startCamera(); }}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 active:scale-95"
                      >
                        <RefreshCw size={18} /> {t.retryCamera}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setMode('upload')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Upload size={16} /> {t.uploadInstead}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <HelpCircle className="text-yellow-400 mb-4" size={48} />
                    <p className="text-lg font-bold mb-4">{error.message}</p>
                    <button 
                      onClick={() => setMode('upload')}
                      className="px-8 py-3 bg-green-600 rounded-xl font-bold"
                    >
                      {t.uploadInstead}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                muted
                playsInline 
                className="w-full h-full object-cover"
              />
            )}
            
            {!isLoading && !error && (
              <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
                <button 
                  type="button"
                  onClick={captureImage}
                  className="bg-white text-green-700 px-10 py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black z-10 border-4 border-green-50/50"
                >
                  <Sparkles className="text-green-500" size={24} /> 
                  <span className="text-lg uppercase tracking-tight">{t.analyzeBtn}</span>
                </button>
              </div>
            )}
            
            {!error && !isLoading && (
               <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[80%] h-[60%] border-2 border-white/20 border-dashed rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 -translate-x-1 -translate-y-1 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 translate-x-1 -translate-y-1 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 -translate-x-1 translate-y-1 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 translate-x-1 translate-y-1 rounded-br-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Align Ingredients Label</p>
                    </div>
                  </div>
               </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-green-50/50 hover:border-green-300 transition-all cursor-pointer group relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="hidden" 
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-6 w-full z-10">
              <div className="p-8 bg-green-100 rounded-full text-green-600 shadow-xl group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                <Upload size={48} />
              </div>
              <div className="text-center px-8">
                <p className="text-2xl font-black text-gray-800 mb-2">{t.uploadInstead}</p>
                <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">Choose a clear photo from your gallery to analyze hidden additives instantly.</p>
              </div>
            </label>
            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200 group-hover:translate-x-2 group-hover:text-green-300 transition-all" size={40} />
          </div>
        )}

        {isLoading && (
          <div className="mt-10 flex flex-col items-center justify-center gap-5 text-green-600">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
               <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-400" size={20} />
            </div>
            <div className="text-center">
              <p className="font-black text-2xl tracking-tight mb-1">{t.scanning}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Identifying Chemicals & Additives</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Scanner;
