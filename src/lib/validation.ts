// Input validation utilities with security best practices

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  field: string
  value: any
  rules: string[]
  customMessage?: string
}

// Sanitization functions
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return ''
  return input.trim().replace(/[<>]/g, '') // Basic XSS prevention
}

export const sanitizeEmail = (email: string): string => {
  return sanitizeString(email).toLowerCase()
}

export const sanitizeNumber = (input: any): number => {
  const num = parseFloat(input)
  return isNaN(num) ? 0 : Math.max(0, num) // Ensure non-negative
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/
  return nameRegex.test(name.trim())
}

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999.99 && Number.isFinite(amount)
}

export const validateInvoiceNumber = (invoiceNumber: string): boolean => {
  const invoiceRegex = /^[A-Z0-9-]{3,20}$/
  return invoiceRegex.test(invoiceNumber)
}

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj.getTime()) && dateObj > new Date('1900-01-01')
}

export const validateDescription = (description: string): boolean => {
  return description.length <= 500 && !/<script|javascript:|on\w+=/i.test(description)
}

// Comprehensive validation function
export const validateInput = (rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = []

  for (const rule of rules) {
    const { field, value, rules: ruleList, customMessage } = rule

    for (const ruleType of ruleList) {
      let isValid = true
      let errorMessage = customMessage || `${field} is invalid`

      switch (ruleType) {
        case 'required':
          if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            isValid = false
            errorMessage = `${field} is required`
          }
          break

        case 'email':
          if (value && !validateEmail(value)) {
            isValid = false
            errorMessage = 'Please enter a valid email address'
          }
          break

        case 'password':
          if (value && !validatePassword(value)) {
            isValid = false
            errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and number'
          }
          break

        case 'name':
          if (value && !validateName(value)) {
            isValid = false
            errorMessage = 'Name must be 2-50 characters and contain only letters and spaces'
          }
          break

        case 'amount':
          if (value && !validateAmount(parseFloat(value))) {
            isValid = false
            errorMessage = 'Amount must be between ₹0.01 and ₹999,999.99'
          }
          break

        case 'date':
          if (value && !validateDate(value)) {
            isValid = false
            errorMessage = 'Please enter a valid date'
          }
          break

        case 'description':
          if (value && !validateDescription(value)) {
            isValid = false
            errorMessage = 'Description must be less than 500 characters and contain no scripts'
          }
          break

        case 'minLength':
          const minLength = rule.customMessage ? parseInt(rule.customMessage) : 3
          if (value && value.length < minLength) {
            isValid = false
            errorMessage = `${field} must be at least ${minLength} characters`
          }
          break

        case 'maxLength':
          const maxLength = rule.customMessage ? parseInt(rule.customMessage) : 100
          if (value && value.length > maxLength) {
            isValid = false
            errorMessage = `${field} must be less than ${maxLength} characters`
          }
          break

        case 'positive':
          if (value && parseFloat(value) <= 0) {
            isValid = false
            errorMessage = `${field} must be greater than 0`
          }
          break

        case 'futureDate':
          if (value && new Date(value) <= new Date()) {
            isValid = false
            errorMessage = `${field} must be a future date`
          }
          break
      }

      if (!isValid) {
        errors.push(errorMessage)
        break // Stop at first error for this field
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>()
  
  return (key: string): boolean => {
    const now = Date.now()
    const userAttempts = attempts.get(key)
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false
    }
    
    userAttempts.count++
    return true
  }
}

// CSRF token validation
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length > 0
}
