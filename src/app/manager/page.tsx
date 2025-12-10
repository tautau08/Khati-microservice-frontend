"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, userAPI, productAPI } from '@/lib/api';
import { Order, User, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ManagerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.roles?.includes('ROLE_MANAGER')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have manager privileges',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        orderAPI.getAllOrdersManager(), 
        
        userAPI.getCustomers(),
        productAPI.getAllProducts(),
      ]);
      
      console.log('Manager Dashboard - Orders:', ordersRes.data);
      console.log('Manager Dashboard - Orders Length:', ordersRes.data?.length);
      console.log('Manager Dashboard - Customers:', customersRes.data);
      console.log('Manager Dashboard - Customers Length:', customersRes.data?.length);
      console.log('Manager Dashboard - Products:', productsRes.data);
      console.log('Manager Dashboard - Products Length:', productsRes.data?.length);
      
      setOrders(ordersRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error: any) {
      console.error('Manager Dashboard - Fetch error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
      
      // Set empty arrays on error to prevent undefined issues
      setOrders([]);
      setCustomers([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await orderAPI.updateOrderStatusManager(orderId, status);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getPendingOrders = () => {
    return orders.filter(o => o.status === 'PENDING').length;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-farm-green-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage orders, customers, and inventory</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getPendingOrders()}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm-green-700">{orders.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${getTotalRevenue().toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">From delivered orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-farm-green-900 mb-4">Order Management</h2>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-farm-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-farm-green-900 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        // Find customer from customers list
                        const customer = customers.find(c => c.id === order.customerId);
                        const customerName = order.customerUsername || customer?.username || 'Unknown';
                        
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{customerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <Badge className={STATUS_COLORS[order.status]}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Products Alert */}
        <div>
          <h2 className="text-2xl font-semibold text-farm-green-900 mb-4">Inventory Alerts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter(p => p.stockQuantity < 10)
              .map((product) => (
                <Card key={product.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Stock:</p>
                        <p className="text-xl font-bold text-orange-600">{product.stockQuantity}</p>
                      </div>
                      <Badge variant="destructive">Low Stock</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {products.filter(p => p.stockQuantity < 10).length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-gray-500">
                  All products are well stocked
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div>
          <h2 className="text-2xl font-semibold text-farm-green-900 mb-4">Customers</h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.slice(0, 6).map((customer) => (
                  <div key={customer.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{customer.username}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm font-medium">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {customers.length > 6 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    View All Customers ({customers.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
