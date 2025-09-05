import connectDB from './mongodb'
import User from '@/models/User'
import Invoice from '@/models/Invoice'
import Payment from '@/models/Payment'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany({})
    await Invoice.deleteMany({})
    await Payment.deleteMany({})

    // Create Finance Manager
    const financeManager = await User.create({
      email: 'finance@company.com',
      name: 'Finance Manager',
      password: await bcrypt.hash('password123', 12),
      role: 'FINANCE_MANAGER',
    })

    // Create Customers
    const customer1 = await User.create({
      email: 'john@example.com',
      name: 'John Doe',
      password: await bcrypt.hash('password123', 12),
      role: 'CUSTOMER',
    })

    const customer2 = await User.create({
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: await bcrypt.hash('password123', 12),
      role: 'CUSTOMER',
    })

    const customer3 = await User.create({
      email: 'bob@example.com',
      name: 'Bob Johnson',
      password: await bcrypt.hash('password123', 12),
      role: 'CUSTOMER',
    })

    // Create Sample Invoices
    const invoice1 = await Invoice.create({
      invoiceNumber: 'INV-000001',
      customerId: customer1._id,
      createdById: financeManager._id,
      amount: 1500.00,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'PENDING',
      description: 'Business loan installment',
    })

    const invoice2 = await Invoice.create({
      invoiceNumber: 'INV-000002',
      customerId: customer2._id,
      createdById: financeManager._id,
      amount: 2500.00,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'PENDING',
      description: 'Equipment financing',
    })

    const invoice3 = await Invoice.create({
      invoiceNumber: 'INV-000003',
      customerId: customer3._id,
      createdById: financeManager._id,
      amount: 800.00,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (overdue)
      status: 'OVERDUE',
      description: 'Personal loan payment',
    })

    const invoice4 = await Invoice.create({
      invoiceNumber: 'INV-000004',
      customerId: customer1._id,
      createdById: financeManager._id,
      amount: 1200.00,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: 'PAID',
      description: 'Previous loan installment',
    })

    // Create Sample Payment
    const payment1 = await Payment.create({
      invoiceId: invoice4._id,
      userId: customer1._id,
      amount: 1200.00,
      status: 'COMPLETED',
      paymentMethod: 'card',
      transactionId: 'TXN-123456789',
    })

    console.log('✅ MongoDB seed data created successfully!')
    console.log('👤 Finance Manager:', financeManager.email)
    console.log('👥 Customers:', customer1.email, customer2.email, customer3.email)
    console.log('📄 Invoices created:', 4)
    console.log('💳 Payments created:', 1)

    return {
      financeManager,
      customers: [customer1, customer2, customer3],
      invoices: [invoice1, invoice2, invoice3, invoice4],
      payments: [payment1]
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}
