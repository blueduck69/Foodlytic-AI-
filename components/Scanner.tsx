
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface ScannerProps {
  onScan: (data: { data: string; mimeType: string }) => void;
  isLoading: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, isLoading }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied or not available. Please try uploading an image.");
      setMode('upload');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
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

  React.useEffect(() => {
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
          onClick={() => setMode('camera')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'camera' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Camera size={18} /> Camera Scan
        </button>
        <button 
          onClick={() => setMode('upload')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'upload' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Upload size={18} /> Upload Image
        </button>
      </div>

      <div className="p-6">
        {mode === 'camera' ? (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner ring-1 ring-gray-900/5">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <AlertCircle className="text-red-400 mb-2" size={48} />
                <p>{error}</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            )}
            {!isLoading && !error && (
              <button 
                onClick={captureImage}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-green-700 p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold"
              >
                <Sparkles size={20} /> Analyze Label
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-300 transition-colors bg-gray-50 group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="hidden" 
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="p-4 bg-green-100 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">Choose a photo</p>
                <p className="text-sm text-gray-500">Take a clear photo of the ingredients list</p>
              </div>
            </label>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-3 text-green-600 animate-pulse font-medium">
            <RefreshCw className="animate-spin" size={20} />
            AI is analyzing your food...
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Scanner;
