'use client'

import { useState } from 'react'
import { XMarkIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface SetTransactionPinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pin: string) => Promise<void>
  canClose?: boolean // Whether user can close without setting PIN
}

export function SetTransactionPinModal({ isOpen, onClose, onSuccess, canClose = false }: SetTransactionPinModalProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (pin.length !== 4) {
      setError('Transaction PIN must be exactly 4 digits')
      return
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers')
      return
    }

    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    // Check for weak PINs
    const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321']
    if (weakPins.includes(pin)) {
      setError('This PIN is too common. Please choose a more secure PIN.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSuccess(pin)
      
      // Show success
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setPin('')
        setConfirmPin('')
        setIsSubmitting(false)
        onClose()
      }, 2000)
    } catch (error: unknown) {
      console.error('Error setting transaction PIN:', error)
      if (typeof error === 'object' && error && 'message' in error) {
        setError((error as { message?: string }).message || 'Failed to set transaction PIN. Please try again.')
      } else {
        setError('Failed to set transaction PIN. Please try again.')
      }
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting || !canClose) return
    setPin('')
    setConfirmPin('')
    setError('')
    onClose()
  }

  const handlePinInput = (value: string, setter: (val: string) => void) => {
    // Only allow digits and limit to 4 characters
    const filtered = value.replace(/\D/g, '').slice(0, 4)
    setter(filtered)
  }

  // Success view
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Transaction PIN Set Successfully!
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Your 4-digit transaction PIN has been created. You&apos;ll need to enter this PIN to authorize all transactions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        {canClose && (
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="h-5 w-5 text-slate-500" />
          </button>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set Transaction PIN</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Secure your account</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
            🔒 Why do I need a Transaction PIN?
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Your 4-digit transaction PIN adds an extra layer of security to all your transactions. You&apos;ll need to enter this PIN whenever you send money, pay bills, or make withdrawals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Create 4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value, setPin)}
              disabled={isSubmitting}
              placeholder="••••"
              maxLength={4}
              autoFocus
              className="w-full px-4 py-4 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed text-center text-3xl tracking-[1rem] font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              disabled={isSubmitting}
              placeholder="••••"
              maxLength={4}
              className="w-full px-4 py-4 border border-slate-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed text-center text-3xl tracking-[1rem] font-bold"
              required
            />
          </div>

          <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
             <span className="font-medium">Security Tips:</span>
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>✓ Don&apos;t use obvious numbers (1234, 0000, etc.)</li>
              <li>✓ Don&apos;t use your birthday or phone number</li>
              <li>✓ Never share your PIN with anyone</li>
              <li>✓ Change your PIN regularly</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            {canClose && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-neutral-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for now
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !pin || !confirmPin || pin.length !== 4}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting PIN...
                </span>
              ) : (
                'Set Transaction PIN'
              )}
            </button>
          </div>
        </form>

        {!canClose && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
              ⚠️ You must set a transaction PIN to continue using PayMee
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
