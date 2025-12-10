"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productAPI, categoryAPI, orderAPI, userAPI, authAPI } from '@/lib/api';
import { Product, Category, Order, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Sidebar, { SidebarItem } from '@/components/layout/Sidebar';
import { Menu, Package, ShoppingCart, Users, FolderTree, Plus, Edit, Trash2, BarChart3, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ViewType = 'overview' | 'products' | 'categories' | 'orders' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [managerDialog, setManagerDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingManager, setEditingManager] = useState<User | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stockQuantity: '', categoryId: '' });
  const [userForm, setUserForm] = useState({ username: '', email: '', roles: [] as string[] });
  const [managerForm, setManagerForm] = useState({ salary: '', joiningDate: '', attendance: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.roles?.includes('ROLE_ADMIN')) {
      toast({ title: 'Access Denied', description: 'You do not have admin privileges', variant: 'destructive' });
      router.push('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
        productAPI.getAllProducts(),
        categoryAPI.getAllCategories(),
        orderAPI.getAllOrders(),
        userAPI.getAllUsers(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setOrders(ordersRes.data);
      
      // Debug: Log the actual user data from backend
      console.log('📊 Users from backend:', usersRes.data);
      console.log('📊 Total users count:', usersRes.data?.length);
      console.log('📊 First user structure:', usersRes.data?.[0]);
      
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, onClick: () => setCurrentView('overview') },
    { id: 'products', label: 'Products', icon: Package, onClick: () => setCurrentView('products') },
    { id: 'categories', label: 'Categories', icon: FolderTree, onClick: () => setCurrentView('categories') },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, onClick: () => setCurrentView('orders') },
    { id: 'users', label: 'Users', icon: Users, onClick: () => setCurrentView('users') },
  ];

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, categoryForm);
      } else {
        await categoryAPI.createCategory(categoryForm);
      }
      setCategoryDialog(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchData();
      toast({ title: 'Success', description: editingCategory ? 'Category updated' : 'Category created' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save category', variant: 'destructive' });
    }
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity),
        categoryId: parseInt(productForm.categoryId),
      };
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, productData);
      } else {
        await productAPI.createProduct(productData);
      }
      setProductDialog(false);
      setProductForm({ name: '', description: '', price: '', stockQuantity: '', categoryId: '' });
      setEditingProduct(null);
      fetchData();
      toast({ title: 'Success', description: editingProduct ? 'Product updated' : 'Product created' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser || !userForm.roles || userForm.roles.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one role', variant: 'destructive' });
      return;
    }
    
    try {
      // Backend expects roles WITH "ROLE_" prefix: ["ROLE_ADMIN", "ROLE_MANAGER"]
      await authAPI.updateRole(editingUser.id, userForm.roles);
      
      const usersRes = await userAPI.getAllUsers();
      setUsers(usersRes.data);
      
      setUserDialog(false);
      setUserForm({ username: '', email: '', roles: [] });
      setEditingUser(null);
      toast({ title: 'Success', description: 'User role updated successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update user role', 
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateManagerInfo = async () => {
    if (!editingManager) return;
    
    try {
      const data = {
        salary: parseFloat(managerForm.salary),
        joiningDate: managerForm.joiningDate,
        attendance: parseInt(managerForm.attendance)
      };
      
      await userAPI.updateManagerInfo(editingManager.id, data);
      
      const usersRes = await userAPI.getAllUsers();
      setUsers(usersRes.data);
      
      toast({ title: 'Success', description: 'Manager info updated successfully' });
      setManagerDialog(false);
      setManagerForm({ salary: '', joiningDate: '', attendance: '' });
      setEditingManager(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update manager info', 
        variant: 'destructive' 
      });
    }
  };

  const toggleUserRole = (role: string) => {
    if (userForm.roles.includes(role)) {
      setUserForm({ ...userForm, roles: userForm.roles.filter(r => r !== role) });
    } else {
      setUserForm({ ...userForm, roles: [...userForm.roles, role] });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={sidebarItems} activeItem={currentView} title="Admin Panel" />
      
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-farm-green-900">Admin Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg" onClick={() => setCurrentView('products')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-farm-green-700">{products.length}</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg" onClick={() => setCurrentView('categories')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <FolderTree className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-farm-green-700">{categories.length}</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg" onClick={() => setCurrentView('orders')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-farm-green-700">{orders.length}</div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg" onClick={() => setCurrentView('users')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-farm-green-700">{users.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', stockQuantity: '', categoryId: '' }); setProductDialog(true); }} className="bg-farm-green-700">
                <Plus className="mr-2 h-4 w-4" />Add Product
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-farm-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </td>
                        <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4"><Badge variant={product.stockQuantity > 0 ? 'default' : 'destructive'}>{product.stockQuantity}</Badge></td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description, price: product.price.toString(), stockQuantity: product.stockQuantity.toString(), categoryId: product.categoryId?.toString() || '' }); setProductDialog(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={async () => { if (confirm('Delete?')) { await productAPI.deleteProduct(product.id); fetchData(); }}} className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); setCategoryDialog(true); }} className="bg-farm-green-700">
                <Plus className="mr-2 h-4 w-4" />Add Category
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => (
                <Card key={category.id}>
                  <CardHeader><CardTitle>{category.name}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, description: category.description }); setCategoryDialog(true); }}>
                        <Edit className="mr-2 h-4 w-4" />Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={async () => { if (confirm('Delete?')) { await categoryAPI.deleteCategory(category.id); fetchData(); }}} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Orders</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-farm-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => {
                      // Find the customer username from users list or use customerUsername from order
                      const customer = users.find(u => u.id === order.customerId);
                      const customerName = order.customerUsername || customer?.username || 'Unknown';
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">#{order.id}</td>
                          <td className="px-6 py-4">{customerName}</td>
                          <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <select value={order.status} onChange={async (e) => { await orderAPI.updateOrderStatusAdmin(order.id, e.target.value); fetchData(); }} className="border rounded px-2 py-1">
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Users Management</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-farm-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase">Roles</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{user.id}</td>
                        <td className="px-6 py-4 font-medium">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {user.roles?.map((role) => (
                              <Badge key={role} variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}>
                                {role.replace('ROLE_', '')}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingUser(user);
                                setUserForm({ username: user.username, email: user.email || '', roles: user.roles || [] });
                                setUserDialog(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Change Role
                            </Button>
                            {user.roles?.includes('ROLE_MANAGER') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setEditingManager(user);
                                  setManagerForm({ salary: '', joiningDate: '', attendance: '' });
                                  setManagerDialog(true);
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                Update Info
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
           
          </div>
        )}
      </div>

      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>Fill in the category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-farm-green-700">{editingCategory ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>Fill in the product details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={productForm.stockQuantity} onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select category</option>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} className="bg-farm-green-700">{editingProduct ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Role Change Dialog */}
      <Dialog open={userDialog} onOpenChange={setUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role - {editingUser?.username}</DialogTitle>
            <DialogDescription>Update user roles and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <Input value={editingUser?.id || ''} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <Input value={editingUser?.username || ''} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={editingUser?.email || ''} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Roles</label>
              <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                {['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CUSTOMER'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={role}
                      checked={userForm.roles.includes(role)}
                      onChange={() => toggleUserRole(role)}
                      className="w-4 h-4 text-farm-green-700 border-gray-300 rounded focus:ring-farm-green-700"
                    />
                    <label htmlFor={role} className="text-sm font-medium cursor-pointer">
                      {role.replace('ROLE_', '')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUserRole} className="bg-farm-green-700">Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Info Update Dialog */}
      <Dialog open={managerDialog} onOpenChange={setManagerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Manager Info - {editingManager?.username}</DialogTitle>
            <DialogDescription>Update manager-specific information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Salary</label>
              <Input 
                type="number" 
                step="0.01"
                value={managerForm.salary} 
                onChange={(e) => setManagerForm({ ...managerForm, salary: e.target.value })} 
                placeholder="50000.00" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Joining Date</label>
              <Input 
                type="date"
                value={managerForm.joiningDate} 
                onChange={(e) => setManagerForm({ ...managerForm, joiningDate: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Attendance (%)</label>
              <Input 
                type="number"
                value={managerForm.attendance} 
                onChange={(e) => setManagerForm({ ...managerForm, attendance: e.target.value })} 
                placeholder="95" 
                min="0"
                max="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManagerDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateManagerInfo} className="bg-farm-green-700">Update Info</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


