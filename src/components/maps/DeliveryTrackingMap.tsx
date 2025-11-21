import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DeliveryTrackingMapProps {
  restaurantAddress: string;
  deliveryAddress: string;
  orderStatus: string;
  restaurantName?: string;
}

const DeliveryTrackingMap = ({ 
  restaurantAddress, 
  deliveryAddress, 
  orderStatus,
  restaurantName = 'Restaurant'
}: DeliveryTrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [driverPosition, setDriverPosition] = useState<google.maps.LatLng | null>(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      setLoading(false);
      return;
    }

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key and internet connection.');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        const geocoder = new google.maps.Geocoder();

        // Geocode restaurant address
        const restaurantResult = await geocoder.geocode({ address: restaurantAddress });
        const restaurantLocation = restaurantResult.results[0]?.geometry.location;

        // Geocode delivery address
        const deliveryResult = await geocoder.geocode({ address: deliveryAddress });
        const deliveryLocation = deliveryResult.results[0]?.geometry.location;

        if (!restaurantLocation || !deliveryLocation) {
          setError('Could not find locations on map.');
          setLoading(false);
          return;
        }

        // Calculate bounds to fit both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(restaurantLocation);
        bounds.extend(deliveryLocation);

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 13,
          center: bounds.getCenter(),
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        map.fitBounds(bounds);

        // Add restaurant marker
        new google.maps.Marker({
          position: restaurantLocation,
          map: map,
          title: restaurantName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
          },
          label: {
            text: 'R',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          }
        });

        // Add delivery marker
        new google.maps.Marker({
          position: deliveryLocation,
          map: map,
          title: 'Delivery Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
          },
          label: {
            text: 'D',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          }
        });

        // Draw route if order is out for delivery
        if (orderStatus === 'out-for-delivery' || orderStatus === 'delivered') {
          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // We already have our custom markers
            polylineOptions: {
              strokeColor: '#3B82F6',
              strokeWeight: 4,
              strokeOpacity: 0.7,
            }
          });

          directionsService.route({
            origin: restaurantLocation,
            destination: deliveryLocation,
            travelMode: google.maps.TravelMode.DRIVING,
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);
              
              // Simulate driver position (for demo - in production, this would come from real-time tracking)
              if (orderStatus === 'out-for-delivery') {
                const route = result.routes[0];
                const path = route.overview_path;
                const midPointIndex = Math.floor(path.length / 2);
                const simulatedDriverPos = path[midPointIndex];
                
                setDriverPosition(simulatedDriverPos);

                // Add animated driver marker
                new google.maps.Marker({
                  position: simulatedDriverPos,
                  map: map,
                  title: 'Delivery Person',
                  icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20, 20),
                  },
                  animation: google.maps.Animation.BOUNCE,
                });
              }
            }
          });
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Map initialization error:', err);
        setError(err.message || 'Failed to initialize map');
        setLoading(false);
      }
    };

    loadGoogleMaps();
  }, [restaurantAddress, deliveryAddress, orderStatus, restaurantName]);

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
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            See GOOGLE_MAPS_SETUP.md for configuration instructions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} className="w-full h-96" />
      <div className="p-4 bg-muted/50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Delivery</span>
          </div>
          {orderStatus === 'out-for-delivery' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-muted-foreground font-medium">On the way!</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DeliveryTrackingMap;

