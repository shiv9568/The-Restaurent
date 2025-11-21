import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Navigation } from 'lucide-react';

interface RestaurantLocationMapProps {
  address: string;
  name: string;
  phone?: string;
}

const RestaurantLocationMap = ({ address, name, phone }: RestaurantLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps not configured');
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
        setError('Failed to load map');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ address });

        if (!result.results[0]?.geometry.location) {
          setError('Location not found');
          setLoading(false);
          return;
        }

        const position = result.results[0].geometry.location;
        setLocation({ lat: position.lat(), lng: position.lng() });

        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: position,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Add restaurant marker with custom icon
        new google.maps.Marker({
          position: position,
          map: map,
          title: name,
          animation: google.maps.Animation.DROP,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 4,
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${name}</h3>
              <p style="color: #666; font-size: 14px; margin-bottom: 8px;">${address}</p>
              ${phone ? `<p style="color: #666; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>` : ''}
            </div>
          `,
        });

        // Show info window automatically
        infoWindow.open(map, new google.maps.Marker({ position, map }));

        setLoading(false);
      } catch (err: any) {
        console.error('Map error:', err);
        setError('Failed to load location');
        setLoading(false);
      }
    };

    loadGoogleMaps();
  }, [address, name, phone]);

  const handleGetDirections = () => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    } else if (address) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 h-80 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Loading location...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-sm text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} className="w-full h-80" />
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
          <Button 
            onClick={handleGetDirections}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantLocationMap;

