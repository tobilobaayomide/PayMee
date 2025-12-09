'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'
import { Transaction } from '@/types'

interface TransactionContextType {
  transactions: Transaction[]
  recentTransactions: Transaction[]
  filter: 'all' | 'income' | 'expense' | 'transfer'
  setFilter: (filter: 'all' | 'income' | 'expense' | 'transfer') => void
  sortBy: 'date' | 'amount' | 'type'
  setSortBy: (sortBy: 'date' | 'amount' | 'type') => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  totalCount: number
  filteredCount: number
}

const TransactionContext = createContext<TransactionContextType | null>(null)

export const useTransactionContext = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider')
  }
  return context
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filter)
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
  }, [transactions, filter, sortBy, searchTerm])

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [transactions])

  const value = {
    transactions: filteredTransactions,
    recentTransactions,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    totalCount: transactions.length,
    filteredCount: filteredTransactions.length
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}