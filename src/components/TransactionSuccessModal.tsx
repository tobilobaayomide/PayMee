'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckCircleIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'

interface TransactionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: {
    amount: number
    recipient_bank: string
    recipient_account: string
    reference: string
    description?: string
    date: string
  }
}

export function TransactionSuccessModal({ 
  isOpen, 
  onClose, 
  transaction 
}: TransactionSuccessModalProps) {
  console.log('TransactionSuccessModal render:', { isOpen, transaction })
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
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
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                    <div className="relative p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircleIcon className="h-16 w-16 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2"
                >
                  Transaction Successful!
                </Dialog.Title>

                {/* Amount */}
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    has been sent successfully
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="bg-slate-50 dark:bg-neutral-800 rounded-xl p-4 space-y-3 mb-6">
                  {/* Recipient */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Recipient Bank</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {transaction.recipient_bank}
                    </span>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Account Number</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                      {transaction.recipient_account}
                    </span>
                  </div>

                  {/* Reference */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Reference</span>
                    <span className="text-xs font-medium text-slate-900 dark:text-white font-mono">
                      {transaction.reference}
                    </span>
                  </div>

                  {/* Description */}
                  {transaction.description && (
                    <div className="flex items-start justify-between pt-3 border-t border-slate-200 dark:border-neutral-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Description</span>
                      <span className="text-sm text-slate-900 dark:text-white text-right max-w-[60%]">
                        {transaction.description}
                      </span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-neutral-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Date & Time</span>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Done
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => {
                      // TODO: Implement share/download receipt
                      alert('Share receipt feature coming soon!')
                    }}
                    className="w-full py-3 px-4 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                  >
                    Share Receipt
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
