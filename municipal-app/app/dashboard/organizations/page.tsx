'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Users
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  municipality_id: string;
}

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockOrganizations: Organization[] = [
        {
          id: '1',
          name: 'Pink Ribbon Foundation',
          type: 'Non-Profit',
          description: 'Breast cancer awareness and support organization',
          contact_person: 'Sarah Johnson',
          email: 'sarah@pinkribbon.org',
          phone: '+233 24 123 4567',
          address: 'Accra, Greater Accra Region',
          status: 'pending',
          created_at: new Date().toISOString(),
          municipality_id: user?.municipality_id || 'accra-metro'
        },
        {
          id: '2',
          name: 'Women Health Initiative',
          type: 'Community Group',
          description: 'Community-based women health advocacy',
          contact_person: 'Mary Asante',
          email: 'mary@whi.org',
          phone: '+233 24 987 6543',
          address: 'Tema, Greater Accra Region',
          status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          municipality_id: user?.municipality_id || 'accra-metro'
        },
        {
          id: '3',
          name: 'Hope Cancer Support',
          type: 'Support Group',
          description: 'Support group for cancer patients and survivors',
          contact_person: 'Grace Mensah',
          email: 'grace@hopecancer.org',
          phone: '+233 24 555 7890',
          address: 'Accra, Greater Accra Region',
          status: 'approved',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          municipality_id: user?.municipality_id || 'accra-metro'
        }
      ];

      setOrganizations(mockOrganizations);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orgId: string) => {
    try {
      // Mock approval - replace with actual API call
      setOrganizations(prev => 
        prev.map(org => 
          org.id === orgId ? { ...org, status: 'approved' as const } : org
        )
      );
      toast.success('Organization approved successfully');
    } catch (error) {
      console.error('Error approving organization:', error);
      toast.error('Failed to approve organization');
    }
  };

  const handleReject = async (orgId: string) => {
    try {
      // Mock rejection - replace with actual API call
      setOrganizations(prev => 
        prev.map(org => 
          org.id === orgId ? { ...org, status: 'rejected' as const } : org
        )
      );
      toast.success('Organization rejected');
    } catch (error) {
      console.error('Error rejecting organization:', error);
      toast.error('Failed to reject organization');
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Organizations
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage organization registrations and approvals
            </p>
          </div>
          
          <PermissionGuard permission="organizations.create">
            <Button onClick={() => toast.success('Create organization feature coming soon!')}>
              <Plus className="h-4 w-4 mr-2" />
              Register Organization
            </Button>
          </PermissionGuard>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{organizations.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {organizations.filter(org => org.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {organizations.filter(org => org.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {organizations.filter(org => org.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations List */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations ({filteredOrganizations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrganizations.length > 0 ? (
              <div className="space-y-4">
                {filteredOrganizations.map((org) => (
                  <div key={org.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{org.name}</h3>
                          {getStatusBadge(org.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{org.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{org.contact_person}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{org.email}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{org.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{org.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {org.status === 'pending' && (
                          <PermissionGuard permission="organizations.approve">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(org.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReject(org.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </PermissionGuard>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Organizations Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No organizations match your current filters.'
                    : 'No organizations have been registered yet.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
