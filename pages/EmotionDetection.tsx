
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { analyzeEmotionWithBackend, saveMoodToBackend } from '../services/api';
import { EmotionResult } from '../types';

const EmotionDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    setResult(null);
    setError(null);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Image = dataUrl.split(',')[1];
      
      const analysis = await analyzeEmotionWithBackend(base64Image);
      if (analysis) {
        setResult(analysis);
        // Automatically save to backend database
        await saveMoodToBackend(100 - analysis.stressLevel, analysis.emotion);
      } else {
        throw new Error("Backend analysis failed");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to reach Flask server. Ensure main.py is running on port 5000.");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Smart Emotion Scan</h1>
        <p className="text-slate-600">Using Flask Vision API to track your emotional trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-white">
          {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center z-20 bg-slate-900/80">
              <i className="fas fa-exclamation-triangle text-4xl mb-4 text-red-500"></i>
              <p className="font-bold text-sm">{error}</p>
              <button onClick={startCamera} className="mt-4 bg-indigo-500 px-4 py-2 rounded-lg">Retry Camera</button>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover transform scale-x-[-1] ${isScanning ? 'opacity-50' : ''}`} 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <button
              onClick={captureAndAnalyze}
              disabled={isScanning || !stream}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-xl
                ${isScanning ? 'bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95'}
              `}
            >
              <i className={`fas ${isScanning ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
              <span>{isScanning ? 'Syncing...' : 'Scan & Save'}</span>
            </button>
          </div>

          {isScanning && (
            <div className="absolute inset-0 border-4 border-indigo-500 animate-pulse pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.8)] animate-[scan_2s_infinite]"></div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!result && !isScanning && (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-400">
              <i className="fas fa-database text-5xl mb-4"></i>
              <p>Your scan results will be automatically saved to your history.</p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Live Result</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-slate-900 capitalize">{result.emotion}</span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Saved!</span>
                  </div>
                </div>
                <div className="text-5xl">
                   {result.stressLevel > 70 ? '😟' : '😊'}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">Stress Intensity</span>
                    <span className="text-lg font-bold text-indigo-600">{result.stressLevel}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000"
                      style={{ width: `${result.stressLevel}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="text-slate-900 font-bold mb-2 flex items-center space-x-2">
                    <i className="fas fa-brain text-indigo-500"></i>
                    <span>MindCare Response</span>
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.advice}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EmotionDetection;
