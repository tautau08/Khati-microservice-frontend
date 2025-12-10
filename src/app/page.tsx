"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout, ShoppingBag, Truck, Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and redirect to role-based dashboard
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.roles?.includes('ROLE_ADMIN')) {
          router.push('/admin');
        } else if (user.roles?.includes('ROLE_MANAGER')) {
          router.push('/manager');
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        // Invalid user data, stay on homepage
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-farm-green-50 via-farm-cream-50 to-farm-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-farm-green-100 px-4 py-2 rounded-full">
              <Sprout className="h-5 w-5 text-farm-green-700" />
              <span className="text-sm font-medium text-farm-green-700">
                100% Fresh from Farm
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-farm-green-900 leading-tight">
              Farm Fresh Products
              <br />
              <span className="text-farm-orange-600">Delivered to Your Door</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the authentic taste of farm-fresh produce. Sourced directly 
              from local farmers, delivered with care.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-farm-green-700 hover:bg-farm-green-800 text-lg px-8">
                  Shop Now
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-farm-green-700 text-farm-green-700 hover:bg-farm-green-50 text-lg px-8">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-farm-green-100 rounded-full">
                <Sprout className="h-8 w-8 text-farm-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-farm-green-900">
                Farm Fresh Quality
              </h3>
              <p className="text-gray-600">
                Directly sourced from local farms ensuring the highest quality and freshness
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-farm-orange-100 rounded-full">
                <Truck className="h-8 w-8 text-farm-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-farm-green-900">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Quick and reliable delivery service to ensure products arrive fresh
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-farm-cream-200 rounded-full">
                <Shield className="h-8 w-8 text-farm-brown-700" />
              </div>
              <h3 className="text-xl font-semibold text-farm-green-900">
                Secure Shopping
              </h3>
              <p className="text-gray-600">
                Safe and secure payment options with buyer protection guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-farm-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Start Your Healthy Journey Today
          </h2>
          <p className="text-xl text-farm-green-100">
            Join thousands of happy customers enjoying fresh farm products
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary" className="bg-white text-farm-green-700 hover:bg-farm-green-50 text-lg px-8">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
