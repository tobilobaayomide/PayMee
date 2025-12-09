'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'
import {
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline'

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailsModalProps) {
  if (!transaction) return null

  const getTransactionIcon = () => {
    const iconClass = 'h-6 w-6'
    switch (transaction.type) {
      case 'income':
        return <ArrowDownIcon className={`${iconClass} text-green-600`} />
      case 'expense':
        return <ArrowUpIcon className={`${iconClass} text-red-600`} />
      case 'transfer':
        return <ArrowsRightLeftIcon className={`${iconClass} text-blue-600`} />
      default:
        return null
    }
  }

  const getStatusIcon = () => {
    const iconClass = 'h-5 w-5'
    switch (transaction.status) {
      case 'completed':
        return <CheckCircleIcon className={`${iconClass} text-green-600`} />
      case 'pending':
        return <ClockIcon className={`${iconClass} text-yellow-600`} />
      case 'failed':
        return <XCircleIcon className={`${iconClass} text-red-600`} />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'expense':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
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
                    <div className="p-2 bg-slate-100 dark:bg-neutral-700 rounded-lg">
                      {getTransactionIcon()}
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                      >
                        Transaction Details
                      </Dialog.Title>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {transaction.type}
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

                {/* Amount */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-neutral-900 rounded-lg text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Amount</p>
                  <p className={`text-3xl font-bold ${
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : transaction.type === 'expense'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                  {/* Description */}
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Description</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                        {transaction.description}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3">
                    <TagIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor()}`}>
                        {transaction.category}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date & Time</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatDate(transaction.date)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatTime(transaction.date)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  {/* Reference (if available) */}
                  {transaction.reference && (
                    <div className="flex items-start gap-3">
                      <IdentificationIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reference</p>
                        <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                          {transaction.reference}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons removed as requested */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
