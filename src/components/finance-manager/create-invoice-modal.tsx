'use client'

import { useState, useEffect } from 'react'
import { Invoice } from '@/types'
import { Button } from '@/components/ui/button'
import { ErrorNotification } from '@/components/ui/error-notification'
import { validateInput, sanitizeString, sanitizeNumber, ValidationRule } from '@/lib/validation'
import { X, User } from 'lucide-react'

interface CreateInvoiceModalProps {
  onClose: () => void
  onSuccess: (invoice: Invoice) => void
}

interface Customer {
  _id: string
  name: string
  email: string
}

export function CreateInvoiceModal({ onClose, onSuccess }: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    dueDate: '',
    description: ''
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowError(false)

    // Sanitize inputs
    const sanitizedData = {
      customerId: formData.customerId.trim(),
      amount: sanitizeNumber(formData.amount),
      dueDate: formData.dueDate,
      description: sanitizeString(formData.description)
    }

    // Validate inputs
    const validationRules: ValidationRule[] = [
      { field: 'Customer', value: sanitizedData.customerId, rules: ['required'] },
      { field: 'Amount', value: sanitizedData.amount, rules: ['required', 'amount'] },
      { field: 'Due Date', value: sanitizedData.dueDate, rules: ['required', 'date', 'futureDate'] },
      { field: 'Description', value: sanitizedData.description, rules: ['description'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      setError(validation.errors[0])
      setShowError(true)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: sanitizedData.customerId,
          amount: sanitizedData.amount,
          dueDate: sanitizedData.dueDate,
          description: sanitizedData.description,
        }),
      })

      if (response.ok) {
        const newInvoice = await response.json()
        onSuccess(newInvoice)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create invoice')
        setShowError(true)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      setShowError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6 p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Create New Invoice</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-lg p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                id="customerId"
                name="customerId"
                required
                className="input-field"
                value={formData.customerId}
                onChange={handleChange}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  min="0"
                  required
                  className="input-field"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  required
                  className="input-field"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input-field resize-none"
                placeholder="Enter invoice description..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </form>

        {/* Error Notification */}
        <ErrorNotification
          message={error}
          isVisible={showError}
          onClose={() => setShowError(false)}
        />
      </div>
    </div>
  )
}
