import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { validateInput, sanitizeString, sanitizeEmail, ValidationRule } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeEmail(email),
      password: password?.trim(),
      role: role?.trim()
    }

    // Server-side validation
    const validationRules: ValidationRule[] = [
      { field: 'Name', value: sanitizedData.name, rules: ['required', 'name'] },
      { field: 'Email', value: sanitizedData.email, rules: ['required', 'email'] },
      { field: 'Password', value: sanitizedData.password, rules: ['required', 'password'] },
      { field: 'Role', value: sanitizedData.role, rules: ['required'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    }

    // Validate role
    if (!['FINANCE_MANAGER', 'CUSTOMER'].includes(sanitizedData.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedData.email })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(sanitizedData.password, 12)

    // Create user
    const user = await User.create({
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: hashedPassword,
      role: sanitizedData.role as 'FINANCE_MANAGER' | 'CUSTOMER'
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
