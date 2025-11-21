import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { DeliveryZone } from '@/types';
import { adminDeliveryZonesService } from '@/utils/adminService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function DeliveryZonesManagement() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deliveryFee: '',
    minOrderAmount: '',
    estimatedTime: '',
    isActive: true,
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setIsLoading(true);
      const data = await adminDeliveryZonesService.getAll();
      setZones(data);
    } catch (error) {
      console.error('Error loading delivery zones:', error);
      toast.error('Failed to load delivery zones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddZone = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      description: '',
      deliveryFee: '',
      minOrderAmount: '',
      estimatedTime: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description,
      deliveryFee: zone.deliveryFee.toString(),
      minOrderAmount: zone.minOrderAmount.toString(),
      estimatedTime: zone.estimatedTime,
      isActive: zone.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSaveZone = async () => {
    if (!formData.name || !formData.deliveryFee || !formData.minOrderAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const zoneData: Omit<DeliveryZone, 'id' | 'coordinates'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        deliveryFee: parseFloat(formData.deliveryFee),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        estimatedTime: formData.estimatedTime.trim(),
        isActive: formData.isActive,
        coordinates: editingZone?.coordinates || [],
      };

      if (editingZone) {
        await adminDeliveryZonesService.update(editingZone.id, zoneData);
        toast.success('Delivery zone updated successfully!');
      } else {
        await adminDeliveryZonesService.create(zoneData);
        toast.success('Delivery zone created successfully!');
      }

      await loadZones();
      setIsDialogOpen(false);
      setEditingZone(null);
    } catch (error: any) {
      console.error('Error saving delivery zone:', error);
      toast.error(error.message || 'Failed to save delivery zone');
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      await adminDeliveryZonesService.delete(id);
      toast.success('Delivery zone deleted successfully!');
      await loadZones();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete delivery zone');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const zone = zones.find(z => z.id === id);
      if (!zone) return;
      
      await adminDeliveryZonesService.update(id, {
        ...zone,
        isActive: !zone.isActive,
      });
      await loadZones();
      toast.success(`Delivery zone ${!zone.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error('Failed to update delivery zone');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-gray-600">Manage delivery areas and fees</p>
        </div>
        <Button onClick={handleAddZone}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery Zone
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Zones ({zones.filter(z => z.isActive).length} active)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Delivery Fee</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Est. Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No delivery zones found. Click "Add Delivery Zone" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell>{zone.description}</TableCell>
                    <TableCell>₹{zone.deliveryFee}</TableCell>
                    <TableCell>₹{zone.minOrderAmount}</TableCell>
                    <TableCell>{zone.estimatedTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={zone.isActive}
                          onCheckedChange={() => toggleActive(zone.id)}
                        />
                        {zone.isActive ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditZone(zone)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{zone.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteZone(zone.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Zone Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Downtown Area"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Zone description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee (₹) *</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: e.target.value }))}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Min Order (₹) *</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                  placeholder="200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time *</Label>
              <Input
                id="estimatedTime"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="25-35 mins"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveZone}>
              {editingZone ? 'Update Zone' : 'Add Zone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
