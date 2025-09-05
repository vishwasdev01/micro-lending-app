'use client'

import { useState } from 'react'
import { Invoice } from '@/types'
import { Button } from '@/components/ui/button'
import { StripePayment } from '@/components/stripe-payment'
import { X, CreditCard, Shield } from 'lucide-react'

interface PaymentModalProps {
  invoice: Invoice
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const [showStripe, setShowStripe] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStripeSuccess = () => {
    onSuccess()
  }

  const handleDemoPayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice._id,
          amount: invoice.amount,
          paymentMethod: 'demo'
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="flex justify-between items-center mb-6 p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Make Payment</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-lg p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Invoice #</span>
              <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Amount Due</span>
              <span className="text-lg font-bold text-gray-900">₹{invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Due Date</span>
              <span className="text-sm text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          {!showStripe ? (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Choose Payment Method</h4>
                <p className="text-gray-600 mb-6">Select your preferred payment method to proceed</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowStripe(true)}
                  disabled={invoice.amount < 0.5}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Stripe Payment
                        {invoice.amount < 0.5 && ' (Not available)'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.amount < 0.5 
                          ? 'Minimum $0.50 required for Stripe' 
                          : 'Cards, Apple Pay, Google Pay'
                        }
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleDemoPayment}
                  disabled={isProcessing}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {isProcessing ? 'Processing...' : 'Demo Payment'}
                      </div>
                      <div className="text-sm text-gray-600">For testing purposes only</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Secure Payment</h4>
                    <p className="text-xs text-blue-700">
                      All payments are processed securely. Your financial information is encrypted and protected.
                      {invoice.amount < 0.5 && (
                        <><br /><br />
                        <strong>Note:</strong> For amounts under $0.50, please use the Demo Payment option as Stripe requires a minimum of $0.50.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <StripePayment
              invoiceId={invoice._id}
              amount={invoice.amount}
              invoiceNumber={invoice.invoiceNumber}
              onSuccess={handleStripeSuccess}
              onCancel={() => setShowStripe(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
