'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validateInput, sanitizeString, sanitizeEmail, ValidationRule } from '@/lib/validation'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' as 'FINANCE_MANAGER' | 'CUSTOMER'
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(formData.name),
      email: sanitizeEmail(formData.email),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role
    }

    // Validate inputs
    const validationRules: ValidationRule[] = [
      { field: 'Name', value: sanitizedData.name, rules: ['required', 'name'] },
      { field: 'Email', value: sanitizedData.email, rules: ['required', 'email'] },
      { field: 'Password', value: sanitizedData.password, rules: ['required', 'password'] },
      { field: 'Confirm Password', value: sanitizedData.confirmPassword, rules: ['required'] }
    ]

    const validation = validateInput(validationRules)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      setLoading(false)
      return
    }

    if (sanitizedData.password !== sanitizedData.confirmPassword) {
      setErrors(['Passwords do not match'])
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedData.name,
          email: sanitizedData.email,
          password: sanitizedData.password,
          role: sanitizedData.role,
        }),
      })

      if (response.ok) {
        router.push('/auth/signin?message=Account created successfully')
      } else {
        const data = await response.json()
        setErrors([data.error || 'An error occurred'])
      }
    } catch (error) {
      setErrors(['An error occurred. Please try again.'])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ML</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MicroLend</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Join MicroLend and start managing your finances
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  className="input-field"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-800">{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
