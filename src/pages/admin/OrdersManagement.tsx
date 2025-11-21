import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AdminOrder } from '@/types';
import { adminOrdersService } from '@/utils/adminService';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Trash2, Search, Phone } from 'lucide-react';
export default function OrdersManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      console.log('Loading orders...');
      const data = await adminOrdersService.getAll();
      console.log('Loaded orders:', data);
      setOrders(data);
      if (data.length === 0) {
        toast.info('No orders found. Orders will appear here once customers place them.');
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminOrdersService.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      await loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleClearAll = async () => {
    try {
      setIsLoading(true);
      const result = await adminOrdersService.clearAll();
      toast.success(`All orders cleared successfully! (${result.deletedCount} orders deleted)`);
      await loadOrders();
    } catch (error: any) {
      toast.error('Failed to clear orders: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const orderNumber = order.orderNumber || '';
      const customerName = order.customerName || '';
      const orderId = order.id || '';
      const customerPhone = order.customerPhone || '';
      const customerEmail = order.customerEmail || '';
      
      // Create unique identifier for search
      const customerFirstName = customerName?.split(' ')[0] || 'Guest';
      const orderCount = orders.length - orders.findIndex(o => o.id === order.id);
      const uniqueId = `${customerFirstName}-${orderCount}`.toLowerCase();
      
      return (
        orderNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        orderId.toLowerCase().includes(query) ||
        customerPhone.includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        uniqueId.includes(query)
      );
    }
    
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'preparing':
        return 'default';
      case 'out-for-delivery':
        return 'default';
      case 'delivered':
        return 'default';
      default:
        return 'outline';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOrders}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isLoading || orders.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all {orders.length} orders
                        from the database and local storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Clear All Orders
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, customer name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer & Phone</TableHead>
                <TableHead>Delivery Address</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">No orders found</p>
                      <p className="text-sm text-gray-400">
                        {statusFilter !== 'all' 
                          ? `No orders with status "${statusFilter}"`
                          : 'Orders will appear here when customers place them'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadOrders}
                        disabled={isLoading}
                        className="mt-2"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => {
                  // Create unique identifier: CustomerName-OrderCount
                  const customerFirstName = order.customerName?.split(' ')[0] || 'Guest';
                  const orderCount = orders.length - orders.findIndex(o => o.id === order.id);
                  const uniqueId = `${customerFirstName}-${orderCount}`;
                  
                  return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">
                          {order.orderNumber || `ORD${order.id?.slice(-8) || Date.now()}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {uniqueId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{order.customerName || 'N/A'}</div>
                        {order.customerPhone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-primary" />
                            <a 
                              href={`tel:${order.customerPhone}`} 
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {order.customerPhone}
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => window.open(`tel:${order.customerPhone}`, '_self')}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">{order.customerEmail || 'No contact'}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs whitespace-pre-line">
                        {order.deliveryAddress || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{order.items?.length || 0} items</TableCell>
                    <TableCell className="font-medium">₹{order.total}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        {order.status === 'pending' && (
                          <Button size="sm" onClick={() => handleStatusChange(order.id, 'preparing')}>
                            Confirm
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
