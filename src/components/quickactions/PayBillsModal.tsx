'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useUser } from '@/components/providers/UserProvider'
import { addTransaction } from '@/lib/supabase/transactions'
import { createNotification } from '@/lib/supabase/notifications'
import { formatCurrency } from '@/lib/utils'
import { PinVerificationModal } from '@/components/PinVerificationModal'
import { TransactionSuccessModal } from '@/components/TransactionSuccessModal'
import {
  XMarkIcon,
  BanknotesIcon,
  PhoneIcon,
  TvIcon,
  BoltIcon,
  WifiIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'


export interface BillPaymentTransaction {
  user_id: string
  type: 'expense'
  amount: number
  description: string
  category: string
  date: Date
  status: 'completed'
  reference: string
  payment_method: string
  recipient_account: string
  recipient_bank: string
}

interface PayBillsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (transaction: BillPaymentTransaction) => void
}

interface BillCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  providers: string[]
  fields: {
    name: string
    label: string
    type: string
    placeholder: string
    required: boolean
    pattern?: string
    maxLength?: number
  }[]
}

const billCategories: BillCategory[] = [
  {
    id: 'airtime',
    name: 'Airtime',
    icon: PhoneIcon,
    color: 'bg-blue-600',
    providers: ['MTN', 'Glo', 'Airtel', '9mobile'],
    fields: [
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '08012345678',
        required: true,
        pattern: '^0[0-9]{10}$',
        maxLength: 11,
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '100',
        required: true,
      },
    ],
  },
  {
    id: 'data',
    name: 'Data Bundle',
    icon: WifiIcon,
    color: 'bg-purple-600',
    providers: ['MTN', 'Glo', 'Airtel', '9mobile'],
    fields: [
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '08012345678',
        required: true,
        pattern: '^0[0-9]{10}$',
        maxLength: 11,
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '1000',
        required: true,
      },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: BoltIcon,
    color: 'bg-yellow-600',
    providers: ['EKEDC', 'IKEDC', 'PHED', 'AEDC', 'KEDC', 'IBEDC'],
    fields: [
      {
        name: 'meterNumber',
        label: 'Meter Number',
        type: 'text',
        placeholder: 'Enter meter number',
        required: true,
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '5000',
        required: true,
      },
    ],
  },
  {
    id: 'cable',
    name: 'Cable TV',
    icon: TvIcon,
    color: 'bg-red-600',
    providers: ['DSTV', 'GOtv', 'Startimes', 'Showmax'],
    fields: [
      {
        name: 'smartCardNumber',
        label: 'Smart Card Number',
        type: 'text',
        placeholder: 'Enter smart card number',
        required: true,
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '3000',
        required: true,
      },
    ],
  },
  {
    id: 'internet',
    name: 'Internet',
    icon: WifiIcon,
    color: 'bg-green-600',
    providers: ['Smile', 'Spectranet', 'Swift', 'ipNX'],
    fields: [
      {
        name: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        placeholder: 'Enter account number',
        required: true,
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '2000',
        required: true,
      },
    ],
  },
  {
    id: 'betting',
    name: 'Betting',
    icon: ShieldCheckIcon,
    color: 'bg-orange-600',
    providers: ['Bet9ja', 'SportyBet', '1xBet', 'NairaBet', 'BetKing', 'MerryBet', '22Bet'],
    fields: [
      {
        name: 'userID',
        label: 'User ID / Account Number',
        type: 'text',
        placeholder: 'Enter your betting account ID',
        required: true,
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: '1000',
        required: true,
      },
    ],
  },
]

