'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import SpendingBreakdown from '@/components/SpendingBreakdown'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useUser } from '@/components/providers/UserProvider'
import { 
  getMonthlyTrend, 
  getCategorySpending, 
  getAnalyticsOverview,
  getDashboardStats,
  getPaymentMethodUsage,
  MonthlyData,
  CategorySpending,
  AnalyticsData,
  DashboardStats
} from '@/lib/supabase/analytics'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowUpIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

type DateRange = '7days' | '30days' | '3months' | '6months' | '1year' | 'all'

const DATE_RANGES: { value: DateRange; label: string; days: number | null }[] = [
  { value: '7days', label: 'Last 7 Days', days: 7 },
  { value: '30days', label: 'Last 30 Days', days: 30 },
  { value: '3months', label: 'Last 3 Months', days: 90 },
  { value: '6months', label: 'Last 6 Months', days: 180 },
  { value: '1year', label: 'Last Year', days: 365 },
  { value: 'all', label: 'All Time', days: null },
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'bank_transfer': 'Bank Transfer',
  'transfer': 'Bank Transfer',
  'wallet': 'Wallet',
  'card': 'Card',
  'paymee_card': 'Card',
  'credit_card': 'Card',
  'debit_card': 'Card',
  'cash': 'Wallet',
  'other': 'Other',
  'Other': 'Other',
}

