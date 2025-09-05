import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'FINANCE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const invoice = await Invoice.findById(id)
      .populate('customer', 'name email')

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate payment link (in a real app, this would integrate with a payment gateway)
    const paymentLink = `${process.env.NEXTAUTH_URL}/payment/${id}`
    
    return NextResponse.json({ 
      paymentLink,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        customerEmail: invoice.customer.email
      }
    })
  } catch (error) {
    console.error('Error generating payment link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
