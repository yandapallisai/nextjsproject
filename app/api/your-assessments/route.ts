import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { status: 'error', message: 'User not logged in' },
        { status: 401 }
      )
    }

    const exams = await prisma.exam.findMany({
      where: { createdBy: session.user.email },
      orderBy: { createdDate: 'desc' }
    })

    const currentTime = new Date()

    const examsData = await Promise.all(
      exams.map(async (exam) => {
        const examStartTime = new Date(`${exam.date} ${exam.time}`)
        const expiryTime = exam.expiry

        // Update exam status based on current time
        let examStatus = exam.examStatus
        if (examStatus !== 'Cancelled') {
          if (currentTime > expiryTime) {
            examStatus = 'Expired'
          } else if (examStartTime <= currentTime && currentTime <= expiryTime) {
            examStatus = 'In Progress'
          }
          
          // Update in database if status changed
          if (examStatus !== exam.examStatus) {
            await prisma.exam.update({
              where: { id: exam.id },
              data: { examStatus }
            })
          }
        }

        return {
          assessment_id: exam.assessmentId,
          title: exam.title,
          date: exam.date,
          time: exam.time,
          duration: exam.duration,
          created_date: exam.createdDate.toLocaleString(),
          expiry: exam.expiry.toLocaleString(),
          file_status: exam.fileStatus,
          status: examStatus
        }
      })
    )

    return NextResponse.json({
      status: 'success',
      assessments: examsData
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
