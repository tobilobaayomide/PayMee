'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, BanknotesIcon, ChartBarIcon, CalendarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { PinVerificationModal } from '@/components/PinVerificationModal'
import { TransactionSuccessModal } from '@/components/TransactionSuccessModal'
import { addTransaction } from '@/lib/supabase/transactions'
import { createNotification } from '@/lib/supabase/notifications'
import { useUser } from '@/components/providers/UserProvider'
import { formatCurrency } from '@/lib/utils'

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (transaction: InvestmentTransaction) => void
}

export interface InvestmentTransaction {
  amount: number
  recipient_bank: string
  recipient_account: string
  reference: string
  description?: string
  date: string
}

type InvestmentType = 'fixed' | 'target'

interface InvestmentPlan {
  id: string
  type: InvestmentType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  minAmount: number
  interestRate: number
  durations?: number[] // For fixed savings (in days)
  hasGoal?: boolean // For target savings
}

const investmentPlans: InvestmentPlan[] = [
  {
    id: 'fixed_savings',
    type: 'fixed',
    name: 'Fixed Savings',
    description: 'Lock your funds and earn guaranteed returns',
    icon: BanknotesIcon,
    minAmount: 5000,
    interestRate: 12, // 12% per annum
    durations: [30, 90, 180, 365],
  },
  {
    id: 'target_savings',
    type: 'target',
    name: 'Target Savings',
    description: 'Save towards a specific goal with flexible deposits',
    icon: TrophyIcon,
    minAmount: 1000,
    interestRate: 8, // 8% per annum
    hasGoal: true,
  },
]

