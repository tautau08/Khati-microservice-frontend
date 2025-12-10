# 🌾 Khati - Farm Fresh E-commerce Frontend

A Next.js + TypeScript frontend for the Khati microservices backend, featuring a farm-fresh design with Shadcn UI components.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend microservices running on ports 8080-8084
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
The `.env.local` file is already configured with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
khati_microFront/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (customer)/         # Customer pages
│   │   ├── (manager)/          # Manager dashboard
│   │   └── (admin)/            # Admin dashboard
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── layout/             # Layout components
│   │   └── shared/             # Shared components
│   ├── lib/                    # Utilities and services
│   │   ├── api/                # API service layer
│   │   ├── auth/               # Authentication logic
│   │   └── utils.ts            # Utility functions
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.js              # Next.js configuration
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 🔌 Backend Integration

### API Gateway
All API requests go through: `http://localhost:8080`

### Available Services:
- **Auth Service** (Port 8081) - Authentication & JWT tokens
- **User Service** (Port 8082) - User profile management
- **Inventory Service** (Port 8083) - Products & categories
- **Order Service** (Port 8084) - Order processing

### Authentication Flow:
1. User logs in → Receives JWT token
2. Token stored in localStorage
3. Token sent in `Authorization: Bearer {token}` header
4. Protected routes check for valid token

## 🧪 Testing the Connection

### 1. Start Backend Services
Ensure all microservices are running:
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081
- User Service: http://localhost:8082
- Inventory Service: http://localhost:8083
- Order Service: http://localhost:8084

### 2. Test API Endpoints
```bash
# Check API Gateway health
curl http://localhost:8080/api/inventory/products

# Register a test user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123","email":"test@example.com"}'
```

### 3. Run Frontend
```bash
npm run dev
```

## 🎯 Features Implemented

### ✅ Core Features
- [x] Next.js 14 with TypeScript setup
- [x] Tailwind CSS with farm-fresh theme
- [x] Shadcn UI component library
- [x] API service layer with Axios
- [x] Authentication system (login/register)
- [x] Protected routes middleware
- [x] Role-based access control

### 🎨 Customer Features
- [x] Product browsing (public)
- [x] Product detail pages
- [x] Shopping cart
- [x] Checkout flow
- [x] Order history
- [x] User profile

### 👔 Manager Features
- [x] Order management
- [x] Customer list
- [x] Order status updates

### 🔧 Admin Features
- [x] Product management (CRUD)
- [x] Category management
- [x] User management
- [x] Order oversight
- [x] Role assignment

## 🎨 Design System

### Farm-Fresh Color Palette
```css
/* Primary - Earthy Green */
--green-50: #f0fdf4
--green-600: #16a34a
--green-800: #166534

/* Secondary - Warm Orange */
--orange-400: #fb923c
--orange-600: #ea580c

/* Neutral - Natural Browns */
--stone-100: #f5f5f4
--stone-600: #57534e

/* Background - Cream */
--amber-50: #fffbeb
```

### Typography
- **Font Family:** Inter (sans-serif)
- **Headings:** Bold, green-800
- **Body:** Regular, gray-700

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🔐 Environment Variables

```env
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Optional
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Khati
```

## 📚 Key API Endpoints

### Public Endpoints (No Auth)
```
GET  /api/inventory/categories       # List categories
GET  /api/inventory/products         # List products
GET  /api/inventory/products/{id}    # Product details
```

### Customer Endpoints
```
POST /api/auth/register              # Sign up
POST /api/auth/login                 # Sign in
GET  /api/users/me                   # Get profile
POST /api/orders                     # Create order
GET  /api/orders/my                  # My orders
```

### Manager Endpoints
```
GET  /api/users/customers            # View customers
PUT  /api/orders/manager/{id}/status # Update order status
```

### Admin Endpoints
```
GET    /api/users                           # All users
PUT    /api/auth/update-role                # Change roles
POST   /api/inventory/admin/categories      # Create category
POST   /api/inventory/admin/products        # Create product
DELETE /api/inventory/admin/products/{id}   # Delete product
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:** 
- Check if API Gateway is running on port 8080
- Verify CORS is configured in gateway
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`

### Issue: "401 Unauthorized"
**Solution:**
- Token may be expired - log in again
- Check if token is being sent in Authorization header
- Verify user has correct role for the endpoint

### Issue: "Module not found" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not working
**Solution:**
```bash
npm run build
npm run dev
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📞 Support

For backend API documentation, see:
- `FRONTEND_INTEGRATION_GUIDE.md` - Complete API docs
- `QUICK_START_FRONTEND.md` - Quick reference
- `POSTMAN_COLLECTION_GUIDE.md` - API testing guide

## 📄 License

This project is part of the Khati microservices platform.

---

**Created:** November 5, 2025  
**Next.js Version:** 14.x  
**Backend Gateway:** http://localhost:8080

Happy coding! 🌾✨
