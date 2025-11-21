import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, IndianRupee, QrCode } from 'lucide-react';
import { ordersAPI } from '@/utils/apiService';
import { toast } from 'sonner';
import { clearCart } from '@/utils/cart';
import { useAuth } from '@clerk/clerk-react';

export default function Payment() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const orderData = location?.state?.orderData;
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [isPaying, setIsPaying] = useState(false);
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!orderData) {
      navigate('/cart');
    }
  }, [orderData, navigate]);

  const amount = useMemo(() => orderData?.total || 0, [orderData]);

  const handlePay = async () => {
    if (!orderData) return;
    try {
      setIsPaying(true);
      // Ensure backend token before creating order
      try {
        if (isLoaded && isSignedIn) {
          const existing = window.localStorage.getItem('token');
          if (!existing) {
            const clerkToken = await getToken();
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const body = JSON.stringify({ token: clerkToken || '' });
            const headers = { 'Content-Type': 'application/json' } as const;
            const res = await fetch(`${API_BASE}/auth/clerk-verify`, { method: 'POST', headers, body });
            if (res.ok) {
              const data = await res.json();
              if (data?.token) {
                window.localStorage.setItem('token', data.token);
                if (data.user) window.localStorage.setItem('user', JSON.stringify(data.user));
              }
            }
          }
        }
      } catch {}
      let orderId: string;
      let savedOrder: any = null;
      try {
        console.log('Creating order with data:', orderData);
        const response = await ordersAPI.create(orderData);
        console.log('Order created response:', response.data);
        savedOrder = response.data;
        orderId = response.data.id || response.data._id || response.data.orderNumber || orderData.orderNumber;
        // Save to localStorage as backup
        const orders = JSON.parse(localStorage.getItem('foodie_orders') || '[]');
        orders.push({ ...orderData, ...savedOrder, id: orderId });
        localStorage.setItem('foodie_orders', JSON.stringify(orders));
        console.log('Order saved to database and localStorage');
      } catch (err: any) {
        console.error('Failed to save order to database:', err);
        console.error('Error details:', err.response?.data || err.message);
        // Fallback: save to localStorage only
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        orderId = orderData.orderNumber || `ORD${timestamp}${random}`;
        const orders = JSON.parse(localStorage.getItem('foodie_orders') || '[]');
        orders.push({ ...orderData, id: orderId, orderNumber: orderId, createdAt: new Date().toISOString() });
        localStorage.setItem('foodie_orders', JSON.stringify(orders));
        console.log('Order saved to localStorage only (database save failed)');
        toast.warning('Order saved locally. It may not appear in admin panel until database connection is fixed.');
      }
      clearCart();
      window.dispatchEvent(new Event('storage'));
      toast.success('Payment successful!');
      navigate(`/order-tracking/${orderId}`);
    } catch (e: any) {
      toast.error('Payment failed, please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  if (!orderData) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Payment</h1>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Amount to Pay</div>
              <div className="text-2xl font-bold">₹{amount}</div>
            </div>
            <div>
              <div className="font-semibold mb-2">Select Payment Method</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  className={`border rounded p-4 flex items-center gap-3 text-left ${method==='upi' ? 'border-primary' : 'border-gray-200'}`}
                  onClick={() => setMethod('upi')}
                >
                  <QrCode className="w-5 h-5" />
                  <div>
                    <div className="font-medium">UPI</div>
                    <div className="text-sm text-muted-foreground">Pay via any UPI app</div>
                  </div>
                </button>
                <button
                  className={`border rounded p-4 flex items-center gap-3 text-left ${method==='card' ? 'border-primary' : 'border-gray-200'}`}
                  onClick={() => setMethod('card')}
                >
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">Paying for</div>
              <div className="font-medium">{orderData?.restaurantName} • {orderData?.items?.length || 0} items</div>
              <div className="text-sm text-muted-foreground mt-1">Deliver to: {orderData?.deliveryAddress}</div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePay} disabled={isPaying}>
              {isPaying ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>) : 'Pay Now'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
