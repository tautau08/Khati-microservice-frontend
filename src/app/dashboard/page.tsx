"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, userAPI } from '@/lib/api';
import { Order, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function CustomerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, userRes] = await Promise.all([
        orderAPI.getMyOrders(),
        userAPI.getCurrentUser(),
      ]);
      
      setOrders(ordersRes.data);
      setUser(userRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSpent = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getDeliveredOrders = () => {
    return orders.filter(o => o.status === 'DELIVERED').length;
  };

  const getPendingOrders = () => {
    return orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-farm-green-900">
          Welcome back, {user?.username}! 🌱
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your orders</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-farm-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm-green-700">{orders.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getPendingOrders()}</div>
            <p className="text-xs text-gray-500 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getDeliveredOrders()}</div>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Package className="h-4 w-4 text-farm-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm-orange-600">${getTotalSpent().toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">All orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-farm-green-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-farm-green-500">
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-farm-green-700 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Browse Products</h3>
                <p className="text-sm text-gray-600">Discover fresh farm products</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cart">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-farm-orange-500">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto text-farm-orange-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">View Cart</h3>
                <p className="text-sm text-gray-600">Check your shopping cart</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Track Orders</h3>
                <p className="text-sm text-gray-600">View all your orders</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-farm-green-900">Recent Orders</h2>
          <Link href="/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
              <Link href="/products">
                <Button className="bg-farm-green-700 hover:bg-farm-green-800">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <Badge className={STATUS_COLORS[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{order.items?.length || 0} items</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-farm-green-700">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item) => {
                          const subtotal = item.subtotal ?? (item.price * item.quantity);
                          return (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.productName} × {item.quantity}
                              </span>
                              <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
