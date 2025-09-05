'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft, Home } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent')
    const invoiceId = searchParams.get('invoice')
    
    if (paymentIntentId && invoiceId) {
      // Verify payment with backend and update invoice status
      const verifyPayment = async () => {
        try {
          const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invoiceId: invoiceId,
              amount: 0, // Will be fetched from invoice
              paymentMethod: 'stripe',
              transactionId: paymentIntentId
            }),
          })

          if (response.ok) {
            console.log('Payment verified and recorded')
          }
        } catch (error) {
          console.error('Error verifying payment:', error)
        }
      }

      verifyPayment()
      
      setPaymentIntent({ 
        id: paymentIntentId,
        invoiceId: invoiceId 
      })
    }
    
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>

          {paymentIntent && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Payment Intent ID</p>
              <p className="font-mono text-sm text-gray-900">{paymentIntent.id}</p>
              {paymentIntent.invoiceId && (
                <>
                  <p className="text-sm text-gray-600 mb-1 mt-2">Invoice ID</p>
                  <p className="font-mono text-sm text-gray-900">{paymentIntent.invoiceId}</p>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Link href="/dashboard/customer" className="block">
              <Button className="btn-primary w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="btn-secondary w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
