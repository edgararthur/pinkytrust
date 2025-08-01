'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import {
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  QrCodeIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowRightIcon,
  BellIcon,
  PlayIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  HandRaisedIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  CameraIcon,
  SpeakerWaveIcon,
  EyeIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  GiftIcon,
  HomeIcon,
  FaceSmileIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
} from '@heroicons/react/24/solid';

// SearchBar component will be implemented inline or removed as it's not used in this component
import BottomNavigation from './components/BottomNavigation';
import AppLoadingScreen from '@/components/ui/AppLoadingScreen';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LoadingCard } from '@/components/ui/LoadingStates';
import { useEvents, useAwarenessContent, useCommunityPosts } from '@/lib/queries';
import { useDataManager } from '@/lib/data-manager';
import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedBadge, 
  EnhancedProgress, 
  EnhancedLoading,
  EnhancedTooltip 
} from '@/components/ui/EnhancedComponents';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNetwork } from '@/components/providers/NetworkProvider';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  solidIcon: React.ComponentType<any>;
  href: string;
  color: string;
  bgColor: string;
  gradient: string;
  priority: 'high' | 'medium' | 'low';
  completionRate?: number;
  isNew?: boolean;
  estimatedTime?: string;
  category: 'health' | 'education' | 'community' | 'support';
  benefits: string[];
  nextSteps?: string[];
}

interface HealthStatistic {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  target?: number;
  source: string;
  lastUpdated: string;
}

interface Testimonial {
  id: string;
  name: string;
  age: number;
  location: string;
  avatar: string;
  story: string;
  shortStory: string;
  outcome: string;
  rating: number;
  date: string;
  verified: boolean;
  category: 'survivor' | 'supporter' | 'healthcare' | 'family';
  tags: string[];
  helpfulCount: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  progress: number;
  target: number;
  unit: string;
  category: 'health' | 'education' | 'community' | 'support';
  reward: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: {
    name: string;
    type: 'hospital' | 'nonprofit' | 'government' | 'community';
    logo?: string;
    verified: boolean;
  };
  category: 'screening' | 'education' | 'support' | 'fundraising' | 'awareness';
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
  isFree: boolean;
  isVirtual: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  image?: string;
  priority: 'high' | 'medium' | 'low';
}

interface EmergencyContact {
  id: string;
  name: string;
  description: string;
  phone: string;
  available24x7: boolean;
  type: 'emergency' | 'support' | 'information' | 'appointment';
  specialties: string[];
  languages: string[];
}

