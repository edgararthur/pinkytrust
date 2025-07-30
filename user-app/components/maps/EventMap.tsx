import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Event } from '@/lib/api/events';
import { MapPin } from 'lucide-react';
import { formatDate } from '@/utils';

interface EventMapProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface EventLocation {
  lat: number;
  lng: number;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 5.5600, // Ghana's approximate center
  lng: -0.2057
};

export function EventMap({ events, onEventClick, center = defaultCenter, zoom = 7 }: EventMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventLocations, setEventLocations] = useState<Map<string, EventLocation>>(new Map());

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    events.forEach(async (event) => {
      if (!eventLocations.has(event.id)) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          const result = await geocoder.geocode({ address: event.location });
          if (result.results[0]?.geometry?.location) {
            const location = {
              lat: result.results[0].geometry.location.lat(),
              lng: result.results[0].geometry.location.lng()
            };
            setEventLocations(prev => new Map(prev).set(event.id, location));
            bounds.extend(result.results[0].geometry.location);
            map.fitBounds(bounds);
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        }
      }
    });
    setMap(map);
  }, [events, eventLocations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }}
    >
      {events.map((event) => {
        const location = eventLocations.get(event.id);
        if (!location) return null;

        return (
          <Marker
            key={event.id}
            position={location}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#EC4899',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }}
            onClick={() => {
              setSelectedEvent(event);
              if (onEventClick) onEventClick(event);
            }}
          />
        );
      })}

      {selectedEvent && eventLocations.get(selectedEvent.id) && (
        <InfoWindow
          position={eventLocations.get(selectedEvent.id)!}
          onCloseClick={() => setSelectedEvent(null)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-gray-900 mb-1">{selectedEvent.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{selectedEvent.location}</span>
              </div>
              <p>{formatDate(selectedEvent.start_date)}</p>
              {selectedEvent.max_participants && (
                <p>
                  {selectedEvent.current_participants} / {selectedEvent.max_participants} participants
                </p>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
} 