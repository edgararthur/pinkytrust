'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { CertificateModal } from '@/components/certificates/CertificateModal';
import { 
  FileText,
  Search,
  Filter,
  Clock,
  Calendar,
  Download,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
  AlertTriangle,
  BarChart2
} from 'lucide-react';
import { CertificatesService, Certificate, CertificateFilters } from '@/lib/api/certificates';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';
import { formatDate, formatRelativeTime } from '@/utils';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit' | 'revoke'>('view');
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revoked: 0,
    pending: 0,
    byType: {} as Record<string, number>
  });

  useEffect(() => {
    loadCertificates();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const loadCertificates = async () => {
    if (!user?.municipality_id) return;

    try {
      setLoading(true);
      const filters: CertificateFilters = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        certificate_type: typeFilter !== 'all' ? typeFilter as any : undefined,
        organization_id: user.organization_id,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const response = await CertificatesService.getCertificates(filters);
      setCertificates(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.municipality_id) return;

    try {
      const certStats = await CertificatesService.getCertificateStats(user.organization_id);
      setStats(certStats);
    } catch (error) {
      console.error('Error loading certificate stats:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCertificate(null);
    setModalMode('view');
  };

  const handleModalSuccess = () => {
    loadCertificates();
    loadStats();
    handleModalClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, icon: Clock, label: 'Pending' },
      active: { variant: 'success' as const, icon: CheckCircle, label: 'Active' },
      expired: { variant: 'warning' as const, icon: AlertTriangle, label: 'Expired' },
      revoked: { variant: 'destructive' as const, icon: XCircle, label: 'Revoked' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const CertificateCard = ({ certificate }: { certificate: Certificate }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{certificate.title}</h3>
              <p className="text-sm text-gray-500">{certificate.certificate_type}</p>
            </div>
          </div>
          {getStatusBadge(certificate.status)}
        </div>

        {certificate.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{certificate.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            Issued: {formatDate(certificate.issue_date)}
          </div>
          {certificate.expiry_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Expires: {formatDate(certificate.expiry_date)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {formatRelativeTime(certificate.created_at)}
          </div>
          {certificate.document_url && (
            <a
              href={certificate.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-500"
            >
              <Download className="h-3 w-3" />
              View Document
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCertificate(certificate);
              setModalMode('view');
              setShowModal(true);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {certificate.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalMode('edit');
                  setShowModal(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setModalMode('revoke');
                  setShowModal(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
          </div>
          <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-pink-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
          <p className="text-gray-600">Manage organization certificates</p>
        </div>
        <Button onClick={() => {
          setSelectedCertificate(null);
          setModalMode('add');
          setShowModal(true);
        }}>
          <FileText className="h-4 w-4 mr-2" />
          Issue Certificate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Certificates" value={stats.total} icon={BarChart2} />
        <StatCard title="Active" value={stats.active} icon={CheckCircle} />
        <StatCard title="Expired" value={stats.expired} icon={AlertTriangle} />
        <StatCard title="Revoked" value={stats.revoked} icon={XCircle} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadCertificates}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by issuing your first certificate.'}
            </p>
            <Button onClick={() => {
              setSelectedCertificate(null);
              setModalMode('add');
              setShowModal(true);
            }}>
              <FileText className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showModal}
        onClose={handleModalClose}
        mode={modalMode}
        certificate={selectedCertificate}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}