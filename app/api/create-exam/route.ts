import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'User not logged in!' },
        { status: 401 }
      )
    }

    const { title, exam_date, exam_time, time_limit } = await request.json()

    if (!title || !exam_date || !exam_time || !time_limit) {
      return NextResponse.json(
        { success: false, message: 'All fields are required!' },
        { status: 400 }
      )
    }

    const assessmentId = uuidv4().substring(0, 10)
    const examDateTime = new Date(`${exam_date} ${exam_time}`)
    const currentDateTime = new Date()

    if (examDateTime < currentDateTime) {
      return NextResponse.json(
        { status: 'error', message: 'You cannot create an assessment in the past!' },
        { status: 400 }
      )
    }

    const expiryTime = new Date(examDateTime.getTime() + parseInt(time_limit) * 60000)

    const newExam = await prisma.exam.create({
      data: {
        assessmentId,
        title,
        date: exam_date,
        time: exam_time,
        duration: parseInt(time_limit),
        expiry: expiryTime,
        createdBy: session.user.email,
        fileStatus: 'Not uploaded',
        examStatus: 'Active'
      }
    })

    return NextResponse.json({
      success: true,
      assessment_id: assessmentId,
      expiry: expiryTime.toLocaleString(),
      message: 'Exam created successfully!'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
