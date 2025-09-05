'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface SuccessNotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function SuccessNotification({ 
  message, 
  isVisible, 
  onClose, 
  duration = 4000 
}: SuccessNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
          bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
