'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Shield, Zap, BarChart3, Users, CreditCard, Clock } from 'lucide-react'
import { DemoScheduleModal } from '@/components/demo-schedule-modal'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showDemoModal, setShowDemoModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session) {
      // Redirect based on user role
      if (session.user.role === 'FINANCE_MANAGER') {
        router.push('/dashboard/finance-manager')
      } else if (session.user.role === 'CUSTOMER') {
        router.push('/dashboard/customer')
      }
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ML</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  MicroLend
                </span>
                <p className="text-xs text-gray-500 -mt-1">Accounts Receivable</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Effortless Invoicing. Smarter Tracking.
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Accounts Receivable
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your micro-lending operations with our comprehensive platform. 
              <span className="font-semibold text-gray-800"> Manage invoices, track payments, and accelerate growth</span> with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/signin"
                className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold text-lg px-10 py-4 rounded-xl transition-all duration-300 hover:bg-blue-50 inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 mb-20">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>99.9% uptime</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span>10,000+ businesses</span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Invoice Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create, customize, and track invoices with our intuitive drag-and-drop interface.
                </p>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Real-time payment monitoring with automated reminders and status updates.
                </p>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics & Reports</h3>
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive insights and customizable reports for data-driven decisions.
                </p>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Portal</h3>
                <p className="text-gray-600 leading-relaxed">
                  Self-service portal for customers to view invoices and make payments.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using MicroLend to streamline their accounts receivable process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button 
                  onClick={() => setShowDemoModal(true)}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold text-lg px-10 py-4 rounded-xl transition-all duration-300"
                >
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ML</span>
              </div>
              <div>
                <span className="text-2xl font-bold">MicroLend</span>
                <p className="text-sm text-gray-400 -mt-1">Accounts Receivable</p>
              </div>
            </div>
            <p className="text-gray-400 text-center md:text-right max-w-md">
              The most comprehensive platform for managing your micro-lending accounts receivable operations.
            </p>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400">
            <p>&copy; 2024 MicroLend. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Schedule Modal */}
      {showDemoModal && (
        <DemoScheduleModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  )
}