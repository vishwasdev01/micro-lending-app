'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Invoice } from '@/types'
import { InvoiceList } from '@/components/finance-manager/invoice-list'
import { CreateInvoiceModal } from '@/components/finance-manager/create-invoice-modal'
import { DemoList } from '@/components/finance-manager/demo-list'
import { SuccessNotification } from '@/components/ui/success-notification'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, DollarSign } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatCurrencyINR } from '@/lib/utils'

export default function FinanceManagerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'FINANCE_MANAGER') {
      router.push('/auth/signin')
      return
    }

    fetchInvoices()
  }, [session, status, router])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices])
    setShowCreateModal(false)
    setSuccessMessage(`Invoice #${newInvoice.invoiceNumber} was created successfully`)
    setShowSuccess(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalInvoices = invoices.length
  const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING').length
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ML</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance Manager</h1>
                <p className="text-gray-600">Welcome back, {session?.user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
              <Button
                onClick={async () => { await signOut({ callbackUrl: '/' }) }}
                variant="outline"
                className="btn-secondary"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                  <dd className="text-2xl font-bold text-gray-900">{totalInvoices}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card card-hover p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-2xl font-bold text-gray-900">{pendingInvoices}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card card-hover p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                  <dd className="text-2xl font-bold text-gray-900">{paidInvoices}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card card-hover p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                  <dd className="text-2xl font-bold text-gray-900">{formatCurrencyINR(totalAmount)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <InvoiceList invoices={invoices} onRefresh={fetchInvoices} />

        {/* Demo Management */}
        <div className="mt-8">
          <DemoList onRefresh={fetchInvoices} />
        </div>

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <CreateInvoiceModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateInvoice}
          />
        )}

        {/* Success Notification */}
        <SuccessNotification
          message={successMessage}
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      </div>
    </div>
  )
}
