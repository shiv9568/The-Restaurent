import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  getCartTotal,
  clearCart,
} from '@/utils/cart';
import { CartItem } from '@/types';
import { toast } from 'sonner';
import { ordersAPI } from '@/utils/apiService';
import { Loader2 } from 'lucide-react';
import { Address } from '@/types';

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
const getUserKey = (clerkId?: string | null): string => getBackendUserId() || clerkId || 'guest';
const readAddresses = (userKey: string): Address[] => {
  try {
    const raw = window.localStorage.getItem(`addresses_${userKey}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Cart = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const userKey = getUserKey(user?.id);

  const loadCart = () => {
    const items = getCart();
    setCartItems(items);
    setTotal(getCartTotal());
  };

  useEffect(() => {
    loadCart();
    const list = readAddresses(userKey);
    setAddresses(list);
    const def = list.find(a => a.isDefault);
    setSelectedAddressId(def ? def.id : (list[0]?.id || ''));
  }, [userKey]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateCartItemQuantity(itemId, newQuantity);
    loadCart();
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemove = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    loadCart();
    window.dispatchEvent(new Event('storage'));
    toast.success(`${itemName} removed from cart`);
  };

  const handleCheckout = async () => {
    if (!isSignedIn) {
      toast.error('Please login to place order');
      navigate('/auth');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error('Delivery address invalid');
      return;
    }

    const firstItem = cartItems[0];
    const restaurantId = firstItem.restaurantId || 'main-restaurant';
    const restaurantName = firstItem.restaurantName || 'D&G Restaurent';

    const deliveryFee = 40;
    const platformFee = 5;
    const gst = Math.round((total + deliveryFee) * 0.05);
    const grandTotal = total + deliveryFee + platformFee + gst;

    const addrStr = `${selectedAddress.label}: ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`;
    // Generate a unique, readable order number
    const timestamp = Date.now().toString(36).toUpperCase(); // Convert to base36 for shorter string
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const generatedOrderNumber = `ORD${timestamp}${random}`;
    
    // Get phone number from profile or address or Clerk
    const phoneNumber = selectedAddress.phone || user?.phoneNumbers?.[0]?.phoneNumber || '';
    
    const orderData = {
      orderNumber: generatedOrderNumber,
      userId: getBackendUserId() || 'guest',
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      items: cartItems.map(item => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total: grandTotal,
      status: 'pending',
      customerName: user?.fullName || user?.firstName || 'Guest',
      customerEmail: user?.primaryEmailAddress?.emailAddress || '',
      customerPhone: phoneNumber,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      deliveryAddress: addrStr,
    };

    navigate('/payment', { state: { orderData } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-md mx-auto text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some delicious items to get started
          </p>
          <Button onClick={() => navigate('/')}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round((total + deliveryFee) * 0.05);
  const grandTotal = total + deliveryFee + platformFee + gst;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-4 h-4 border-2 flex items-center justify-center ${
                            item.isVeg ? 'border-green-500' : 'border-red-500'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <h3 className="font-semibold">{item.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.restaurantName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.id, item.name)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="font-semibold text-lg">₹{item.price}</span>
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-1">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="text-primary hover:text-primary-hover disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="text-primary hover:text-primary-hover"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">
                      Total: ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Bill Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>To Pay</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            {/* Address Selection */}
            {isSignedIn && addresses.length > 0 && (
              <div className="mb-4">
                <label className="block font-medium mb-1">Delivery Address</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedAddressId}
                  onChange={e => setSelectedAddressId(e.target.value)}
                  required
                >
                  {addresses.map(addr => (
                    <option value={addr.id} key={addr.id}>
                      {addr.label}: {addr.street}, {addr.city} {addr.state} {addr.pincode}
                      {addr.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button 
              className="w-full mt-6" 
              size="lg" 
              onClick={handleCheckout}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
