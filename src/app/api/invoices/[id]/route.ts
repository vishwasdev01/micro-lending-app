import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const invoice = await Invoice.findById(id)
      .populate('customerId', 'name email')
      .populate('createdById', 'name email')

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
