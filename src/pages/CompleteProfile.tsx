import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usersAPI } from '@/utils/apiService';

type AddressForm = {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
};

const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<AddressForm>({ label: 'Home', street: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('user');
      if (!raw) {
        navigate('/auth');
        return;
      }
      const parsed = JSON.parse(raw);
      setUserId(parsed?._id || parsed?.id || '');
      setEmail(parsed?.email || '');
      setName(parsed?.name || parsed?.fullName || '');
      setPhone(parsed?.phone || '');
      if (parsed?.phone) {
        navigate('/');
      }
    } catch {
      navigate('/auth');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/^0+/, '')}`;
    if (!indianPhoneRegex.test(normalizedPhone)) {
      toast.error('Enter a valid Indian mobile number');
      return;
    }
    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Complete address is required');
      return;
    }
    try {
      setSaving(true);
      const payload: any = {
        name: name.trim(),
        phone: normalizedPhone,
      };
      // Save a single default address if user has none
      payload.addresses = [
        {
          id: Math.random().toString(36).substring(2, 12),
          label: address.label || 'Home',
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: true,
        },
      ];
      const res = await usersAPI.update(userId, payload);
      const updated = res.data || {};
      window.localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile completed');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">Mobile Number (+91)</Label>
              <Input
                id="phone"
                placeholder="e.g. 9876543210 or +919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input id="street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save and Continue'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}


