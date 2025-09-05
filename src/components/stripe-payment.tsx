'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle } from 'lucide-react'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface StripePaymentProps {
  invoiceId: string
  amount: number
  invoiceNumber: string
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({ invoiceId, amount, invoiceNumber, onSuccess, onCancel }: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?invoice=${invoiceId}`,
        },
      })

      if (error) {
        console.error('Payment failed:', error)
        alert('Payment failed. Please try again.')
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      console.error('Payment error:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your payment has been processed successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Invoice #{invoiceNumber}</h3>
            <p className="text-sm text-gray-600">Amount to pay</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}`
          )}
        </Button>
      </div>
    </form>
  )
}

export function StripePayment({ invoiceId, amount, invoiceNumber, onSuccess, onCancel }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Check if amount is too small for Stripe
        if (amount < 0.5) {
          setError(`Amount too small for Stripe payment. Minimum amount is $0.50. Current amount: $${amount.toFixed(2)}`)
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoiceId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Error creating payment intent:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [invoiceId, amount])

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onCancel} variant="outline">
          Close
        </Button>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Unable to initialize payment</p>
        <Button onClick={onCancel} variant="outline">
          Close
        </Button>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Stripe is not configured. Please add your Stripe keys to environment variables.</p>
        <Button onClick={onCancel} variant="outline">
          Close
        </Button>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm
        invoiceId={invoiceId}
        amount={amount}
        invoiceNumber={invoiceNumber}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
}
