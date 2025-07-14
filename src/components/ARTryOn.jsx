import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, RotateCcw, Move3D, Maximize2 } from 'lucide-react';

const ARTryOn = ({ productType, modelUrl, onClose }) => {
  const [arActive, setArActive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure camera permissions are granted.');
      setIsLoading(false);
    }
  };

  const handleStartAR = () => {
    setArActive(true);
    setModelLoaded(true);
    // Simulate model loading
    setTimeout(() => {
      setModelLoaded(true);
    }, 1000);
  };

  const handleStopAR = () => {
    setArActive(false);
    setModelLoaded(false);
  };

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Create download link
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ar-preview-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const getARText = () => {
    switch (productType) {
      case 'apparel':
        return {
          title: 'Virtual Try-On',
          instruction: 'Point your camera at yourself to see how the item looks on you',
          actionText: 'Try It On'
        };
      case 'furniture':
        return {
          title: 'View in Your Space',
          instruction: 'Point your camera at the floor to place the furniture in your room',
          actionText: 'Place in Room'
        };
      default:
        return {
          title: 'AR Preview',
          instruction: 'Point your camera to view the product in AR',
          actionText: 'Start AR'
        };
    }
  };

  const arText = getARText();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Initializing AR...</p>
          <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">AR Not Available</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* AR Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          <button
            onClick={onClose}
            className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            <span className="text-sm font-medium">{arText.title}</span>
          </div>
        </div>

        {/* Center Instructions */}
        {!arActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="bg-black bg-opacity-70 text-white p-8 rounded-2xl text-center max-w-sm mx-4">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">{arText.title}</h3>
              <p className="text-gray-300 mb-6">{arText.instruction}</p>
              <button
                onClick={handleStartAR}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full"
              >
                {arText.actionText}
              </button>
            </div>
          </div>
        )}

        {/* AR Active State */}
        {arActive && (
          <>
            {/* Loading Model */}
            {!modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-70 text-white p-6 rounded-2xl text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg">Loading 3D model...</p>
                </div>
              </div>
            )}

            {/* AR Guides */}
            {modelLoaded && (
              <div className="absolute inset-0">
                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 border-2 border-white border-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Ground plane indicator for furniture */}
                {productType === 'furniture' && (
                  <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
                    <div className="w-32 h-32 border-2 border-blue-400 border-dashed rounded-full bg-blue-400 bg-opacity-20 flex items-center justify-center">
                      <div className="text-white text-sm font-medium">Place here</div>
                    </div>
                  </div>
                )}

                {/* Virtual model placeholder */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-24 h-24 bg-blue-500 bg-opacity-30 rounded-lg border-2 border-blue-400 border-dashed flex items-center justify-center">
                    <div className="text-white text-xs">3D Model</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-4 right-4 flex justify-center space-x-4 pointer-events-auto">
          {arActive && modelLoaded && (
            <>
              <button
                onClick={handleTakePhoto}
                className="bg-white bg-opacity-90 text-black p-4 rounded-full hover:bg-opacity-100 transition-colors shadow-lg"
              >
                <Camera size={24} />
              </button>
              <button
                onClick={handleStopAR}
                className="bg-red-600 bg-opacity-90 text-white p-4 rounded-full hover:bg-opacity-100 transition-colors shadow-lg"
              >
                <RotateCcw size={24} />
              </button>
            </>
          )}
        </div>

        {/* Model Info */}
        {arActive && modelLoaded && (
          <div className="absolute top-20 left-4 right-4 pointer-events-auto">
            <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">Model loaded successfully</div>
              <div className="text-xs text-gray-300">
                {productType === 'apparel' ? 'Move closer to see details' : 'Tap to place object'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARTryOn;