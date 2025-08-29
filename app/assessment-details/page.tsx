'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AssessmentDetails() {
  const [assessmentId, setAssessmentId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/verify-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assessmentId }),
      })

      const data = await response.json()

      if (data.status === 'in_progress') {
        setMessage(data.message)
        // Redirect to face verification
        setTimeout(() => {
          router.push(`/face-verification?assessmentId=${assessmentId}`)
        }, 2000)
      } else if (data.status === 'valid') {
        setMessage(data.message)
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header">
        <div className="container flex justify-between items-center">
          <Link href="/">Online Assistive Examination</Link>
          <Link href="/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Assessment Details</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="assessmentId">Assessment ID:</label>
                <input
                  type="text"
                  id="assessmentId"
                  value={assessmentId}
                  onChange={(e) => setAssessmentId(e.target.value)}
                  required
                  placeholder="Enter your assessment ID"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Assessment'}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded ${
                message.includes('progress') || message.includes('valid')
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          &copy; 2025 Online Assistive Examination. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
