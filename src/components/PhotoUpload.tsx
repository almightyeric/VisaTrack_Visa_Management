import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Loader, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PhotoUploadProps {
  currentPhotoUrl: string | null;
  onPhotoSelected: (file: File) => void;
  onPhotoRemoved: () => void;
  onOCRComplete?: (data: any) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  onPhotoRemoved,
  onOCRComplete,
}) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [showCamera, setShowCamera] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const extractVisaInfo = async (imageDataUrl: string) => {
    setIsExtracting(true);
    setExtractionMessage(t('analyzing'));

    try {
      const base64Data = imageDataUrl.split(',')[1];
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/extract-visa-info`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
          }),
        }
      );

      const result = await response.json();

      if (result.extracted && result.data) {
        setExtractionMessage(`✅ ${t('extracted')} ${t('confirmInfo')}`);
        if (onOCRComplete) {
          onOCRComplete(result.data);
        }
      } else {
        setExtractionMessage(result.message || `⚠️ ${t('fillManually')}`);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setExtractionMessage(`⚠️ ${t('extractionFailed')}`);
    } finally {
      setTimeout(() => {
        setIsExtracting(false);
        setExtractionMessage('');
      }, 3000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onPhotoSelected(file);

        await extractVisaInfo(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `visa-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setPreview(dataUrl);
            onPhotoSelected(file);
            stopCamera();

            await extractVisaInfo(dataUrl);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('visaPhoto')}
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Visa preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {isExtracting && (
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex flex-col items-center justify-center gap-3">
              <Loader className="w-8 h-8 text-white animate-spin" />
              <p className="text-white text-sm font-medium px-4 text-center">
                {extractionMessage}
              </p>
            </div>
          )}

          {extractionMessage && !isExtracting && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">{extractionMessage}</p>
            </div>
          )}
        </div>
      ) : showCamera ? (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-lg border-2 border-blue-500"
            />
            <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs p-2 rounded text-center">
              {t('positionVisa')}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {t('capturePhoto')}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">
              {t('smartRecognition')}
            </p>
            <p className="text-gray-600 mb-4 text-sm">
              {t('uploadOrCapture')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Upload className="w-5 h-5" />
                {t('uploadPhoto')}
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Camera className="w-5 h-5" />
                {t('takePhoto')}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-4">
              {t('supported')}: JPG, PNG, WebP (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
