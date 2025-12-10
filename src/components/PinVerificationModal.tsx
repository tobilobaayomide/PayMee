'use client'

import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PinVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (pin: string) => void
  isVerifying?: boolean
}

export function PinVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify,
  isVerifying = false 
}: PinVerificationModalProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Reset PIN and focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']) // Reset PIN input every time modal opens
      setTimeout(() => {
        inputRefs[0].current?.focus()
      }, 100)
    }
  }, [isOpen, inputRefs])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all 4 digits are entered
    if (index === 3 && value) {
      const fullPin = newPin.join('')
      if (fullPin.length === 4) {
        onVerify(fullPin)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs[index - 1].current?.focus()
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
    const pastedData = e.clipboardData.getData('text').slice(0, 4)
    if (/^\d+$/.test(pastedData)) {
      const newPin = pastedData.split('').concat(['', '', '', '']).slice(0, 4)
      setPin(newPin)
      
      // Focus last filled input or last input
      const lastIndex = Math.min(pastedData.length, 3)
      inputRefs[lastIndex].current?.focus()

      // Auto-submit if 4 digits pasted
      if (pastedData.length === 4) {
        onVerify(pastedData)
      }
    }
  }

  const handleClose = () => {
    setPin(['', '', '', ''])
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-neutral-800">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <LockClosedIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                      >
                        Enter PIN
                      </Dialog.Title>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Enter your 4-digit PIN to confirm
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isVerifying}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* PIN Input */}
                <div className="flex justify-center gap-3 mb-6">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isVerifying}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-300 dark:border-neutral-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-neutral-800 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  ))}
                </div>

                {/* Info Text */}
                <div className="text-center">
                  {isVerifying ? (
                    <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">Processing...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Use any 4-digit PIN
                    </p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
