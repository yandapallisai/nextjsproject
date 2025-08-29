'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  onMenuClick: (page: string) => void
}

export default function DashboardLayout({ children, user, onMenuClick }: DashboardLayoutProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { id: 'create_assessment', label: '📋 Create Assessment' },
    { id: 'upload_questions', label: '📄 Upload Question Paper' },
    { id: 'upload_attendees', label: '📷 Upload Attendee Images' },
    { id: 'your_assessments', label: '📜 Your Assessments' },
    { id: 'view_performance', label: '📊 View Performance' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white"
            >
              ☰
            </button>
            <h1 className="text-xl font-bold">Online Assistive Examination</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 text-white hover:bg-white/20 px-3 py-2 rounded"
            >
              <span>👤</span>
              <span>{user?.name}</span>
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => setShowProfile(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className={`w-64 bg-gray-50 border-r ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onMenuClick(item.id)
                        setSidebarOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}
