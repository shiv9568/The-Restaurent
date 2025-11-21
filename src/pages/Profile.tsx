import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Package, Heart, Settings, CheckCircle2, Clock, Truck, Locate, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { userAPI, orderAPI } from '@/utils/api';
import { Address } from '@/types';
import { addToCart } from '@/utils/cart';

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

const getUserKey = (clerkId?: string | null): string => {
  return getBackendUserId() || clerkId || 'guest';
};

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

const writeAddresses = (userKey: string, addresses: Address[]) => {
  window.localStorage.setItem(`addresses_${userKey}`, JSON.stringify(addresses));
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState({ name: '', mobile: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Local addresses only
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    label: '', street: '', city: '', state: '', pincode: '', phone: '', isDefault: false,
  });
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const userKey = getUserKey(user?.id);

  const statusSteps = useMemo(() => ([
    { key: 'pending', label: 'Placed', icon: CheckCircle2 },
    { key: 'confirmed', label: 'Confirmed', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'out-for-delivery', label: 'On the way', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ]), []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/auth');
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (isSignedIn) {
      setLoading(true);
      userAPI.getProfile()
        .then((res) => {
          const data = res.data;
          setProfile({
            name: data.name || user?.fullName || '',
            mobile: data.mobile || data.phone || user?.phoneNumbers?.[0]?.phoneNumber || '',
            email: data.email || user?.primaryEmailAddress?.emailAddress || '',
          });
        })
        .catch(() => {
          setProfile({
            name: user?.fullName || '',
            mobile: user?.phoneNumbers?.[0]?.phoneNumber || '',
            email: user?.primaryEmailAddress?.emailAddress || '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isSignedIn, user]);

  // Load local addresses
  useEffect(() => {
    setAddressLoading(true);
    const list = readAddresses(userKey);
    setAddresses(list);
    setAddressLoading(false);
  }, [userKey]);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      const uid = getBackendUserId();
      if (!uid) return;
      
      try {
        setOrdersLoading(true);
        const res = await orderAPI.getAll();
        const list = Array.isArray(res.data) ? res.data.filter(o => (o.userId === uid)) : [];
        setOrders(list);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    }
    
    if (isSignedIn) {
      loadOrders();
    }
  }, [isSignedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await userAPI.updateProfile({
        name: profile.name,
        mobile: profile.mobile,
        phone: profile.mobile,
        email: profile.email,
      });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFormInput = e => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetAddressForm = () => setAddressForm({ label: '', street: '', city: '', state: '', pincode: '', phone: '', isDefault: false });

  function persistAddresses(next: Address[]) {
    setAddresses(next);
    writeAddresses(userKey, next);
    window.dispatchEvent(new Event('storage'));
  }

  function handleAddEditAddress(e) {
    e.preventDefault();
    setAddressLoading(true);
    try {
      let next = [...addresses];
      if (isEditingAddress && addressForm.id) {
        const idx = next.findIndex(a => a.id === addressForm.id);
        if (idx !== -1) {
          const updated = { ...next[idx], ...addressForm } as Address;
          if (updated.isDefault) next = next.map(a => ({ ...a, isDefault: a.id === updated.id }));
          next[idx] = updated;
        }
        toast.success('Address updated');
      } else {
        const id = Math.random().toString(36).substring(2, 12);
        const newAddr: Address = {
          id,
          label: addressForm.label || 'Home',
          street: addressForm.street || '',
          city: addressForm.city || '',
          state: addressForm.state || '',
          pincode: addressForm.pincode || '',
          isDefault: !!addressForm.isDefault,
        };
        if (newAddr.isDefault) next = next.map(a => ({ ...a, isDefault: false }));
        next.push(newAddr);
        toast.success('Address added');
      }
      persistAddresses(next);
      setIsEditingAddress(null);
      resetAddressForm();
      setAddressDialogOpen(false);
    } finally {
      setAddressLoading(false);
    }
  }

  function handleDeleteAddress(id: string) {
    setAddressLoading(true);
    try {
      const next = addresses.filter(a => a.id !== id);
      persistAddresses(next);
      toast.success('Address deleted');
    } finally {
      setAddressLoading(false);
    }
  }

  function handleSetDefault(id: string) {
    setAddressLoading(true);
    try {
      const next = addresses.map(a => ({ ...a, isDefault: a.id === id }));
      persistAddresses(next);
      toast.success('Default address set');
    } finally {
      setAddressLoading(false);
    }
  }

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

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    toast.info('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) throw new Error('Failed to get address');
          
          const data = await response.json();
          const address = data.address;
          
          // Update form with detected location
          setAddressForm({
            ...addressForm,
            street: `${address.road || address.neighbourhood || ''}, ${address.suburb || ''}`.trim(),
            city: address.city || address.town || address.village || '',
            state: address.state || '',
            pincode: address.postcode || '',
          });
          
          toast.success('Location detected successfully!');
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('Could not get address from location');
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        
        let errorMessage = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isSignedIn) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-6 h-fit">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 border-2 border-gray-200 shadow-lg">
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h2 className="font-semibold text-lg">{profile.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Verified User
              </div>
            </div>
            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('orders')}
              >
                <Package className="w-4 h-4 mr-2" /> Orders
              </Button>
              <Button 
                variant={activeTab === 'addresses' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin className="w-4 h-4 mr-2" /> Addresses
              </Button>
              <Button 
                variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </Button>
            </nav>
          </Card>
          {/* Profile Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block font-medium mb-1">Full Name</label>
                      <Input name="name" value={profile.name} onChange={handleChange} disabled={!editing || loading} />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Email</label>
                      <Input name="email" type="email" value={profile.email} onChange={handleChange} disabled={!editing || loading} />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Mobile Number</label>
                      <Input name="mobile" type="tel" value={profile.mobile} onChange={handleChange} disabled={!editing || loading} placeholder="+1 234-567-8900" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    {editing ? (
                      <>
                        <Button onClick={handleSave} disabled={loading}>Save</Button>
                        <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>Cancel</Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                    )}
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="orders" className="space-y-4">
                {ordersLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    {orders.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                        <Button onClick={() => navigate('/')}>Browse Menu</Button>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const currentIdx = statusSteps.findIndex(s => s.key === order.status);
                          return (
                            <Card key={order.id} className="p-6 space-y-4">
                              <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                  <div className="font-semibold text-lg">
                                    {order.orderNumber || `#${String(order.id).slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{order.restaurantName}</div>
                                  <div className="text-sm font-medium mt-1">Total: ₹{order.total}</div>
                                  {order.orderedAt && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {new Date(order.orderedAt).toLocaleDateString('en-IN', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/order-tracking/${order.id}`)}>
                                    Track Order
                                  </Button>
                                  <Button size="sm" onClick={() => handleReorder(order)}>
                                    Reorder
                                  </Button>
                                </div>
                              </div>
                              {/* Order Items */}
                              {order.items && order.items.length > 0 && (
                                <div className="border-t pt-4">
                                  <div className="text-sm font-medium mb-2">Items:</div>
                                  <div className="space-y-1">
                                    {order.items.map((item: any, idx: number) => (
                                      <div key={idx} className="text-sm text-muted-foreground flex justify-between">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Timeline */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                {statusSteps.map((step, idx) => {
                                  const Icon = step.icon;
                                  const isCompleted = idx <= currentIdx;
                                  const isCurrent = idx === currentIdx;
                                  return (
                                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isCompleted 
                                          ? 'bg-green-500 text-white' 
                                          : 'bg-gray-200 text-gray-500'
                                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div className="text-xs mt-1 text-center text-gray-600 hidden sm:block">{step.label}</div>
                                      {idx < statusSteps.length - 1 && (
                                        <div 
                                          className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 transition-colors ${
                                            idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                                          }`} 
                                          style={{ maxWidth: '100%' }} 
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              <TabsContent value="addresses" className="space-y-4">
                <div>
                  {addressLoading ? (
                    <div className="text-center py-10">Loading...</div>
                  ) : (
                    <>
                      {addresses.length === 0 && <div className="text-muted-foreground">No addresses saved yet.</div>}
                      <div className="space-y-4">
                        {addresses.map(addr => (
                          <Card key={addr.id} className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{addr.label}</h3>
                                  {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>}
                                </div>
                                <div className="text-sm text-muted-foreground">{addr.street}</div>
                                <div className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.pincode}</div>
                                {addr.phone && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    📞 {addr.phone}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                {!addr.isDefault && (
                                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)} disabled={addressLoading}>Set Default</Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => {
                                  setIsEditingAddress(addr.id);
                                  setAddressForm(addr);
                                  setAddressDialogOpen(true);
                                }} disabled={addressLoading}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteAddress(addr.id)} disabled={addressLoading}>Delete</Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                  <Button className="w-full mt-6" onClick={() => {
                    setIsEditingAddress(null);
                    resetAddressForm();
                    setAddressDialogOpen(true);
                  }} disabled={addressLoading}>Add New Address</Button>
                  {addressDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center p-4 overflow-y-auto">
                      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl z-50 my-8">
                        <form onSubmit={handleAddEditAddress} className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{isEditingAddress ? 'Edit Address' : 'Add Address'}</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDetectLocation}
                              disabled={addressLoading || detectingLocation}
                            >
                              {detectingLocation ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Locate className="h-4 w-4 mr-2" />
                              )}
                              {detectingLocation ? 'Detecting...' : 'Detect Location'}
                            </Button>
                          </div>
                          
                          <div>
                            <label className="block font-medium mb-1">Label</label>
                            <Input name="label" value={addressForm.label || ''} onChange={handleFormInput} required disabled={addressLoading} />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Street</label>
                            <Input name="street" value={addressForm.street || ''} onChange={handleFormInput} required disabled={addressLoading} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block font-medium mb-1">City</label>
                              <Input name="city" value={addressForm.city || ''} onChange={handleFormInput} required disabled={addressLoading} />
                            </div>
                            <div>
                              <label className="block font-medium mb-1">State</label>
                              <Input name="state" value={addressForm.state || ''} onChange={handleFormInput} required disabled={addressLoading} />
                            </div>
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Pincode</label>
                            <Input name="pincode" value={addressForm.pincode || ''} onChange={handleFormInput} required maxLength={8} disabled={addressLoading} />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Phone Number</label>
                            <Input name="phone" type="tel" value={addressForm.phone || ''} onChange={handleFormInput} placeholder="+1 234-567-8900" disabled={addressLoading} />
                          </div>
                          <div className="flex items-center mt-2">
                            <input type="checkbox" id="isDefault" name="isDefault" checked={!!addressForm.isDefault} onChange={handleFormInput} disabled={addressLoading} />
                            <label htmlFor="isDefault" className="ml-2 text-sm">Set as default address</label>
                          </div>
                          <div className="flex gap-2 justify-end mt-4">
                            <Button type="submit" disabled={addressLoading}>{isEditingAddress ? 'Save Changes' : 'Add Address'}</Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setAddressDialogOpen(false);
                              setIsEditingAddress(null);
                              resetAddressForm();
                            }} disabled={addressLoading}>Cancel</Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
