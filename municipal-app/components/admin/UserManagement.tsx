'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Plus, Users, Search, MapPin, Mail, Phone, User, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

interface Region {
  id: string;
  name: string;
  capital: string;
  code: string;
}

interface Municipality {
  id: string;
  name: string;
  type: 'Metropolitan' | 'Municipal' | 'District';
  capital: string;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  regionId: string;
  municipalityId: string;
  department: string;
}

export default function UserManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<Municipality[]>([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const [formData, setFormData] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    regionId: '',
    municipalityId: '',
    department: ''
  });

  // Load regions on component mount
  useEffect(() => {
    loadRegions();
    loadUsers();
  }, []);

  // Load municipalities when region is selected
  useEffect(() => {
    if (selectedRegion) {
      loadMunicipalities(selectedRegion);
    } else {
      setFilteredMunicipalities([]);
    }
  }, [selectedRegion]);

  const loadRegions = async () => {
    try {
      setLoadingRegions(true);
      const response = await fetch('/api/ghana-municipalities');
      const result = await response.json();

      if (result.success) {
        setRegions(result.data.regions);
      } else {
        throw new Error('Failed to load regions');
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      toast.error('Failed to load regions');
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadMunicipalities = async (regionId: string) => {
    try {
      setLoadingMunicipalities(true);
      const response = await fetch(`/api/ghana-municipalities?region=${regionId}`);
      const result = await response.json();

      if (result.success) {
        setFilteredMunicipalities(result.data);
      } else {
        throw new Error('Failed to load municipalities');
      }
    } catch (error) {
      console.error('Error loading municipalities:', error);
      toast.error('Failed to load municipalities');
      setFilteredMunicipalities([]);
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'municipal_admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast.success('Password generated!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get selected municipality details
      const municipality = filteredMunicipalities.find(m => m.id === formData.municipalityId);
      const region = regions.find(r => r.id === formData.regionId);

      if (!municipality || !region) {
        throw new Error('Please select a valid region and municipality');
      }

      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Create user via API endpoint
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          regionId: formData.regionId,
          regionName: region.name,
          municipalityId: formData.municipalityId,
          municipalityName: municipality.name,
          department: formData.department
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }

      toast.success(`Municipal admin created successfully for ${municipality.name}!`);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        regionId: '',
        municipalityId: '',
        department: ''
      });
      setSelectedRegion('');
      setShowCreateForm(false);

      // Reload users
      loadUsers();

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = existingUsers.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Municipal Admin Management</h2>
          <p className="text-gray-600">Create and manage municipal administrator accounts</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Create Municipal Admin
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Create Municipal Administrator Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button type="button" onClick={generatePassword} variant="outline">
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assignment Information</h3>

                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <select
                      id="region"
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setFormData(prev => ({ ...prev, regionId: e.target.value, municipalityId: '' }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      disabled={loadingRegions}
                    >
                      <option value="">{loadingRegions ? 'Loading regions...' : 'Select Region'}</option>
                      {regions.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="municipality">Municipality/District *</Label>
                    <select
                      id="municipality"
                      value={formData.municipalityId}
                      onChange={(e) => setFormData(prev => ({ ...prev, municipalityId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      disabled={!selectedRegion || loadingMunicipalities}
                    >
                      <option value="">
                        {loadingMunicipalities
                          ? 'Loading municipalities...'
                          : !selectedRegion
                            ? 'Select region first'
                            : 'Select Municipality/District'
                        }
                      </option>
                      {filteredMunicipalities.map(municipality => (
                        <option key={municipality.id} value={municipality.id}>
                          {municipality.name} ({municipality.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g., Health Department, Social Services"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Account Details:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Role: Municipal Administrator</li>
                      <li>• Email verification: Bypassed</li>
                      <li>• Account status: Active</li>
                      <li>• Access level: Municipality management</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Municipal Admin'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Users List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Municipal Administrators ({existingUsers.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {existingUsers.length === 0 ? 'No Municipal Admins Created' : 'No Users Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {existingUsers.length === 0
                  ? 'Create your first municipal administrator account to get started.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </h4>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.municipality_id || 'Unknown Municipality'}
                        </div>
                      </div>
                      {user.department && (
                        <div className="text-sm text-gray-500 mt-1">
                          Department: {user.department}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Municipal Admin
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}