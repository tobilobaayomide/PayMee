import { useState } from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { useTransactionContext } from '@/contexts/TransactionContext'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { TransactionDetailsModal } from '@/features/transactions/TransactionDetailsModal'

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'income':
      return ArrowDownIcon
    case 'expense':
      return ArrowUpIcon
    case 'transfer':
      return ArrowsRightLeftIcon
    default:
      return ArrowsRightLeftIcon
  }
}

export default function RecentTransactions() {
  const { transactions, isLoading } = useTransactionContext()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const recentTransactions: Transaction[] = isMobile
    ? transactions.slice(0, 3)
    : transactions.slice(0, 6)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedTransaction(null), 300)
  }

  return (
  <div className="compact-card rounded-xl p-3 sm:p-5 w-full shadow-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
  <div className="flex flex-row items-center mb-4 w-full">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Latest activity</p>
        </div>
        <div className="flex-1" />
        <Link 
          href="/transactions"
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ml-auto"
        >
          View All
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && recentTransactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Start by adding your first transaction</p>
        </div>
      )}
      
      {/* Transactions List */}
      {!isLoading && recentTransactions.length > 0 && (
        <>
          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-neutral-700 w-full">
            <div className="col-span-5">Transaction</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3 text-right">Amount</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
          
          {/* Transaction Rows */}
          <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-slate-200 dark:sm:divide-neutral-700 w-full">{recentTransactions.map((transaction) => {
          const IconComponent = getTransactionIcon(transaction.type)
          return (
            <div 
              key={transaction.id} 
              className="sm:grid sm:grid-cols-12 sm:gap-3 sm:px-3 sm:py-3 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-all duration-200 group cursor-pointer sm:items-center rounded-lg sm:rounded-none w-full"
              onClick={() => handleTransactionClick(transaction)}
            >
              {/* Mobile Card Layout */}
              <div className="sm:hidden bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-3 w-full shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : transaction.type === 'expense'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  )}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{transaction.description}</p>
                    {/* Only show reference/account number for transfers on desktop, not mobile */}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(transaction.date)}</p>
                  <p className={cn(
                    'text-xs font-semibold',
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : 'text-slate-900 dark:text-white'
                  )}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>

              {/* Desktop Grid Layout - Hidden on mobile */}
              {/* Transaction (Icon + Name) */}
              <div className="hidden sm:flex col-span-5 items-center gap-3 w-full">
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : transaction.type === 'expense'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{transaction.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{transaction.category}</p>
                </div>
              </div>
              {/* Date */}
              <div className="hidden sm:block col-span-2 w-full">
                <p className="text-sm text-slate-600 dark:text-slate-400">{formatDate(transaction.date)}</p>
              </div>
              {/* Amount */}
              <div className="hidden sm:block col-span-3 text-right w-full">
                <p className={cn(
                  'text-sm font-semibold',
                  transaction.type === 'income' 
                    ? 'text-green-600' 
                    : 'text-slate-900 dark:text-white'
                )}>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                </p>
              </div>
              {/* Status */}
              <div className="hidden sm:flex col-span-2 justify-center w-full">
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : transaction.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {transaction.status}
                </span>
              </div>
            </div>
          )
        })}
          </div>
        </>
      )}
      
     <TransactionDetailsModal
       isOpen={isModalOpen}
       onClose={handleCloseModal}
       transaction={selectedTransaction}
     />
    </div>
  )
}