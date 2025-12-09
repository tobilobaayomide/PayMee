import { useState, useEffect, useMemo, useCallback } from 'react'
import { Transaction } from '@/features/transactions/types'
import { fetchTransactions } from '@/lib/supabase/transactions'
import { useUser } from '@/components/providers/UserProvider'

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