export function InvestmentModal({ isOpen, onClose, onSuccess }: InvestmentModalProps) {
  const { user } = useUser()
  const [step, setStep] = useState<'select' | 'details' | 'pin' | 'success'>('select')
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState<number>(90) // Default 90 days for fixed
  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<InvestmentTransaction | null>(null)

  const handleClose = () => {
    setStep('select')
    setSelectedPlan(null)
    setAmount('')
    setDuration(90)
    setGoalName('')
    setTargetAmount('')
    setError('')
    setLoading(false)
    setIsPinModalOpen(false)
    setIsSuccessModalOpen(false)
    setCompletedTransaction(null)
    onClose()
  }

  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlan(plan)
    setStep('details')
    setError('')
  }

  const calculateReturns = () => {
    if (!selectedPlan || !amount) return { maturityAmount: 0, interest: 0 }

    const principal = parseFloat(amount)
    const rate = selectedPlan.interestRate / 100
    const days = selectedPlan.type === 'fixed' ? duration : 365 // Default 1 year for target
    const years = days / 365

    const interest = principal * rate * years
    const maturityAmount = principal + interest

    return { maturityAmount, interest }
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!selectedPlan) {
      setError('Please select an investment plan')
      return
    }

    if (numAmount < selectedPlan.minAmount) {
      setError(`Minimum investment amount is ${formatCurrency(selectedPlan.minAmount)}`)
      return
    }

    if (selectedPlan.type === 'target') {
      if (!goalName.trim()) {
        setError('Please enter a goal name')
        return
      }

      const numTargetAmount = parseFloat(targetAmount)
      if (isNaN(numTargetAmount) || numTargetAmount <= 0) {
        setError('Please enter a valid target amount')
        return
      }

      if (numTargetAmount < numAmount) {
        setError('Target amount must be greater than initial amount')
        return
      }
    }

    setIsPinModalOpen(true)
  }

  const handlePinVerify = async (_pin: string) => {
    if (!user?.id || !selectedPlan) return

    setLoading(true)
    setError('')

    try {
      const numAmount = parseFloat(amount)
      const { maturityAmount, interest } = calculateReturns()

      let description = ''
  const maturityDate = new Date()

      if (selectedPlan.type === 'fixed') {
        maturityDate.setDate(maturityDate.getDate() + duration)
        description = `Fixed Savings - ${duration} days at ${selectedPlan.interestRate}% p.a. (Matures: ${maturityDate.toLocaleDateString()})`
      } else {
        description = `Target Savings: ${goalName} (Goal: ${formatCurrency(parseFloat(targetAmount))})`
      }

      // Create investment transaction (deduct from balance)
      const transaction = {
        user_id: user.id,
        amount: numAmount,
        type: 'expense' as const,
        category: 'Investment',
        description,
        date: new Date(),
  status: 'completed' as const,
        reference: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_method: 'wallet',
        metadata: {
          investment_type: selectedPlan.type,
          investment_plan: selectedPlan.id,
          duration: selectedPlan.type === 'fixed' ? duration : null,
          interest_rate: selectedPlan.interestRate,
          expected_returns: interest,
          maturity_amount: maturityAmount,
          maturity_date: selectedPlan.type === 'fixed' ? maturityDate.toISOString() : null,
          goal_name: selectedPlan.type === 'target' ? goalName : null,
          target_amount: selectedPlan.type === 'target' ? parseFloat(targetAmount) : null,
        },
      }

      console.log('Creating investment transaction:', transaction)
      const result = await addTransaction(transaction)
      console.log('Investment transaction created:', result)

      // Create notification
      const notificationMessage =
        selectedPlan.type === 'fixed'
          ? `You've invested ${formatCurrency(numAmount)} in Fixed Savings for ${duration} days. Expected returns: ${formatCurrency(interest)}`
          : `You've started a Target Savings plan "${goalName}" with ${formatCurrency(numAmount)}. Target: ${formatCurrency(parseFloat(targetAmount))}`

      await createNotification(
        user.id,
        'Investment Created',
        notificationMessage,
        'success',
        '/transactions',
        result.id // Pass transaction ID
      )

      console.log('Closing PIN modal and showing success modal...')

      // Batch state updates
      setCompletedTransaction(result)
      setIsPinModalOpen(false)

      // Wait before opening success modal
      setTimeout(() => {
        setIsSuccessModalOpen(true)

        // Notify parent to refresh stats
        if (onSuccess) {
          onSuccess(result)
        }
      }, 100)
    } catch (err: unknown) {
      console.error('Investment error:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to create investment. Please try again.')
      } else {
        setError('Failed to create investment. Please try again.')
      }
      setIsPinModalOpen(false)
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false)
    handleClose()
  }

  const { maturityAmount, interest } = calculateReturns()

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
                    <Dialog.Title as="h3" className="text-xl font-semibold text-slate-900 dark:text-white">
                      {step === 'select' ? 'Choose Investment Plan' : `${selectedPlan?.name}`}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Step 1: Select Investment Plan */}
                  {step === 'select' && (
                    <div className="space-y-3">
                      {investmentPlans.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => handlePlanSelect(plan)}
                          className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 transition-all">
                              <plan.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{plan.name}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{plan.description}</p>
                              <div className="flex items-center space-x-4 text-xs">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {plan.interestRate}% p.a.
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">
                                  Min: {formatCurrency(plan.minAmount)}
                                </span>
                              </div>
                            </div>
                            <ChartBarIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Investment Details */}
                  {step === 'details' && selectedPlan && (
                    <form onSubmit={handleDetailsSubmit} className="space-y-5">
                      {/* Amount Input */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {selectedPlan.type === 'target' ? 'Initial Amount' : 'Investment Amount'}
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
                            min={selectedPlan.minAmount}
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Minimum: {formatCurrency(selectedPlan.minAmount)}
                        </p>
                      </div>

                      {/* Fixed Savings: Duration Selection */}
                      {selectedPlan.type === 'fixed' && selectedPlan.durations && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Lock Period
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedPlan.durations.map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => setDuration(days)}
                                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                  duration === days
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>{days} days</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Target Savings: Goal Name and Target Amount */}
                      {selectedPlan.type === 'target' && (
                        <>
                          <div>
                            <label htmlFor="goalName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Goal Name
                            </label>
                            <input
                              type="text"
                              id="goalName"
                              value={goalName}
                              onChange={(e) => setGoalName(e.target.value)}
                              className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                              placeholder="e.g., Buy a laptop"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Target Amount
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">
                                ₦
                              </span>
                              <input
                                type="number"
                                id="targetAmount"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                                placeholder="0.00"
                                step="0.01"
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Returns Summary */}
                      {amount && parseFloat(amount) >= selectedPlan.minAmount && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            {selectedPlan.type === 'fixed' ? 'Expected Returns' : 'Estimated Returns (1 year)'}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Principal</span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatCurrency(parseFloat(amount))}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Interest ({selectedPlan.interestRate}%)</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                +{formatCurrency(interest)}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {selectedPlan.type === 'fixed' ? 'Maturity Amount' : 'Expected Total'}
                              </span>
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(maturityAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setStep('select')}
                          className="flex-1 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue
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
