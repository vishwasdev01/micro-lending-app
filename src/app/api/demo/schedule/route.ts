import { NextRequest, NextResponse } from 'next/server'
import { validateInput, sanitizeString, sanitizeEmail, ValidationRule } from '@/lib/validation'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, phone, preferredDate, preferredTime, message, demoType } = body

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeEmail(email),
      company: sanitizeString(company),
      phone: sanitizeString(phone),
      preferredDate: preferredDate?.trim(),
      preferredTime: preferredTime?.trim(),
      message: sanitizeString(message || ''),
      demoType: demoType?.trim() || 'overview'
    }

    // Server-side validation
    const validationRules: ValidationRule[] = [
      { field: 'Name', value: sanitizedData.name, rules: ['required', 'name'] },
      { field: 'Email', value: sanitizedData.email, rules: ['required', 'email'] },
      { field: 'Company', value: sanitizedData.company, rules: ['required', 'minLength'] },
      { field: 'Phone', value: sanitizedData.phone, rules: ['required', 'minLength'] },
      { field: 'Preferred Date', value: sanitizedData.preferredDate, rules: ['required', 'date', 'futureDate'] },
      { field: 'Preferred Time', value: sanitizedData.preferredTime, rules: ['required'] },
      { field: 'Message', value: sanitizedData.message, rules: ['description'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    }

    // Validate demo type
    if (!['overview', 'technical', 'custom'].includes(sanitizedData.demoType)) {
      return NextResponse.json({ error: 'Invalid demo type' }, { status: 400 })
    }

    await connectDB()

    // Check for existing demo booking on the same date and time
    const existingDemo = await Demo.findOne({
      preferredDate: new Date(sanitizedData.preferredDate),
      preferredTime: sanitizedData.preferredTime,
      status: { $in: ['pending', 'confirmed'] }
    })

    if (existingDemo) {
      return NextResponse.json({ 
        error: 'This time slot is already booked. Please choose a different time.' 
      }, { status: 400 })
    }

    // Create demo booking
    const demo = await Demo.create({
      name: sanitizedData.name,
      email: sanitizedData.email,
      company: sanitizedData.company,
      phone: sanitizedData.phone,
      preferredDate: new Date(sanitizedData.preferredDate),
      preferredTime: sanitizedData.preferredTime,
      message: sanitizedData.message,
      demoType: sanitizedData.demoType
    })

    // In a real application, you would:
    // 1. Send confirmation email to the user
    // 2. Send notification to sales team
    // 3. Add to calendar (Google Calendar, Outlook, etc.)
    // 4. Send reminder emails

    return NextResponse.json({
      success: true,
      demoId: demo._id,
      message: 'Demo scheduled successfully! We\'ll contact you soon to confirm the details.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error scheduling demo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const filter: any = {}
    
    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      
      filter.preferredDate = {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }
    
    if (status) {
      filter.status = status
    }

    const demos = await Demo.find(filter)
      .sort({ preferredDate: 1, preferredTime: 1 })
      .select('-__v')

    return NextResponse.json(demos)

  } catch (error) {
    console.error('Error fetching demos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
