import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Invoice from '@/models/Invoice'
import { validateInput, sanitizeString, sanitizeNumber, ValidationRule } from '@/lib/validation'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { invoiceId, amount, paymentMethod, transactionId } = body

    // Sanitize inputs
    const sanitizedData = {
      invoiceId: invoiceId?.trim(),
      amount: sanitizeNumber(amount),
      paymentMethod: sanitizeString(paymentMethod || 'online'),
      transactionId: sanitizeString(transactionId || '')
    }

    // Server-side validation
    const validationRules: ValidationRule[] = [
      { field: 'Invoice ID', value: sanitizedData.invoiceId, rules: ['required'] },
      { field: 'Amount', value: sanitizedData.amount, rules: ['required', 'positive'] },
      { field: 'Payment Method', value: sanitizedData.paymentMethod, rules: ['required'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(sanitizedData.invoiceId)) {
      return NextResponse.json({ error: 'Invalid invoice ID format' }, { status: 400 })
    }

    // Verify invoice exists and belongs to customer
    const invoice = await Invoice.findById(sanitizedData.invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (session.user.role === 'CUSTOMER' && invoice.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate payment amount doesn't exceed invoice amount
    if (sanitizedData.amount > invoice.amount) {
      return NextResponse.json({ error: 'Payment amount cannot exceed invoice amount' }, { status: 400 })
    }

    // Use invoice amount if amount is 0 or not provided
    const paymentAmount = sanitizedData.amount > 0 ? sanitizedData.amount : invoice.amount

    // Create payment record
    const payment = await Payment.create({
      invoiceId: sanitizedData.invoiceId,
      userId: session.user.id,
      amount: paymentAmount,
      paymentMethod: sanitizedData.paymentMethod,
      status: 'COMPLETED', // In a real app, this would be updated based on payment gateway response
      transactionId: sanitizedData.transactionId || `TXN-${Date.now()}`
    })

    // Update invoice status if fully paid
    const totalPaid = await Payment.aggregate([
      { $match: { invoiceId: invoice._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    if (totalPaid.length > 0 && totalPaid[0].total >= invoice.amount) {
      await Invoice.findByIdAndUpdate(sanitizedData.invoiceId, { status: 'PAID' })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
