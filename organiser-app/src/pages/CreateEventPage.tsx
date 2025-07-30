import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Plus, 
  X,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Event } from '../types';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  event_type: z.enum(['screening', 'education', 'support', 'awareness', 'fundraising']),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.string().min(1, 'End date is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  max_participants: z.number().min(1, 'Maximum participants must be at least 1').optional(),
  registration_deadline_date: z.string().optional(),
  registration_deadline_time: z.string().optional(),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_type: 'screening',
      contact_email: '',
    },
  });

  const watchedEventType = watch('event_type');

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);

      // Combine date and time for start and end dates
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`).toISOString();
      const endDateTime = new Date(`${data.end_date}T${data.end_time}`).toISOString();
      
      let registrationDeadline;
      if (data.registration_deadline_date && data.registration_deadline_time) {
        registrationDeadline = new Date(`${data.registration_deadline_date}T${data.registration_deadline_time}`).toISOString();
      }

      const eventData: Partial<Event> = {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        start_date: startDateTime,
        end_date: endDateTime,
        location: data.location,
        address: data.address,
        max_participants: data.max_participants,
        registration_deadline: registrationDeadline,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        requirements,
        status: 'draft',
        current_participants: 0,
      };

      // TODO: Replace with actual API call
      console.log('Creating event:', eventData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setRequirements(requirements.filter(req => req !== requirement));
  };

  const eventTypeOptions = [
    { value: 'screening', label: 'Health Screening', description: 'Medical screening and checkups' },
    { value: 'education', label: 'Educational Workshop', description: 'Learning and awareness sessions' },
    { value: 'support', label: 'Support Group', description: 'Emotional and peer support' },
    { value: 'awareness', label: 'Awareness Campaign', description: 'Public awareness activities' },
    { value: 'fundraising', label: 'Fundraising Event', description: 'Fundraising activities' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600">Fill in the details to create a new event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Event Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter event title"
            />

            <div>
              <label className="label">Event Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {eventTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      watchedEventType === option.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('event_type')}
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.event_type && (
                <p className="text-sm text-red-600 mt-1">{errors.event_type.message}</p>
              )}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="input"
                placeholder="Describe your event..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Date and Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                {...register('start_date')}
                error={errors.start_date?.message}
              />
              <Input
                label="Start Time"
                type="time"
                {...register('start_time')}
                error={errors.start_time?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="End Date"
                type="date"
                {...register('end_date')}
                error={errors.end_date?.message}
              />
              <Input
                label="End Time"
                type="time"
                {...register('end_time')}
                error={errors.end_time?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Registration Deadline Date (Optional)"
                type="date"
                {...register('registration_deadline_date')}
                error={errors.registration_deadline_date?.message}
              />
              <Input
                label="Registration Deadline Time (Optional)"
                type="time"
                {...register('registration_deadline_time')}
                error={errors.registration_deadline_time?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Location Name"
              {...register('location')}
              error={errors.location?.message}
              placeholder="e.g., Community Center"
            />

            <Input
              label="Full Address"
              {...register('address')}
              error={errors.address?.message}
              placeholder="e.g., 123 Main St, City, State"
            />
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Maximum Participants (Optional)"
              type="number"
              min="1"
              {...register('max_participants', { valueAsNumber: true })}
              error={errors.max_participants?.message}
              placeholder="Leave empty for unlimited"
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Contact Email"
              type="email"
              {...register('contact_email')}
              error={errors.contact_email?.message}
              placeholder="contact@organization.com"
            />

            <Input
              label="Contact Phone (Optional)"
              type="tel"
              {...register('contact_phone')}
              error={errors.contact_phone?.message}
              placeholder="+1 (555) 123-4567"
            />
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a requirement (e.g., ID Card, Medical Records)"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {requirements.length > 0 && (
              <div className="space-y-2">
                <label className="label">Event Requirements:</label>
                <div className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(requirement)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/events')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage; 