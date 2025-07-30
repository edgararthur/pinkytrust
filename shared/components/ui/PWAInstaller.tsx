'use client'

import React, { useState, useEffect } from 'react'
import { Download, Wifi, WifiOff, Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = (window.navigator as any).standalone === true
    
    setIsInstalled(isStandalone || (isIOS && isInStandaloneMode))

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      
      // Show install banner after 30 seconds if not installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true)
        }
      }, 30000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowInstallBanner(false)
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const dismissBanner = () => {
    setShowInstallBanner(false)
  }

  if (isInstalled) {
    return (
      <div className={`
        fixed bottom-4 right-4 z-50 transition-all duration-300
        ${!isOnline ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}
      `}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">You're offline</h4>
              <p className="text-sm text-gray-600">Don't worry, you can still use the app!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Offline Indicator */}
      <div className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${!isOnline ? 'translate-y-0' : '-translate-y-full'}
      `}>
        <div className="bg-red-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </div>
      </div>

      {/* Install Banner */}
      {showInstallBanner && isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-in-up">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Install Pinky Trust</h4>
                  <p className="text-sm text-pink-100 mb-3">
                    Add to your home screen for quick access and offline use
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleInstallClick}
                      className="px-4 py-2 bg-white text-pink-600 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install</span>
                    </button>
                    <button
                      onClick={dismissBanner}
                      className="px-3 py-2 text-pink-100 hover:text-white transition-colors text-sm"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={dismissBanner}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Install Button (for supported browsers) */}
      {isInstallable && !showInstallBanner && (
        <button
          onClick={handleInstallClick}
          className="
            fixed bottom-20 right-4 z-40
            w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600
            rounded-full shadow-xl text-white
            flex items-center justify-center
            hover:shadow-2xl hover:scale-110
            transition-all duration-300
            animate-bounce
          "
        >
          <Download className="w-6 h-6" />
        </button>
      )}
    </>
  )
}

// Service Worker Registration Hook
export const useServiceWorker = () => {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setSwRegistration(registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setIsUpdateAvailable(true)
        }
      })
    }
  }, [])

  const updateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return { isUpdateAvailable, updateApp }
}

export default PWAInstaller 