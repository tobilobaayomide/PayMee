'use client'

import DashboardLayout from '@/components/DashboardLayout'
import TransactionList from '@/features/transactions/TransactionList'
import TransactionFilters from '@/features/transactions/TransactionFilters'
import { TransactionProvider, useTransactionContext } from '@/features/transactions/TransactionContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  PlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { useMemo } from 'react'

function TransactionsContent() {
  const { transactions, allTransactions, isLoading, resetFilters, refreshTransactions } = useTransactionContext()

  // Export transactions to CSV
  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      alert('No transactions to export')
      return
    }

    // Prepare CSV data
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Status', 'Reference']
    const csvRows = [headers.join(',')]

    transactions.forEach(transaction => {
      const row = [
        new Date(transaction.date).toLocaleDateString('en-US'),
        `"${transaction.description}"`, // Wrap in quotes to handle commas
        transaction.category,
        transaction.type,
        transaction.amount.toFixed(2),
        transaction.status,
        transaction.reference || ''
      ]
      csvRows.push(row.join(','))
    })

    // Create CSV content
    const csvContent = csvRows.join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate stats from filtered transactions (respects date range filter)
  const stats = useMemo(() => {
    // Calculate totals from filtered transactions (already respects date range)
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0)
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0)
    const pendingCount = transactions
      .filter((t: any) => t.status === 'pending').length
    // For comparison, calculate last month from all transactions
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    // Last month transactions (for comparison) - use allTransactions
    const lastMonthTransactions = allTransactions.filter((t: any) => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear
    })
    const lastMonthIncome = lastMonthTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0)
    const lastMonthExpenses = lastMonthTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0)
    const incomeChange = lastMonthIncome > 0
      ? ((totalIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1)
      : '0.0'
    const expenseChange = lastMonthExpenses > 0
      ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
      : '0.0'
    return {
      totalIncome,
      totalExpenses,
      pendingCount,
      incomeChange: Number(incomeChange),
      expenseChange: Number(expenseChange)
    }
  }, [transactions, allTransactions])

  return (
  <div className="space-y-2 sm:space-y-4">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Monitor your financial activity and spending patterns</p>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <button 
            onClick={resetFilters}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium text-xs sm:text-sm"
          >
            Reset Filters
          </button>
          <button 
            onClick={handleExportTransactions}
            disabled={transactions.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg shadow-green-600/25 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      {/* Stats Cards */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 p-2 sm:p-4 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1 sm:p-2 bg-emerald-500 rounded-lg shadow-lg">
                    <ArrowTrendingUpIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] sm:text-xs">Total Income</p>
                    <p className="text-emerald-900 dark:text-emerald-100 text-base sm:text-lg font-bold tracking-tight">{formatCurrency(stats.totalIncome)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${stats.incomeChange >= 0 ? 'bg-emerald-500' : 'bg-red-500'} text-white px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-medium`}>
                    {stats.incomeChange >= 0 ? '+' : ''}{stats.incomeChange}%
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs">vs last month</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs">vs last month</span>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/30 p-4 border border-red-200/50 dark:border-red-800/50">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1 sm:p-2 bg-red-500 rounded-lg shadow-lg">
                      <ArrowTrendingDownIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-red-700 dark:text-red-400 font-semibold text-[10px] sm:text-xs">Total Expenses</p>
                      <p className="text-red-900 dark:text-red-100 text-base sm:text-lg font-bold tracking-tight">{formatCurrency(stats.totalExpenses)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${stats.expenseChange >= 0 ? 'bg-red-500' : 'bg-emerald-500'} text-white px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-medium`}>
                    {stats.expenseChange >= 0 ? '+' : ''}{stats.expenseChange}%
                  </span>
                  <span className="text-red-700 dark:text-red-400 text-xs">vs last month</span>
                  <span className="text-red-700 dark:text-red-400 text-[10px] sm:text-xs">vs last month</span>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/30 p-4 border border-amber-200/50 dark:border-amber-800/50">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-1 sm:p-2 bg-amber-500 rounded-lg shadow-lg">
                      <ClockIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-amber-700 dark:text-amber-400 font-semibold text-[10px] sm:text-xs">Pending</p>
                      <p className="text-amber-900 dark:text-amber-100 text-base sm:text-lg font-bold tracking-tight">{stats.pendingCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-medium">Transactions</span>
                  <span className="text-amber-700 dark:text-amber-400 text-[10px] sm:text-xs">awaiting approval</span>
                </div>
              </div>
            </div>
          </div>
          
          <TransactionFilters />
          <TransactionList />
        </>
      )}


    </div>
  )
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TransactionProvider>
          <TransactionsContent />
        </TransactionProvider>
      </DashboardLayout>
    </ProtectedRoute>
  )
}