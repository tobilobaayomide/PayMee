'use client'

import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useTransactionContext } from '@/features/transactions/TransactionContext'

export default function TransactionFilters() {
	const { 
		filter, 
		setFilter, 
		searchTerm, 
		setSearchTerm,
		category,
		setCategory,
		status,
		setStatus,
		dateRange,
		setDateRange,
		filteredCount,
		totalCount
	} = useTransactionContext()
		return (
			<div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-neutral-800 shadow-xl shadow-slate-900/5 p-2 sm:p-4">
				<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
				<div className="flex-1 max-w-md">
					<div className="relative group">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
						<input
							type="text"
							placeholder="Search transactions, merchants, amounts..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-neutral-700 transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm text-slate-900 dark:text-white"
						/>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
						<span className="text-xs font-medium text-slate-700 dark:text-slate-300">Filters</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-slate-500" />
  							<select 
  								value={dateRange}
  								onChange={(e) => setDateRange(e.target.value as '7days' | '30days' | '90days' | '1year' | 'all')}
  								className="pl-7 pr-6 py-2 bg-slate-50 dark:bg-neutral-800 border-0 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-neutral-700 transition-all duration-200 appearance-none cursor-pointer"
  							>
								<option value="7days">Last 7 days</option>
								<option value="30days">Last 30 days</option>
								<option value="90days">Last 3 months</option>
								<option value="1year">Last year</option>
							</select>
						</div>
						<select 
							value={filter}
							onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense' | 'transfer')}
							className="px-3 py-2 bg-slate-50 dark:bg-neutral-800 border-0 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-neutral-700 transition-all duration-200 appearance-none cursor-pointer"
						>
							<option value="all">All Types</option>
							<option value="income">Income</option>
							<option value="expense">Expenses</option>
							<option value="transfer">Transfers</option>
						</select>
									<select 
										value={category}
										onChange={(e) => setCategory(e.target.value)}
										className="hidden sm:block px-3 py-2 bg-slate-50 dark:bg-neutral-800 border-0 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-neutral-700 transition-all duration-200 appearance-none cursor-pointer"
									>
										<option value="all">All Categories</option>
										<option value="salary">Salary</option>
										<option value="groceries">Groceries</option>
										<option value="transfer">Transfer</option>
										<option value="transportation">Transportation</option>
										<option value="freelance">Freelance</option>
										<option value="utilities">Utilities</option>
										<option value="entertainment">Entertainment</option>
										<option value="investment">Investment</option>
									</select>
									<select 
										value={status}
										onChange={(e) => setStatus(e.target.value)}
										className="hidden sm:block px-3 py-2 bg-slate-50 dark:bg-neutral-800 border-0 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-neutral-700 transition-all duration-200 appearance-none cursor-pointer"
									>
										<option value="all">All Status</option>
										<option value="completed">Completed</option>
										<option value="pending">Pending</option>
										<option value="failed">Failed</option>
									</select>
					</div>
								<div className="hidden sm:flex items-center gap-2">
									<div className="text-xs text-slate-600 dark:text-slate-400 font-medium px-3 py-2 bg-slate-100 dark:bg-neutral-800 rounded-lg">
										{filteredCount} of {totalCount} transactions
									</div>
								</div>
				</div>
			</div>
		</div>
	)
}