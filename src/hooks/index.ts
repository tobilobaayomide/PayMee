'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Transaction, DashboardStats } from '@/types'
import { fetchTransactions } from '@/lib/supabase/transactions'
import { useUser } from '@/components/providers/UserProvider'

// Hook for dashboard statistics - fetches ALL real transactions from Supabase
export function useDashboardStats() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all transactions from Supabase
  const loadTransactions = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchTransactions(user.id)
      setTransactions(data)
    } catch (err: any) {
      console.error('Failed to load transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Calculate stats from real transactions
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // All-time totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' || t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalBalance = totalIncome - totalExpenses

    // Current month
    const currentMonthTransactions = transactions.filter(t => {
      try {
        if (!t.date) return false
        const txDate = new Date(t.date)
        return !isNaN(txDate.getTime()) && txDate >= currentMonthStart
      } catch {
        return false
      }
    })
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' || t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)

    // Last month
    const lastMonthTransactions = transactions.filter(t => {
      try {
        if (!t.date) return false
        const txDate = new Date(t.date)
        return !isNaN(txDate.getTime()) && txDate >= lastMonthStart && txDate <= lastMonthEnd
      } catch {
        return false
      }
    })
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense' || t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate balance at the end of last month (all transactions up to last month end)
    const transactionsUpToLastMonth = transactions.filter(t => {
      try {
        if (!t.date) return false
        const txDate = new Date(t.date)
        return !isNaN(txDate.getTime()) && txDate <= lastMonthEnd
      } catch {
        return false
      }
    })
    const lastMonthEndIncome = transactionsUpToLastMonth
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const lastMonthEndExpenses = transactionsUpToLastMonth
      .filter(t => t.type === 'expense' || t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0)
    const lastMonthEndBalance = lastMonthEndIncome - lastMonthEndExpenses

    // Calculate balance change (current balance vs end of last month)
    const balanceChange = lastMonthEndBalance !== 0
      ? ((totalBalance - lastMonthEndBalance) / Math.abs(lastMonthEndBalance) * 100).toFixed(1)
      : totalBalance > 0 ? '100.0' : '0.0'
    
    const incomeChange = lastMonthIncome > 0
      ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1)
      : '0.0'
    
    const expenseChange = lastMonthExpenses > 0
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
      : '0.0'

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      balanceChange,
      incomeChange,
      expenseChange,
      savingsRate: totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : '0.0',
      transactionCount: transactions.length
    }
  }, [transactions])

  return {
    stats,
    isLoading,
    error,
    refreshStats: loadTransactions
  }
}

// Hook for transaction management - NOW WITH REAL DATA
export function useTransactions() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date')
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | '1year' | 'all'>('30days')

  // Fetch real transactions from Supabase
  const loadTransactions = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await fetchTransactions(user.id)
      setTransactions(data)
    } catch (err: any) {
      console.error('Failed to load transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let daysToSubtract = 30 // default
      
      switch (dateRange) {
        case '7days':
          daysToSubtract = 7
          break
        case '30days':
          daysToSubtract = 30
          break
        case '90days':
          daysToSubtract = 90
          break
        case '1year':
          daysToSubtract = 365
          break
      }
      
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      
      filtered = filtered.filter(transaction => {
        const txDate = new Date(transaction.date)
        return txDate >= startDate
      })
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filter)
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === status)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'type':
          return a.type.localeCompare(b.type)
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

    return filtered
  }, [transactions, filter, sortBy, searchTerm, category, status, dateRange])

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [transactions])

  return {
    transactions: filteredTransactions,
    allTransactions: transactions, // unfiltered transactions for stats comparison
    recentTransactions,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    status,
    setStatus,
    dateRange,
    setDateRange,
    totalCount: transactions.length,
    filteredCount: filteredTransactions.length,
    isLoading,
    refreshTransactions: loadTransactions,
    resetFilters: () => {
      setFilter('all')
      setCategory('all')
      setStatus('all')
      setSearchTerm('')
      setSortBy('date')
      setDateRange('30days')
    }
  }
}

// Hook for local storage persistence
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Hook for responsive design
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isMobile = windowSize.width < 768
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop
  }
}

// Hook for debounced values (useful for search)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}