# MicroLend - Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Vercel account (recommended) or any hosting platform

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/micro-lending?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Stripe (Optional - for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_CURRENCY=inr
```

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🌐 Deployment Options

### 1. Vercel (Recommended)
1. Push code to GitHub
2. Connect Vercel to your repository
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### 2. Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables

### 3. Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

## 🔧 Build Issues Fixed
- ✅ Next.js 15 API route params handling
- ✅ TypeScript type definitions
- ✅ MongoDB connection optimization
- ✅ Stripe integration compatibility

## 📝 Features Included
- ✅ User authentication (NextAuth.js)
- ✅ Role-based access control
- ✅ Invoice management
- ✅ Payment processing (Stripe)
- ✅ Demo scheduling system
- ✅ Responsive design
- ✅ Input validation & security

## 🛠️ Troubleshooting

### Build Errors
If you encounter build errors:
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Try building without turbopack: `npx next build`

### MongoDB Connection
Ensure your MongoDB URI is correct and the database is accessible from your hosting platform.

### Environment Variables
Make sure all required environment variables are set in your hosting platform's dashboard.
