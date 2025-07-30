'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import GhanaAdminService, { type GhanaRegion, type MunicipalityData } from '@/lib/api/ghana-admin';
import { MunicipalityService } from '@/lib/api/municipality';
import type { MunicipalityRegistration } from '@/types';

const registrationSchema = z.object({
  municipalityId: z.string().min(1, 'Please select a municipality'),
  adminUser: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    position: z.string().min(2, 'Please enter your position/title')
  }),
  contactInfo: z.object({
    primaryEmail: z.string().email('Please enter a valid email address'),
    secondaryEmail: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    address: z.string().min(10, 'Please enter a complete address'),
    website: z.string().url().optional().or(z.literal(''))
  }),
  verification: z.object({
    documentType: z.enum(['certificate', 'letter', 'other']),
    documentUrl: z.string().optional()
  }),
  preferences: z.object({
    timezone: z.string().default('Africa/Accra'),
    language: z.string().default('en'),
    features: z.array(z.string()).default([])
  })
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface MunicipalityRegistrationFormProps {
  onSuccess?: (municipalityId: string) => void;
  onCancel?: () => void;
}

export function MunicipalityRegistrationForm({
  onSuccess,
  onCancel
}: MunicipalityRegistrationFormProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      preferences: {
        timezone: 'Africa/Accra',
        language: 'en',
        features: ['basic_reporting', 'event_management', 'certificate_management']
      }
    }
  });

  // Load regions and municipalities on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [regionsData, municipalitiesData] = await Promise.all([
          GhanaAdminService.getAllRegions(),
          GhanaAdminService.getAllMunicipalities()
        ]);
        setRegions(regionsData);
        setMunicipalities(municipalitiesData);
      } catch (error) {
        console.error('Error loading Ghana administrative data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedMunicipalityId = watch('municipalityId');
  const availableMunicipalities = selectedRegion
    ? municipalities.filter(m => m.regionId === selectedRegion && !m.isRegistered)
    : [];

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const registrationData: MunicipalityRegistration = {
        municipalityId: data.municipalityId,
        adminUser: {
          firstName: data.adminUser.firstName,
          lastName: data.adminUser.lastName,
          email: data.adminUser.email,
          phone: data.adminUser.phone,
          position: data.adminUser.position
        },
        contactInfo: {
          primaryEmail: data.contactInfo.primaryEmail,
          secondaryEmail: data.contactInfo.secondaryEmail,
          phone: data.contactInfo.phone,
          address: data.contactInfo.address,
          website: data.contactInfo.website
        },
        verification: data.verification.documentType ? {
          documentType: data.verification.documentType,
          documentUrl: data.verification.documentUrl
        } : undefined,
        preferences: {
          timezone: data.preferences.timezone,
          language: data.preferences.language,
          features: data.preferences.features
        }
      };

      const result = await MunicipalityService.registerMunicipality(registrationData);
      setSubmitStatus('success');
      onSuccess?.(result.municipalityId);
    } catch (error) {
      console.error('Registration failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Ghana administrative data...</p>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your municipality has been registered successfully. An admin account has been created 
            and login credentials will be sent to the provided email address.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Check your email for login credentials</li>
              <li>• Complete your municipality profile setup</li>
              <li>• Invite additional staff members</li>
              <li>• Configure your municipality settings</li>
            </ul>
          </div>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Municipality Registration
          </CardTitle>
          <p className="text-gray-600">
            Register your municipality to access the Breast Cancer Awareness Platform
          </p>
        </CardHeader>
      </Card>

      {/* Municipality Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Municipality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <Select
              value={selectedRegion}
              onValueChange={(value) => {
                setSelectedRegion(value);
                setValue('municipalityId', '');
              }}
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.code} value={region.code.toLowerCase()}>
                  {region.label}
                </option>
              ))}
            </Select>
          </div>

          {selectedRegion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipality
              </label>
              <Select
                {...register('municipalityId')}
                disabled={!selectedRegion}
              >
                <option value="">Select a municipality</option>
                {availableMunicipalities.map((municipality) => (
                  <option key={municipality.id} value={municipality.id}>
                    {municipality.name} ({municipality.type})
                  </option>
                ))}
              </Select>
              {errors.municipalityId && (
                <p className="text-red-600 text-sm mt-1">{errors.municipalityId.message}</p>
              )}
            </div>
          )}

          {selectedMunicipalityId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Municipality</h4>
              {(() => {
                const municipality = municipalities.find(m => m.id === selectedMunicipalityId);
                return municipality ? (
                  <div className="text-sm text-blue-800">
                    <p><strong>Name:</strong> {municipality.name}</p>
                    <p><strong>Type:</strong> {municipality.type}</p>
                    <p><strong>Capital:</strong> {municipality.capital}</p>
                    <p><strong>Region:</strong> {municipality.regionName}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Administrator Information
          </CardTitle>
          <p className="text-gray-600">
            This person will be the primary administrator for your municipality
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <Input
              {...register('adminUser.firstName')}
              placeholder="Enter first name"
            />
            {errors.adminUser?.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.adminUser.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <Input
              {...register('adminUser.lastName')}
              placeholder="Enter last name"
            />
            {errors.adminUser?.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.adminUser.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              {...register('adminUser.email')}
              placeholder="admin@municipality.gov.gh"
            />
            {errors.adminUser?.email && (
              <p className="text-red-600 text-sm mt-1">{errors.adminUser.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              {...register('adminUser.phone')}
              placeholder="+233 XX XXX XXXX"
            />
            {errors.adminUser?.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.adminUser.phone.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position/Title *
            </label>
            <Input
              {...register('adminUser.position')}
              placeholder="e.g., Municipal Chief Executive, IT Director"
            />
            {errors.adminUser?.position && (
              <p className="text-red-600 text-sm mt-1">{errors.adminUser.position.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Municipality Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Email *
              </label>
              <Input
                type="email"
                {...register('contactInfo.primaryEmail')}
                placeholder="info@municipality.gov.gh"
              />
              {errors.contactInfo?.primaryEmail && (
                <p className="text-red-600 text-sm mt-1">{errors.contactInfo.primaryEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Email
              </label>
              <Input
                type="email"
                {...register('contactInfo.secondaryEmail')}
                placeholder="contact@municipality.gov.gh"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                {...register('contactInfo.phone')}
                placeholder="+233 XX XXX XXXX"
              />
              {errors.contactInfo?.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.contactInfo.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                type="url"
                {...register('contactInfo.website')}
                placeholder="https://municipality.gov.gh"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Physical Address *
            </label>
            <Textarea
              {...register('contactInfo.address')}
              placeholder="Enter complete physical address"
              rows={3}
            />
            {errors.contactInfo?.address && (
              <p className="text-red-600 text-sm mt-1">{errors.contactInfo.address.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <div className="flex justify-between items-center">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <div className="flex gap-4">
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Registration failed. Please try again.</span>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedMunicipalityId}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Registering...' : 'Register Municipality'}
          </Button>
        </div>
      </div>
    </form>
  );
}
