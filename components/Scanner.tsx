
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Sparkles, Lock } from 'lucide-react';
import { LanguageCode } from '../types';
import { uiTranslations } from '../translations';

interface ScannerProps {
  onScan: (data: { data: string; mimeType: string }) => void;
  isLoading: boolean;
  language: LanguageCode;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, isLoading, language }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef<boolean>(false);
  
  const t = uiTranslations[language];

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Prevent multiple simultaneous attempts
    if (isStartingRef.current) return;
    if (streamRef.current?.active) return;
    
    isStartingRef.current = true;
    setError(null);

    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for metadata to load before playing
        await new Promise((resolve) => {
          if (videoRef.current) videoRef.current.onloadedmetadata = resolve;
        });
        await videoRef.current?.play();
      }
    } catch (err: any) {
      console.error("Scanner Error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('denied')) {
        setError(uiTranslations[language].cameraDenied);
      } else {
        setError("Camera error: " + (err.message || "Unknown error"));
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [language]);

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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="flex border-b">
        <button 
          type="button"
          onClick={() => setMode('camera')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'camera' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Camera size={18} /> {t.scanTab}
        </button>
        <button 
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'upload' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Upload size={18} /> {t.uploadInstead.split(' ')[0]}
        </button>
      </div>

      <div className="p-6">
        {mode === 'camera' ? (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-gray-200">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center bg-gray-900/90 backdrop-blur-sm">
                <Lock className="text-red-400 mb-4" size={48} />
                <h4 className="text-xl font-bold mb-2">Camera Access Required</h4>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button"
                    onClick={() => { stopCamera(); startCamera(); }}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RefreshCw size={16} /> {t.retryCamera}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode('upload')}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                  >
                    {t.uploadInstead}
                  </button>
                </div>
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
              <button 
                type="button"
                onClick={captureImage}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-green-700 px-8 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black z-10 border-2 border-green-100"
              >
                <Sparkles className="text-green-500" size={20} /> {t.analyzeBtn}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-green-300 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="hidden" 
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="p-5 bg-green-100 rounded-full text-green-600">
                <Upload size={32} />
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-gray-700">{t.uploadInstead}</p>
                <p className="text-sm text-gray-400">Select a clear photo of the ingredient list</p>
              </div>
            </label>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-3 text-green-600 font-bold text-lg">
            <RefreshCw className="animate-spin" size={24} />
            {t.scanning}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Scanner;
