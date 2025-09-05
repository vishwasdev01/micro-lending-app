import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/mongodb'
import Invoice from '@/models/Invoice'
import Payment from '@/models/Payment'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    await connectDB()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        if (!invoiceId) {
          console.error('No invoice ID in payment intent metadata')
          break
        }

        // Update invoice status
        await Invoice.findByIdAndUpdate(invoiceId, {
          status: 'PAID',
          updatedAt: new Date(),
        })

        // Create payment record
        await Payment.create({
          invoiceId,
          userId: customerId,
          amount: paymentIntent.amount / 100,
          status: 'COMPLETED',
          paymentMethod: 'stripe',
          transactionId: paymentIntent.id,
        })

        console.log(`Payment succeeded for invoice ${invoiceId}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        if (invoiceId && customerId) {
          // Create failed payment record
          await Payment.create({
            invoiceId,
            userId: customerId,
            amount: paymentIntent.amount / 100,
            status: 'FAILED',
            paymentMethod: 'stripe',
            transactionId: paymentIntent.id,
          })

          console.log(`Payment failed for invoice ${invoiceId}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
