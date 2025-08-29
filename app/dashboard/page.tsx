'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeComponent, setActiveComponent] = useState('welcome')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  const renderContent = () => {
    switch (activeComponent) {
      case 'create_assessment':
        return <CreateAssessment />
      case 'your_assessments':
        return <YourAssessments />
      case 'upload_questions':
        return <UploadQuestions />
      case 'upload_attendees':
        return <UploadAttendees />
      case 'view_performance':
        return <ViewPerformance />
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome, {session.user?.name}!</h2>
            <p className="mb-6">Select an option from the menu to proceed.</p>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">General Instructions to Create an Assessment:</h3>
              <ol className="list-decimal list-inside space-y-2 mb-6">
                <li>Go to "Create Assessment" page in dashboard and create an assessment id.</li>
                <li>After creating assessment id, go to "Upload Question Paper" page for extracting questions and saving.</li>
                <li>After saving questions. Add the photos of attendees who will be taking the examination.</li>
                <li>Finally your exam will be created successfully and you can verify your assessment details by opening "Your Assessments" page.</li>
              </ol>
              
              <h3 className="text-lg font-semibold mb-4">Questions Structure to be Followed in PDF:</h3>
              <p className="text-red-600 mb-2">⚠️ If not in the below format the questions cannot be extracted properly.</p>
              <ul className="list-disc list-inside space-y-2">
                <li>The questions should start with either Q., Question., 1., or 1) and end with . or ?</li>
                <li>For MCQ Questions ensure the question is followed by options (A., (A), A), Option A)</li>
                <li>For fill in the blank questions, use at least 3 underscores "___" anywhere in the question</li>
                <li>For MCQ and Fill in the Blank, the correct answer should be mentioned as "Answer: your_answer"</li>
              </ul>
            </div>
          </div>
        )
    }
  }

  return (
    <DashboardLayout user={session.user} onMenuClick={setActiveComponent}>
      {renderContent()}
    </DashboardLayout>
  )
}

function CreateAssessment() {
  const [formData, setFormData] = useState({
    title: '',
    exam_date: '',
    exam_time: '',
    time_limit: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Assessment created successfully! ID: ${data.assessment_id}`)
        setFormData({ title: '', exam_date: '', exam_time: '', time_limit: '' })
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Create Assessment</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="form-group">
          <label htmlFor="title">Assessment Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exam_date">Exam Date:</label>
          <input
            type="date"
            id="exam_date"
            name="exam_date"
            value={formData.exam_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="exam_time">Exam Time:</label>
          <input
            type="time"
            id="exam_time"
            name="exam_time"
            value={formData.exam_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time_limit">Time Limit (minutes):</label>
          <input
            type="number"
            id="time_limit"
            name="time_limit"
            value={formData.time_limit}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Assessment'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('successful') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}

function YourAssessments() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/your-assessments')
      const data = await response.json()
      
      if (data.status === 'success') {
        setAssessments(data.assessments)
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading assessments...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Assessments</h2>
      
      {assessments.length === 0 ? (
        <p>No assessments found.</p>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment: any) => (
            <div key={assessment.assessment_id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{assessment.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Assessment ID:</strong> {assessment.assessment_id}
                </div>
                <div>
                  <strong>Date:</strong> {assessment.date}
                </div>
                <div>
                  <strong>Time:</strong> {assessment.time}
                </div>
                <div>
                  <strong>Duration:</strong> {assessment.duration} minutes
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    assessment.status === 'Active' ? 'bg-green-100 text-green-800' :
                    assessment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    assessment.status === 'Expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {assessment.status}
                  </span>
                </div>
                <div>
                  <strong>File Status:</strong> {assessment.file_status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UploadQuestions() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Questions</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Question upload functionality will be implemented here.</p>
        <p className="text-sm text-gray-600 mt-2">This requires PDF processing and question extraction logic.</p>
      </div>
    </div>
  )
}

function UploadAttendees() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Attendee Images</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Attendee image upload functionality will be implemented here.</p>
        <p className="text-sm text-gray-600 mt-2">This requires face recognition and image processing.</p>
      </div>
    </div>
  )
}

function ViewPerformance() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">View Performance</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Performance viewing functionality will be implemented here.</p>
      </div>
    </div>
  )
}
