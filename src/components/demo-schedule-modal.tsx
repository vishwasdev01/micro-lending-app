'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SuccessNotification } from '@/components/ui/success-notification'
import { ErrorNotification } from '@/components/ui/error-notification'
import { validateInput, sanitizeString, sanitizeEmail, ValidationRule } from '@/lib/validation'
import { X, Calendar, Clock, User, Mail, Building } from 'lucide-react'

interface DemoScheduleModalProps {
  onClose: () => void
}

interface DemoBooking {
  name: string
  email: string
  company: string
  phone: string
  preferredDate: string
  preferredTime: string
  message: string
  demoType: 'overview' | 'technical' | 'custom'
}

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
]

const DEMO_TYPES = [
  { value: 'overview', label: 'Product Overview', description: 'General product walkthrough' },
  { value: 'technical', label: 'Technical Deep Dive', description: 'API and integration details' },
  { value: 'custom', label: 'Custom Demo', description: 'Tailored to your specific needs' }
]

export function DemoScheduleModal({ onClose }: DemoScheduleModalProps) {
  const [formData, setFormData] = useState<DemoBooking>({
    name: '',
    email: '',
    company: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    demoType: 'overview'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showError, setShowError] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])
    setShowError(false)

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(formData.name),
      email: sanitizeEmail(formData.email),
      company: sanitizeString(formData.company),
      phone: sanitizeString(formData.phone),
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      message: sanitizeString(formData.message),
      demoType: formData.demoType
    }

    // Validate inputs
    const validationRules: ValidationRule[] = [
      { field: 'Name', value: sanitizedData.name, rules: ['required', 'name'] },
      { field: 'Email', value: sanitizedData.email, rules: ['required', 'email'] },
      { field: 'Company', value: sanitizedData.company, rules: ['required', 'minLength'] },
      { field: 'Phone', value: sanitizedData.phone, rules: ['required', 'minLength'] },
      { field: 'Preferred Date', value: sanitizedData.preferredDate, rules: ['required', 'date', 'futureDate'] },
      { field: 'Preferred Time', value: sanitizedData.preferredTime, rules: ['required'] },
      { field: 'Message', value: sanitizedData.message, rules: ['description'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      setShowError(true)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/demo/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      })

      if (response.ok) {
        setSuccessMessage('Demo scheduled successfully! We\'ll contact you soon to confirm the details.')
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        const data = await response.json()
        setErrors([data.error || 'Failed to schedule demo'])
        setShowError(true)
      }
    } catch (error) {
      setErrors(['An error occurred. Please try again.'])
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

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="flex justify-between items-center mb-6 p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Schedule a Demo</h3>
              <p className="text-sm text-gray-600">Book a personalized demo of MicroLend</p>
            </div>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                className="input-field"
                placeholder="Enter your company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="input-field"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Preferred Date *
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                required
                min={minDate}
                className="input-field"
                value={formData.preferredDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Preferred Time *
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                required
                className="input-field"
                value={formData.preferredTime}
                onChange={handleChange}
              >
                <option value="">Select a time slot</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="demoType" className="block text-sm font-medium text-gray-700 mb-2">
              Demo Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_TYPES.map((type) => (
                <label key={type.value} className="relative">
                  <input
                    type="radio"
                    name="demoType"
                    value={type.value}
                    checked={formData.demoType === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.demoType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="input-field resize-none"
              placeholder="Tell us about your specific requirements or questions..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>

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
                  Scheduling...
                </div>
              ) : (
                'Schedule Demo'
              )}
            </Button>
          </div>
        </form>

        {/* Error Notification */}
        <ErrorNotification
          message={errors.join(', ')}
          isVisible={showError}
          onClose={() => setShowError(false)}
        />

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
