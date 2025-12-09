"use client"

import { useState } from 'react'
import { formatCurrency, formatDate, formatDateTime, cn } from '@/lib/utils'
import { useTransactionContext } from '@/features/transactions/TransactionContext'
import { TransactionDetailsModal } from '@/features/transactions/TransactionDetailsModal'
import type { Transaction } from '@/features/transactions/types'
import { 
	ArrowUpIcon,
	ArrowDownIcon,
	ArrowsRightLeftIcon
} from '@heroicons/react/24/outline'

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

export default function TransactionList() {
	const { 
		transactions: filteredTransactions, 
		sortBy, 
		setSortBy,
		filteredCount 
	} = useTransactionContext()

	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleTransactionClick = (transaction: Transaction) => {
		setSelectedTransaction(transaction)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setTimeout(() => setSelectedTransaction(null), 300) // Delay clearing to allow exit animation
	}

		return (
			<div className="compact-card rounded-xl p-3 sm:p-5">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
					<div>
						<h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Transaction History</h3>
					</div>
					<div className="flex items-center gap-2 sm:gap-3">
						<select 
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type')}
							className="text-xs sm:text-sm border border-slate-200 dark:border-neutral-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 dark:text-white"
						>
							<option value="date">Latest First</option>
							<option value="amount">Highest Amount</option>
							<option value="type">By Type</option>
						</select>
					</div>
				</div>
				{/* Table Header */}
				<div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-neutral-700">
					<div className="col-span-1">ID</div>
					<div className="col-span-3">Transaction</div>
					<div className="col-span-2">Session ID</div>
					<div className="col-span-2">Date</div>
					<div className="col-span-2 text-right">Amount</div>
					<div className="col-span-2 text-center">Status</div>
				</div>
				{/* Transaction Rows */}
				<div className="divide-y divide-slate-50 dark:divide-neutral-700">
					{filteredTransactions
						.slice()
						.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
						.map((transaction) => {
						const IconComponent = getTransactionIcon(transaction.type)
									return (
										<div 
											key={transaction.id} 
											onClick={() => handleTransactionClick(transaction)}
											className="grid grid-cols-4 sm:grid-cols-12 gap-1 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 hover:bg-slate-50/50 dark:hover:bg-neutral-700/30 transition-all duration-200 group cursor-pointer items-center text-xs sm:text-sm"
										>
											{/* Transaction ID (desktop only) */}
											<div className="hidden sm:block col-span-1">
												<p className="font-mono text-slate-500 dark:text-slate-400 truncate">
													#{transaction.id}
												</p>
											</div>
											{/* Transaction (Icon + Name) */}
															<div className="col-span-2 sm:col-span-3 flex items-center gap-2 sm:gap-3">
																<div className={cn(
																	'flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center',
																	transaction.type === 'income' 
																		? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
																		: transaction.type === 'expense'
																		? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
																		: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
																)}>
																	<IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
																</div>
																<div className="min-w-0 flex-1">
																						<p className="font-medium text-slate-900 dark:text-white truncate">
																							{/* Show only the main type/label for description, covering more cases */}
																							{(() => {
																								const desc = (transaction.description || '').toLowerCase();
																								if (desc.startsWith('transfer')) return 'Transfer';
																								if (desc.startsWith('airtime')) return 'Airtime';
																								if (desc.startsWith('data')) return 'Data';
																								if (desc.startsWith('bill')) return 'Bill';
																								if (desc.startsWith('withdraw')) return 'Withdraw';
																								if (desc.startsWith('deposit')) return 'Deposit';
																								if (desc.startsWith('topup')) return 'Topup';
																								if (desc.startsWith('fund')) return 'Topup';
																								if (desc.startsWith('electricity')) return 'Electricity';
																								if (desc.startsWith('bet')) return 'Betting';
																								if (desc.startsWith('shopping')) return 'Shopping';
																								if (desc.startsWith('subscription')) return 'Subscription';
																								if (desc.startsWith('internet')) return 'Internet';
																								if (desc.startsWith('loan')) return 'Loan';
																								if (desc.startsWith('tax')) return 'Tax';
																								if (desc.startsWith('insurance')) return 'Insurance';
																								if (desc.startsWith('school')) return 'School';
																								if (desc.startsWith('rent')) return 'Rent';
																								if (desc.startsWith('salary')) return 'Salary';
																								if (desc.startsWith('bonus')) return 'Bonus';
																								if (desc.startsWith('gift')) return 'Gift';
																								if (desc.startsWith('investment')) return 'Investment';
																								if (desc.startsWith('pos')) return 'POS';
																								if (desc.startsWith('atm')) return 'ATM';
																								if (desc.startsWith('card')) return 'Card';
																								// fallback: first word or before dash/to
																								return (transaction.description || '').split('-')[0].split(' to')[0].trim();
																							})()}
																						</p>
																	<p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
																		{transaction.category && transaction.category.split('-')[0]}
																	</p>
																</div>
															</div>
											{/* Session ID (desktop only) */}
											<div className="hidden sm:block col-span-2">
												<p className="font-mono text-slate-600 dark:text-slate-400 truncate">
													SS-{Math.random().toString(36).substr(2, 8).toUpperCase()}
												</p>
											</div>
											{/* Date */}
															<div className="col-span-1 sm:col-span-2 flex items-center">
																<p className="text-[10px] sm:text-sm text-slate-600 dark:text-slate-400 truncate">
																	{formatDateTime(transaction.date)}
																</p>
															</div>
																											{/* Amount column: on mobile, stack status under amount; on desktop, only amount */}
																											<div className="col-span-1 sm:col-span-2 flex flex-col items-end sm:items-end justify-end">
																												<p className={cn(
																													'font-semibold',
																													transaction.type === 'income' 
																														? 'text-green-600 dark:text-green-400' 
																														: 'text-slate-900 dark:text-white'
																												)}>
																													{transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
																												</p>
																												{/* Show status under amount only on mobile */}
																												<span className={cn(
																													'inline-flex items-center px-1.5 py-0.5 rounded-full font-medium mt-1 sm:hidden',
																													transaction.status === 'completed' 
																														? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
																														: transaction.status === 'pending'
																														? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
																														: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
																												)}>
																													{transaction.status}
																												</span>
																											</div>
																											{/* Status column: only visible on desktop */}
																											<div className="hidden sm:flex col-span-2 flex-col items-center justify-center">
																												<span className={cn(
																													'inline-flex items-center px-2 py-0.5 rounded-full font-medium',
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
				{/* Footer */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-slate-100 dark:border-neutral-700 gap-2 sm:gap-0">
					<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
						Showing {filteredCount} transactions
					</p>
					<button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
						Load more
					</button>
				</div>
				{/* Transaction Details Modal */}
				<TransactionDetailsModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					transaction={selectedTransaction}
				/>
			</div>
	)
}