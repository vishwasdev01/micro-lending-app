import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

export async function POST() {
  try {
    const result = await seedDatabase()
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database' 
    }, { status: 500 })
  }
}
