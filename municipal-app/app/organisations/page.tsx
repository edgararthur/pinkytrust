'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface Organisation {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  description?: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  registrationNumber?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documentUrl?: string;
  eventsCount: number;
  certificateStatus?: 'active' | 'revoked' | 'expired' | 'none';
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([
    {
      id: '1',
      name: 'Pink Ribbon Foundation',
      contactEmail: 'contact@pinkribbon.org',
      contactPhone: '+1-555-0123',
      address: '123 Health Street, City Center',
      website: 'https://pinkribbon.org',
      description: 'Dedicated to breast cancer awareness and support programs.',
      registrationStatus: 'approved',
      registrationNumber: 'ORG-2024-001',
      submittedAt: '2024-01-15T10:00:00Z',
      reviewedAt: '2024-01-16T14:30:00Z',
      reviewedBy: 'admin@municipal.gov',
      eventsCount: 12,
      certificateStatus: 'active',
    },
    {
      id: '2',
      name: 'Women\'s Health Alliance',
      contactEmail: 'info@wha.org',
      contactPhone: '+1-555-0456',
      address: '456 Wellness Avenue, Downtown',
      description: 'Community-based women\'s health advocacy and education.',
      registrationStatus: 'pending',
      submittedAt: '2024-01-20T09:15:00Z',
      eventsCount: 0,
      certificateStatus: 'none',
      documentUrl: '/documents/wha-registration.pdf',
    },
    {
      id: '3',
      name: 'Survivors United',
      contactEmail: 'support@survivorsunited.org',
      address: '789 Hope Boulevard, Riverside',
      description: 'Support group network for breast cancer survivors and families.',
      registrationStatus: 'pending',
      submittedAt: '2024-01-22T16:45:00Z',
      eventsCount: 0,
      certificateStatus: 'none',
      documentUrl: '/documents/survivors-registration.pdf',
    },
  ]);

  const [filteredOrganisations, setFilteredOrganisations] = useState<Organisation[]>(organisations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterOrganisations();
  }, [searchQuery, statusFilter, organisations]);

  const filterOrganisations = () => {
    let filtered = organisations;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.registrationStatus === statusFilter);
    }

    // Sort: pending first, then by submission date
    filtered.sort((a, b) => {
      if (a.registrationStatus === 'pending' && b.registrationStatus !== 'pending') return -1;
      if (b.registrationStatus === 'pending' && a.registrationStatus !== 'pending') return 1;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    setFilteredOrganisations(filtered);
  };

  const handleStatusUpdate = (orgId: string, newStatus: 'approved' | 'rejected') => {
    setOrganisations(prev =>
      prev.map(org =>
        org.id === orgId
          ? {
              ...org,
              registrationStatus: newStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'current_user@municipal.gov',
              certificateStatus: newStatus === 'approved' ? 'active' : 'none',
              registrationNumber: newStatus === 'approved' ? `ORG-2024-${String(Date.now()).slice(-3)}` : undefined,
            }
          : org
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingCount = organisations.filter(org => org.registrationStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                Organisations
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage organisation registrations and certificates
              </p>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              {pendingCount > 0 && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {pendingCount} pending review
                </span>
              )}
              <Link
                href="/organisations/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Organisation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organisations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Organisation Cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredOrganisations.map((organisation) => (
            <div key={organisation.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                {/* Header with status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{organisation.name}</h3>
                      <p className="text-sm text-gray-500">
                        {organisation.registrationNumber || 'No registration number'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(organisation.registrationStatus)}
                    <span className="ml-1 text-sm font-medium text-gray-600">
                      {getStatusText(organisation.registrationStatus)}
                    </span>
                  </div>
                </div>

                {/* Organisation Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{organisation.contactEmail}</span>
                  </div>
                  
                  {organisation.contactPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{organisation.contactPhone}</span>
                    </div>
                  )}
                  
                  {organisation.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{organisation.address}</span>
                    </div>
                  )}
                </div>

                {organisation.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {organisation.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Events: {organisation.eventsCount}</span>
                  <span>Submitted: {formatDate(organisation.submittedAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/organisations/${organisation.id}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Link>
                  
                  {organisation.registrationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(organisation.id, 'approved')}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(organisation.id, 'rejected')}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrganisations.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No organisations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding a new organisation.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/organisations/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Organisation
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 