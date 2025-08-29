import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { assessmentId } = await request.json()

    const exam = await prisma.exam.findUnique({
      where: { assessmentId }
    })

    if (!exam) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid Assessment ID'
      })
    }

    const currentTime = new Date()
    const examStartTime = new Date(`${exam.date} ${exam.time}`)
    const expiryTime = exam.expiry

    if (exam.examStatus === 'Cancelled') {
      return NextResponse.json({
        status: 'cancelled',
        message: 'Assessment has been cancelled'
      })
    } else if (exam.examStatus === 'Expired' || currentTime > expiryTime) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { examStatus: 'Expired' }
      })
      return NextResponse.json({
        status: 'expired',
        message: 'Assessment has expired'
      })
    } else if (exam.examStatus === 'In Progress' || (examStartTime <= currentTime && currentTime <= expiryTime)) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { examStatus: 'In Progress' }
      })
      return NextResponse.json({
        status: 'in_progress',
        message: 'Assessment is currently in progress. You can take the test.'
      })
    } else if (exam.examStatus === 'Active') {
      return NextResponse.json({
        status: 'valid',
        message: 'Valid Assessment ID. Test not yet started.'
      })
    }

    return NextResponse.json({
      status: 'error',
      message: 'Unknown assessment status'
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