export default function HomePage() {
  const router = useRouter();
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Transform values for animations
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // InView animations
  const testimonialsInView = useInView(testimonialsRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  // Data fetching
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: awarenessContent = [], isLoading: contentLoading } = useAwarenessContent();
  const { data: communityPosts = [], isLoading: postsLoading } = useCommunityPosts();

  // Network state
  const { isOnline, isSlowConnection } = useNetwork();

  // State
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Navigation handlers
  const navigateTo = async (path: string) => {
    if (path && path.length > 0) {
      try {
        setIsLoading(true);
        await router.push(path);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Event handlers
  const handleEventClick = (eventId: string) => {
    navigateTo(`/events/${eventId}`);
  };

  const handleQuickActionClick = (href: string) => {
    navigateTo(href);
  };

  const handleEmergencyContact = () => {
    setShowEmergencyContacts(true);
  };

  const handleHelpfulClick = async (testimonialId: string) => {
    try {
      // await apiClient.post(`/testimonials/${testimonialId}/helpful`); // apiClient is not defined
      // You could update the testimonial count here if needed
    } catch (error) {
      console.error('Failed to mark testimonial as helpful:', error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    },
  };

  // Loading state
  if (eventsLoading || contentLoading || postsLoading || isLoading) {
    return <AppLoadingScreen />;
  }

  const quickActions: QuickAction[] = [
    {
      id: 'assessment',
      title: 'Health Assessment',
      description: 'Complete your personalized breast health evaluation with expert guidance',
      icon: ShieldCheckIcon,
      solidIcon: ShieldCheckIconSolid,
      href: '/assessment',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      priority: 'high',
      completionRate: 0,
      isNew: false,
      estimatedTime: '10-15 min',
      category: 'health',
      benefits: ['Personalized risk assessment', 'Expert recommendations', 'Early detection guidance'],
      nextSteps: ['Complete health questionnaire', 'Review risk factors', 'Get personalized recommendations'],
    },
    {
      id: 'education',
      title: 'Learn & Explore',
      description: 'Access expert-curated educational content and resources',
      icon: BookOpenIcon,
      solidIcon: BookOpenIcon,
      href: '/awareness',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
      priority: 'medium',
      completionRate: 45,
      estimatedTime: '5-20 min',
      category: 'education',
      benefits: ['Expert-reviewed content', 'Interactive learning', 'Latest research updates'],
      nextSteps: ['Browse featured articles', 'Watch educational videos', 'Take knowledge quizzes'],
    },
    {
      id: 'events',
      title: 'Community Events',
      description: 'Join local screening events, support groups, and educational workshops',
      icon: CalendarDaysIcon,
      solidIcon: CalendarDaysIcon,
      href: '/events',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
      priority: 'medium',
      completionRate: 20,
      estimatedTime: '2-4 hours',
      category: 'community',
      benefits: ['Free screenings', 'Expert consultations', 'Community support'],
      nextSteps: ['Find nearby events', 'Register for screenings', 'Join support groups'],
    },
    {
      id: 'support',
      title: 'Get Support',
      description: 'Connect with healthcare professionals, counselors, and support groups',
      icon: UserGroupIcon,
      solidIcon: UserGroupIconSolid,
      href: '/community',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      gradient: 'from-pink-500 to-pink-600',
      priority: 'high',
      estimatedTime: 'Ongoing',
      category: 'support',
      benefits: ['24/7 support access', 'Professional counseling', 'Peer support groups'],
      nextSteps: ['Browse support options', 'Schedule consultations', 'Join community groups'],
    },
  ];

  const healthStats: HealthStatistic[] = [
    {
      id: 'early-detection',
      label: 'Early Detection Rate',
      value: 89,
      unit: '%',
      change: 12,
      changeType: 'positive',
      description: 'Percentage of cases detected in early stages through regular screening',
      icon: ShieldCheckIcon,
      color: 'text-green-600',
      target: 95,
      source: 'National Cancer Institute',
      lastUpdated: '2024-01-15',
    },
    {
      id: 'survival-rate',
      label: '5-Year Survival Rate',
      value: 91,
      unit: '%',
      change: 8,
      changeType: 'positive',
      description: 'Survival rate for breast cancer when detected early',
      icon: HeartIcon,
      color: 'text-pink-600',
      target: 95,
      source: 'American Cancer Society',
      lastUpdated: '2024-01-10',
    },
    {
      id: 'screening-participation',
      label: 'Screening Participation',
      value: 67,
      unit: '%',
      change: -3,
      changeType: 'negative',
      description: 'Percentage of eligible women participating in regular screening',
      icon: UsersIcon,
      color: 'text-blue-600',
      target: 80,
      source: 'Health Department',
      lastUpdated: '2024-01-12',
    },
    {
      id: 'community-events',
      label: 'Monthly Events',
      value: 24,
      unit: 'events',
      change: 6,
      changeType: 'positive',
      description: 'Number of awareness and screening events organized this month',
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      target: 30,
      source: 'Event Organizers',
      lastUpdated: '2024-01-14',
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      age: 42,
      location: 'San Francisco, CA',
      avatar: '/testimonials/sarah.jpg',
      story: 'The early detection program saved my life. Through regular screening and the support I found here, I caught my cancer in stage 1. The community has been incredible throughout my journey.',
      shortStory: 'Early detection through this program saved my life. The community support has been incredible.',
      outcome: 'Cancer-free for 2 years',
      rating: 5,
      date: '2024-01-10',
      verified: true,
      category: 'survivor',
      tags: ['early-detection', 'support-group', 'survivor'],
      helpfulCount: 127,
    },
    {
      id: '2',
      name: 'Dr. Maria Rodriguez',
      age: 38,
      location: 'Austin, TX',
      avatar: '/testimonials/maria.jpg',
      story: 'As an oncologist, I recommend this platform to all my patients. The educational resources are evidence-based and the community support is unmatched.',
      shortStory: 'As an oncologist, I recommend this platform for its evidence-based resources and community support.',
      outcome: 'Helping patients daily',
      rating: 5,
      date: '2024-01-08',
      verified: true,
      category: 'healthcare',
      tags: ['medical-professional', 'education', 'resources'],
      helpfulCount: 89,
    },
    {
      id: '3',
      name: 'Jennifer Thompson',
      age: 35,
      location: 'Denver, CO',
      avatar: '/testimonials/jennifer.jpg',
      story: 'My mother is a breast cancer survivor, and this platform helped our whole family understand the journey. The support groups for families are amazing.',
      shortStory: 'This platform helped our family understand and support my mother through her cancer journey.',
      outcome: 'Family stronger together',
      rating: 5,
      date: '2024-01-05',
      verified: true,
      category: 'family',
      tags: ['family-support', 'caregiver', 'education'],
      helpfulCount: 156,
    },
  ];

  const achievements: Achievement[] = [
    {
      id: 'first-assessment',
      title: 'Health Champion',
      description: 'Complete your first health assessment',
      icon: ShieldCheckIcon,
      progress: 0,
      target: 1,
      unit: 'assessment',
      category: 'health',
      reward: 'Personalized health insights',
      unlocked: false,
    },
    {
      id: 'education-explorer',
      title: 'Knowledge Seeker',
      description: 'Read 5 educational articles',
      icon: BookOpenIcon,
      progress: 2,
      target: 5,
      unit: 'articles',
      category: 'education',
      reward: 'Advanced learning resources',
      unlocked: false,
    },
    {
      id: 'community-connector',
      title: 'Community Builder',
      description: 'Attend 3 community events',
      icon: UserGroupIcon,
      progress: 1,
      target: 3,
      unit: 'events',
      category: 'community',
      reward: 'VIP event access',
      unlocked: false,
    },
    {
      id: 'support-advocate',
      title: 'Support Advocate',
      description: 'Help 10 community members',
      icon: HandRaisedIcon,
      progress: 4,
      target: 10,
      unit: 'members',
      category: 'support',
      reward: 'Mentor badge',
      unlocked: false,
    },
  ];

  // Use real events data with fallback to cached data
  const upcomingEvents = events.length > 0 ? events.slice(0, 3) : [
    {
      id: '1',
      title: 'Free Breast Cancer Screening',
      description: 'Comprehensive screening with certified radiologists and immediate results',
      date: '2024-02-15',
      time: '09:00 AM',
      location: 'City Medical Center',
      organizer: {
        name: 'Metropolitan Health System',
        type: 'hospital',
        logo: '/logos/metro-health.png',
        verified: true,
      },
      category: 'screening',
      attendees: 45,
      maxAttendees: 60,
      isRegistered: false,
      isFree: true,
      isVirtual: false,
      tags: ['screening', 'free', 'walk-in'],
      rating: 4.9,
      reviewCount: 234,
      image: '/events/screening-1.jpg',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Breast Health Education Workshop',
      description: 'Interactive workshop on self-examination techniques and risk factors',
      date: '2024-02-18',
      time: '02:00 PM',
      location: 'Community Center',
      organizer: {
        name: 'Pink Ribbon Foundation',
        type: 'nonprofit',
        logo: '/logos/pink-ribbon.png',
        verified: true,
      },
      category: 'education',
      attendees: 28,
      maxAttendees: 40,
      isRegistered: true,
      isFree: true,
      isVirtual: false,
      tags: ['education', 'workshop', 'interactive'],
      rating: 4.8,
      reviewCount: 89,
      image: '/events/workshop-1.jpg',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Survivor Support Circle',
      description: 'Monthly support group meeting for survivors and their families',
      date: '2024-02-20',
      time: '06:30 PM',
      location: 'Online & In-Person',
      organizer: {
        name: 'Healing Hearts Support',
        type: 'nonprofit',
        logo: '/logos/healing-hearts.png',
        verified: true,
      },
      category: 'support',
      attendees: 18,
      maxAttendees: 25,
      isRegistered: false,
      isFree: true,
      isVirtual: true,
      tags: ['support', 'survivors', 'monthly'],
      rating: 4.9,
      reviewCount: 156,
      image: '/events/support-1.jpg',
      priority: 'high',
    },
  ];

  const emergencyContacts: EmergencyContact[] = [
    {
      id: 'crisis-hotline',
      name: 'Crisis Support Hotline',
      description: 'Immediate emotional support and crisis intervention',
      phone: '1-800-273-8255',
      available24x7: true,
      type: 'emergency',
      specialties: ['Crisis intervention', 'Emotional support', 'Referrals'],
      languages: ['English', 'Spanish', 'Mandarin'],
    },
    {
      id: 'medical-emergency',
      name: 'Medical Emergency',
      description: 'For immediate medical emergencies',
      phone: '911',
      available24x7: true,
      type: 'emergency',
      specialties: ['Emergency medicine', 'Trauma care'],
      languages: ['English', 'Spanish'],
    },
    {
      id: 'cancer-info',
      name: 'Cancer Information Service',
      description: 'Expert information about cancer prevention, treatment, and support',
      phone: '1-800-422-6237',
      available24x7: true,
      type: 'information',
      specialties: ['Cancer information', 'Treatment options', 'Clinical trials'],
      languages: ['English', 'Spanish'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Offline indicator */}
      {!isOnline && (
        <motion.div
          className="fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm font-medium z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          You are currently offline. Some features may be unavailable.
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden pb-4"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Application Logo */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex justify-center">
                <div className="flex items-center gap-4 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <Image
                    src="/images/logo.png"
                    alt="PinkyTrust Logo"
                    width={60}
                    height={60}
                    className="rounded-xl"
                  />
                  <div>
                    <h1 className="text-2xl font-display font-bold text-primary-600">
                      PinkyTrust
                    </h1>
                    <p className="text-sm text-gray-600">Breast Health Companion</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Awareness Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-200 rounded-full px-4 py-2 shadow-sm">
                <HeartIcon className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-800">
                  October is Breast Cancer Awareness Month
                </span>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-3"
            >
              Early Detection{' '}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Saves Lives
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl text-gray-700">
                Your Health Journey Matters
              </span>
            </motion.h1>

            {/* Key Statistics */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  <span className="font-bold text-pink-600">1 in 8</span>
                  <span className="text-gray-600 ml-1">women will develop breast cancer</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  <span className="font-bold text-green-600">99%</span>
                  <span className="text-gray-600 ml-1">survival rate when caught early</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <EnhancedButton
                variant="tertiary"
                size="lg"
                icon={MapPinIcon}
                onClick={() => navigateTo('/events')}
                className="w-full sm:w-auto"
                magnetic
              >
                Find Nearby Screening Events
              </EnhancedButton>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-4">
              <EnhancedButton
                variant="warm"
                size="sm"
                icon={PhoneIcon}
                onClick={handleEmergencyContact}
              >
                Emergency Support
              </EnhancedButton>

              <EnhancedButton
                variant="cool"
                size="sm"
                icon={UserGroupIcon}
                onClick={() => navigateTo('/community')}
              >
                Join Community
              </EnhancedButton>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        ref={testimonialsRef}
        className="py-4 bg-gradient-to-r from-pink-50 to-purple-50"
        initial={{ opacity: 0 }}
        animate={testimonialsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 mb-1">
              💪 Stories of Hope & Strength
            </h2>
            <p className="text-sm text-gray-600">
              Real stories from our community members who found support and healing
            </p>

            {/* Testimonial Navigation */}
            {/* <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index
                      ? 'bg-primary-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div> */}
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <EnhancedCard className="text-center" hover glow>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {testimonials[currentTestimonial]?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      {testimonials[currentTestimonial]?.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonials[currentTestimonial]?.shortStory || 'Amazing experience with early detection.'}"
                  </blockquote>

                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`w-5 h-5 ${
                          i < (testimonials[currentTestimonial]?.rating || 5)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial]?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {testimonials[currentTestimonial]?.location || 'Community Member'}
                    </p>
                    <EnhancedBadge
                      variant="success"
                      size="sm"
                      className="mb-4"
                    >
                      {testimonials[currentTestimonial]?.outcome || 'Positive Outcome'}
                    </EnhancedBadge>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleHelpfulClick(testimonials[currentTestimonial]?.id)}
                        className="hover:text-primary-600 transition-colors duration-200"
                      >
                        <span>{testimonials[currentTestimonial]?.helpfulCount || 0} found this helpful</span>
                      </button>
                      <span>•</span>
                      <span>{testimonials[currentTestimonial]?.category || 'General'}</span>
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-primary-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-6 bg-gradient-to-r from-primary-600 to-secondary-600"
        initial={{ opacity: 0 }}
        animate={ctaInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of women who have taken the first step towards better breast health. 
              Your journey to wellness starts with a single click.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <EnhancedButton
                variant="secondary"
                size="lg"
                icon={ShieldCheckIcon}
                onClick={() => navigateTo('/assessment')}
                className="bg-white text-primary-600 hover:bg-gray-50"
                magnetic
                glow
              >
                Start Your Assessment
              </EnhancedButton>
              
              <EnhancedButton
                variant="ghost"
                size="lg"
                icon={PhoneIcon}
                onClick={handleEmergencyContact}
                className="text-white border-white hover:bg-white/10"
              >
                Get Support Now
              </EnhancedButton>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Emergency Contacts Modal */}
      <AnimatePresence>
        {showEmergencyContacts && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEmergencyContacts(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Emergency Support</h3>
                  <button
                    onClick={() => setShowEmergencyContacts(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <EnhancedCard key={contact.id} className="p-4" hover>
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
                            {contact.available24x7 && (
                              <EnhancedBadge variant="success" size="xs">
                                24/7
                              </EnhancedBadge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
                            >
                              {contact.phone}
                            </a>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {contact.specialties.slice(0, 2).map((specialty) => (
                              <EnhancedBadge key={specialty} variant="neutral" size="xs">
                                {specialty}
                              </EnhancedBadge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </EnhancedCard>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Important Note</p>
                      <p className="text-sm text-yellow-700">
                        If you're experiencing a medical emergency, please call 911 immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <EnhancedButton
            variant="primary"
            size="lg"
            icon={HeartIconSolid}
            onClick={handleEmergencyContact}
            className="rounded-full w-14 h-14 shadow-2xl"
            glow
            magnetic
          >
            <span className="sr-only">Quick Help</span>
          </EnhancedButton>

          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-primary-500 opacity-20 animate-ping"></div>
        </motion.div>
      </motion.div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Company Attribution */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Developed by</span>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <Image
                  src="/images/gi-kace-logo.jpeg"
                  alt="GI-KACE Logo"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="font-medium text-gray-900">GI-KACE</span>
              </div>
            </div>

            {/* App Info */}
            <div className="text-center text-xs text-gray-500">
              <p>© {new Date().getFullYear()} PinkyTrust. All rights reserved.</p>
              <p className="mt-1">Your trusted companion for breast health awareness and early detection.</p>
            </div>

            {/* Medical Disclaimer */}
            <div className="text-center text-xs text-gray-400 max-w-2xl">
              <p>
                <strong>Medical Disclaimer:</strong> This app provides educational information and should not replace professional medical advice.
                Always consult with healthcare professionals for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}