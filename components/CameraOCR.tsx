'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';

interface CameraOCRProps {
  onResult: (value: string) => void;
  onClose: () => void;
  className?: string;
}

export default function CameraOCR({ onResult, onClose, className = '' }: CameraOCRProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('Kamera tidak didukung di browser ini');
      return;
    }

    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(true);

    // Process OCR
    processOCR(imageData);
  };

  const processOCR = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Use fallback OCR service
      const { FallbackOCR, ImageProcessor } = await import('../lib/ocrService');
      
      // Preprocess image for better recognition
      const processedImage = await ImageProcessor.preprocessImage(imageData);
      
      // Process OCR
      const result = await FallbackOCR.recognizeText(processedImage);
      setOcrResult(result);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError('Gagal memproses gambar. Coba ambil foto lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setError(null);
    setIsCapturing(false);
  };

  const confirmResult = () => {
    if (ocrResult) {
      onResult(ocrResult);
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isSupported) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Kamera Tidak Didukung
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Browser Anda tidak mendukung akses kamera. Silakan gunakan input manual.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Foto Meteran
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="relative">
          {!capturedImage ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed rounded-lg p-4">
                  <p className="text-white text-sm text-center">
                    Arahkan kamera ke meteran
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured meter"
                className="w-full h-64 object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Memproses gambar...</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* OCR Result */}
        {ocrResult && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Nilai Terdeteksi:
                </span>
              </div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {ocrResult} kWh
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!capturedImage ? (
            <div className="flex space-x-3">
              <button
                onClick={capturePhoto}
                disabled={!stream}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Ambil Foto</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Foto Ulang</span>
              </button>
              {ocrResult && (
                <button
                  onClick={confirmResult}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Gunakan</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tips Foto Meteran:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Pastikan meteran terlihat jelas</li>
            <li>• Hindari bayangan dan pantulan</li>
            <li>• Jaga jarak yang cukup</li>
            <li>• Tunggu hingga angka stabil</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
