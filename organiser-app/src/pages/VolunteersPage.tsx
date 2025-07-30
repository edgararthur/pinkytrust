import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  UserPlus,
  Users,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Volunteer } from '../types';
import { formatDate, formatRelativeTime } from '../utils';

const VolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
      const mockVolunteers: Volunteer[] = [
        {
          id: '1',
          organization_id: '1',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1 (555) 123-4567',
          status: 'active',
          skills: ['Medical Background', 'Event Coordination'],
          availability: 'Weekends',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          organization_id: '1',
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael.brown@example.com',
          phone: '+1 (555) 234-5678',
          status: 'pending',
          skills: ['Social Media', 'Photography'],
          availability: 'Flexible',
          created_at: '2024-01-18T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z',
        },
        {
          id: '3',
          organization_id: '1',
          first_name: 'Emily',
          last_name: 'Davis',
          email: 'emily.davis@example.com',
          phone: '+1 (555) 345-6789',
          status: 'active',
          skills: ['Translation', 'Public Speaking'],
          availability: 'Evenings',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
        },
        {
          id: '4',
          organization_id: '1',
          first_name: 'David',
          last_name: 'Wilson',
          email: 'david.wilson@example.com',
          status: 'inactive',
          skills: ['IT Support', 'Data Entry'],
          availability: 'Weekdays',
          created_at: '2024-01-05T10:00:00Z',
          updated_at: '2024-01-25T10:00:00Z',
        },
      ];

      setVolunteers(mockVolunteers);
    } catch (error) {
      console.error('Error loading volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (volunteerId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      // TODO: Replace with actual API call
      setVolunteers(volunteers.map(volunteer => 
        volunteer.id === volunteerId 
          ? { ...volunteer, status: newStatus, updated_at: new Date().toISOString() }
          : volunteer
      ));
    } catch (error) {
      console.error('Error updating volunteer status:', error);
    }
  };

  const handleDeleteVolunteer = async (volunteerId: string) => {
    if (window.confirm('Are you sure you want to remove this volunteer?')) {
      try {
        // TODO: Replace with actual API call
        setVolunteers(volunteers.filter(volunteer => volunteer.id !== volunteerId));
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = 
      volunteer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || volunteer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.status === 'active').length,
    pending: volunteers.filter(v => v.status === 'pending').length,
    inactive: volunteers.filter(v => v.status === 'inactive').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-gray-600">Manage your organization's volunteers</p>
        </div>
        <Link to="/volunteers/invite">
          <Button className="mt-4 sm:mt-0">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Volunteer
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers List */}
      <Card>
        <CardHeader>
          <CardTitle>Volunteer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Skills</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {volunteer.first_name[0]}{volunteer.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {volunteer.first_name} {volunteer.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{volunteer.availability}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {volunteer.email}
                        </div>
                        {volunteer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {volunteer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(volunteer.status)}>
                        {volunteer.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills?.slice(0, 2).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {volunteer.skills && volunteer.skills.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{volunteer.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(volunteer.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {volunteer.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(volunteer.id, 'active')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(volunteer.id, 'inactive')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {volunteer.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(volunteer.id, 'inactive')}
                          >
                            Deactivate
                          </Button>
                        )}
                        {volunteer.status === 'inactive' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(volunteer.id, 'active')}
                          >
                            Activate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteVolunteer(volunteer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredVolunteers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more volunteers.'
                  : "You haven't invited any volunteers yet. Start building your team!"
                }
              </p>
              <Link to="/volunteers/invite">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Volunteer
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteersPage; 