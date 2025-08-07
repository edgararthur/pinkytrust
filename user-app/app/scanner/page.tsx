'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CameraIcon,
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  XMarkIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedButton, EnhancedCard, EnhancedBadge } from '@/components/ui/EnhancedComponents';

interface ScanHistory {
  id: string;
  eventName: string;
  scanTime: string;
  eventDate: string;
  location: string;
  status: 'success' | 'error';
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([
    {
      id: '1',
      eventName: 'Free Breast Cancer Screening',
      scanTime: '10:30 AM',
      eventDate: 'Today',
      location: 'Community Health Center',
      status: 'success',
    },
    {
      id: '2',
      eventName: 'Awareness Workshop',
      scanTime: '2:15 PM',
      eventDate: 'Yesterday',
      location: 'Women\'s Wellness Center',
      status: 'success',
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanResultDetails, setScanResultDetails] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if flashlight is available
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setHasFlashlight('torch' in capabilities);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);

        // Start continuous scanning
        videoRef.current.onloadedmetadata = () => {
          startContinuousScanning();
        };
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions and try again.');
      console.error('Camera access error:', err);
    }
  };

  const startContinuousScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      scanFrame();
    }, 500); // Scan every 500ms
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Simulate QR code detection (in a real app, you'd use a QR scanning library like @zxing/library)
    // For now, we'll simulate finding a QR code occasionally
    if (Math.random() < 0.1) { // 10% chance per scan
      const mockQRData = generateMockQRData();
      handleScanResult(mockQRData.url, mockQRData);
    }
  };

  const generateMockQRData = () => {
    const mockData = [
      {
        url: 'https://pinkytrust.org/events/screening-2024',
        type: 'event',
        title: 'Free Breast Cancer Screening',
        description: 'Annual community screening event',
        location: 'Community Health Center',
        date: new Date().toISOString(),
        organizer: 'PinkyTrust Foundation'
      },
      {
        url: 'https://pinkytrust.org/resources/self-exam-guide',
        type: 'resource',
        title: 'Self-Examination Guide',
        description: 'Step-by-step breast self-examination instructions',
        category: 'Education'
      },
      {
        url: 'https://pinkytrust.org/support/emergency-contacts',
        type: 'emergency',
        title: 'Emergency Support Contacts',
        description: 'Quick access to support hotlines and emergency contacts'
      }
    ];

    return mockData[Math.floor(Math.random() * mockData.length)];
  };

  const stopScanning = () => {
    // Clear scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Turn off flashlight
    if (flashlightOn) {
      toggleFlashlight();
    }

    setIsScanning(false);
  };

  const handleScanResult = (result: string, details?: any) => {
    setScanResult(result);
    setScanResultDetails(details);
    setShowResultModal(true);

    // Add to scan history
    const newScan: ScanHistory = {
      id: Date.now().toString(),
      eventName: details?.title || 'QR Code Scan',
      scanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventDate: 'Today',
      location: details?.location || 'Unknown Location',
      status: 'success',
    };

    setScanHistory(prev => [newScan, ...prev]);
    stopScanning();
  };

  const toggleFlashlight = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !flashlightOn } as any]
      });
      setFlashlightOn(!flashlightOn);
    } catch (err) {
      console.error('Flashlight toggle failed:', err);
    }
  };

  const handleResultAction = (action: string) => {
    if (!scanResultDetails) return;

    switch (action) {
      case 'open':
        window.open(scanResult || '', '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(scanResult || '');
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: scanResultDetails.title,
            text: scanResultDetails.description,
            url: scanResult || '',
          });
        }
        break;
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Simulate QR scanning (in a real app, you'd use a QR scanning library)
  const simulateScan = () => {
    setTimeout(() => {
      handleScanResult('https://example.com/event/check-in/12345');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 safe-area-inset-top">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">QR Scanner</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="text-center">
            <QrCodeIcon className="mx-auto h-16 w-16 text-primary-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Check-in</h2>
            <p className="text-sm text-gray-600 mb-6">
              Scan the QR code at event locations to check in
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Check-in Successful!</span>
                </div>
                <p className="text-xs text-green-700">
                  You have successfully checked into the event.
                </p>
                <button
                  onClick={resetScan}
                  className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Scan Another Code
                </button>
              </div>
            )}

            {!isScanning && !scanResult && (
              <div className="space-y-4">
                <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Camera view will appear here</p>
                  </div>
                </div>
                
                <button
                  onClick={startScanning}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Start Scanning
                </button>
              </div>
            )}

            {isScanning && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-80 h-80 mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Animated Scanning overlay */}
                  <div className="absolute inset-0">
                    {/* Corner brackets */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary-400"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary-400"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary-400"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary-400"></div>

                    {/* Scanning line animation */}
                    <motion.div
                      className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
                      animate={{ y: [16, 304, 16] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Center crosshair */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 border-2 border-primary-400 rounded-full opacity-50"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Flashlight control */}
                  {hasFlashlight && (
                    <button
                      onClick={toggleFlashlight}
                      className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 ${
                        flashlightOn
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      <LightBulbIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-gray-700">Position QR code within the frame</p>
                  <p className="text-xs text-gray-500">Scanning automatically...</p>
                </div>

                <div className="flex space-x-3">
                  <EnhancedButton
                    variant="secondary"
                    size="lg"
                    onClick={stopScanning}
                    className="flex-1"
                    icon={XMarkIcon}
                  >
                    Cancel
                  </EnhancedButton>
                  <EnhancedButton
                    variant="primary"
                    size="lg"
                    onClick={simulateScan}
                    className="flex-1"
                    icon={QrCodeIcon}
                  >
                    Simulate Scan
                  </EnhancedButton>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Check-ins</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {scanHistory.map((scan) => (
              <div key={scan.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{scan.eventName}</h4>
                    <p className="text-xs text-gray-600 mt-1">{scan.location}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{scan.scanTime} • {scan.eventDate}</span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    {scan.status === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scanHistory.length === 0 && (
            <div className="p-8 text-center">
              <QrCodeIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No check-ins yet</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-medium text-blue-900 text-sm mb-2">How to use QR Scanner:</h4>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Tap "Start Scanning" to activate your camera</li>
            <li>• Point your camera at the QR code at event locations</li>
            <li>• The app will automatically detect and process the code</li>
            <li>• You'll receive confirmation of successful check-in</li>
          </ul>
        </div>
      </div>

      {/* Scan Result Modal */}
      <AnimatePresence>
        {showResultModal && scanResultDetails && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">QR Code Scanned</h3>
                      <p className="text-sm text-gray-500">Successfully detected</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowResultModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <EnhancedCard className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{scanResultDetails.title}</h4>
                        <p className="text-sm text-gray-600">{scanResultDetails.description}</p>
                      </div>

                      {scanResultDetails.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{scanResultDetails.location}</span>
                        </div>
                      )}

                      {scanResultDetails.date && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{new Date(scanResultDetails.date).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100">
                        <EnhancedBadge
                          variant={
                            scanResultDetails.type === 'event' ? 'primary' :
                            scanResultDetails.type === 'resource' ? 'info' :
                            scanResultDetails.type === 'emergency' ? 'error' : 'neutral'
                          }
                          size="sm"
                        >
                          {scanResultDetails.type?.toUpperCase() || 'QR CODE'}
                        </EnhancedBadge>
                      </div>
                    </div>
                  </EnhancedCard>

                  {/* URL Display */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Scanned URL:</p>
                        <p className="text-sm text-gray-700 truncate font-mono">{scanResult}</p>
                      </div>
                      <button
                        onClick={() => handleResultAction('copy')}
                        className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <EnhancedButton
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={() => handleResultAction('open')}
                    >
                      Open Link
                    </EnhancedButton>

                    <EnhancedButton
                      variant="secondary"
                      size="lg"
                      icon={ShareIcon}
                      onClick={() => handleResultAction('share')}
                    >
                      Share
                    </EnhancedButton>
                  </div>

                  {/* Scan Another */}
                  <div className="pt-4 border-t border-gray-100">
                    <EnhancedButton
                      variant="tertiary"
                      size="md"
                      className="w-full"
                      icon={QrCodeIcon}
                      onClick={() => {
                        setShowResultModal(false);
                        setScanResult(null);
                        setScanResultDetails(null);
                      }}
                    >
                      Scan Another Code
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>
    </div>
  );
}