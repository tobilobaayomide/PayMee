'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useUser } from '@/components/providers/UserProvider'
import { addTransaction } from '@/lib/supabase/transactions'
import { createNotification } from '@/lib/supabase/notifications'
import { formatCurrency } from '@/lib/utils'
import { PinVerificationModal } from '@/components/PinVerificationModal'
import { TransactionSuccessModal } from '@/components/TransactionSuccessModal'
import {
  XMarkIcon,
  UserIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline'

interface SendMoneyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (transaction: SendMoneyTransaction) => void
}

export interface SendMoneyTransaction {
  amount: number
  recipient_bank: string
  recipient_account: string
  reference: string
  description?: string
  date: string
}

export function SendMoneyModal({ isOpen, onClose, onSuccess }: SendMoneyModalProps) {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<SendMoneyTransaction | null>(null)
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankName: '',
    amount: '',
    description: '',
    paymentMethod: 'bank_transfer',
  })

  // Debug state changes
  useEffect(() => {
    console.log('State updated:', {
      isSuccessModalOpen,
      completedTransaction,
      isPinModalOpen,
      isSubmitting
    })
  }, [isSuccessModalOpen, completedTransaction, isPinModalOpen, isSubmitting])

  const nigerianBanks = [
    'Access Bank',
    'Citibank Nigeria',
    'Ecobank Nigeria',
    'Fidelity Bank',
    'First Bank of Nigeria',
    'First City Monument Bank (FCMB)',
    'Globus Bank',
    'Guaranty Trust Bank (GTBank)',
    'Heritage Bank',
    'Jaiz Bank',
    'Keystone Bank',
    'Kuda Bank',
    'Moniepoint',
    'Opay',
    'PalmPay',
    'Parallex Bank',
    'Polaris Bank',
    'Providus Bank',
    'Stanbic IBTC Bank',
    'Standard Chartered Bank',
    'Sterling Bank',
    'SunTrust Bank',
    'Union Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Unity Bank',
    'Wema Bank',
    'Zenith Bank',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      alert('Please log in to send money')
      return
    }

    // Validate form
    if (!formData.accountNumber || !formData.bankName || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    // Validate account number (should be 10 digits for Nigerian banks)
    if (!/^\d{10}$/.test(formData.accountNumber)) {
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      return
    }

    // Show PIN modal instead of directly processing
    setIsPinModalOpen(true)
  }

  const handlePinVerify = async (pin: string) => {
    // In a real app, you would verify the PIN with your backend
    // For now, we'll accept any 4-digit PIN
    
    if (!user?.id) return

    const amount = parseFloat(formData.amount)

    try {
      setIsSubmitting(true)

      // Create transaction
      const transactionDescription = formData.description 
        ? `Transfer to ${formData.bankName} (${formData.accountNumber}): ${formData.description}`
        : `Transfer to ${formData.bankName} (${formData.accountNumber})`
      
      const transaction = {
        user_id: user.id,
        type: 'expense' as 'expense',
        amount: amount,
        description: transactionDescription,
        category: 'Transfer',
        date: new Date(),
        status: 'completed' as 'completed',
        reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_method: formData.paymentMethod,
        recipient_account: formData.accountNumber,
        recipient_bank: formData.bankName,
      }

      console.log('Attempting to add transaction:', transaction)
      const result = await addTransaction(transaction)
      console.log('Transaction added successfully:', result)

      // Create notification with transaction ID
      await createNotification(
        user.id,
        'Money Sent',
        `You sent ${formatCurrency(amount)} to ${formData.bankName} account ${formData.accountNumber}`,
        'transaction',
        '/transactions',
        result.id // Pass transaction ID
      )

      console.log('Closing PIN modal and showing success modal...')

      // Batch state updates together
      setIsPinModalOpen(false)
      setCompletedTransaction(result)
      setIsSuccessModalOpen(true)
      
      console.log('Completed transaction set:', result)
      console.log('Success modal opened')

      // DON'T call onSuccess here - it causes re-render that resets state
      // We'll call it when the success modal closes
    } catch (error) {
      console.error('Error sending money:', error)
      // Close PIN modal on error
      setIsPinModalOpen(false)
      
      // Show detailed error message - handle Supabase error structure
      let errorMessage = 'Unknown error'
      
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error
        } else if ('error_description' in error && typeof error.error_description === 'string') {
          errorMessage = error.error_description
        } else {
          errorMessage = JSON.stringify(error, null, 2)
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`❌ Failed to send money.\n\nError: ${errorMessage}\n\nPlease check:\n1. Run supabase_transactions_table.sql in Supabase SQL Editor\n2. Ensure you're logged in\n3. Check browser console for more details`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ArrowUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                      >
                        Send Money
                      </Dialog.Title>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Transfer funds to anyone
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Account Number 
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="Enter 10-digit account number"
                        required
                        maxLength={10}
                        pattern="\d{10}"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Must be exactly 10 digits
                    </p>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Select Bank 
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCardIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="">Choose a bank</option>
                        {nigerianBanks.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Amount (₦) 
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BanknotesIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                    {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatCurrency(parseFloat(formData.amount))}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <DocumentTextIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What's this payment for?"
                        rows={3}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Payment Method
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCardIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-slate-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="wallet">Wallet Balance</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Money
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
        onClose={() => {
          const transaction = completedTransaction
          
          setIsSuccessModalOpen(false)
          setCompletedTransaction(null)
          
          // Reset form
          setFormData({
            accountNumber: '',
            bankName: '',
            amount: '',
            description: '',
            paymentMethod: 'bank_transfer',
          })
          
          // Close send money modal
          onClose()
          
          // Call success callback NOW (after modal closes)
          if (onSuccess && transaction) {
            onSuccess(transaction)
          }
        }}
        transaction={completedTransaction}
      />
    )}
    </>
  )
}
