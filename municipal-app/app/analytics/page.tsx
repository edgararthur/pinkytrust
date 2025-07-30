'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataVisualization } from '../../../shared/components/ui/DataVisualization';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { DashboardService } from '@/lib/api/dashboard';
import { OrganizationsService } from '@/lib/api/organizations';
import { EventsService } from '@/lib/api/events';
import { ReportsService } from '@/lib/api/reports';
import { CertificatesService } from '@/lib/api/certificates';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building2,
  FileText,
  Award,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalOrganizations: number;
    activeEvents: number;
    totalReports: number;
    activeCertificates: number;
    totalScreenings: number;
    suspectedCases: number;
    referralsMade: number;
    growthRate: number;
  };
  trends: {
    organizations: Array<{ month: string; count: number; }>;
    events: Array<{ month: string; count: number; }>;
    reports: Array<{ month: string; count: number; }>;
    screenings: Array<{ month: string; count: number; }>;
  };
  demographics: {
    organizationsByStatus: Array<{ status: string; count: number; color: string; }>;
    eventsByType: Array<{ type: string; count: number; color: string; }>;
    reportsByType: Array<{ type: string; count: number; color: string; }>;
    certificatesByStatus: Array<{ status: string; count: number; color: string; }>;
  };
  performance: {
    approvalRates: {
      organizations: number;
      events: number;
      reports: number;
    };
    averageProcessingTime: {
      organizations: number;
      events: number;
      reports: number;
    };
    userActivity: Array<{ date: string; activeUsers: number; }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'organizations' | 'events' | 'reports' | 'screenings'>('all');
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedMetric]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls to get analytics data
      const [dashboardStats, orgStats, eventStats, reportStats, certStats] = await Promise.all([
        DashboardService.getStats(),
        OrganizationsService.getOrganizationStats(),
        EventsService.getEventStats(),
        ReportsService.getReportStats(),
        CertificatesService.getCertificateStats(),
      ]);

      // Generate mock trend data
      const generateTrendData = (baseCount: number, months: number = 12) => {
        const data = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = months - 1; i >= 0; i--) {
          const monthIndex = (new Date().getMonth() - i + 12) % 12;
          const variation = Math.random() * 0.3 - 0.15; // ±15% variation
          const count = Math.max(0, Math.floor(baseCount * (1 + variation)));
          
          data.push({
            month: monthNames[monthIndex],
            count,
          });
        }
        
        return data;
      };

      const analyticsData: AnalyticsData = {
        overview: {
          totalOrganizations: dashboardStats.totalOrganisations,
          activeEvents: dashboardStats.activeEvents,
          totalReports: dashboardStats.totalReports,
          activeCertificates: dashboardStats.activeCertificates,
          totalScreenings: dashboardStats.totalScreenings,
          suspectedCases: dashboardStats.suspectedCases,
          referralsMade: dashboardStats.referralsMade,
          growthRate: 12.5, // Mock growth rate
        },
        trends: {
          organizations: generateTrendData(dashboardStats.totalOrganisations / 12),
          events: generateTrendData(dashboardStats.totalEvents / 12),
          reports: generateTrendData(dashboardStats.totalReports / 12),
          screenings: generateTrendData(dashboardStats.totalScreenings / 12),
        },
        demographics: {
          organizationsByStatus: [
            { status: 'Approved', count: dashboardStats.activeOrganisations, color: '#10B981' },
            { status: 'Pending', count: dashboardStats.pendingOrganisations, color: '#F59E0B' },
            { status: 'Rejected', count: Math.max(0, dashboardStats.totalOrganisations - dashboardStats.activeOrganisations - dashboardStats.pendingOrganisations), color: '#EF4444' },
          ],
          eventsByType: [
            { type: 'Screening', count: Math.floor(dashboardStats.totalEvents * 0.4), color: '#3B82F6' },
            { type: 'Education', count: Math.floor(dashboardStats.totalEvents * 0.3), color: '#8B5CF6' },
            { type: 'Support', count: Math.floor(dashboardStats.totalEvents * 0.2), color: '#06B6D4' },
            { type: 'Awareness', count: Math.floor(dashboardStats.totalEvents * 0.1), color: '#84CC16' },
          ],
          reportsByType: [
            { type: 'Monthly', count: Math.floor(reportStats.total * 0.4), color: '#F59E0B' },
            { type: 'Event', count: Math.floor(reportStats.total * 0.3), color: '#10B981' },
            { type: 'Quarterly', count: Math.floor(reportStats.total * 0.2), color: '#3B82F6' },
            { type: 'Annual', count: Math.floor(reportStats.total * 0.1), color: '#8B5CF6' },
          ],
          certificatesByStatus: [
            { status: 'Active', count: dashboardStats.activeCertificates, color: '#10B981' },
            { status: 'Expiring Soon', count: dashboardStats.expiringSoonCertificates, color: '#F59E0B' },
            { status: 'Expired', count: Math.max(0, dashboardStats.totalCertificates - dashboardStats.activeCertificates - dashboardStats.expiringSoonCertificates), color: '#EF4444' },
          ],
        },
        performance: {
          approvalRates: {
            organizations: Math.round((dashboardStats.activeOrganisations / dashboardStats.totalOrganisations) * 100),
            events: Math.round((dashboardStats.activeEvents / dashboardStats.totalEvents) * 100),
            reports: Math.round((reportStats.approved / reportStats.total) * 100),
          },
          averageProcessingTime: {
            organizations: 3.2, // days
            events: 2.1, // days
            reports: 1.8, // days
          },
          userActivity: generateTrendData(50, 30).map((item, index) => ({
            date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            activeUsers: item.count,
          })),
        },
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Analytics data has been exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No analytics data available</p>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive insights and reporting for the breast cancer platform
              </p>
            </div>
          <div className="flex items-center gap-3">
              <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              </select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              leftIcon={refreshing ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
        </div>
      </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Organizations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.totalOrganizations.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
        </div>
          </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+{data.overview.growthRate}%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.activeEvents.toLocaleString()}
                  </p>
          </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
          </div>
        </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Screenings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.totalScreenings.toLocaleString()}
                  </p>
          </div>
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+15.3%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suspected Cases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.suspectedCases.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
              <div className="flex items-center mt-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">-2.1%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
                        </div>
            </CardContent>
          </Card>
                      </div>

        {/* Trends Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Organization Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="line"
                data={data.trends.organizations}
                xKey="month"
                yKey="count"
                title="Organizations Over Time"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="bar"
                data={data.trends.events}
                xKey="month"
                yKey="count"
                title="Events Over Time"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="area"
                data={data.trends.reports}
                xKey="month"
                yKey="count"
                title="Reports Over Time"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Screening Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="line"
                data={data.trends.screenings}
                xKey="month"
                yKey="count"
                title="Screenings Over Time"
                height={300}
              />
            </CardContent>
          </Card>
          </div>

        {/* Demographics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="pie"
                data={data.demographics.organizationsByStatus}
                xKey="status"
                yKey="count"
                title="Organizations by Status"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="doughnut"
                data={data.demographics.eventsByType}
                xKey="type"
                yKey="count"
                title="Events by Type"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="pie"
                data={data.demographics.reportsByType}
                xKey="type"
                yKey="count"
                title="Reports by Type"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificate Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="doughnut"
                data={data.demographics.certificatesByStatus}
                xKey="status"
                yKey="count"
                title="Certificates by Status"
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Approval Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Organizations</span>
                <span className="text-lg font-semibold text-green-600">
                  {data.performance.approvalRates.organizations}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events</span>
                <span className="text-lg font-semibold text-green-600">
                  {data.performance.approvalRates.events}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reports</span>
                <span className="text-lg font-semibold text-green-600">
                  {data.performance.approvalRates.reports}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Organizations</span>
                <span className="text-lg font-semibold text-blue-600">
                  {data.performance.averageProcessingTime.organizations} days
                </span>
            </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events</span>
                <span className="text-lg font-semibold text-blue-600">
                  {data.performance.averageProcessingTime.events} days
                </span>
          </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reports</span>
                <span className="text-lg font-semibold text-blue-600">
                  {data.performance.averageProcessingTime.reports} days
                </span>
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataVisualization
                type="line"
                data={data.performance.userActivity}
                xKey="date"
                yKey="activeUsers"
                title="Daily Active Users"
                height={200}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 