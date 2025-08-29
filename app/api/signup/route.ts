import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: false, message: 'All fields are required!!' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { status: false, message: 'Email already registered!!' },
        { status: 400 }
      )
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, hash this password
      }
    })

    return NextResponse.json({
      status: true,
      message: 'Signup successful!'
    })
  } catch (error) {
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
