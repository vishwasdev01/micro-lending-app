# Micro Lending - Accounts Receivable Management System

A full-stack web application built with Next.js, TypeScript, and Tailwind CSS for managing accounts receivable in a micro-lending company.

## Features

### Finance Manager (Creditor) Functions:
- **Authentication**: Secure login with username and password
- **Create Invoices**: Generate new invoices with customer information, amounts, and due dates
- **View Invoices**: Comprehensive invoice management with search and filter capabilities
- **Generate Payment Links**: Create secure payment links for customers

### Customer (Debtor) Functions:
- **View Outstanding Invoices**: Access all pending and overdue invoices
- **Make Payments**: Secure payment processing with multiple payment methods
- **Payment History**: Track completed payments

## Tech Stack

- **Frontend & Backend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd micro-lending-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI="mongodb://localhost:27017/micro-lending-app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Payment Gateway (for future integration)
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

4. Start MongoDB:
Make sure MongoDB is running on your system. You can use MongoDB Atlas (cloud) or local MongoDB installation.

5. Seed the database with sample data:
```bash
# Start the development server first
npm run dev

# In another terminal, seed the database
npm run seed
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses MongoDB with the following collections:

- **Users**: Finance Managers and Customers with role-based access
- **Invoices**: Invoice records with customer and payment information
- **Payments**: Payment transactions linked to invoices

### MongoDB Collections:
- `users` - User accounts (Finance Managers and Customers)
- `invoices` - Invoice records with references to users
- `payments` - Payment transactions with references to invoices and users

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Invoices
- `GET /api/invoices` - Get invoices (filtered by user role)
- `POST /api/invoices` - Create new invoice (Finance Manager only)
- `POST /api/invoices/[id]/payment-link` - Generate payment link

### Payments
- `POST /api/payments` - Process payment

### Customers
- `GET /api/customers` - Get customer list (Finance Manager only)

## User Roles

### Finance Manager
- Create and manage invoices
- Generate payment links
- View all invoices and customer data
- Access comprehensive dashboard with analytics

### Customer
- View personal invoices
- Make payments
- Track payment history
- Access simplified dashboard

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Role-based access control
- Secure API endpoints with authentication checks

## Future Enhancements

- Real payment gateway integration (Stripe, PayPal)
- Email notifications for invoices and payments
- Advanced reporting and analytics
- Mobile-responsive design improvements
- Invoice PDF generation
- Automated overdue invoice handling

## Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── models/             # Mongoose models
└── types/              # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with sample data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.