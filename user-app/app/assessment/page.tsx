'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  HeartIcon,
  ShieldCheckIcon,
  ClockIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LightBulbIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  MapPinIcon,
  SparklesIcon,
  HandRaisedIcon,
  FaceSmileIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  TrophyIcon,
  GiftIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  CameraIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  EyeIcon,
  EyeSlashIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  CogIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  HeartIcon as HeartIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  StarIcon as StarIconSolid,
  TrophyIcon as TrophyIconSolid,
  FaceSmileIcon as FaceSmileIconSolid,
} from '@heroicons/react/24/solid';

import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedBadge, 
  EnhancedProgress, 
  EnhancedInput,
  EnhancedLoading,
  EnhancedTooltip 
} from '@/components/ui/EnhancedComponents';
import AppLoadingScreen from '@/components/ui/AppLoadingScreen';
import { useAssessmentQuestions, useUserAssessments } from '@/lib/queries';
import { useDataManager } from '@/lib/data-manager';
import type { AssessmentQuestion } from '@/types';

interface AssessmentAnswer {
  questionId: string;
  value: any;
  confidence?: number;
  notes?: string;
  timestamp: Date;
}

interface RiskResult {
  score: number;
  level: 'low' | 'moderate' | 'high';
  category: string;
  recommendations: string[];
  nextSteps: string[];
  resources: Array<{
    title: string;
    description: string;
    url: string;
    type: 'article' | 'video' | 'tool' | 'appointment' | 'screening';
    priority: 'high' | 'medium' | 'low';
  }>;
  supportContacts: Array<{
    name: string;
    description: string;
    phone: string;
    hours: string;
    type: 'emergency' | 'support' | 'information';
  }>;
  personalizedMessage: string;
  encouragementMessage: string;
  warningMessage?: string;
}

interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  questions: string[];
  estimatedTime: string;
  importance: 'high' | 'medium' | 'low';
  supportiveIntro: string;
  completionMessage: string;
}

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [currentConfidence, setCurrentConfidence] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<RiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Fetch real assessment questions from backend
  const {
    data: questionsData = [],
    isLoading: questionsLoading,
    error: questionsError
  } = useAssessmentQuestions();

  // Use data manager for offline support
  const dataManager = useDataManager();
  const [showSupportiveMessage, setShowSupportiveMessage] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [showConfidenceHelper, setShowConfidenceHelper] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  
  const progressRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const progressInView = useInView(progressRef, { once: true });

  const assessmentSections: AssessmentSection[] = [
    {
      id: 'demographic',
      title: 'Personal Information',
      description: 'Basic information to personalize your assessment',
      icon: UserIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      questions: ['age', 'ethnicity', 'location'],
      estimatedTime: '2-3 min',
      importance: 'high',
      supportiveIntro: 'Let\'s start with some basic information about you. This helps us provide personalized recommendations.',
      completionMessage: 'Great! This information helps us understand your unique health profile.',
    },
    {
      id: 'family_history',
      title: 'Family Health History',
      description: 'Information about your family\'s health history',
      icon: UserIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      questions: ['family_breast_cancer', 'family_ovarian_cancer', 'family_age_diagnosis'],
      estimatedTime: '3-4 min',
      importance: 'high',
      supportiveIntro: 'Family history is important, but remember - having a family history doesn\'t mean you will develop cancer.',
      completionMessage: 'Thank you for sharing this information. Family history helps us assess risk factors.',
    },
    {
      id: 'personal_history',
      title: 'Personal Health History',
      description: 'Your personal medical history and experiences',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      questions: ['previous_biopsies', 'hormone_therapy', 'radiation_exposure'],
      estimatedTime: '4-5 min',
      importance: 'high',
      supportiveIntro: 'Your personal health history helps us understand your individual risk factors.',
      completionMessage: 'You\'re doing great! This information is valuable for your health assessment.',
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Factors',
      description: 'Information about your daily habits and lifestyle',
      icon: HeartIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      questions: ['exercise_frequency', 'alcohol_consumption', 'smoking_history'],
      estimatedTime: '3-4 min',
      importance: 'medium',
      supportiveIntro: 'Lifestyle factors can influence health outcomes, and many can be modified to improve your wellbeing.',
      completionMessage: 'Excellent! Lifestyle awareness is a key step toward better health.',
    },
    {
      id: 'symptoms',
      title: 'Current Symptoms',
      description: 'Any symptoms or concerns you may have',
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      questions: ['breast_changes', 'pain_discomfort', 'skin_changes'],
      estimatedTime: '3-4 min',
      importance: 'high',
      supportiveIntro: 'It\'s important to discuss any symptoms. Remember, most breast changes are not cancer.',
      completionMessage: 'Thank you for sharing. Early reporting of changes is always the right choice.',
    },
    {
      id: 'concerns',
      title: 'Concerns & Goals',
      description: 'Your health concerns and wellness goals',
      icon: LightBulbIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      questions: ['health_concerns', 'wellness_goals', 'support_needs'],
      estimatedTime: '2-3 min',
      importance: 'medium',
      supportiveIntro: 'Understanding your concerns and goals helps us provide the most relevant recommendations.',
      completionMessage: 'Perfect! Your goals and concerns help us personalize your health journey.',
    },
  ];

  // Use real questions data with fallback to sample data
  const assessmentQuestions = questionsData.length > 0 ? questionsData : [
    {
      id: 'age',
      question: 'What is your age?',
      subtitle: 'Age is an important factor in health assessment',
      type: 'number' as const,
      weight: 2,
      category: 'demographic' as const,
      helpText: 'Age helps us provide personalized health recommendations based on your life stage.',
      min: 18,
      max: 100,
      unit: 'years',
      required: true,
      supportiveMessage: 'Age-specific guidelines help us provide the most relevant recommendations for you.',
      confidencePrompt: 'How confident are you about your age?',
    },
    {
      id: 'ethnicity',
      question: 'What is your ethnicity?',
      subtitle: 'Certain ethnic groups have different risk factors',
      type: 'select' as const,
      weight: 1,
      category: 'demographic' as const,
      options: [
        'White/Caucasian',
        'Black/African American',
        'Hispanic/Latino',
        'Asian',
        'Native American',
        'Pacific Islander',
        'Mixed/Other',
        'Prefer not to answer'
      ],
      helpText: 'Some ethnic groups have different risk factors for breast cancer.',
      supportiveMessage: 'Understanding ethnic background helps us provide culturally appropriate care recommendations.',
      confidencePrompt: 'How certain are you about your ethnic background?',
    },
    {
      id: 'family_breast_cancer',
      question: 'Has anyone in your immediate family had breast cancer?',
      subtitle: 'This includes parents, siblings, and children',
      type: 'boolean' as const,
      weight: 3,
      category: 'family_history' as const,
      helpText: 'Family history is important, but having a family history doesn\'t mean you will develop cancer.',
      supportiveMessage: 'Remember, most people with a family history of breast cancer never develop the disease.',
      warningMessage: 'If yes, consider genetic counseling and discuss with your healthcare provider.',
      confidencePrompt: 'How confident are you about your family history?',
      relatedResources: [
        {
          title: 'Understanding Family History',
          url: '/resources/family-history',
          type: 'article'
        },
        {
          title: 'Genetic Counseling Information',
          url: '/resources/genetic-counseling',
          type: 'video'
        }
      ],
    },
    {
      id: 'family_ovarian_cancer',
      question: 'Has anyone in your family had ovarian cancer?',
      subtitle: 'Ovarian cancer can be related to breast cancer risk',
      type: 'boolean' as const,
      weight: 2,
      category: 'family_history' as const,
      helpText: 'Ovarian cancer in the family can indicate genetic mutations that increase breast cancer risk.',
      supportiveMessage: 'Family history helps us understand your genetic risk factors.',
      confidencePrompt: 'How certain are you about your family\'s ovarian cancer history?',
    },
    {
      id: 'previous_biopsies',
      question: 'Have you had any breast biopsies?',
      subtitle: 'Including fine needle aspirations and core biopsies',
      type: 'boolean' as const,
      weight: 2,
      category: 'personal_history' as const,
      helpText: 'Previous biopsies can affect risk assessment, especially if abnormal cells were found.',
      supportiveMessage: 'Previous biopsies show you\'re proactive about your health.',
      confidencePrompt: 'How confident are you about your biopsy history?',
    },
    {
      id: 'hormone_therapy',
      question: 'Have you used hormone replacement therapy?',
      subtitle: 'Including estrogen and progesterone therapy',
      type: 'select' as const,
      weight: 1,
      category: 'personal_history' as const,
      options: [
        'Never used',
        'Currently using',
        'Used in the past',
        'Unsure'
      ],
      helpText: 'Hormone therapy can slightly increase breast cancer risk, but benefits often outweigh risks.',
      supportiveMessage: 'Hormone therapy decisions should always be made with your healthcare provider.',
      confidencePrompt: 'How certain are you about your hormone therapy history?',
    },
    {
      id: 'exercise_frequency',
      question: 'How often do you exercise?',
      subtitle: 'Regular physical activity can reduce breast cancer risk',
      type: 'select' as const,
      weight: 1,
      category: 'lifestyle' as const,
      options: [
        'Daily',
        '3-4 times per week',
        '1-2 times per week',
        'Rarely',
        'Never'
      ],
      helpText: 'Regular exercise is one of the best ways to reduce breast cancer risk.',
      supportiveMessage: 'Any amount of physical activity is beneficial for your health.',
      confidencePrompt: 'How accurately does this reflect your current exercise habits?',
    },
    {
      id: 'alcohol_consumption',
      question: 'How often do you consume alcohol?',
      subtitle: 'Alcohol consumption can affect breast cancer risk',
      type: 'select' as const,
      weight: 1,
      category: 'lifestyle' as const,
      options: [
        'Never',
        'Rarely (special occasions)',
        '1-2 drinks per week',
        '3-7 drinks per week',
        'More than 7 drinks per week'
      ],
      helpText: 'Limiting alcohol consumption can help reduce breast cancer risk.',
      supportiveMessage: 'Small changes in alcohol consumption can have positive health impacts.',
      confidencePrompt: 'How accurately does this reflect your alcohol consumption?',
    },
    {
      id: 'breast_changes',
      question: 'Have you noticed any changes in your breasts recently?',
      subtitle: 'Including lumps, changes in size, shape, or texture',
      type: 'boolean' as const,
      weight: 3,
      category: 'symptoms' as const,
      helpText: 'Most breast changes are not cancer, but it\'s important to have them checked.',
      supportiveMessage: 'Being aware of changes in your body is an important part of health maintenance.',
      warningMessage: 'If you\'ve noticed changes, please schedule an appointment with your healthcare provider.',
      confidencePrompt: 'How confident are you about recent changes in your breasts?',
    },
    {
      id: 'health_concerns',
      question: 'What are your main health concerns?',
      subtitle: 'Understanding your concerns helps us provide better guidance',
      type: 'multiselect' as const,
      weight: 1,
      category: 'concerns' as const,
      options: [
        'Breast cancer prevention',
        'Early detection',
        'Family history concerns',
        'Lifestyle factors',
        'Screening guidelines',
        'Treatment options',
        'Support resources',
        'Other'
      ],
      helpText: 'Your concerns help us prioritize the most relevant information for you.',
      supportiveMessage: 'Having health concerns shows you\'re taking an active role in your wellbeing.',
      confidencePrompt: 'How well do these options capture your main concerns?',
    },
  ];

  const getCurrentQuestion = () => {
    if (currentStep >= assessmentQuestions.length) return null;
    return assessmentQuestions[currentStep];
  };

  const getCurrentSection = () => {
    const question = getCurrentQuestion();
    if (!question) return null;
    return assessmentSections.find(section => section.id === question.category);
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / assessmentQuestions.length) * 100);
  };

  const getSectionProgress = () => {
    const section = getCurrentSection();
    if (!section) return 0;
    
    const sectionQuestions = assessmentQuestions.filter(q => q.category === section.id);
    const answeredInSection = answers.filter(a => {
      const question = assessmentQuestions.find(q => q.id === a.questionId);
      return question && question.category === section.id;
    });
    
    return Math.round((answeredInSection.length / sectionQuestions.length) * 100);
  };

  const handleAnswer = (value: any) => {
    setCurrentAnswer(value);

    // Show supportive message for sensitive questions
    const question = getCurrentQuestion();
    if (question?.supportiveMessage) {
      setShowSupportiveMessage(true);
      setTimeout(() => setShowSupportiveMessage(false), 3000);
    }
  };

  const validateAnswer = (question: AssessmentQuestion, answer: any): string | null => {
    if (question.required && (answer === null || answer === undefined || answer === '')) {
      return 'This question is required.';
    }

    if (question.type === 'number') {
      const numValue = Number(answer);
      if (isNaN(numValue)) {
        return 'Please enter a valid number.';
      }
      if (question.min !== undefined && numValue < question.min) {
        return `Value must be at least ${question.min}.`;
      }
      if (question.max !== undefined && numValue > question.max) {
        return `Value must be no more than ${question.max}.`;
      }
    }

    if (question.type === 'multiselect') {
      if (!Array.isArray(answer) || answer.length === 0) {
        return question.required ? 'Please select at least one option.' : null;
      }
    }

    return null;
  };

  const handleNext = () => {
    const question = getCurrentQuestion();
    if (!question) return;

    // Validate answer
    const validationError = validateAnswer(question, currentAnswer);
    if (validationError) {
      // TODO: Replace with toast notification
      alert(validationError);
      return;
    }

    // Save answer
    const newAnswer: AssessmentAnswer = {
      questionId: question.id,
      value: currentAnswer,
      confidence: currentConfidence,
      notes: notes,
      timestamp: new Date(),
    };

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === question.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });

    // Check if section is completed
    const section = getCurrentSection();
    if (section) {
      const sectionQuestions = assessmentQuestions.filter(q => q.category === section.id);
      const answeredInSection = answers.filter(a => {
        const q = assessmentQuestions.find(q => q.id === a.questionId);
        return q && q.category === section.id;
      });
      
      if (answeredInSection.length + 1 === sectionQuestions.length) {
        setCompletedSections(prev => [...prev, section.id]);
      }
    }

    // Move to next question or show results
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCurrentAnswer(null);
      setCurrentConfidence(5);
      setNotes('');
      setShowNotes(false);
    } else {
      // Calculate and show results
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      
      // Load previous answer
      const prevQuestion = assessmentQuestions[currentStep - 1];
      const prevAnswer = prevQuestion ? answers.find(a => a.questionId === prevQuestion.id) : null;
      if (prevAnswer) {
        setCurrentAnswer(prevAnswer.value);
        setCurrentConfidence(prevAnswer.confidence || 5);
        setNotes(prevAnswer.notes || '');
      }
    }
  };

  const calculateResults = () => {
    setIsLoading(true);
    
    // Simulate calculation with realistic timing
    setTimeout(() => {
      const riskScore = calculateRiskScore();
      const riskLevel = getRiskLevel(riskScore);
      
      const results: RiskResult = {
        score: riskScore,
        level: riskLevel,
        category: getRiskCategory(riskLevel),
        recommendations: getRecommendations(riskLevel),
        nextSteps: getNextSteps(riskLevel),
        resources: getResources(riskLevel),
        supportContacts: getSupportContacts(riskLevel),
        personalizedMessage: getPersonalizedMessage(riskLevel),
        encouragementMessage: getEncouragementMessage(riskLevel),
        ...(riskLevel === 'high' && { warningMessage: 'Please consult with a healthcare provider as soon as possible.' }),
      };
      
      setResults(results);
      setIsLoading(false);
      setShowResults(true);
    }, 2000);
  };

  const calculateRiskScore = () => {
    let score = 0;
    answers.forEach(answer => {
      const question = assessmentQuestions.find(q => q.id === answer.questionId);
      if (question) {
        // Simplified risk calculation
        if (question.id === 'age' && answer.value > 50) score += 10;
        if (question.id === 'family_breast_cancer' && answer.value === true) score += 15;
        if (question.id === 'family_ovarian_cancer' && answer.value === true) score += 10;
        if (question.id === 'previous_biopsies' && answer.value === true) score += 8;
        if (question.id === 'hormone_therapy' && answer.value === 'Currently using') score += 5;
        if (question.id === 'exercise_frequency' && ['Rarely', 'Never'].includes(answer.value)) score += 5;
        if (question.id === 'alcohol_consumption' && answer.value === 'More than 7 drinks per week') score += 5;
        if (question.id === 'breast_changes' && answer.value === true) score += 20;
      }
    });
    return Math.min(score, 100);
  };

  const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' => {
    if (score < 20) return 'low';
    if (score < 40) return 'moderate';
    return 'high';
  };

  const getRiskCategory = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'low': return 'Lower Risk';
      case 'moderate': return 'Moderate Risk';
      case 'high': return 'Higher Risk';
    }
  };

  const getRecommendations = (level: 'low' | 'moderate' | 'high') => {
    const base = [
      'Maintain regular self-examinations',
      'Follow age-appropriate screening guidelines',
      'Maintain a healthy lifestyle with regular exercise',
      'Limit alcohol consumption',
      'Maintain a healthy weight',
    ];
    
    if (level === 'moderate') {
      return [...base, 'Consider discussing earlier or more frequent screening with your doctor', 'Stay informed about breast health'];
    }
    
    if (level === 'high') {
      return [...base, 'Schedule an appointment with your healthcare provider', 'Consider genetic counseling if family history is present', 'Discuss enhanced screening options'];
    }
    
    return base;
  };

  const getNextSteps = (level: 'low' | 'moderate' | 'high') => {
    const base = ['Schedule your next routine screening', 'Continue healthy lifestyle habits'];
    
    if (level === 'moderate') {
      return ['Discuss results with your healthcare provider', ...base, 'Consider joining a support group'];
    }
    
    if (level === 'high') {
      return ['Schedule an appointment with your healthcare provider within 1-2 weeks', 'Bring these results to your appointment', 'Consider genetic counseling', ...base];
    }
    
    return base;
  };

  const getResources = (level: 'low' | 'moderate' | 'high') => {
    const base = [
      {
        title: 'Breast Self-Examination Guide',
        description: 'Learn how to perform monthly self-examinations',
        url: '/resources/self-exam',
        type: 'article' as const,
        priority: 'high' as const,
      },
      {
        title: 'Healthy Lifestyle Tips',
        description: 'Evidence-based tips for breast cancer prevention',
        url: '/resources/lifestyle',
        type: 'article' as const,
        priority: 'medium' as const,
      },
    ];
    
    if (level === 'moderate' || level === 'high') {
      return [...base, {
        title: 'Find a Healthcare Provider',
        description: 'Locate breast health specialists in your area',
        url: '/resources/find-provider',
        type: 'tool' as const,
        priority: 'high' as const,
      }];
    }
    
    return base;
  };

  const getSupportContacts = (level: 'low' | 'moderate' | 'high') => {
    const base = [
      {
        name: 'Breast Cancer Information Line',
        description: 'General information and support',
        phone: '1-800-422-6237',
        hours: '24/7',
        type: 'information' as const,
      },
    ];
    
    if (level === 'high') {
      return [{
        name: 'Crisis Support Hotline',
        description: 'Immediate emotional support',
        phone: '1-800-273-8255',
        hours: '24/7',
        type: 'emergency' as const,
      }, ...base];
    }
    
    return base;
  };

  const getPersonalizedMessage = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'low':
        return 'Based on your responses, you appear to have a lower risk profile. This is encouraging! Continue with regular screening and healthy lifestyle choices.';
      case 'moderate':
        return 'Your assessment indicates a moderate risk profile. This doesn\'t mean you will develop breast cancer, but it\'s important to stay vigilant with screening and discuss these results with your healthcare provider.';
      case 'high':
        return 'Your assessment indicates a higher risk profile. Please don\'t be alarmed - this doesn\'t mean you will develop breast cancer. It\'s important to discuss these results with a healthcare provider who can provide personalized guidance.';
    }
  };

  const getEncouragementMessage = (_level: 'low' | 'moderate' | 'high') => {
    return 'Remember, taking this assessment shows you\'re being proactive about your health. Early detection and prevention are powerful tools, and you\'re taking the right steps.';
  };

  const startAssessment = () => {
    setAssessmentStarted(true);
    setCurrentStep(0);
  };

  const restartAssessment = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer(null);
    setCurrentConfidence(5);
    setShowResults(false);
    setResults(null);
    setCompletedSections([]);
    setAssessmentStarted(false);
    setNotes('');
    setShowNotes(false);
  };

  const currentQuestion = getCurrentQuestion();
  const currentSectionData = getCurrentSection();

  if (!assessmentStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="PinkyTrust Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-primary-600">PinkyTrust</span>
            </div>
          </div>

          {/* Welcome Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Breast Health Assessment
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A personalized assessment to help you understand your breast health and provide 
              tailored recommendations for your wellness journey.
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4" />
                15-20 minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheckIcon className="w-4 h-4" />
                Confidential & Secure
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AcademicCapIcon className="w-4 h-4" />
                Expert-Reviewed
              </div>
            </div>
          </motion.div>

          {/* Assessment Sections Preview */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              What We'll Cover
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessmentSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <EnhancedCard className="text-center h-full" hover tilt>
                    <div className={`w-12 h-12 ${section.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                    
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span>{section.estimatedTime}</span>
                      <span>•</span>
                      <EnhancedBadge
                        variant={section.importance === 'high' ? 'error' : section.importance === 'medium' ? 'warning' : 'neutral'}
                        size="xs"
                      >
                        {section.importance} priority
                      </EnhancedBadge>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Important Information */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <EnhancedCard className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important to Know</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• This assessment is not a medical diagnosis</li>
                    <li>• Results should be discussed with a healthcare provider</li>
                    <li>• Your information is kept private and secure</li>
                    <li>• You can pause and resume at any time</li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Start Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <EnhancedButton
              variant="primary"
              size="lg"
              onClick={startAssessment}
              icon={ArrowRightIcon}
              className="mb-4"
              magnetic
              glow
            >
              Start Assessment
            </EnhancedButton>
            
            <p className="text-sm text-gray-500">
              By starting this assessment, you agree to our privacy policy and terms of use.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <EnhancedLoading
            type="heart"
            size="lg"
            color="primary"
            text="Analyzing your responses..."
            showLogo={true}
          />
          <motion.p
            className="mt-4 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            Creating your personalized health insights
          </motion.p>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Assessment Results</h1>
            <EnhancedButton
              variant="secondary"
              size="sm"
              onClick={restartAssessment}
              icon={ArrowLeftIcon}
            >
              Take Again
            </EnhancedButton>
          </div>

          {/* Results Overview */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedCard className="text-center mb-6" hover glow>
              <div className="mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  results.level === 'low' ? 'bg-green-100 text-green-600' :
                  results.level === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {results.level === 'low' ? (
                    <CheckCircleIconSolid className="w-10 h-10" />
                  ) : results.level === 'moderate' ? (
                    <ExclamationTriangleIcon className="w-10 h-10" />
                  ) : (
                    <ExclamationTriangleIcon className="w-10 h-10" />
                  )}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {results.category}
                </h2>
                
                <EnhancedBadge
                  variant={
                    results.level === 'low' ? 'success' :
                    results.level === 'moderate' ? 'warning' : 'error'
                  }
                  size="lg"
                >
                  Risk Score: {results.score}/100
                </EnhancedBadge>
              </div>

              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-gray-700 mb-4">
                  {results.personalizedMessage}
                </p>
                
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <HeartIconSolid className="w-4 h-4 text-primary-600" />
                    {results.encouragementMessage}
                  </p>
                </div>
              </div>
            </EnhancedCard>

            {/* Warning Message */}
            {results.warningMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedCard className="bg-red-50 border-red-200 mb-6">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Important Notice</h3>
                      <p className="text-red-800">{results.warningMessage}</p>
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            )}
          </motion.div>

          {/* Recommendations */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EnhancedCard className="h-full" hover>
                    <div className="flex items-start gap-3">
                      <CheckCircleIconSolid className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-3">
              {results.nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EnhancedCard hover>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Helpful Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EnhancedCard className="h-full group cursor-pointer" hover tilt interactive>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        resource.type === 'article' ? 'bg-blue-100 text-blue-600' :
                        resource.type === 'video' ? 'bg-purple-100 text-purple-600' :
                        resource.type === 'tool' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {resource.type === 'article' ? (
                          <BookOpenIcon className="w-5 h-5" />
                        ) : resource.type === 'video' ? (
                          <PlayIcon className="w-5 h-5" />
                        ) : resource.type === 'tool' ? (
                          <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        ) : (
                          <CalendarDaysIcon className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                            {resource.title}
                          </h4>
                          <EnhancedBadge
                            variant={resource.priority === 'high' ? 'error' : resource.priority === 'medium' ? 'warning' : 'neutral'}
                            size="xs"
                          >
                            {resource.priority}
                          </EnhancedBadge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="capitalize">{resource.type}</span>
                          <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Support Contacts */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Support & Contact Information</h3>
            <div className="space-y-4">
              {results.supportContacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EnhancedCard hover>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        contact.type === 'emergency' ? 'bg-red-100 text-red-600' :
                        contact.type === 'support' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <PhoneIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          <EnhancedBadge variant="success" size="xs">
                            {contact.hours}
                          </EnhancedBadge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <EnhancedButton
              variant="primary"
              size="lg"
              icon={BookOpenIcon}
              href="/awareness"
              magnetic
            >
              Explore Resources
            </EnhancedButton>
            
            <EnhancedButton
              variant="secondary"
              size="lg"
              icon={CalendarDaysIcon}
              href="/events"
            >
              Find Events
            </EnhancedButton>
            
            <EnhancedButton
              variant="warm"
              size="lg"
              icon={ChatBubbleLeftRightIcon}
              href="/community"
            >
              Get Support
            </EnhancedButton>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main assessment form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Previous
          </button>
          
          <div className="flex items-center gap-4">
            <EnhancedButton
              variant="ghost"
              size="sm"
              icon={QuestionMarkCircleIcon}
              onClick={() => setShowHelp(!showHelp)}
            >
              Help
            </EnhancedButton>
            
            <EnhancedButton
              variant="secondary"
              size="sm"
              onClick={restartAssessment}
            >
              Restart
            </EnhancedButton>
          </div>
        </div>

        {/* Progress Section */}
        <motion.div
          ref={progressRef}
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={progressInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Question {currentStep + 1} of {assessmentQuestions.length}
              </h2>
              <p className="text-xs text-gray-500">
                {currentSectionData?.title} • {currentSectionData?.estimatedTime}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {getProgressPercentage()}% Complete
              </p>
              <p className="text-xs text-gray-500">
                Section: {getSectionProgress()}%
              </p>
            </div>
          </div>
          
          <EnhancedProgress
            value={getProgressPercentage()}
            size="md"
            variant="default"
            animated
            striped
            className="mb-2"
          />
          
          <EnhancedProgress
            value={getSectionProgress()}
            size="sm"
            variant="default"
            animated
            className="opacity-60"
          />
        </motion.div>

        {/* Section Introduction */}
        {currentSection && currentStep === 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedCard className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200" hover>
              <div className="flex items-start gap-4">
                {currentSectionData && (
                  <>
                    <div className={`p-3 rounded-xl ${currentSectionData.bgColor}`}>
                      <currentSectionData.icon className={`w-6 h-6 ${currentSectionData.color}`} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{currentSectionData.title}</h3>
                      <p className="text-gray-600 mb-3">{currentSectionData.supportiveIntro}</p>
                      <EnhancedBadge variant="info" size="sm">
                        {currentSectionData.questions.length} questions • {currentSectionData.estimatedTime}
                      </EnhancedBadge>
                    </div>
                  </>
                )}
              </div>
            </EnhancedCard>
          </motion.div>
        )}

        {/* Question */}
        {currentQuestion && (
          <motion.div
            ref={questionRef}
            className="mb-8"
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <EnhancedCard className="mb-6" hover glow>
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${currentSectionData?.bgColor}`}>
                    {currentSectionData?.icon && (
                      <currentSectionData.icon className={`w-5 h-5 ${currentSectionData.color}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                      {currentQuestion.question}
                    </h3>
                    
                    {currentQuestion.subtitle && (
                      <p className="text-gray-600 mb-3">{currentQuestion.subtitle}</p>
                    )}
                    
                    {currentQuestion.required && (
                      <EnhancedBadge variant="error" size="xs" className="mb-3">
                        Required
                      </EnhancedBadge>
                    )}
                  </div>
                </div>

                {/* Help Text */}
                {currentQuestion.helpText && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">{currentQuestion.helpText}</p>
                    </div>
                  </div>
                )}

                {/* Answer Input */}
                <div className="space-y-4">
                  {currentQuestion.type === 'boolean' && (
                    <div className="flex gap-4">
                      <EnhancedButton
                        variant={currentAnswer === true ? 'primary' : 'secondary'}
                        size="lg"
                        onClick={() => handleAnswer(true)}
                        className="flex-1"
                        icon={CheckCircleIcon}
                      >
                        Yes
                      </EnhancedButton>
                      <EnhancedButton
                        variant={currentAnswer === false ? 'primary' : 'secondary'}
                        size="lg"
                        onClick={() => handleAnswer(false)}
                        className="flex-1"
                        icon={XMarkIcon}
                      >
                        No
                      </EnhancedButton>
                    </div>
                  )}

                  {currentQuestion.type === 'number' && (
                    <EnhancedInput
                      type="number"
                      value={currentAnswer || ''}
                      onChange={(value) => handleAnswer(Number(value))}
                      placeholder={`Enter your ${currentQuestion.unit || 'answer'}`}
                      {...(currentQuestion.min !== undefined && { min: currentQuestion.min })}
                      {...(currentQuestion.max !== undefined && { max: currentQuestion.max })}
                      size="lg"
                      className="text-center"
                    />
                  )}

                  {currentQuestion.type === 'select' && currentQuestion.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, index) => (
                        <EnhancedButton
                          key={index}
                          variant={currentAnswer === option ? 'primary' : 'secondary'}
                          size="md"
                          onClick={() => handleAnswer(option)}
                          className="text-left justify-start"
                          fullWidth
                        >
                          {option}
                        </EnhancedButton>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'multiselect' && currentQuestion.options && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentQuestion.options.map((option, index) => {
                          const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                          return (
                            <EnhancedButton
                              key={index}
                              variant={isSelected ? 'primary' : 'secondary'}
                              size="md"
                              onClick={() => {
                                const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                                if (isSelected) {
                                  handleAnswer(current.filter(item => item !== option));
                                } else {
                                  handleAnswer([...current, option]);
                                }
                              }}
                              className="text-left justify-start"
                              fullWidth
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  isSelected ? 'bg-white border-white' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <CheckCircleIcon className="w-3 h-3 text-primary-600" />
                                  )}
                                </div>
                                {option}
                              </div>
                            </EnhancedButton>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === 'scale' && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {currentAnswer || currentQuestion.min || 1}
                        </span>
                        <span className="text-gray-500 ml-1">
                          / {currentQuestion.max || 10}
                        </span>
                      </div>

                      <div className="px-4">
                        <input
                          type="range"
                          min={currentQuestion.min || 1}
                          max={currentQuestion.max || 10}
                          value={currentAnswer || currentQuestion.min || 1}
                          onChange={(e) => handleAnswer(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                              ((currentAnswer || currentQuestion.min || 1) - (currentQuestion.min || 1)) /
                              ((currentQuestion.max || 10) - (currentQuestion.min || 1)) * 100
                            }%, #e5e7eb ${
                              ((currentAnswer || currentQuestion.min || 1) - (currentQuestion.min || 1)) /
                              ((currentQuestion.max || 10) - (currentQuestion.min || 1)) * 100
                            }%, #e5e7eb 100%)`
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 px-4">
                        <span>{currentQuestion.min || 1}</span>
                        <span>{currentQuestion.max || 10}</span>
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === 'multiselect' && currentQuestion.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                        return (
                          <EnhancedButton
                            key={index}
                            variant={isSelected ? 'primary' : 'secondary'}
                            size="md"
                            onClick={() => {
                              const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                              const updated = isSelected
                                ? current.filter(item => item !== option)
                                : [...current, option];
                              handleAnswer(updated);
                            }}
                            className="text-left justify-start"
                            fullWidth
                            icon={isSelected ? CheckCircleIcon : PlusIcon}
                          >
                            {option}
                          </EnhancedButton>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === 'scale' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Not at all</span>
                        <span>Extremely</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                          <button
                            key={value}
                            onClick={() => handleAnswer(value)}
                            className={`flex-1 h-12 rounded-lg border-2 transition-all duration-200 ${
                              currentAnswer === value
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Tracking */}
              {currentAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      {currentQuestion.confidencePrompt || 'How confident are you in this answer?'}
                    </label>
                    <EnhancedButton
                      variant="ghost"
                      size="sm"
                      icon={QuestionMarkCircleIcon}
                      onClick={() => setShowConfidenceHelper(!showConfidenceHelper)}
                    >
                      Help
                    </EnhancedButton>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Not confident</span>
                      <span>Very confident</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <button
                          key={value}
                          onClick={() => setCurrentConfidence(value)}
                          className={`flex-1 h-8 rounded transition-all duration-200 ${
                            currentConfidence >= value
                              ? 'bg-primary-500'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {currentConfidence}/10
                      </span>
                    </div>
                  </div>

                  {/* Confidence Helper */}
                  <AnimatePresence>
                    {showConfidenceHelper && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <p className="text-sm text-blue-800">
                          Confidence helps us understand how certain you are about your answer. 
                          Lower confidence might indicate you need to discuss this topic with a healthcare provider.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Notes Section */}
              {currentAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="border-t border-gray-200 pt-4 mt-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Additional notes (optional)
                    </label>
                    <EnhancedButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotes(!showNotes)}
                    >
                      {showNotes ? 'Hide' : 'Add Notes'}
                    </EnhancedButton>
                  </div>
                  
                  <AnimatePresence>
                    {showNotes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EnhancedInput
                          type="text"
                          value={notes}
                          onChange={setNotes}
                          placeholder="Add any additional information or context..."
                          size="md"
                          maxLength={500}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </EnhancedCard>

            {/* Supportive Message */}
            <AnimatePresence>
              {showSupportiveMessage && currentQuestion.supportiveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <EnhancedCard className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <div className="flex items-start gap-3">
                      <HeartIconSolid className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-green-800">{currentQuestion.supportiveMessage}</p>
                    </div>
                  </EnhancedCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Warning Message */}
            {currentQuestion.warningMessage && currentAnswer === true && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <EnhancedCard className="bg-orange-50 border-orange-200">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <p className="text-orange-800">{currentQuestion.warningMessage}</p>
                  </div>
                </EnhancedCard>
              </motion.div>
            )}

            {/* Related Resources */}
            {currentQuestion.relatedResources && currentQuestion.relatedResources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mb-6"
              >
                <EnhancedCard>
                  <h4 className="font-medium text-gray-900 mb-3">Related Resources</h4>
                  <div className="space-y-2">
                    {currentQuestion.relatedResources.map((resource, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <BookOpenIcon className="w-4 h-4 text-blue-600" />
                        <a
                          href={resource.url}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          {resource.title}
                        </a>
                        <EnhancedBadge variant="info" size="xs">
                          {resource.type}
                        </EnhancedBadge>
                      </div>
                    ))}
                  </div>
                </EnhancedCard>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <EnhancedButton
            variant="secondary"
            size="lg"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            icon={ArrowLeftIcon}
          >
            Previous
          </EnhancedButton>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {assessmentQuestions.length}
            </span>
          </div>
          
          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={currentAnswer === null}
            icon={currentStep === assessmentQuestions.length - 1 ? CheckCircleIcon : ArrowRightIcon}
            loading={isLoading}
            magnetic
          >
            {currentStep === assessmentQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
          </EnhancedButton>
        </motion.div>

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Assessment Help</h3>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">How to Answer</h4>
                      <p className="text-sm text-gray-600">
                        Answer each question as accurately as possible. If you're unsure, 
                        select the closest option and adjust your confidence level accordingly.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Confidence Level</h4>
                      <p className="text-sm text-gray-600">
                        Rate how confident you are in your answer from 1-10. Lower confidence 
                        indicates you might want to discuss this topic with a healthcare provider.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                      <p className="text-sm text-gray-600">
                        Your responses are encrypted and stored securely. This assessment 
                        is for educational purposes and is not a medical diagnosis.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Remember:</strong> This assessment is designed to provide 
                        educational information and should not replace professional medical advice.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 