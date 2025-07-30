'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Award, 
  Plus, 
  Search, 
  Download, 
  Eye,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';

interface Certificate {
  id: string;
  recipient_name: string;
  recipient_email: string;
  certificate_type: string;
  event_name: string;
  issue_date: string;
  certificate_number: string;
  status: 'issued' | 'pending' | 'revoked';
  municipality_id: string;
  issued_by: string;
  created_at: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          recipient_name: 'Sarah Johnson',
          recipient_email: 'sarah@example.com',
          certificate_type: 'Participation',
          event_name: 'Breast Cancer Awareness Walk 2024',
          issue_date: '2024-01-30',
          certificate_number: 'BCAW-2024-001',
          status: 'issued',
          municipality_id: user?.municipality_id || 'accra-metro',
          issued_by: 'Municipal Health Department',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          recipient_name: 'Mary Asante',
          recipient_email: 'mary@example.com',
          certificate_type: 'Volunteer Recognition',
          event_name: 'Free Breast Cancer Screening',
          issue_date: '2024-01-28',
          certificate_number: 'FBCS-2024-002',
          status: 'issued',
          municipality_id: user?.municipality_id || 'accra-metro',
          issued_by: 'Municipal Health Department',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          recipient_name: 'Grace Mensah',
          recipient_email: 'grace@example.com',
          certificate_type: 'Training Completion',
          event_name: 'Breast Health Education Workshop',
          issue_date: '2024-01-25',
          certificate_number: 'BHEW-2024-003',
          status: 'pending',
          municipality_id: user?.municipality_id || 'accra-metro',
          issued_by: 'Municipal Health Department',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge className="bg-green-100 text-green-800">Issued</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Participation':
        return 'text-blue-600';
      case 'Volunteer Recognition':
        return 'text-purple-600';
      case 'Training Completion':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading certificates...</p>
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
              <Award className="h-6 w-6 text-purple-600" />
              Certificates
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Issue and manage participation certificates
            </p>
          </div>
          
          <PermissionGuard permission="certificates.create">
            <Button onClick={() => toast.success('Issue certificate feature coming soon!')}>
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
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
                  placeholder="Search certificates..."
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
                <option value="issued">Issued</option>
                <option value="pending">Pending</option>
                <option value="revoked">Revoked</option>
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
                  <p className="text-2xl font-bold">{certificates.length}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Issued</p>
                  <p className="text-2xl font-bold text-green-600">
                    {certificates.filter(cert => cert.status === 'issued').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {certificates.filter(cert => cert.status === 'pending').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {certificates.filter(cert => {
                      const certDate = new Date(cert.issue_date);
                      const now = new Date();
                      return certDate.getMonth() === now.getMonth() && 
                             certDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates List */}
        <Card>
          <CardHeader>
            <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCertificates.length > 0 ? (
              <div className="space-y-4">
                {filteredCertificates.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{cert.recipient_name}</h3>
                          {getStatusBadge(cert.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Award className={`h-4 w-4 ${getTypeColor(cert.certificate_type)}`} />
                              <span className={`font-medium ${getTypeColor(cert.certificate_type)}`}>
                                {cert.certificate_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>{cert.event_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>{cert.recipient_email}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                            </div>
                            <div className="text-gray-600">
                              <span>Certificate #: {cert.certificate_number}</span>
                            </div>
                            <div className="text-gray-600">
                              <span>Issued by: {cert.issued_by}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {cert.status === 'issued' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No certificates match your current filters.'
                    : 'No certificates have been issued yet.'
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
