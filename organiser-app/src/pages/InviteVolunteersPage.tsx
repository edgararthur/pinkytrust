import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UserPlus, Mail, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const inviteSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  availability: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

const InviteVolunteersPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      setLoading(true);

      const volunteerData = {
        ...data,
        skills,
        status: 'pending',
      };

      // TODO: Replace with actual API call
      console.log('Inviting volunteer:', volunteerData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Volunteer invitation sent successfully!');
      reset();
      setSkills([]);
    } catch (error) {
      console.error('Error inviting volunteer:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleBulkInvite = async () => {
    if (!bulkEmails.trim()) {
      toast.error('Please enter email addresses');
      return;
    }

    try {
      setLoading(true);
      const emails = bulkEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      if (emails.length === 0) {
        toast.error('No valid email addresses found');
        return;
      }

      // TODO: Replace with actual API call
      console.log('Bulk inviting volunteers:', emails);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Sent ${emails.length} volunteer invitations!`);
      setBulkEmails('');
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      toast.error('Failed to send bulk invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availabilityOptions = [
    'Flexible',
    'Weekdays only',
    'Weekends only',
    'Evenings',
    'Mornings',
    'Specific events only',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/volunteers')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invite Volunteers</h1>
          <p className="text-gray-600">Invite people to join your organization as volunteers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Invite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Individual Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  {...register('first_name')}
                  error={errors.first_name?.message}
                  placeholder="Enter first name"
                />
                <Input
                  label="Last Name"
                  {...register('last_name')}
                  error={errors.last_name?.message}
                  placeholder="Enter last name"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="volunteer@example.com"
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="+1 (555) 123-4567"
              />

              <div>
                <label className="label">Availability (Optional)</label>
                <select
                  {...register('availability')}
                  className="input"
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.availability && (
                  <p className="text-sm text-red-600 mt-1">{errors.availability.message}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="label">Skills (Optional)</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Add a skill (e.g., Medical Background, Event Planning)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Added skills:</p>
                    <div className="space-y-2">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm">{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bulk Invite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Bulk Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="label">Email Addresses</label>
                <textarea
                  rows={8}
                  className="input"
                  placeholder="Enter email addresses, one per line:
volunteer1@example.com
volunteer2@example.com
volunteer3@example.com"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter one email address per line. Invalid emails will be skipped.
                </p>
              </div>

              <Button
                onClick={handleBulkInvite}
                loading={loading}
                className="w-full"
                disabled={!bulkEmails.trim()}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Bulk Invitations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>How Volunteer Invitations Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
              <p>Invited volunteers will receive an email with instructions on how to join your organization.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
              <p>They will need to create an account and their status will be "Pending" until you approve them.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
              <p>You can manage volunteer statuses and assignments from the Volunteers page.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
              <p>Volunteers can be assigned to specific events and roles once they're approved.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteVolunteersPage; 