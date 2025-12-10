'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CreditCardIcon, BanknotesIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { PinVerificationModal } from '@/components/PinVerificationModal'
import { TransactionSuccessModal } from '@/components/TransactionSuccessModal'
import { addTransaction } from '@/lib/supabase/transactions'
import { createNotification } from '@/lib/supabase/notifications'
import { useUser } from '@/components/providers/UserProvider'
import { formatCurrency } from '@/lib/utils'

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (transaction: TopUpTransaction) => void
}

export interface TopUpTransaction {
  amount: number
  recipient_bank: string
  recipient_account: string
  reference: string
  description?: string
  date: string
}

type FundingMethod = 'card' | 'bank' | 'cash'

const fundingMethods = [
  {
    id: 'card' as FundingMethod,
    name: 'Debit/Credit Card',
    icon: CreditCardIcon,
    description: 'Instant top-up',
  },
  {
    id: 'bank' as FundingMethod,
    name: 'Bank Transfer',
    icon: BuildingLibraryIcon,
    description: 'Transfer from your bank',
  },
  {
    id: 'cash' as FundingMethod,
    name: 'Cash Deposit',
    icon: BanknotesIcon,
    description: 'At authorized agents',
  },
]

export function TopUpModal({ isOpen, onClose, onSuccess }: TopUpModalProps) {
  const { user } = useUser()
  const [step, setStep] = useState<'amount' | 'method' | 'pin' | 'success'>('amount')
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<FundingMethod>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completedTransaction, setCompletedTransaction] = useState<TopUpTransaction | null>(null)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const handleClose = () => {
    setStep('amount')
    setAmount('')
    setSelectedMethod('card')
    setError('')
    setLoading(false)
    setCompletedTransaction(null)
    onClose()
  }

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (numAmount < 100) {
      setError('Minimum top-up amount is ₦100')
      return
    }

    if (numAmount > 1000000) {
      setError('Maximum top-up amount is ₦1,000,000')
      return
    }

    setStep('method')
  }

  const handleMethodSelect = (method: FundingMethod) => {
    setSelectedMethod(method)
  }

  const handleMethodContinue = () => {
    setIsPinModalOpen(true)
  }

  const handlePinVerify = async (pin: string) => {
    if (!user?.id) return

    setLoading(true)
    setError('')

    try {
      // Create transaction
      const transaction = {
        user_id: user.id,
        amount: parseFloat(amount),
        type: 'income' as 'income',
        category: 'Top Up',
        description: `Top up via ${fundingMethods.find(m => m.id === selectedMethod)?.name || selectedMethod}`,
        date: new Date(),
        status: 'completed' as 'completed',
        reference: `TOP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_method: selectedMethod,
      }

      console.log('Attempting to add top-up transaction:', transaction)
      const result = await addTransaction(transaction)
      console.log('Top-up transaction added successfully:', result)

      // Create notification with transaction ID
      await createNotification(
        user.id,
        'Top Up Successful',
        `Your account has been credited with ${formatCurrency(parseFloat(amount))}`,
        'transaction',
        '/transactions',
        result.id // Pass transaction ID
      )

      console.log('Closing PIN modal and showing success modal...')
      
      // Batch all state updates together and delay closing PIN modal
      setCompletedTransaction(result)
      setIsPinModalOpen(false)
      
      // Wait a tick before opening success modal to ensure PIN modal closes first
      setTimeout(() => {
        setIsSuccessModalOpen(true)
        
        // Notify parent to refresh stats
        if (onSuccess) {
          onSuccess(result)
        }
      }, 100)
      
    } catch (err: unknown) {
      console.error('Top up error:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to complete top-up. Please try again.')
      } else {
        setError('Failed to complete top-up. Please try again.')
      }
      setIsPinModalOpen(false)
      setStep('method')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false)
    handleClose()
  }

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000]

  return (
    <>
      <Transition appear show={isOpen && !isPinModalOpen && !isSuccessModalOpen} as={Fragment}>
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
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold text-slate-900 dark:text-white"
                    >
                      {step === 'amount' ? 'Top Up Account' : 'Select Payment Method'}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {step === 'amount' && (
                    <form onSubmit={handleAmountSubmit} className="space-y-6">
                      {/* Quick Amount Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          Quick Select
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {quickAmounts.map((quickAmount) => (
                            <button
                              key={quickAmount}
                              type="button"
                              onClick={() => setAmount(quickAmount.toString())}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                amount === quickAmount.toString()
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                  : 'border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600'
                              }`}
                            >
                              ₦{quickAmount.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Or Enter Custom Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">
                            ₦
                          </span>
                          <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                            placeholder="0.00"
                            step="0.01"
                            min="100"
                            max="1000000"
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Min: ₦100 | Max: ₦1,000,000
                        </p>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </form>
                  )}

                  {step === 'method' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        {fundingMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handleMethodSelect(method.id)}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                              selectedMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  selectedMethod === method.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <method.icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4
                                  className={`font-medium ${
                                    selectedMethod === method.id
                                      ? 'text-blue-900 dark:text-blue-100'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {method.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                  {method.description}
                                </p>
                              </div>
                              {selectedMethod === method.id && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Top-up Amount</span>
                          <span className="text-lg font-semibold text-slate-900 dark:text-white">
                            ₦{parseFloat(amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Processing Fee</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Free</span>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setStep('amount')}
                          className="flex-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleMethodContinue}
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Confirm & Pay
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* PIN Verification Modal */}
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handlePinVerify}
        isVerifying={loading}
      />

      {/* Success Modal */}
      {completedTransaction && (
        <TransactionSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessClose}
          transaction={completedTransaction}
        />
      )}
    </>
  )
}
