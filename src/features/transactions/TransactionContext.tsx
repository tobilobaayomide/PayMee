'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useTransactions } from '@/features/transactions/useTransactions'

type TransactionContextType = ReturnType<typeof useTransactions>

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
	const transactionData = useTransactions()
	return (
		<TransactionContext.Provider value={transactionData}>
			{children}
		</TransactionContext.Provider>
	)
}

export function useTransactionContext() {
	const context = useContext(TransactionContext)
	if (context === undefined) {
		throw new Error('useTransactionContext must be used within a TransactionProvider')
	}
	return context
}