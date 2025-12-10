// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  salary?: number;
  joiningDate?: string;
  attendance?: number;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  roles: string[];
  message: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerId: number; // Changed from userId to match backend
  customerUsername?: string; // Changed from username to match backend
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}
