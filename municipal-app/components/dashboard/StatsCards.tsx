'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Building2, 
  Award, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Provide default values if stats is null or undefined
  const safeStats: DashboardStats = {
    totalOrganisations: stats?.totalOrganisations ?? 0,
    activeOrganisations: stats?.activeOrganisations ?? 0,
    pendingOrganisations: stats?.pendingOrganisations ?? 0,
    totalEvents: stats?.totalEvents ?? 0,
    activeEvents: stats?.activeEvents ?? 0,
    completedEvents: stats?.completedEvents ?? 0,
    totalUsers: stats?.totalUsers ?? 0,
    totalReports: stats?.totalReports ?? 0,
    pendingReports: stats?.pendingReports ?? 0,
    totalCertificates: stats?.totalCertificates ?? 0,
    activeCertificates: stats?.activeCertificates ?? 0,
    expiringSoonCertificates: stats?.expiringSoonCertificates ?? 0,
    totalScreenings: stats?.totalScreenings ?? 0,
    suspectedCases: stats?.suspectedCases ?? 0,
    referralsMade: stats?.referralsMade ?? 0,
  };

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('StatsCards - Original stats:', stats);
    console.log('StatsCards - Safe stats:', safeStats);
  }

  const cards = [
    {
      title: 'Total Organizations',
      value: safeStats.totalOrganisations,
      change: {
        value: safeStats.activeOrganisations,
        label: 'Active',
        type: 'neutral' as const,
      },
      icon: Building2,
      color: 'blue',
      description: safeStats.pendingOrganisations > 0
        ? `${safeStats.pendingOrganisations} pending approval`
        : safeStats.totalOrganisations === 0
          ? 'No organizations registered yet'
          : 'All organizations approved',
    },
    {
      title: 'Active Certificates',
      value: safeStats.activeCertificates,
      change: {
        value: safeStats.expiringSoonCertificates,
        label: 'Expiring Soon',
        type: safeStats.expiringSoonCertificates > 0 ? 'warning' as const : 'neutral' as const,
      },
      icon: Award,
      color: 'green',
      description: safeStats.totalCertificates === 0
        ? 'No certificates issued yet'
        : `${safeStats.totalCertificates} total certificates`,
    },
    {
      title: 'Active Events',
      value: safeStats.activeEvents,
      change: {
        value: safeStats.completedEvents,
        label: 'Completed',
        type: 'neutral' as const,
      },
      icon: Calendar,
      color: 'purple',
      description: safeStats.totalEvents === 0
        ? 'No events scheduled yet'
        : `${safeStats.totalEvents} total events`,
    },
    {
      title: 'Pending Reports',
      value: safeStats.pendingReports,
      change: {
        value: Math.max(0, (safeStats.totalReports || 0) - (safeStats.pendingReports || 0)),
        label: 'Processed',
        type: 'neutral' as const,
      },
      icon: FileText,
      color: 'orange',
      description: safeStats.totalReports === 0
        ? 'No reports submitted yet'
        : `${safeStats.totalReports} total reports`,
    },
    {
      title: 'Municipal Staff',
      value: safeStats.totalUsers,
      change: {
        value: safeStats.totalUsers,
        label: 'Active Users',
        type: 'neutral' as const,
      },
      icon: Users,
      color: 'indigo',
      description: safeStats.totalUsers === 0
        ? 'No staff accounts created yet'
        : 'System administrators',
    },
    {
      title: 'Total Screenings',
      value: safeStats.totalScreenings,
      change: {
        value: safeStats.suspectedCases,
        label: 'Suspected Cases',
        type: safeStats.suspectedCases > 0 ? 'warning' as const : 'neutral' as const,
      },
      icon: CheckCircle,
      color: 'pink',
      description: safeStats.totalScreenings === 0
        ? 'No screenings conducted yet'
        : 'Breast cancer screenings',
    },
    {
      title: 'Referrals Made',
      value: safeStats.referralsMade,
      change: {
        value: safeStats.suspectedCases > 0
          ? Math.round((safeStats.referralsMade / safeStats.suspectedCases) * 100)
          : 0,
        label: '% of suspected cases',
        type: 'neutral' as const,
      },
      icon: TrendingUp,
      color: 'teal',
      description: safeStats.referralsMade === 0 && safeStats.suspectedCases === 0
        ? 'No referrals needed yet'
        : safeStats.referralsMade === 0
          ? 'Referrals pending for suspected cases'
          : 'Medical referrals',
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: {
        value: 0,
        label: 'Issues',
        type: 'success' as const,
      },
      icon: AlertTriangle,
      color: 'green',
      description: 'Platform uptime',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 shadow-sm',
      green: 'text-green-600 bg-green-100 shadow-sm',
      purple: 'text-purple-600 bg-purple-100 shadow-sm',
      orange: 'text-orange-600 bg-orange-100 shadow-sm',
      indigo: 'text-indigo-600 bg-indigo-100 shadow-sm',
      pink: 'text-pink-600 bg-pink-100 shadow-sm',
      teal: 'text-teal-600 bg-teal-100 shadow-sm',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'danger':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] border-l-4" style={{ borderLeftColor: card.color === 'pink' ? '#db2777' : '' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${getColorClasses(card.color)}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1" style={{ color: card.color === 'pink' ? '#db2777' : '' }}>
              {typeof card.value === 'number' && !isNaN(card.value)
                ? card.value.toLocaleString()
                : card.value || '0'}
            </div>

            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(card.change.type)}`}>
                {getChangeIcon(card.change.type)}
                <span className="font-medium">
                  {typeof card.change.value === 'number' && !isNaN(card.change.value)
                    ? card.change.value.toLocaleString()
                    : card.change.value || '0'}
                </span>
                <span className="text-gray-500">{card.change.label}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 mt-2">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