export function PayBillsModal({ isOpen, onClose, onSuccess }: PayBillsModalProps) {
  const { user } = useUser()
  const [step, setStep] = useState<'category' | 'payment'>('category')
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<BillPaymentTransaction | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({
    provider: '',
  })

  const handleCategorySelect = (category: BillCategory) => {
    setSelectedCategory(category)
    setFormData({ provider: '' })
    setStep('payment')
  }

  const handleBack = () => {
    setStep('category')
    setSelectedCategory(null)
    setFormData({ provider: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
  setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id || !selectedCategory) {
      alert('Please log in to pay bills')
      return
    }

    // Validate all required fields
    const missingFields = selectedCategory.fields
      .filter((field) => field.required && !formData[field.name])
      .map((field) => field.label)

    if (!formData.provider || missingFields.length > 0) {
      alert('Please fill in all required fields')
      return
    }

  const amount = parseFloat(formData.amount || '0')
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    // Show PIN modal
    setIsPinModalOpen(true)
  }

  const handlePinVerify = async (_pin: string) => {
    if (!user?.id || !selectedCategory) return

    const amount = parseFloat(formData.amount)

    try {
      setIsSubmitting(true)

      // Build description based on category
      let accountIdentifier = ''
  if (formData.phoneNumber) accountIdentifier = formData.phoneNumber
  else if (formData.meterNumber) accountIdentifier = formData.meterNumber
  else if (formData.smartCardNumber) accountIdentifier = formData.smartCardNumber
  else if (formData.accountNumber) accountIdentifier = formData.accountNumber
  else if (formData.userID) accountIdentifier = formData.userID

      const description = `${selectedCategory.name} - ${formData.provider} (${accountIdentifier})`

      // Create transaction
      const transaction = {
        user_id: user.id,
      type: 'expense' as const,
        amount: amount,
        description: description,
        category: 'Bills',
        date: new Date(),
      status: 'completed' as const,
        reference: `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_method: 'wallet',
        recipient_account: accountIdentifier,
        recipient_bank: formData.provider,
      }

      console.log('Attempting to add bill payment transaction:', transaction)
      const result = await addTransaction(transaction)
      console.log('Bill payment transaction added successfully:', result)

      // Create notification with transaction ID
      await createNotification(
        user.id,
        'Bill Payment Successful',
        `You paid ${formatCurrency(amount)} for ${selectedCategory.name} - ${formData.provider}`,
        'transaction',
        '/transactions',
        result.id // Pass transaction ID
      )

      console.log('Closing PIN modal and showing success modal...')

      // Batch state updates
      setIsPinModalOpen(false)
      setCompletedTransaction(result)
      setIsSuccessModalOpen(true)

      console.log('Success modal opened')
    } catch (error) {
      console.error('Error paying bill:', error)
      setIsPinModalOpen(false)

      let errorMessage = 'Unknown error'

      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error
        } else {
          errorMessage = JSON.stringify(error, null, 2)
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      alert(`❌ Failed to pay bill.\n\nError: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    const transaction = completedTransaction

    setIsSuccessModalOpen(false)
    setCompletedTransaction(null)
    setStep('category')
    setSelectedCategory(null)
    setFormData({ provider: '' })
    onClose()

    if (onSuccess && transaction) {
      onSuccess(transaction)
    }
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-neutral-800">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {step === 'payment' && (
                        <button
                          onClick={handleBack}
                          className="mr-3 p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-slate-600 dark:text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                      )}
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                        <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold text-slate-900 dark:text-white"
                        >
                          {step === 'category' ? 'Pay Bills' : selectedCategory?.name}
                        </Dialog.Title>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {step === 'category'
                            ? 'Choose a bill category'
                            : 'Enter payment details'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Category Selection */}
                  {step === 'category' && (
                    <div className="grid grid-cols-2 gap-3">
                      {billCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className="p-4 rounded-xl border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md group"
                        >
                          <div
                            className={`inline-flex p-3 rounded-lg ${category.color} mb-3 group-hover:scale-110 transition-transform`}
                          >
                            <category.icon className="h-6 w-6 text-white" />
                          </div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {category.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Payment Form */}
                  {step === 'payment' && selectedCategory && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Provider Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Select Provider <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="provider"
                          value={formData.provider || ''}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-slate-900 dark:text-white"
                        >
                          <option value="">Choose provider</option>
                          {selectedCategory.providers.map((provider) => (
                            <option key={provider} value={provider}>
                              {provider}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic Fields */}
                      {selectedCategory.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {field.label}{' '}
                            {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required={field.required}
                            pattern={field.pattern}
                            maxLength={field.maxLength}
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      ))}

                      {/* Submit Button */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-600 transition-colors font-medium text-sm"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Pay {formData.amount ? formatCurrency(parseFloat(formData.amount)) : 'Bill'}
                        </button>
                      </div>
                    </form>
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
        isVerifying={isSubmitting}
      />

      {/* Transaction Success Modal */}
      {completedTransaction && (
        <TransactionSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessClose}
          transaction={{ ...completedTransaction, date: completedTransaction.date instanceof Date ? completedTransaction.date.toISOString() : completedTransaction.date }}
        />
      )}
    </>
  )
}
