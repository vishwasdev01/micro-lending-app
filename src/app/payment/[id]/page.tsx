'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Invoice } from '@/types'
import { PaymentModal } from '@/components/customer/payment-modal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, DollarSign, Calendar, User } from 'lucide-react'
import Link from 'next/link'

export default function PaymentPage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
    }
  }, [params.id])

  const fetchInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        setError('Invoice not found')
      }
    } catch (error) {
      setError('Error loading invoice')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false)
    // Refresh invoice to reflect PAID status
    if (params.id) {
      await fetchInvoice(params.id as string)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The requested invoice could not be found.'}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Payment</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Invoice Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
                <p className="text-sm text-gray-600">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.amount)}</div>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Invoice Details</h3>
                <dl className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-3" />
                    <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                    <dd className="ml-auto text-sm text-gray-900">{invoice.invoiceNumber}</dd>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="ml-auto text-sm text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.amount)}</dd>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                    <dd className="ml-auto text-sm text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Customer Information</h3>
                <dl className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <dt className="text-sm font-medium text-gray-500">Customer</dt>
                    <dd className="ml-auto text-sm text-gray-900">{(invoice as any).customerId?.name}</dd>
                  </div>
                  <div className="flex items-center">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="ml-auto text-sm text-gray-900">{(invoice as any).customerId?.email}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {invoice.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-gray-900">{invoice.description}</p>
              </div>
            )}
          </div>

          {/* Payment Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {invoice.status === 'PAID' 
                    ? 'This invoice has been paid.' 
                    : 'Click the button below to make a payment for this invoice.'
                  }
                </p>
              </div>
              <div>
                {invoice.status === 'PAID' ? (
                  <Button disabled className="bg-green-600 text-white">
                    Already Paid
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <PaymentModal
            invoice={invoice}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  )
}
