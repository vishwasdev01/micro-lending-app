import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'

// Demo booking schema
const DemoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String, required: true },
  phone: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  message: { type: String, default: '' },
  demoType: { 
    type: String, 
    enum: ['overview', 'technical', 'custom'], 
    default: 'overview' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Demo = mongoose.models.Demo || mongoose.model('Demo', DemoSchema)

export async function PATCH(
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
    const { status } = await request.json()

    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid demo ID format' }, { status: 400 })
    }

    const demo = await Demo.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!demo) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      demo: {
        _id: demo._id,
        name: demo.name,
        email: demo.email,
        company: demo.company,
        phone: demo.phone,
        preferredDate: demo.preferredDate,
        preferredTime: demo.preferredTime,
        message: demo.message,
        demoType: demo.demoType,
        status: demo.status,
        createdAt: demo.createdAt,
        updatedAt: demo.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating demo status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid demo ID format' }, { status: 400 })
    }

    const demo = await Demo.findByIdAndDelete(id)

    if (!demo) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Demo deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting demo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
