'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  Building2, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { GHANA_REGIONS, GHANA_MUNICIPALITIES, getMunicipalitiesByRegion } from '@/data/ghana-municipalities';
import type { MunicipalityAccount } from '@/types';

// Mock data - would come from API
const mockMunicipalityAccounts: MunicipalityAccount[] = [
  {
    id: '1',
    municipalityId: 'accra-metropolitan',
    municipalityName: 'Accra Metropolitan Assembly',
    regionId: 'greater-accra',
    regionName: 'Greater Accra Region',
    status: 'active',
    adminUserId: 'admin-1',
    contactInfo: {
      primaryEmail: 'admin@accra.gov.gh',
      phone: '+233 30 266 4181',
      address: 'Accra Metropolitan Assembly, High Street, Accra'
    },
    settings: {
      timezone: 'Africa/Accra',
      language: 'en',
      features: ['basic_reporting', 'event_management', 'certificate_management']
    },
    subscription: {
      plan: 'standard',
      startDate: '2024-01-01T00:00:00Z',
      isActive: true
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastActiveAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    municipalityId: 'kumasi-metropolitan',
    municipalityName: 'Kumasi Metropolitan Assembly',
    regionId: 'ashanti',
    regionName: 'Ashanti Region',
    status: 'pending',
    adminUserId: 'admin-2',
    contactInfo: {
      primaryEmail: 'admin@kma.gov.gh',
      phone: '+233 32 202 4181',
      address: 'Kumasi Metropolitan Assembly, Kumasi'
    },
    settings: {
      timezone: 'Africa/Accra',
      language: 'en',
      features: ['basic_reporting']
    },
    subscription: {
      plan: 'basic',
      startDate: '2024-01-10T00:00:00Z',
      isActive: false
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800'
};

const STATUS_ICONS = {
  active: CheckCircle,
  pending: Clock,
  suspended: XCircle,
  inactive: XCircle
};

export function MunicipalityManagement() {
  const [municipalities, setMunicipalities] = useState<MunicipalityAccount[]>(mockMunicipalityAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityAccount | null>(null);

  const filteredMunicipalities = municipalities.filter(municipality => {
    const matchesSearch = 
      municipality.municipalityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      municipality.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      municipality.contactInfo.primaryEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || municipality.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || municipality.regionId === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const handleStatusChange = async (municipalityId: string, newStatus: MunicipalityAccount['status']) => {
    // Update municipality status
    setMunicipalities(prev => 
      prev.map(m => 
        m.id === municipalityId 
          ? { ...m, status: newStatus, updatedAt: new Date().toISOString() }
          : m
      )
    );
  };

  const getRegistrationStats = () => {
    const totalMunicipalities = GHANA_MUNICIPALITIES.length;
    const registeredCount = municipalities.length;
    const activeCount = municipalities.filter(m => m.status === 'active').length;
    const pendingCount = municipalities.filter(m => m.status === 'pending').length;
    
    return {
      total: totalMunicipalities,
      registered: registeredCount,
      active: activeCount,
      pending: pendingCount,
      unregistered: totalMunicipalities - registeredCount
    };
  };

  const stats = getRegistrationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Municipality Management</h1>
          <p className="text-gray-600">Manage all registered municipalities across Ghana</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Register New Municipality
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Municipalities</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registered</p>
                <p className="text-2xl font-bold">{stats.registered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unregistered</p>
                <p className="text-2xl font-bold">{stats.unregistered}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search municipalities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="sm:w-48">
              <Select
                value={regionFilter}
                onValueChange={setRegionFilter}
              >
                <option value="all">All Regions</option>
                {GHANA_REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Municipalities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Municipalities ({filteredMunicipalities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Municipality</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Region</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Subscription</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMunicipalities.map((municipality) => (
                  <tr key={municipality.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{municipality.municipalityName}</p>
                        <p className="text-sm text-gray-600">ID: {municipality.municipalityId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{municipality.regionName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={STATUS_COLORS[municipality.status]}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(municipality.status)}
                          {municipality.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-700">{municipality.contactInfo.primaryEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-700">{municipality.contactInfo.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={municipality.subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {municipality.subscription.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">
                        {municipality.lastActiveAt 
                          ? new Date(municipality.lastActiveAt).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {municipality.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleStatusChange(municipality.id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
