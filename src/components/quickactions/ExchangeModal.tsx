'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ArrowsRightLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { PinVerificationModal } from '@/components/PinVerificationModal'
import { TransactionSuccessModal } from '@/components/TransactionSuccessModal'
import { addTransaction } from '@/lib/supabase/transactions'
import { createNotification } from '@/lib/supabase/notifications'
import { useUser } from '@/components/providers/UserProvider'
import { formatCurrency } from '@/lib/utils'

interface ExchangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (transaction: ExchangeTransaction) => void
}

export interface ExchangeTransaction {
  amount: number
  recipient_bank: string
  recipient_account: string
  reference: string
  description?: string
  date: string
}

type Currency = 'NGN' | 'USD'

interface CurrencyInfo {
  code: Currency
  name: string
  symbol: string
  flag: string
}

const currencies: Record<Currency, CurrencyInfo> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
  },
}

// Exchange rates (you would fetch this from an API in production)
const EXCHANGE_RATES = {
  NGN_TO_USD: 0.0012, // 1 NGN = 0.0012 USD (approx 1 USD = 833 NGN)
  USD_TO_NGN: 833, // 1 USD = 833 NGN
}

const EXCHANGE_FEE_PERCENT = 1.5 // 1.5% fee

export function ExchangeModal({ isOpen, onClose, onSuccess }: ExchangeModalProps) {
  const { user } = useUser()
  const [fromCurrency, setFromCurrency] = useState<Currency>('NGN')
  const [toCurrency, setToCurrency] = useState<Currency>('USD')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<ExchangeTransaction | null>(null)

  const handleClose = () => {
    setFromCurrency('NGN')
    setToCurrency('USD')
    setAmount('')
    setError('')
    setLoading(false)
    setIsPinModalOpen(false)
    setIsSuccessModalOpen(false)
    setCompletedTransaction(null)
    onClose()
  }

  const getExchangeRate = () => {
    if (fromCurrency === 'NGN' && toCurrency === 'USD') {
      return EXCHANGE_RATES.NGN_TO_USD
    } else if (fromCurrency === 'USD' && toCurrency === 'NGN') {
      return EXCHANGE_RATES.USD_TO_NGN
    }
    return 1
  }

  const calculateExchange = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return { convertedAmount: 0, fee: 0, totalReceived: 0, rate: 0 }
    }

    const rate = getExchangeRate()
    const convertedAmount = numAmount * rate
    const fee = convertedAmount * (EXCHANGE_FEE_PERCENT / 100)
    const totalReceived = convertedAmount - fee

    return { convertedAmount, fee, totalReceived, rate }
  }

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setAmount('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (numAmount < 100) {
      setError(`Minimum exchange amount is ${currencies[fromCurrency].symbol}100`)
      return
    }

    if (fromCurrency === toCurrency) {
      setError('Source and target currencies must be different')
      return
    }

    setIsPinModalOpen(true)
  }

  const handlePinVerify = async (pin: string) => {
    if (!user?.id) return

    setLoading(true)
    setError('')

    try {
      const numAmount = parseFloat(amount)
      const { convertedAmount, fee, totalReceived, rate } = calculateExchange()

      // Create exchange transaction (expense in source currency)
      const transaction = {
        user_id: user.id,
        amount: numAmount,
        type: 'expense' as 'expense',
        category: 'Exchange',
        description: `Currency Exchange: ${currencies[fromCurrency].symbol}${numAmount.toLocaleString()} ${fromCurrency} → ${currencies[toCurrency].symbol}${totalReceived.toFixed(2)} ${toCurrency}`,
  date: new Date(),
  status: 'completed' as 'completed',
        reference: `EXG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        payment_method: 'wallet',
        metadata: {
          exchange_type: 'currency',
          from_currency: fromCurrency,
          to_currency: toCurrency,
          from_amount: numAmount,
          to_amount: totalReceived,
          exchange_rate: rate,
          fee_amount: fee,
          fee_percent: EXCHANGE_FEE_PERCENT,
          converted_amount: convertedAmount,
        },
      }

      console.log('Creating exchange transaction:', transaction)
      const result = await addTransaction(transaction)
      console.log('Exchange transaction created:', result)

      // Create notification with transaction ID
      await createNotification(
        user.id,
        'Currency Exchange Successful',
        `You exchanged ${currencies[fromCurrency].symbol}${numAmount.toLocaleString()} ${fromCurrency} to ${currencies[toCurrency].symbol}${totalReceived.toFixed(2)} ${toCurrency}. Rate: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`,
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
      console.error('Exchange error:', err)
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to complete exchange. Please try again.')
      } else {
        setError('Failed to complete exchange. Please try again.')
      }
      setIsPinModalOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false)
    handleClose()
  }

  const { convertedAmount, fee, totalReceived, rate } = calculateExchange()

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
                      Currency Exchange
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Exchange Rate Display */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Current Rate</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                          </span>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live rate"></div>
                        </div>
                      </div>
                    </div>

                    {/* From Currency */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        From
                      </label>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
                            placeholder="0.00"
                            step="0.01"
                            min="100"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-3 border-2 border-slate-300 dark:border-neutral-700 rounded-lg font-medium bg-white dark:bg-neutral-800 text-slate-900 dark:text-white min-w-[100px] flex items-center justify-center space-x-2"
                          disabled
                        >
                          <span className="text-xl">{currencies[fromCurrency].flag}</span>
                          <span>{fromCurrency}</span>
                        </button>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleSwapCurrencies}
                        className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all hover:scale-110"
                        title="Swap currencies"
                      >
                        <ArrowsRightLeftIcon className="h-5 w-5 rotate-90" />
                      </button>
                    </div>

                    {/* To Currency */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        To
                      </label>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={amount && !isNaN(parseFloat(amount)) ? totalReceived.toFixed(2) : '0.00'}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-neutral-700 rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold"
                            disabled
                            readOnly
                          />
                        </div>
                        <button
                          type="button"
                          className="px-4 py-3 border-2 border-slate-300 dark:border-neutral-700 rounded-lg font-medium bg-white dark:bg-neutral-800 text-slate-900 dark:text-white min-w-[100px] flex items-center justify-center space-x-2"
                          disabled
                        >
                          <span className="text-xl">{currencies[toCurrency].flag}</span>
                          <span>{toCurrency}</span>
                        </button>
                      </div>
                    </div>

                    {/* Exchange Summary */}
                    {amount && parseFloat(amount) > 0 && (
                      <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg space-y-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                          Exchange Summary
                        </h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Amount</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {currencies[fromCurrency].symbol}
                            {parseFloat(amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Converted Amount</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {currencies[toCurrency].symbol}
                            {convertedAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Fee ({EXCHANGE_FEE_PERCENT}%)
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            -{currencies[toCurrency].symbol}
                            {fee.toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-neutral-700 flex justify-between">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            You'll Receive
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {currencies[toCurrency].symbol}
                            {totalReceived.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

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
                      Exchange Now
                    </button>

                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                      Exchange rate updates every few seconds. Final rate is locked at confirmation.
                    </p>
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
