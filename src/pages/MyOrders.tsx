import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Package, Truck } from 'lucide-react';
import { addToCart } from '@/utils/cart';
import { toast } from 'sonner';

const getBackendUserId = (): string | null => {
  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?._id || null;
  } catch {
    return null;
  }
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statusSteps = useMemo(() => ([
    { key: 'pending', label: 'Placed', icon: CheckCircle2 },
    { key: 'confirmed', label: 'Confirmed', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'out-for-delivery', label: 'On the way', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ]), []);

  useEffect(() => {
    async function load() {
      const uid = getBackendUserId();
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await orderAPI.getAll();
        const list = Array.isArray(res.data) ? res.data.filter(o => (o.userId === uid)) : [];
        setOrders(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleReorder = (order: any) => {
    try {
      (order.items || []).forEach((it: any) => {
        addToCart({
          id: it.itemId || it.id || `${order.id}-${it.name}`,
          name: it.name,
          description: '',
          price: it.price,
          image: it.image || '',
          category: 'Reorder',
          isVeg: true,
          quantity: it.quantity || 1,
          restaurantId: order.restaurantId || 'main-restaurant',
          restaurantName: order.restaurantName || 'D&G Restaurent',
        } as any);
      });
      window.dispatchEvent(new Event('storage'));
      toast.success('Items added to cart');
      navigate('/cart');
    } catch {
      toast.error('Failed to reorder');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        {orders.length === 0 && (
          <div className="text-muted-foreground">No orders yet.</div>
        )}
        {orders.map((order) => {
          const currentIdx = statusSteps.findIndex(s => s.key === order.status);
          return (
            <Card key={order.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">#{String(order.id).slice(-6)} • {order.restaurantName}</div>
                  <div className="text-sm text-muted-foreground">Total: ₹{order.total}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/order-tracking/${order.id}`)}>Track</Button>
                  <Button size="sm" onClick={() => handleReorder(order)}>Reorder</Button>
                </div>
              </div>
              {/* Timeline */}
              <div className="flex items-center justify-between">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon as any;
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs mt-1 text-center text-gray-600">{step.label}</div>
                      {idx < statusSteps.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} style={{ maxWidth: '100%' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
