'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { useUser } from '@/components/providers/UserProvider'
import { getMonthlyTrend, MonthlyData } from '@/lib/supabase/analytics'
import { formatCurrency } from '@/lib/utils'

export default function BalanceChart() {
  const { user } = useUser()
  const { resolvedTheme } = useTheme()
  const [chartData, setChartData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChartData() {
      if (!user?.id) return

      setLoading(true)
      try {
        const data = await getMonthlyTrend(user.id)
        setChartData(data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="compact-card rounded-xl p-4 sm:p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-slate-600 text-sm">Loading chart...</p>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic colors for dark mode
  const isDark = resolvedTheme === 'dark'
  const gridColor = isDark ? '#334155' : '#f1f5f9'
  const axisColor = isDark ? '#94a3b8' : '#94a3b8'
  const labelColor = isDark ? '#f1f5f9' : '#0f172a'
  const tooltipBg = isDark ? 'rgba(30,41,59,0.98)' : 'rgba(255,255,255,0.98)'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a'
  const legendText = isDark ? 'text-slate-300' : 'text-slate-600'

  return (
  <div className="compact-card rounded-xl p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Financial Overview</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Income vs Expenses • Last 12 months
            </p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className={`text-xs sm:text-sm font-medium ${legendText}`}>Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className={`text-xs sm:text-sm font-medium ${legendText}`}>Expenses</span>
            </div>
          </div>
        </div>
      </div>

  <div className="h-32 sm:h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transaction data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 15,
                right: 25,
                left: 15,
                bottom: 15,
              }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.5 : 0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={isDark ? 0.12 : 0.05}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={isDark ? 0.35 : 0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={isDark ? 0.10 : 0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke={axisColor}
                fontSize={12}
                fontWeight={500}
                tickMargin={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke={axisColor}
                fontSize={12}
                fontWeight={500}
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: tooltipText, fontWeight: 600, fontSize: '13px' }}
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '13px',
                  padding: '12px',
                  color: tooltipText
                }}
                cursor={{ stroke: tooltipBorder, strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#incomeGradient)" 
                name="Income"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: isDark ? '#1e293b' : '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                fill="url(#expenseGradient)" 
                name="Expenses"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: isDark ? '#1e293b' : '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}