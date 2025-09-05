'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Invoice } from '@/types'
import { CustomerInvoiceList } from '@/components/customer/invoice-list'
import { PaymentModal } from '@/components/customer/payment-modal'
import { SuccessNotification } from '@/components/ui/success-notification'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { formatCurrencyINR } from '@/lib/utils'
import { FileText, DollarSign, CreditCard } from 'lucide-react'

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'CUSTOMER') {
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

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedInvoice(null)
    setSuccessMessage(`Payment of ${formatCurrencyINR(selectedInvoice?.amount || 0)} for Invoice #${selectedInvoice?.invoiceNumber} completed successfully.`)
    setShowSuccess(true)
    fetchInvoices() // Refresh the invoice list
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const outstandingInvoices = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID')
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user.name}</p>
            </div>
            <Button
              onClick={async () => { await signOut({ callbackUrl: '/' }) }}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Invoices</dt>
                    <dd className="text-lg font-medium text-gray-900">{outstandingInvoices.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrencyINR(totalOutstanding)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Paid Invoices</dt>
                    <dd className="text-lg font-medium text-gray-900">{paidInvoices.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <CustomerInvoiceList 
          invoices={invoices} 
          onPayment={handlePayment}
          onRefresh={fetchInvoices}
        />

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <PaymentModal
            invoice={selectedInvoice}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
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
