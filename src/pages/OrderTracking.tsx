import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Package, Truck, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { orderAPI, restaurantBrandAPI } from '@/utils/api';
import DeliveryTrackingMap from '@/components/maps/DeliveryTrackingMap';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<any>(null);

  const statusSteps = useMemo(() => ([
    { key: 'pending', label: 'Order Placed', icon: CheckCircle2 },
    { key: 'confirmed', label: 'Confirmed', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ]), []);

  useEffect(() => {
    (async () => {
      try {
        const res = await restaurantBrandAPI.get();
        setBrand(res.data || null);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    let timer: any;
    let usingLocal = false;
    const isMongoId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);
    async function load() {
      if (!orderId) return;
      try {
        if (usingLocal) return;
        const res = await orderAPI.getById(orderId);
        setOrder(res.data);
      } catch (err: any) {
        // Fallback for local orders (e.g., when backend rejected or id is not an ObjectId)
        const shouldFallback = err?.response?.status === 401 || !isMongoId(orderId);
        if (shouldFallback) {
          usingLocal = true;
          try {
            const list = JSON.parse(localStorage.getItem('foodie_orders') || '[]');
            const local = Array.isArray(list) ? list.find((o: any) => (o.id === orderId || o.orderNumber === orderId)) : null;
            if (local) setOrder(local);
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    // Poll backend every 4s only when not using local fallback
    timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [orderId]);

  const currentStepIndex = useMemo(() => {
    if (!order) return 0;
    const idx = statusSteps.findIndex((step) => step.key === order.status);
    return idx >= 0 ? idx : 0;
  }, [order, statusSteps]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <Button variant="outline" onClick={() => navigate(`/invoice/${orderId || order.id}`)}>
            View Invoice
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">Order ID: {orderId || order.id}</p>

        {/* Status Timeline */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-8">
            {statusSteps.map((step, index) => {
              const Icon = step.icon as any;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-success/30' : ''}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-sm text-center ${
                      isCompleted ? 'font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute h-1 w-full top-6 left-1/2 -z-10 ${
                        index < currentStepIndex ? 'bg-success' : 'bg-muted'
                      }`}
                      style={{ maxWidth: 'calc(100% / 5)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {order.status === 'preparing' && (
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">Your order is being prepared 🍳</p>
            </div>
          )}
        </Card>

        {/* Delivery Map */}
        {order.deliveryAddress && (order.status === 'confirmed' || order.status === 'preparing' || order.status === 'out-for-delivery' || order.status === 'delivered') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Track Delivery</h2>
            <DeliveryTrackingMap
              restaurantAddress={brand?.address || 'Restaurant Location'}
              deliveryAddress={order.deliveryAddress}
              orderStatus={order.status}
              restaurantName={order.restaurantName || brand?.name}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Restaurant</p>
                <p className="font-semibold">{order.restaurantName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                {order.items?.map((item: any) => (
                  <div
                    key={item.itemId || item.id}
                    className="flex justify-between text-sm mb-1"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.deliveryAddress}
                </p>
                {brand?.contactNumber && (
                  <a href={`tel:${brand.contactNumber}`} className="inline-flex items-center gap-2 mt-3 text-primary hover:underline">
                    <Phone className="w-4 h-4" /> Call Restaurant: {brand.contactNumber}
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center space-y-4">
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          <div className="flex items-center justify-center gap-2">
            {/* <Button variant="outline" onClick={() => navigate('/my-orders')}>
              View My Orders
            </Button> */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
