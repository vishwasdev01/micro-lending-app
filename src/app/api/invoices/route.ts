import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Invoice from '@/models/Invoice'
import User from '@/models/User'
import { CreateInvoiceData } from '@/types'
import mongoose from 'mongoose'
import { validateInput, sanitizeString, sanitizeNumber, ValidationRule } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const filter: any = {}
    
    if (session.user.role === 'CUSTOMER') {
      filter.customerId = new mongoose.Types.ObjectId(session.user.id)
    }
    
    if (status) {
      filter.status = status
    }
    
    let query = Invoice.find(filter)
      .populate('customerId', 'name email')
      .populate('createdById', 'name email')
      .sort({ createdAt: -1 })

    if (search) {
      query = query.or([
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerId.name': { $regex: search, $options: 'i' } },
        { 'customerId.email': { $regex: search, $options: 'i' } }
      ])
    }

    const invoices = await query.exec()

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'FINANCE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { customerId, amount, dueDate, description } = body

    // Sanitize inputs
    const sanitizedData = {
      customerId: customerId?.trim(),
      amount: sanitizeNumber(amount),
      dueDate: dueDate?.trim(),
      description: sanitizeString(description || '')
    }

    // Server-side validation
    const validationRules: ValidationRule[] = [
      { field: 'Customer', value: sanitizedData.customerId, rules: ['required'] },
      { field: 'Amount', value: sanitizedData.amount, rules: ['required', 'amount'] },
      { field: 'Due Date', value: sanitizedData.dueDate, rules: ['required', 'date', 'futureDate'] },
      { field: 'Description', value: sanitizedData.description, rules: ['description'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    }

    // Validate customer exists
    const customer = await User.findById(sanitizedData.customerId)
    if (!customer || customer.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid customer' }, { status: 400 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(sanitizedData.customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 })
    }
    
    // Generate unique invoice number
    const invoiceCount = await Invoice.countDocuments()
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`

    const invoice = await Invoice.create({
      invoiceNumber,
      customerId: new mongoose.Types.ObjectId(sanitizedData.customerId),
      createdById: new mongoose.Types.ObjectId(session.user.id),
      amount: sanitizedData.amount,
      dueDate: new Date(sanitizedData.dueDate),
      description: sanitizedData.description,
    })

    await invoice.populate([
      { path: 'customerId', select: 'name email' },
      { path: 'createdById', select: 'name email' }
    ])

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
