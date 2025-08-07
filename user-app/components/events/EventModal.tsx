import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';
import { EventsService, Event } from '@/lib/api/events';
import { toast } from 'react-hot-toast';
import { 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Users,
  ArrowRight,
  Building,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSuccess: () => void;
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
}

export function EventModal({ isOpen, onClose, event, onSuccess }: EventModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: user?.email || '',
    phone: ''
  });

  if (!event) return null;

  const isUpcoming = new Date() < new Date(event.start_date);
  const canRegister = isUpcoming && (!event.max_participants || event.current_participants < event.max_participants);

  const validateRegistration = () => {
    if (!registrationData.name.trim()) return 'Name is required';
    if (!registrationData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
      return 'Invalid email format';
    }
    if (!registrationData.phone.trim()) return 'Phone number is required';
    return null;
  };

  const handleRegister = async () => {
    const error = validateRegistration();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);
      await EventsService.registerForEvent(event.id, {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone
      });
      toast.success('Successfully registered for the event');
      onSuccess();
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for the event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {showRegistration ? 'Event Registration' : 'Event Details'}
          </DialogTitle>
        </DialogHeader>

        {showRegistration ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  value={registrationData.phone}
                  onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Event Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Event:</span> {event.title}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(event.start_date)}</p>
                  <p><span className="font-medium">Location:</span> {event.location}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRegistration(false)}>
                Back
              </Button>
              <Button onClick={handleRegister} disabled={loading}>
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-gray-600 mb-4">{event.description}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm">
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm">{event.location}</p>
                  </div>
                </div>

                {event.contact_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Contact Email</p>
                      <p className="text-sm">{event.contact_email}</p>
                    </div>
                  </div>
                )}

                {event.contact_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Contact Phone</p>
                      <p className="text-sm">{event.contact_phone}</p>
                    </div>
                  </div>
                )}

                {event.max_participants && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm">
                        {event.current_participants} / {event.max_participants} registered
                        {event.current_participants >= event.max_participants && (
                          <span className="text-red-600 ml-2">(Event Full)</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <div className="flex items-center gap-1 text-sm">
                      <span>{event.organization_name}</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {canRegister && (
                <Button onClick={() => setShowRegistration(true)}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 