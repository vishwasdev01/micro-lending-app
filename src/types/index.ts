export type UserRole = 'FINANCE_MANAGER' | 'CUSTOMER'
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface User {
  _id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  customerId: string
  createdById: string
  amount: number
  dueDate: Date
  status: InvoiceStatus
  description?: string
  createdAt: Date
  updatedAt: Date
  customer?: User
  createdBy?: User
}

export interface Payment {
  _id: string
  invoiceId: string
  userId: string
  amount: number
  status: PaymentStatus
  paymentMethod?: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
  invoice?: Invoice
  user?: User
}

export interface CreateInvoiceData {
  customerId: string
  amount: number
  dueDate: string
  description?: string
}

export interface PaymentLinkData {
  invoiceId: string
  amount: number
  customerEmail: string
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}