export default function AnalyticsPage() {
  const { user } = useUser()
  const [dateRange, setDateRange] = useState<DateRange>('30days')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<{ method: string; count: number; percentage: number }[]>([])
  const [loading, setLoading] = useState(true)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showDateDropdown && !target.closest('.date-dropdown-container')) {
        setShowDateDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDateDropdown])

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.id) return

      setLoading(true)
      try {
        // Calculate date range
        const endDate = new Date()
        const selectedRange = DATE_RANGES.find(r => r.value === dateRange)
        const startDate = selectedRange?.days 
          ? new Date(endDate.getTime() - selectedRange.days * 24 * 60 * 60 * 1000)
          : null

        const [monthly, categories, analytics, stats, paymentMethodsData] = await Promise.all([
          getMonthlyTrend(user.id, startDate, endDate),
          getCategorySpending(user.id, startDate, endDate),
          getAnalyticsOverview(user.id, startDate, endDate),
          getDashboardStats(user.id, startDate, endDate),
          getPaymentMethodUsage(user.id, startDate, endDate),
        ])

        setMonthlyData(monthly)
        setCategoryData(categories)
        setAnalyticsData(analytics)
        setDashboardStats(stats)
        setPaymentMethods(paymentMethodsData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user?.id, dateRange])

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!analyticsData || !dashboardStats) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">No analytics data available</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
  <div className="space-y-2 sm:space-y-4">
        {/* Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Financial Analytics
            </h1>
            <p className="mt-1 text-xs sm:text-base text-slate-500 dark:text-slate-400">
              Deep insights into your spending patterns, trends, and financial health
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <div className="relative date-dropdown-container">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-1 sm:gap-2 compact-card rounded-lg px-2 sm:px-4 py-1 sm:py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <CalendarDaysIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {DATE_RANGES.find(r => r.value === dateRange)?.label}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 compact-card rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setDateRange(range.value)
                        setShowDateDropdown(false)
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm transition-colors ${
                        dateRange === range.value
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      } ${range.value === DATE_RANGES[0].value ? 'rounded-t-lg' : ''} ${
                        range.value === DATE_RANGES[DATE_RANGES.length - 1].value ? 'rounded-b-lg' : ''
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Monthly Growth */}
          <div className="compact-card rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Growth</p>
                <div className="flex items-center mt-1">
                  <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    {analyticsData.monthlyGrowth === null ? 'N/A' : `${analyticsData.monthlyGrowth >= 0 ? '+' : ''}${analyticsData.monthlyGrowth.toFixed(1)}%`}
                  </p>
                  <TrendingUpIcon className="h-5 w-5 text-green-500 ml-2" />
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              {analyticsData.monthlyGrowth === null ? (
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>N/A (not enough data)</span>
                </div>
              ) : (
                <div className={`flex items-center text-[10px] sm:text-xs ${
                  analyticsData.monthlyGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  <ArrowUpIcon className={`h-3 w-3 mr-1 ${analyticsData.monthlyGrowth < 0 ? 'rotate-180' : ''}`} />
                  <span>{analyticsData.monthlyGrowth >= 0 ? '+' : ''}{analyticsData.monthlyGrowth.toFixed(1)}% from previous period</span>
                </div>
              )}
            </div>
          </div>

          {/* Average Income */}
          <div className="compact-card rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Monthly Income</p>
                <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(analyticsData.avgMonthlyIncome)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className={`flex items-center text-[10px] sm:text-xs ${
                analyticsData.incomeGrowth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <ArrowUpIcon className={`h-3 w-3 mr-1 ${analyticsData.incomeGrowth < 0 ? 'rotate-180' : ''}`} />
                <span>{analyticsData.incomeGrowth >= 0 ? '+' : ''}{analyticsData.incomeGrowth.toFixed(1)}% from previous period</span>
              </div>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="compact-card rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Savings Rate</p>
                <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {analyticsData.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                <TrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className={`flex items-center text-[10px] sm:text-xs ${
                analyticsData.savingsGrowth >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <ArrowUpIcon className={`h-3 w-3 mr-1 ${analyticsData.savingsGrowth < 0 ? 'rotate-180' : ''}`} />
                <span>{analyticsData.savingsGrowth >= 0 ? '+' : ''}{analyticsData.savingsGrowth.toFixed(1)}% from previous period</span>
              </div>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="compact-card rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</p>
                <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {analyticsData.transactionCount}
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                <CreditCardIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                <span>{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
          {/* Left Column - Monthly Trend + Financial Health Score */}
          <div className="space-y-2 sm:space-y-4">
            {/* Income vs Expenses Trend */}
            <div className="compact-card rounded-xl p-1 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Income vs Expenses</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Monthly comparison over time</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-400">Income</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                  </div>
                </div>
              </div>
              <AnalyticsCharts data={monthlyData} />
            </div>

            {/* Financial Health Score - Replica of Chart Box */}
            <div className="compact-card rounded-xl p-1 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Financial Health Score</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Overall financial wellness</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-400">Score</span>
                  </div>
                </div>
              </div>
              {/* Health Score Content */}
              <div className="h-32 sm:h-48 flex items-center justify-center">
                <div className="flex items-center gap-4 sm:gap-8">
                  {/* Score Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                      <svg className="w-16 h-16 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray={`${analyticsData.healthScore}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg sm:text-2xl font-bold text-blue-600">{analyticsData.healthScore}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-1 sm:mt-2">
                      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{analyticsData.healthGrade}</div>
                    </div>
                  </div>
                  {/* Score Breakdown (optional, can be removed or made dynamic) */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between gap-3 sm:gap-6 min-w-[90px] sm:min-w-[120px]">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Savings</span>
                      <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{analyticsData.savingsRate >= 60 ? 'A+' : analyticsData.savingsRate >= 40 ? 'A' : analyticsData.savingsRate >= 20 ? 'B' : 'C'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:gap-6 min-w-[90px] sm:min-w-[120px]">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Spending</span>
                      <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">{analyticsData.avgMonthlyExpenses / analyticsData.avgMonthlyIncome < 0.5 ? 'A' : analyticsData.avgMonthlyExpenses / analyticsData.avgMonthlyIncome < 0.8 ? 'B' : 'C'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:gap-6 min-w-[90px] sm:min-w-[120px]">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Goals</span>
                      <span className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">{analyticsData.healthScore >= 85 ? 'A' : analyticsData.healthScore >= 65 ? 'B' : 'C'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Top Spending Categories */}
          <div className="compact-card rounded-xl p-1 sm:p-4">
            <div className="mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Top Spending Categories</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Where your money goes {DATE_RANGES.find(r => r.value === dateRange)?.label.toLowerCase()}</p>
            </div>
            <SpendingBreakdown 
              data={categoryData} 
              dateRangeLabel={DATE_RANGES.find(r => r.value === dateRange)?.label || 'This period'}
            />
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* This Month Summary */}
          <div className="compact-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{DATE_RANGES.find(r => r.value === dateRange)?.label}</h4>
                {/* Optionally, show a formatted date range here if you want */}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Income</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(dashboardStats.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(dashboardStats.totalExpenses)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Net Savings</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(dashboardStats.totalIncome - dashboardStats.totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Category */}
          <div className="compact-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Top Category</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Highest spending</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{analyticsData.topSpendingCategory}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(analyticsData.topSpendingAmount)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">65% of total expenses</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="compact-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                <CreditCardIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Payment Methods</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cards usage</p>
              </div>
            </div>
            <div className="space-y-3">
              {paymentMethods.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">No data</div>
              ) : (
                paymentMethods.map((pm) => {
                  const label = PAYMENT_METHOD_LABELS[pm.method?.toLowerCase?.()] || pm.method
                  return (
                    <div key={pm.method} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{pm.percentage.toFixed(0)}%</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}