'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="header">
        <div className="container flex justify-between items-center">
          <Link href="/">Online Assistive Examination</Link>
          <Link href="/signup" className="btn btn-secondary">
            Signup
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Online Assistive Examination</h1>
          <p className="text-xl mb-8">Your voice-powered online examination system</p>
          <div className="space-x-4">
            <Link href="/assessment-details" className="btn btn-primary">
              Take Assessment
            </Link>
            <Link href="/login" className="btn btn-primary">
              Give Assessment
            </Link>
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
