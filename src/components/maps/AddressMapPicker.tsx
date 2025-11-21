import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

interface AddressMapPickerProps {
  onAddressSelect: (address: {
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  }) => void;
  initialAddress?: string;
}

const AddressMapPicker = ({ onAddressSelect, initialAddress = '' }: AddressMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');

  // Initialize map
  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured');
      setLoading(false);
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError('Failed to load Google Maps');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Default to center of India or use user's location
      const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

      const map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMapInstance(map);

      // Create draggable marker
      const newMarker = new google.maps.Marker({
        position: defaultCenter,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        title: 'Drag me to your location',
      });

      setMarker(newMarker);

      // Handle marker drag
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          reverseGeocode(position);
        }
      });

      // Handle map click
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          newMarker.setPosition(e.latLng);
          reverseGeocode(e.latLng);
        }
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(userLocation);
            newMarker.setPosition(userLocation);
            reverseGeocode(new google.maps.LatLng(userLocation.lat, userLocation.lng));
          },
          () => {
            // Fallback to default location
            console.log('Using default location');
          }
        );
      }

      // Setup autocomplete search box
      if (searchInputRef.current) {
        const searchBoxInstance = new google.maps.places.SearchBox(searchInputRef.current);
        setSearchBox(searchBoxInstance);

        map.addListener('bounds_changed', () => {
          searchBoxInstance.setBounds(map.getBounds() as google.maps.LatLngBounds);
        });

        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          if (!places || places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          map.setCenter(place.geometry.location);
          map.setZoom(15);
          newMarker.setPosition(place.geometry.location);
          reverseGeocode(place.geometry.location);
        });
      }

      setLoading(false);
    };

    loadGoogleMaps();
  }, []);

  const reverseGeocode = useCallback((latLng: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        setSelectedAddress(result.formatted_address);

        // Parse address components
        let street = '';
        let city = '';
        let state = '';
        let pincode = '';

        result.address_components.forEach((component) => {
          const types = component.types;
          
          if (types.includes('street_number') || types.includes('route')) {
            street += component.long_name + ' ';
          }
          if (types.includes('sublocality') || types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        // If city is still empty, try locality
        if (!city) {
          result.address_components.forEach((component) => {
            if (component.types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
          });
        }

        onAddressSelect({
          fullAddress: result.formatted_address,
          street: street.trim() || result.formatted_address.split(',')[0],
          city: city || 'Unknown',
          state: state || 'Unknown',
          pincode: pincode || '',
          lat: latLng.lat(),
          lng: latLng.lng(),
        });
      } else {
        toast.error('Could not find address for this location');
      }
    });
  }, [onAddressSelect]);

  if (loading) {
    return (
      <Card className="p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Add VITE_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search for your address..."
            className="pl-10"
          />
        </div>
        {selectedAddress && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-background rounded-md border">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{selectedAddress}</p>
          </div>
        )}
      </div>
      <div ref={mapRef} className="w-full h-96" />
      <div className="p-4 bg-muted/50 border-t">
        <p className="text-xs text-muted-foreground text-center">
          <MapPin className="inline h-3 w-3 mr-1" />
          Click on the map or drag the marker to select your exact location
        </p>
      </div>
    </Card>
  );
};

export default AddressMapPicker;

