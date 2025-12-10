import type { Card } from '../../types';
/**
 * Get payment method usage breakdown for the specified date range
 */
export async function getPaymentMethodUsage(
  userId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<{ method: string; count: number; percentage: number }[]> {
  const supabase = createClient()

  let query = supabase
    .from('transactions')
    .select('payment_method')
    .eq('user_id', userId)

  if (startDate) {
    query = query.gte('date', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('date', endDate.toISOString())
  }

  const { data: transactions, error } = await query
  if (error || !transactions) {
    console.error('Error fetching payment method usage:', error)
    return []
  }

  // Count usage per method
  const methodMap = new Map<string, number>()
  let total = 0
  transactions.forEach((t: { payment_method?: string }) => {
    const method = t.payment_method || 'Other'
    methodMap.set(method, (methodMap.get(method) || 0) + 1)
    total++
  })

  // Convert to array with percentages
  return Array.from(methodMap.entries()).map(([method, count]) => ({
    method,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  })).sort((a, b) => b.count - a.count)
}
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'

// Category color mapping for consistency
const CATEGORY_COLORS = {
  'Investment': { color: 'bg-purple-500', hex: '#8b5cf6' },
  'Food & Dining': { color: 'bg-blue-500', hex: '#3b82f6' },
  'Food': { color: 'bg-blue-400', hex: '#60a5fa' },
  'Groceries': { color: 'bg-green-500', hex: '#22c55e' },
  'Rent': { color: 'bg-orange-600', hex: '#ea580c' },
  'Bills': { color: 'bg-yellow-400', hex: '#facc15' },
  'Utilities': { color: 'bg-emerald-500', hex: '#10b981' },
  'Transportation': { color: 'bg-orange-500', hex: '#f97316' },
  'Transfer': { color: 'bg-cyan-500', hex: '#06b6d4' },
  'Exchange': { color: 'bg-fuchsia-500', hex: '#d946ef' },
  'Entertainment': { color: 'bg-pink-500', hex: '#ec4899' },
  'Shopping': { color: 'bg-indigo-500', hex: '#6366f1' },
  'Healthcare': { color: 'bg-red-500', hex: '#ef4444' },
  'Education': { color: 'bg-yellow-500', hex: '#eab308' },
  'Other Expenses': { color: 'bg-slate-400', hex: '#94a3b8' },
  'Others': { color: 'bg-slate-500', hex: '#64748b' },
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
}

export interface CategorySpending {
  category: string
  amount: number
  percentage: number
  color: string
  hex: string
  trend: string
}

export interface AnalyticsData {
  monthlyGrowth: number | null
  avgMonthlyIncome: number
  avgMonthlyExpenses: number
  savingsRate: number
  topSpendingCategory: string
  topSpendingAmount: number
  transactionCount: number
  cardsUsed: number
  incomeGrowth: number  // New: growth in income compared to previous period
  savingsGrowth: number // New: growth in savings rate compared to previous period
  healthScore: number   // 0-100
  healthGrade: string   // e.g. 'A', 'B+', etc.
}

export interface DashboardStats {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  monthlyGrowth: number
  transactionCount: number
  activeCards: number
}

/**
 * Get monthly income and expense data for the specified date range
 */
export async function getMonthlyTrend(
  userId: string, 
  startDate: Date | null = null, 
  endDate: Date | null = null
): Promise<MonthlyData[]> {
  const supabase = createClient()

  // Build query with date filter if provided
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (startDate) {
    query = query.gte('date', startDate.toISOString())
  }
  if (endDate) {
    query = query.lte('date', endDate.toISOString())
  }

  const { data: transactions, error } = await query

  if (error) {
    console.error('Error fetching transactions for monthly trend:', error)
    return []
  }

  if (!transactions || transactions.length === 0) {
    console.log('No transactions found for user:', userId)
    return []
  }

  console.log(`Found ${transactions.length} transactions for monthly trend`)

  // Group by month and year, and find min/max month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyMap = new Map<string, { income: number; expenses: number }>()
  let minYear = 9999, minMonth = 0, maxYear = 0, maxMonth = 0;

  transactions?.forEach((transaction: { date?: string, created_at?: string, type: string, amount: number }) => {
    // IMPORTANT: Use 'date' field first (the actual transaction date), not 'created_at'
    let date: Date
    if (transaction.date) {
      date = new Date(transaction.date)
    } else if (transaction.created_at) {
      date = new Date(transaction.created_at)
    } else {
      console.warn('Transaction has no date:', transaction)
      return // Skip this transaction
    }
    
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    
    console.log(`Transaction: ${transaction.type} ₦${transaction.amount.toLocaleString()} on ${date.toLocaleDateString()} -> ${monthNames[month]} ${year}`)
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { income: 0, expenses: 0 })
    }
    if (year < minYear || (year === minYear && month < minMonth)) {
      minYear = year; minMonth = month;
    }
    if (year > maxYear || (year === maxYear && month > maxMonth)) {
      maxYear = year; maxMonth = month;
    }
    const monthData = monthlyMap.get(key)!
    if (transaction.type === 'income') {
      monthData.income += transaction.amount
    } else if (transaction.type === 'expense') {
      monthData.expenses += transaction.amount
    }
  })

  // Fill in all months between min and max
  const result: MonthlyData[] = []
  let y = minYear, m = minMonth
  while (y < maxYear || (y === maxYear && m <= maxMonth)) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}`
    const data = monthlyMap.get(key) || { income: 0, expenses: 0 }
    result.push({
      month: `${monthNames[m]} ${y}`,
      income: data.income,
      expenses: data.expenses,
    })
    m++
    if (m > 11) { m = 0; y++; }
  }
  
  console.log('Monthly trend data:', result)
  
  // Only show last 12 months if more
  return result.slice(-12)
}

/**
 * Get spending breakdown by category for the specified date range
 */
export async function getCategorySpending(
  userId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<CategorySpending[]> {
  const supabase = createClient()

  // Calculate comparison period (same length as selected period, but before it)
  let currentStartDate: Date
  let currentEndDate: Date
  let lastStartDate: Date
  let lastEndDate: Date

  if (startDate && endDate) {
    currentStartDate = startDate
    currentEndDate = endDate
    const periodLength = endDate.getTime() - startDate.getTime()
    lastEndDate = new Date(startDate.getTime() - 1)
    lastStartDate = new Date(lastEndDate.getTime() - periodLength)
  } else {
    // Default to current month vs last month
    currentEndDate = new Date()
    currentStartDate = new Date()
    currentStartDate.setDate(1)
    currentStartDate.setHours(0, 0, 0, 0)
    
    lastEndDate = new Date(currentStartDate.getTime() - 1)
    lastStartDate = new Date(lastEndDate)
    lastStartDate.setDate(1)
    lastStartDate.setHours(0, 0, 0, 0)
  }

  // Get current period transactions
  const currentQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', currentStartDate.toISOString())
    .lte('date', currentEndDate.toISOString())

  // Get previous period transactions for comparison
  const lastQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', lastStartDate.toISOString())
    .lte('date', lastEndDate.toISOString())

  const { data: currentPeriodTransactions, error: currentError } = await currentQuery
  const { data: lastPeriodTransactions } = await lastQuery

  if (currentError) {
    console.error('Error fetching current period transactions:', currentError)
    return []
  }

  // Group by category for current period
  const categoryMap = new Map<string, number>()
  let total = 0

  currentPeriodTransactions?.forEach((transaction: Transaction) => {
    const category = transaction.category || 'Others'
    const amount = categoryMap.get(category) || 0
    categoryMap.set(category, amount + transaction.amount)
    total += transaction.amount
  })

  // Group by category for last period (for trend)
  const lastPeriodCategoryMap = new Map<string, number>()
  lastPeriodTransactions?.forEach((transaction: Transaction) => {
    const category = transaction.category || 'Others'
    const amount = lastPeriodCategoryMap.get(category) || 0
    lastPeriodCategoryMap.set(category, amount + transaction.amount)
  })

  // Convert to array and calculate percentages and trends
  const categoryArray: CategorySpending[] = Array.from(categoryMap.entries()).map(([category, amount]) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0
    // Calculate trend
    const lastPeriodAmount = lastPeriodCategoryMap.get(category) || 0
    let trend = ''
    if (lastPeriodAmount > 0) {
      const trendValue = ((amount - lastPeriodAmount) / lastPeriodAmount) * 100
      trend = trendValue >= 0 ? `+${trendValue.toFixed(1)}%` : `${trendValue.toFixed(1)}%`
    }

    // Get color or default
    const colors = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS['Others']

    return {
      category,
      amount,
      percentage,
      color: colors.color,
      hex: colors.hex,
      trend,
    }
  })

  // Sort by amount descending
  return categoryArray.sort((a, b) => b.amount - a.amount)
}

/**
 * Get analytics overview data for the specified date range
 */
export async function getAnalyticsOverview(
  userId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<AnalyticsData> {
  const supabase = createClient()

  // Calculate date ranges
  let currentStartDate: Date
  let currentEndDate: Date
  let lastStartDate: Date
  let lastEndDate: Date

  if (startDate && endDate) {
    currentStartDate = startDate
    currentEndDate = endDate
    const periodLength = endDate.getTime() - startDate.getTime()
    lastEndDate = new Date(startDate.getTime() - 1)
    lastStartDate = new Date(lastEndDate.getTime() - periodLength)
  } else {
    // Default to current month vs last month
    currentEndDate = new Date()
    currentStartDate = new Date()
    currentStartDate.setDate(1)
    currentStartDate.setHours(0, 0, 0, 0)
    
    lastEndDate = new Date(currentStartDate.getTime() - 1)
    lastStartDate = new Date(lastEndDate)
    lastStartDate.setDate(1)
    lastStartDate.setHours(0, 0, 0, 0)
  }

  // Get all transactions for average calculations
  let allQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
  
  if (startDate) {
    allQuery = allQuery.gte('date', startDate.toISOString())
  }
  if (endDate) {
    allQuery = allQuery.lte('date', endDate.toISOString())
  }

  // Get current period transactions
  const currentQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', currentStartDate.toISOString())
    .lte('date', currentEndDate.toISOString())

  // Get last period transactions
  const lastQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', lastStartDate.toISOString())
    .lte('date', lastEndDate.toISOString())

  // Get cards
  const cardsQuery = supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  const [
    { data: allTransactions, error: allError },
    { data: currentPeriodTransactions, error: currentError },
  { data: lastPeriodTransactions },
  { data: cards }
  ] = await Promise.all([allQuery, currentQuery, lastQuery, cardsQuery])

  if (allError || currentError) {
    console.error('Error fetching analytics data:', { allError, currentError })
    return {
      monthlyGrowth: null,
      avgMonthlyIncome: 0,
      avgMonthlyExpenses: 0,
      savingsRate: 0,
      topSpendingCategory: 'N/A',
      topSpendingAmount: 0,
      transactionCount: 0,
      cardsUsed: cards?.length || 0,
      incomeGrowth: 0,
      savingsGrowth: 0,
      healthScore: 0,
      healthGrade: 'F',
    }
  }

  // Calculate current period totals
  let currentIncome = 0
  let currentExpenses = 0
  currentPeriodTransactions?.forEach((t: Transaction) => {
    if (t.type === 'income') currentIncome += t.amount
    if (t.type === 'expense') currentExpenses += t.amount
  })

  // Calculate last period totals
  let lastIncome = 0
  let lastExpenses = 0
  lastPeriodTransactions?.forEach((t: Transaction) => {
    if (t.type === 'income') lastIncome += t.amount
    if (t.type === 'expense') lastExpenses += t.amount
  })

  // Calculate period growth (comparing net income)
  const lastPeriodNet = lastIncome - lastExpenses
  const currentPeriodNet = currentIncome - currentExpenses
  let monthlyGrowth: number | null = null
  if (lastPeriodNet > 0) {
    const rawGrowth = ((currentPeriodNet - lastPeriodNet) / lastPeriodNet) * 100
    // Clamp to a reasonable range (e.g., -100% to +100%)
    monthlyGrowth = Math.max(-100, Math.min(100, rawGrowth))
  } else {
    monthlyGrowth = null // Will display as N/A
  }

  // Calculate averages (from all transactions in selected period)
  const monthsMap = new Map<string, { income: number; expenses: number }>()
  allTransactions?.forEach((t: { date?: string, created_at?: string, type: string, amount: number }) => {
  const dateString = t.date ?? t.created_at;
  if (!dateString) return;
  const date = new Date(dateString);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    const monthData = monthsMap.get(monthKey) || { income: 0, expenses: 0 }
    
    if (t.type === 'income') monthData.income += t.amount
    if (t.type === 'expense') monthData.expenses += t.amount
    
    monthsMap.set(monthKey, monthData)
  })

  const monthCount = monthsMap.size || 1
  const totalIncome = Array.from(monthsMap.values()).reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = Array.from(monthsMap.values()).reduce((sum, m) => sum + m.expenses, 0)

  const avgMonthlyIncome = totalIncome / monthCount
  const avgMonthlyExpenses = totalExpenses / monthCount
  const savingsRate = avgMonthlyIncome > 0 
    ? ((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome) * 100 
    : 0

  // Calculate income growth
  const incomeGrowth = lastIncome > 0 
    ? ((currentIncome - lastIncome) / lastIncome) * 100 
    : (currentIncome > 0 ? 100 : 0)

  // Calculate previous period savings rate for comparison
  const lastPeriodSavingsRate = lastIncome > 0 
    ? ((lastIncome - lastExpenses) / lastIncome) * 100 
    : 0
  const currentPeriodSavingsRate = currentIncome > 0 
    ? ((currentIncome - currentExpenses) / currentIncome) * 100 
    : 0
  const savingsGrowth = lastPeriodSavingsRate > 0
    ? ((currentPeriodSavingsRate - lastPeriodSavingsRate) / lastPeriodSavingsRate) * 100
    : 0

  // Find top spending category (current period)
  const categoryMap = new Map<string, number>()
  currentPeriodTransactions?.forEach((t: Transaction) => {
    if (t.type === 'expense') {
      const category = t.category || 'Others'
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount)
    }
  })

  let topSpendingCategory = 'N/A'
  let topSpendingAmount = 0
  categoryMap.forEach((amount, category) => {
    if (amount > topSpendingAmount) {
      topSpendingAmount = amount
      topSpendingCategory = category
    }
  })

  // --- Financial Health Score Calculation ---
  let healthScore = 0
  if (currentPeriodTransactions?.length) {
    if (savingsRate >= 60) healthScore = 100
    else if (savingsRate >= 40) healthScore = 80
    else if (savingsRate >= 20) healthScore = 60
    else if (savingsRate >= 0) healthScore = 40
    else healthScore = 20
    // Bonus for high income, penalty for high expenses
    if (avgMonthlyIncome > 0 && avgMonthlyExpenses / avgMonthlyIncome < 0.5) healthScore += 10
    if (avgMonthlyExpenses / avgMonthlyIncome > 0.8) healthScore -= 10
    healthScore = Math.max(0, Math.min(100, healthScore))
  }
  let healthGrade = 'C'
  if (healthScore >= 95) healthGrade = 'A+'
  else if (healthScore >= 85) healthGrade = 'A'
  else if (healthScore >= 75) healthGrade = 'B+'
  else if (healthScore >= 65) healthGrade = 'B'
  else if (healthScore >= 55) healthGrade = 'C+'
  else if (healthScore >= 45) healthGrade = 'C'
  else if (healthScore >= 35) healthGrade = 'D'
  else healthGrade = 'F'

  return {
    monthlyGrowth,
    avgMonthlyIncome,
    avgMonthlyExpenses,
    savingsRate,
    topSpendingCategory,
    topSpendingAmount,
    transactionCount: allTransactions?.length || 0,
    cardsUsed: cards?.length || 0,
    incomeGrowth,
    savingsGrowth,
    healthScore,
    healthGrade,
  }
}

/**
 * Get dashboard stats for the specified date range
 */
export async function getDashboardStats(
  userId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<DashboardStats> {
  const supabase = createClient()

  // Calculate date ranges
  let currentStartDate: Date
  let currentEndDate: Date
  let lastStartDate: Date
  let lastEndDate: Date

  if (startDate && endDate) {
    currentStartDate = startDate
    currentEndDate = endDate
    const periodLength = endDate.getTime() - startDate.getTime()
    lastEndDate = new Date(startDate.getTime() - 1)
    lastStartDate = new Date(lastEndDate.getTime() - periodLength)
  } else {
    // Default to current month vs last month
    currentEndDate = new Date()
    currentStartDate = new Date()
    currentStartDate.setDate(1)
    currentStartDate.setHours(0, 0, 0, 0)
    
    lastEndDate = new Date(currentStartDate.getTime() - 1)
    lastStartDate = new Date(lastEndDate)
    lastStartDate.setDate(1)
    lastStartDate.setHours(0, 0, 0, 0)
  }

  // Get current period transactions
  const currentQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', currentStartDate.toISOString())
    .lte('date', currentEndDate.toISOString())

  // Get last period transactions
  const lastQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', lastStartDate.toISOString())
    .lte('date', lastEndDate.toISOString())

  // Get cards
  const cardsQuery = supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  const [
    { data: currentPeriodTransactions, error: currentError },
  { data: lastPeriodTransactions },
  { data: cards }
  ] = await Promise.all([currentQuery, lastQuery, cardsQuery])

  if (currentError) {
  console.error('Error fetching dashboard stats:', { currentError })
    return {
      totalBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      monthlyGrowth: 0,
      transactionCount: 0,
      activeCards: cards?.length || 0,
    }
  }

  // Calculate current period totals
  let totalIncome = 0
  let totalExpenses = 0
  currentPeriodTransactions?.forEach((t: Transaction) => {
    if (t.type === 'income') totalIncome += t.amount
    if (t.type === 'expense') totalExpenses += t.amount
  })

  // Calculate last period totals for growth
  let lastIncome = 0
  let lastExpenses = 0
  lastPeriodTransactions?.forEach((t: Transaction) => {
    if (t.type === 'income') lastIncome += t.amount
    if (t.type === 'expense') lastExpenses += t.amount
  })

  const lastPeriodNet = lastIncome - lastExpenses
  const currentPeriodNet = totalIncome - totalExpenses
  const monthlyGrowth = lastPeriodNet > 0 
    ? ((currentPeriodNet - lastPeriodNet) / lastPeriodNet) * 100 
    : 0

  // Calculate total balance from cards
  const totalBalance = cards?.reduce((sum: number, card: Card) => sum + (card.balance || 0), 0) || 0

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    monthlyGrowth,
    transactionCount: currentPeriodTransactions?.length || 0,
    activeCards: cards?.length || 0,
  }
}
