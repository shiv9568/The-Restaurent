import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { restaurantBrandAPI } from '@/utils/api';
import { toast } from 'sonner';

export default function RestaurantSettings() {
  const [form, setForm] = useState<any>({
    name: '',
    logo: '',
    about: '',
    address: '',
    openTime: '',
    closeTime: '',
    contactNumber: '',
    deliveryZones: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await restaurantBrandAPI.get();
        if (res.data) {
          const d = res.data;
          setForm({
            name: d.name || '',
            logo: d.logo || '',
            about: d.about || '',
            address: d.address || '',
            openTime: d.openTime || '',
            closeTime: d.closeTime || '',
            contactNumber: d.contactNumber || '',
            deliveryZones: (d.deliveryZones || []).join(', '),
          });
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async () => {
    try {
      const payload = {
        ...form,
        deliveryZones: form.deliveryZones ? form.deliveryZones.split(',').map((z: string) => z.trim()).filter(Boolean) : [],
      };
      await restaurantBrandAPI.upsert(payload);
      toast.success('Restaurant branding updated');
    } catch {
      toast.error('Save failed');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Restaurant Settings</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input name="name" value={form.name} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <Input name="logo" value={form.logo} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">About</label>
            <Textarea name="about" value={form.about} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea name="address" value={form.address} onChange={onChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Open Time</label>
              <Input name="openTime" placeholder="10:00" value={form.openTime} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Close Time</label>
              <Input name="closeTime" placeholder="22:00" value={form.closeTime} onChange={onChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number</label>
            <Input name="contactNumber" value={form.contactNumber} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Zones (comma separated)</label>
            <Input name="deliveryZones" value={form.deliveryZones} onChange={onChange} />
          </div>
          <Button onClick={onSave}>Save</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Preview</h2>
          <div className="flex items-center gap-3">
            {form.logo ? <img src={form.logo} alt="logo" className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-gray-200 rounded" />}
            <div>
              <div className="text-lg font-bold">{form.name || 'Restaurant Name'}</div>
              <div className="text-sm text-gray-500">Open {form.openTime || '--:--'} - {form.closeTime || '--:--'}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{form.about}</p>
          <div className="text-sm">
            <div><span className="font-medium">Address: </span>{form.address}</div>
            <div><span className="font-medium">Contact: </span>{form.contactNumber}</div>
            {form.deliveryZones && <div><span className="font-medium">Zones: </span>{form.deliveryZones}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
