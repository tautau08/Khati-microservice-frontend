"use client"

import { ShoppingCart, User, LogOut, Menu, Sprout } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Get cart count from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartItems = JSON.parse(cart);
      setCartCount(cartItems.length);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-farm-green-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-farm-green-700 rounded-lg group-hover:bg-farm-green-800 transition">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-farm-green-800">Khati</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <Link 
                href="/products" 
                className={`text-sm font-medium transition ${
                  pathname === '/products' 
                    ? 'text-farm-green-700' 
                    : 'text-gray-700 hover:text-farm-green-700'
                }`}
              >
                Products
              </Link>
            )}
            
            {user && !user.roles?.includes('ROLE_ADMIN') && !user.roles?.includes('ROLE_MANAGER') && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition ${
                    pathname === '/dashboard' 
                      ? 'text-farm-green-700' 
                      : 'text-gray-700 hover:text-farm-green-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/orders" 
                  className={`text-sm font-medium transition ${
                    pathname === '/orders' 
                      ? 'text-farm-green-700' 
                      : 'text-gray-700 hover:text-farm-green-700'
                  }`}
                >
                  My Orders
                </Link>
              </>
            )}

            {user?.roles?.includes('ROLE_MANAGER') && (
              <Link 
                href="/manager" 
                className={`text-sm font-medium transition ${
                  pathname === '/manager' 
                    ? 'text-farm-green-700' 
                    : 'text-gray-700 hover:text-farm-green-700'
                }`}
              >
                Manager Dashboard
              </Link>
            )}

            {user?.roles?.includes('ROLE_ADMIN') && (
              <Link 
                href="/admin" 
                className={`text-sm font-medium transition ${
                  pathname === '/admin' 
                    ? 'text-farm-green-700' 
                    : 'text-gray-700 hover:text-farm-green-700'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart - Only show for logged-in customers (not admin/manager) */}
            {user && !user.roles?.includes('ROLE_ADMIN') && !user.roles?.includes('ROLE_MANAGER') && (
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-farm-orange-500">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-farm-green-700 text-farm-green-700 hover:bg-farm-green-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-farm-green-700 hover:bg-farm-green-800">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
