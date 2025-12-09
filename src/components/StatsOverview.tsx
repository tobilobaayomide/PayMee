'use client'

import { 
  BanknotesIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ComponentType<{ className?: string }>
  iconBgColor: string
  iconColor: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconBgColor, 
  iconColor 
}: StatCardProps) {
  // Convert light colors to dark mode compatible versions
  const getDarkBgColor = (lightColor: string) => {
    if (lightColor.includes('blue')) return 'dark:bg-blue-500/10'
    if (lightColor.includes('green')) return 'dark:bg-green-500/10'
    if (lightColor.includes('red')) return 'dark:bg-red-500/10'
    return 'dark:bg-slate-500/10'
  }
  
  const getDarkIconColor = (lightColor: string) => {
    if (lightColor.includes('blue')) return 'dark:text-blue-400'
    if (lightColor.includes('green')) return 'dark:text-green-400'
    if (lightColor.includes('red')) return 'dark:text-red-400'
    return 'dark:text-slate-400'
  }
  
  return (
    <div className="compact-card rounded-xl p-3 sm:p-4">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 sm:p-2 ${iconBgColor} ${getDarkBgColor(iconBgColor)} rounded-lg flex-shrink-0`}>
            <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${iconColor} ${getDarkIconColor(iconColor)}`} />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(value)}
          </p>
          <span className={`text-xs font-semibold px-1.5 sm:px-2 py-1 rounded flex-shrink-0 ${
            changeType === 'positive' 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
          }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  )
}

interface StatsOverviewProps {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  balanceChange?: string
  incomeChange?: string
  expenseChange?: string
}

export default function StatsOverview({ 
  totalBalance, 
  totalIncome, 
  totalExpenses,
  balanceChange = '0.0',
  incomeChange = '0.0',
  expenseChange = '0.0'
}: StatsOverviewProps) {
  // Format change values with + or - sign
  const formatChange = (change: string) => {
    const numChange = parseFloat(change)
    return numChange >= 0 ? `+${change}%` : `${change}%`
  }

  // Determine if change is positive or negative
  const getChangeType = (change: string): 'positive' | 'negative' => {
    return parseFloat(change) >= 0 ? 'positive' : 'negative'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        title="Account Balance"
        value={totalBalance}
        change={formatChange(balanceChange)}
        changeType={getChangeType(balanceChange)}
        icon={BanknotesIcon}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />
      <div className="hidden sm:block">
        <StatCard
          title="Money In"
          value={totalIncome}
          change={formatChange(incomeChange)}
          changeType={getChangeType(incomeChange)}
          icon={ArrowUpIcon}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>
      <div className="hidden sm:block">
        <StatCard
          title="Money Out"
          value={totalExpenses}
          change={formatChange(expenseChange)}
          changeType={getChangeType(expenseChange)}
          icon={ArrowUpIcon}
          iconBgColor="bg-red-50"
          iconColor="text-red-600 rotate-180"
        />
      </div>
    </div>
  )
}