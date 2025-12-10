'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface TransactionPinVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (pin: string) => Promise<boolean>
  title?: string
  description?: string
}

export function TransactionPinVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify,
  title = "Verify Transaction PIN",
  description = "Enter your 4-digit transaction PIN to continue"
}: TransactionPinVerificationModalProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset PIN when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', ''])
      setError('')
      setIsVerifying(false)
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePinChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1)
    
    const newPin = [...pin]
    newPin[index] = digit
    setPin(newPin)
    setError('')

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 4 digits are entered
    if (digit && index === 3 && newPin.every(d => d !== '')) {
      handleVerify(newPin.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newPin = [...pin]
        newPin[index] = ''
        setPin(newPin)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    
    if (pastedData.length === 4) {
      const newPin = pastedData.split('')
      setPin(newPin)
      setError('')
      inputRefs.current[3]?.focus()
      // Auto-submit
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (pinValue: string) => {
    if (pinValue.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    try {
      setIsVerifying(true)
      setError('')
      
      const isValid = await onVerify(pinValue)
      
      if (isValid) {
        // Success - modal will close from parent
        setPin(['', '', '', ''])
      } else {
        setError('Incorrect PIN. Please try again.')
        setPin(['', '', '', ''])
        setIsVerifying(false)
        inputRefs.current[0]?.focus()
      }
    } catch (error: unknown) {
      console.error('Error verifying transaction PIN:', error)
      if (typeof error === 'object' && error && 'message' in error) {
        setError((error as { message?: string }).message || 'Failed to verify PIN. Please try again.')
      } else {
        setError('Failed to verify PIN. Please try again.')
      }
      setPin(['', '', '', ''])
      setIsVerifying(false)
      inputRefs.current[0]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pinValue = pin.join('')
    handleVerify(pinValue)
  }

  const handleClose = () => {
    if (isVerifying) return
    setPin(['', '', '', ''])
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          disabled={isVerifying}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XMarkIcon className="h-5 w-5 text-slate-500" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3 text-center">
              Enter Your Transaction PIN
            </label>
            <div className="flex justify-center gap-3">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  className="w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold border-2 border-slate-300 dark:border-neutral-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              ))}
            </div>
          </div>

          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Verifying PIN...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || pin.some(d => d === '')}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {isVerifying ? 'Verifying...' : 'Verify PIN'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleClose}
              disabled={isVerifying}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 p-3 bg-slate-50 dark:bg-neutral-700/50 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            🔒 Your transaction PIN keeps your money safe. Never share it with anyone.
          </p>
        </div>
      </div>
    </div>
  )
}
