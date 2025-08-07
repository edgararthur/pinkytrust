'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EventModal } from '@/components/events/EventModal';
import { 
  Calendar,
  MapPin,
  Clock,
  Search,
  Users
} from 'lucide-react';
import { EventsService, Event } from '@/lib/api/events';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'react-hot-toast';
import { formatDate, formatRelativeTime } from '@/utils';

interface EventCategory {
  title: string;
  description: string;
  filter: string;
  events: Event[];
}

export default function EventsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([
    {
      title: "Nearby Events",
      description: "Events happening close to you",
      filter: "nearby",
      events: []
    },
    {
      title: "Screening Events",
      description: "Free and subsidized screening programs",
      filter: "screening",
      events: []
    },
    {
      title: "Educational Workshops",
      description: "Learn about breast health and awareness",
      filter: "education",
      events: []
    },
    {
      title: "Support Groups",
      description: "Connect with others in your community",
      filter: "support",
      events: []
    },
    {
      title: "Awareness Campaigns",
      description: "Join the fight against breast cancer",
      filter: "awareness",
      events: []
    }
  ]);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location. Showing all events instead.');
        }
      );
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [userLocation]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await EventsService.getEvents({ limit: 100 });
      
      // Update categories with fetched events
      setCategories(prev => prev.map(category => {
        let filteredEvents = allEvents.data;

        if (category.filter === 'nearby' && userLocation) {
          // Sort by distance if we have user location
          // For nearby events, just show the first 10 events since coordinates are not available
          filteredEvents = filteredEvents.slice(0, 10);
        } else if (category.filter !== 'nearby') {
          // Filter by event type
          filteredEvents = filteredEvents
            .filter(event => event.event_type === category.filter)
            .slice(0, 10);
        }

        return {
          ...category,
          events: filteredEvents
        };
      }));
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const EventCard = ({ event }: { event: Event }) => {
    // Distance calculation is not available since events don't have coordinates
    const distance = null;

    const isUpcoming = new Date(event.start_date) > new Date();
    const participantsLeft = event.max_participants 
      ? event.max_participants - (event.current_participants || 0)
      : null;

    return (
      <Card 
        className="flex-shrink-0 w-[280px] bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
        onClick={() => {
          setSelectedEvent(event);
          setShowModal(true);
        }}
      >
        {event.image_url && (
          <div className="h-32 w-full bg-gray-100 relative">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {distance !== null && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
              >
                {distance.toFixed(1)} km
              </Badge>
            )}
          </div>
        )}
        <div className="p-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{event.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{event.event_type}</p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(event.start_date)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            {participantsLeft !== null && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Users className="h-3.5 w-3.5" />
                {participantsLeft > 0 ? (
                  <span className="text-green-600">{participantsLeft} spots left</span>
                ) : (
                  <span className="text-red-600">Event full</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events near you..."
            className="pl-10 bg-white/80 backdrop-blur-sm"
            onChange={(e) => {
              // Implement search functionality
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6 pt-4">
        {categories.map((category) => (
          <div key={category.filter}>
            <div className="px-4 mb-3">
              <h2 className="text-lg font-medium text-gray-900">{category.title}</h2>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex gap-3 px-4 pb-4 min-w-full">
                {loading ? (
                  // Loading skeletons
                  Array(4).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[280px] h-[180px] bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))
                ) : category.events.length > 0 ? (
                  category.events.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="flex-shrink-0 w-full py-8 text-center text-gray-500">
                    No events found in this category
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={() => {
          loadEvents();
          setShowModal(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
