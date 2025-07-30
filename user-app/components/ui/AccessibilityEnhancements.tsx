'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  SunIcon,
  MoonIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  HandRaisedIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  KeyIcon,
  CommandLineIcon,
  CogIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  SparklesIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import {
  SunIcon as SunSolid,
  MoonIcon as MoonSolid,
  EyeIcon as EyeSolid,
  SpeakerWaveIcon as SpeakerWaveSolid,
  CheckCircleIcon as CheckCircleSolid,
  HeartIcon as HeartSolid,
} from '@heroicons/react/24/solid';

import { EnhancedButton, EnhancedCard, EnhancedBadge, EnhancedTooltip } from './EnhancedComponents';

// Accessibility Context
interface AccessibilityContextType {
  // Visual preferences
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  
  // Audio preferences
  soundEnabled: boolean;
  speechRate: number;
  speechVolume: number;
  
  // Navigation preferences
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  skipLinks: boolean;
  
  // Content preferences
  simplifiedLayout: boolean;
  textToSpeech: boolean;
  autoPlay: boolean;
  
  // Health-specific preferences
  medicalTermsExplained: boolean;
  emotionalSupportMode: boolean;
  privateMode: boolean;
  
  // Functions
  setFontSize: (size: number) => void;
  setHighContrast: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setColorBlindMode: (mode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSpeechVolume: (volume: number) => void;
  setKeyboardNavigation: (enabled: boolean) => void;
  setFocusIndicators: (enabled: boolean) => void;
  setSkipLinks: (enabled: boolean) => void;
  setSimplifiedLayout: (enabled: boolean) => void;
  setTextToSpeech: (enabled: boolean) => void;
  setAutoPlay: (enabled: boolean) => void;
  setMedicalTermsExplained: (enabled: boolean) => void;
  setEmotionalSupportMode: (enabled: boolean) => void;
  setPrivateMode: (enabled: boolean) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  resetToDefaults: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider Component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'>('none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [keyboardNavigation, setKeyboardNavigation] = useState(true);
  const [focusIndicators, setFocusIndicators] = useState(true);
  const [skipLinks, setSkipLinks] = useState(true);
  const [simplifiedLayout, setSimplifiedLayout] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [medicalTermsExplained, setMedicalTermsExplained] = useState(true);
  const [emotionalSupportMode, setEmotionalSupportMode] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    // Apply accessibility preferences to document
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-size', `${fontSize}px`);
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Dark mode
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Color blind mode
    root.classList.remove('deuteranopia', 'protanopia', 'tritanopia');
    if (colorBlindMode !== 'none') {
      root.classList.add(colorBlindMode);
    }
    
    // Focus indicators
    if (focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Simplified layout
    if (simplifiedLayout) {
      root.classList.add('simplified-layout');
    } else {
      root.classList.remove('simplified-layout');
    }
    
    // Emotional support mode
    if (emotionalSupportMode) {
      root.classList.add('emotional-support');
    } else {
      root.classList.remove('emotional-support');
    }
    
    // Private mode
    if (privateMode) {
      root.classList.add('private-mode');
    } else {
      root.classList.remove('private-mode');
    }
  }, [
    fontSize,
    highContrast,
    darkMode,
    reducedMotion,
    colorBlindMode,
    focusIndicators,
    simplifiedLayout,
    emotionalSupportMode,
    privateMode,
  ]);

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setFontSize(preferences.fontSize || 16);
        setHighContrast(preferences.highContrast || false);
        setDarkMode(preferences.darkMode || false);
        setReducedMotion(preferences.reducedMotion || false);
        setColorBlindMode(preferences.colorBlindMode || 'none');
        setSoundEnabled(preferences.soundEnabled !== undefined ? preferences.soundEnabled : true);
        setSpeechRate(preferences.speechRate || 1);
        setSpeechVolume(preferences.speechVolume || 1);
        setKeyboardNavigation(preferences.keyboardNavigation !== undefined ? preferences.keyboardNavigation : true);
        setFocusIndicators(preferences.focusIndicators !== undefined ? preferences.focusIndicators : true);
        setSkipLinks(preferences.skipLinks !== undefined ? preferences.skipLinks : true);
        setSimplifiedLayout(preferences.simplifiedLayout || false);
        setTextToSpeech(preferences.textToSpeech || false);
        setAutoPlay(preferences.autoPlay || false);
        setMedicalTermsExplained(preferences.medicalTermsExplained !== undefined ? preferences.medicalTermsExplained : true);
        setEmotionalSupportMode(preferences.emotionalSupportMode || false);
        setPrivateMode(preferences.privateMode || false);
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    const preferences = {
      fontSize,
      highContrast,
      darkMode,
      reducedMotion,
      colorBlindMode,
      soundEnabled,
      speechRate,
      speechVolume,
      keyboardNavigation,
      focusIndicators,
      skipLinks,
      simplifiedLayout,
      textToSpeech,
      autoPlay,
      medicalTermsExplained,
      emotionalSupportMode,
      privateMode,
    };
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
  }, [
    fontSize,
    highContrast,
    darkMode,
    reducedMotion,
    colorBlindMode,
    soundEnabled,
    speechRate,
    speechVolume,
    keyboardNavigation,
    focusIndicators,
    skipLinks,
    simplifiedLayout,
    textToSpeech,
    autoPlay,
    medicalTermsExplained,
    emotionalSupportMode,
    privateMode,
  ]);

  const speakText = (text: string) => {
    if (!speechSynthesis.current || !textToSpeech || !soundEnabled) return;
    
    // Stop current speech
    speechSynthesis.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    utterance.lang = 'en-US';
    
    currentUtterance.current = utterance;
    speechSynthesis.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
    }
  };

  const resetToDefaults = () => {
    setFontSize(16);
    setHighContrast(false);
    setDarkMode(false);
    setReducedMotion(false);
    setColorBlindMode('none');
    setSoundEnabled(true);
    setSpeechRate(1);
    setSpeechVolume(1);
    setKeyboardNavigation(true);
    setFocusIndicators(true);
    setSkipLinks(true);
    setSimplifiedLayout(false);
    setTextToSpeech(false);
    setAutoPlay(false);
    setMedicalTermsExplained(true);
    setEmotionalSupportMode(false);
    setPrivateMode(false);
  };

  const value: AccessibilityContextType = {
    fontSize,
    highContrast,
    darkMode,
    reducedMotion,
    colorBlindMode,
    soundEnabled,
    speechRate,
    speechVolume,
    keyboardNavigation,
    focusIndicators,
    skipLinks,
    simplifiedLayout,
    textToSpeech,
    autoPlay,
    medicalTermsExplained,
    emotionalSupportMode,
    privateMode,
    setFontSize,
    setHighContrast,
    setDarkMode,
    setReducedMotion,
    setColorBlindMode,
    setSoundEnabled,
    setSpeechRate,
    setSpeechVolume,
    setKeyboardNavigation,
    setFocusIndicators,
    setSkipLinks,
    setSimplifiedLayout,
    setTextToSpeech,
    setAutoPlay,
    setMedicalTermsExplained,
    setEmotionalSupportMode,
    setPrivateMode,
    speakText,
    stopSpeaking,
    resetToDefaults,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Accessibility Control Panel Component
export const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'navigation' | 'content' | 'health'>('visual');
  const accessibility = useAccessibility();

  const tabs = [
    { id: 'visual', label: 'Visual', icon: EyeIcon },
    { id: 'audio', label: 'Audio', icon: SpeakerWaveIcon },
    { id: 'navigation', label: 'Navigation', icon: CommandLineIcon },
    { id: 'content', label: 'Content', icon: DocumentTextIcon },
    { id: 'health', label: 'Health', icon: HeartIcon },
  ];

  return (
    <>
      {/* Accessibility Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <EnhancedButton
          variant="primary"
          size="lg"
          icon={AdjustmentsHorizontalIcon}
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
          aria-label="Open accessibility settings"
          glow
        >
          <span className="sr-only">Accessibility Settings</span>
        </EnhancedButton>
      </div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Accessibility Settings
                    </h2>
                    <p className="text-sm text-gray-600">
                      Customize your experience for better accessibility
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={accessibility.resetToDefaults}
                  >
                    Reset to Defaults
                  </EnhancedButton>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label="Close accessibility settings"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-48 bg-gray-50 border-r border-gray-200">
                  <nav className="p-4 space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === 'visual' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Preferences</h3>
                        
                        {/* Font Size */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size: {accessibility.fontSize}px
                          </label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => accessibility.setFontSize(Math.max(12, accessibility.fontSize - 2))}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                              aria-label="Decrease font size"
                            >
                              <MagnifyingGlassMinusIcon className="w-4 h-4" />
                            </button>
                            
                            <input
                              type="range"
                              min="12"
                              max="24"
                              value={accessibility.fontSize}
                              onChange={(e) => accessibility.setFontSize(Number(e.target.value))}
                              className="flex-1"
                            />
                            
                            <button
                              onClick={() => accessibility.setFontSize(Math.min(24, accessibility.fontSize + 2))}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                              aria-label="Increase font size"
                            >
                              <MagnifyingGlassPlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* High Contrast */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.highContrast}
                              onChange={(e) => accessibility.setHighContrast(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">High Contrast Mode</span>
                              <p className="text-xs text-gray-600">Increases contrast for better visibility</p>
                            </div>
                          </label>
                        </div>

                        {/* Dark Mode */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.darkMode}
                              onChange={(e) => accessibility.setDarkMode(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-2">
                              {accessibility.darkMode ? (
                                <MoonSolid className="w-4 h-4 text-gray-700" />
                              ) : (
                                <SunSolid className="w-4 h-4 text-gray-700" />
                              )}
                              <div>
                                <span className="text-sm font-medium text-gray-900">Dark Mode</span>
                                <p className="text-xs text-gray-600">Reduces eye strain in low light</p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Reduced Motion */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.reducedMotion}
                              onChange={(e) => accessibility.setReducedMotion(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Reduce Motion</span>
                              <p className="text-xs text-gray-600">Minimizes animations and transitions</p>
                            </div>
                          </label>
                        </div>

                        {/* Color Blind Support */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color Blind Support
                          </label>
                          <select
                            value={accessibility.colorBlindMode}
                            onChange={(e) => accessibility.setColorBlindMode(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="none">No adjustment</option>
                            <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                            <option value="protanopia">Protanopia (Red-blind)</option>
                            <option value="tritanopia">Tritanopia (Blue-blind)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'audio' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Preferences</h3>
                        
                        {/* Sound Enabled */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.soundEnabled}
                              onChange={(e) => accessibility.setSoundEnabled(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-2">
                              <SpeakerWaveSolid className="w-4 h-4 text-gray-700" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Enable Sound</span>
                                <p className="text-xs text-gray-600">Allow audio feedback and notifications</p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Text to Speech */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.textToSpeech}
                              onChange={(e) => accessibility.setTextToSpeech(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Text-to-Speech</span>
                              <p className="text-xs text-gray-600">Read content aloud</p>
                            </div>
                          </label>
                        </div>

                        {/* Speech Rate */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Speech Rate: {accessibility.speechRate}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={accessibility.speechRate}
                            onChange={(e) => accessibility.setSpeechRate(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* Speech Volume */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Speech Volume: {Math.round(accessibility.speechVolume * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={accessibility.speechVolume}
                            onChange={(e) => accessibility.setSpeechVolume(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* Test Speech */}
                        <div className="mb-6">
                          <div className="flex items-center gap-2">
                            <EnhancedButton
                              variant="secondary"
                              size="sm"
                              icon={PlayIcon}
                              onClick={() => accessibility.speakText('This is a test of the text-to-speech feature.')}
                              disabled={!accessibility.textToSpeech}
                            >
                              Test Speech
                            </EnhancedButton>
                            
                            <EnhancedButton
                              variant="ghost"
                              size="sm"
                              icon={StopIcon}
                              onClick={accessibility.stopSpeaking}
                            >
                              Stop
                            </EnhancedButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'navigation' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Preferences</h3>
                        
                        {/* Keyboard Navigation */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.keyboardNavigation}
                              onChange={(e) => accessibility.setKeyboardNavigation(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-2">
                              <KeyIcon className="w-4 h-4 text-gray-700" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Keyboard Navigation</span>
                                <p className="text-xs text-gray-600">Enable keyboard shortcuts and navigation</p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Enhanced Focus Indicators */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.focusIndicators}
                              onChange={(e) => accessibility.setFocusIndicators(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Enhanced Focus Indicators</span>
                              <p className="text-xs text-gray-600">Show clear focus outlines for keyboard navigation</p>
                            </div>
                          </label>
                        </div>

                        {/* Skip Links */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.skipLinks}
                              onChange={(e) => accessibility.setSkipLinks(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Skip Links</span>
                              <p className="text-xs text-gray-600">Show skip navigation links</p>
                            </div>
                          </label>
                        </div>

                        {/* Keyboard Shortcuts */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Skip to main content</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Tab</kbd>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Open accessibility panel</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + A</kbd>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Toggle text-to-speech</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + S</kbd>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Increase font size</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + +</kbd>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Decrease font size</span>
                              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + -</kbd>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'content' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preferences</h3>
                        
                        {/* Simplified Layout */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.simplifiedLayout}
                              onChange={(e) => accessibility.setSimplifiedLayout(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Simplified Layout</span>
                              <p className="text-xs text-gray-600">Use a cleaner, more focused layout</p>
                            </div>
                          </label>
                        </div>

                        {/* Auto Play */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.autoPlay}
                              onChange={(e) => accessibility.setAutoPlay(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Auto Play Media</span>
                              <p className="text-xs text-gray-600">Automatically play videos and audio</p>
                            </div>
                          </label>
                        </div>

                        {/* Medical Terms Explained */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.medicalTermsExplained}
                              onChange={(e) => accessibility.setMedicalTermsExplained(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Explain Medical Terms</span>
                              <p className="text-xs text-gray-600">Show definitions for medical terminology</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'health' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health-Specific Features</h3>
                        
                        {/* Emotional Support Mode */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.emotionalSupportMode}
                              onChange={(e) => accessibility.setEmotionalSupportMode(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-2">
                              <HeartSolid className="w-4 h-4 text-pink-600" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Emotional Support Mode</span>
                                <p className="text-xs text-gray-600">Show supportive messages and gentle reminders</p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Private Mode */}
                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accessibility.privateMode}
                              onChange={(e) => accessibility.setPrivateMode(e.target.checked)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex items-center gap-2">
                              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Private Mode</span>
                                <p className="text-xs text-gray-600">Hide sensitive information from screen readers</p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Health Resources */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Access</h4>
                          <div className="space-y-2">
                            <EnhancedButton
                              variant="secondary"
                              size="sm"
                              icon={PhoneIcon}
                              fullWidth
                              className="justify-start"
                            >
                              Crisis Support Hotline
                            </EnhancedButton>
                            
                            <EnhancedButton
                              variant="secondary"
                              size="sm"
                              icon={ChatBubbleLeftRightIcon}
                              fullWidth
                              className="justify-start"
                            >
                              Online Support Chat
                            </EnhancedButton>
                            
                            <EnhancedButton
                              variant="secondary"
                              size="sm"
                              icon={BookOpenIcon}
                              fullWidth
                              className="justify-start"
                            >
                              Accessibility Resources
                            </EnhancedButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Settings are automatically saved and synced across devices
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <EnhancedButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </EnhancedButton>
                    
                    <EnhancedButton
                      variant="primary"
                      size="sm"
                      icon={CheckCircleSolid}
                      onClick={() => setIsOpen(false)}
                    >
                      Apply Settings
                    </EnhancedButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Skip Links Component
export const SkipLinks: React.FC = () => {
  const { skipLinks } = useAccessibility();

  if (!skipLinks) return null;

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-32 z-50 bg-primary-600 text-white px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Skip to navigation
      </a>
    </div>
  );
};

// Medical Term Tooltip Component
export const MedicalTermTooltip: React.FC<{
  term: string;
  definition: string;
  children: React.ReactNode;
}> = ({ term, definition, children }) => {
  const { medicalTermsExplained, speakText } = useAccessibility();

  if (!medicalTermsExplained) {
    return <>{children}</>;
  }

  return (
    <EnhancedTooltip
      content={
        <div className="max-w-xs">
          <div className="font-semibold mb-1">{term}</div>
          <div className="text-sm">{definition}</div>
          <button
            onClick={() => speakText(`${term}: ${definition}`)}
            className="mt-2 text-xs text-blue-300 hover:text-blue-200"
          >
            Listen to definition
          </button>
        </div>
      }
    >
      <span className="underline decoration-dotted decoration-primary-400 cursor-help">
        {children}
      </span>
    </EnhancedTooltip>
  );
};

// Emotional Support Message Component
export const EmotionalSupportMessage: React.FC<{
  message: string;
  type?: 'encouragement' | 'reminder' | 'support';
}> = ({ message, type = 'support' }) => {
  const { emotionalSupportMode } = useAccessibility();

  if (!emotionalSupportMode) return null;

  const icons = {
    encouragement: SparklesIcon,
    reminder: LightBulbIcon,
    support: HeartSolid,
  };

  const colors = {
    encouragement: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    reminder: 'bg-blue-50 border-blue-200 text-blue-800',
    support: 'bg-pink-50 border-pink-200 text-pink-800',
  };

  const IconComponent = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${colors[type]} mb-4`}
    >
      <div className="flex items-start gap-2">
        <IconComponent className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{message}</p>
      </div>
    </motion.div>
  );
};

// Accessible Form Field Component
export const AccessibleFormField: React.FC<{
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, description, error, required, children }) => {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 mb-2">
          {description}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' '),
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required ? 'true' : 'false',
        })}
      </div>
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Screen Reader Only Component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

// Live Region Component for Dynamic Content
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  level?: 'polite' | 'assertive';
}> = ({ children, level = 'polite' }) => {
  return (
    <div aria-live={level} aria-atomic="true" className="sr-only">
      {children}
    </div>
  );
}; 