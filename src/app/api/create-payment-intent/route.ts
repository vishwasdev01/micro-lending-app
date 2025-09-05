import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    await connectDB()

    const invoice = await Invoice.findById(invoiceId).populate('customerId', 'name email')
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Check minimum amount for Stripe
    if (invoice.amount < 0.5) {
      return NextResponse.json({ 
        error: `Amount too small for Stripe payment. Minimum amount is $0.50. Current amount: $${invoice.amount.toFixed(2)}` 
      }, { status: 400 })
    }

    const currency = process.env.STRIPE_CURRENCY || 'inr'
    // Enforce Stripe minimum charge (typically 0.50 in most currencies)
    const MIN_AMOUNT = 0.5
    const amountToCharge = Math.max(Number(invoice.amount) || 0, MIN_AMOUNT)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amountToCharge),
      currency,
      description: `Payment for Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice._id.toString(),
        customerId: invoice.customerId._id.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountToCharge,
      invoiceNumber: invoice.invoiceNumber,
      currency
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
