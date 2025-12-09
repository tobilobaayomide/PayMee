'use client'

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { MonthlyData } from '@/lib/supabase/analytics'
import { useTheme } from 'next-themes'

interface AnalyticsChartsProps {
  data: MonthlyData[]
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Get last 5 months from data
  const last5Months = data.slice(-5)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const chartHeight = isMobile ? 120 : 192 // h-30 for mobile, h-48 for desktop
  const axisFontSize = isMobile ? 10 : 12
  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Chart Container - removed extra wrapper, using compact-card from parent */}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={last5Months}
            margin={{
              top: 15,
              right: 25,
              left: 15,
              bottom: 15,
            }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#334155' : '#f1f5f9'} 
              vertical={false} 
            />
            <XAxis 
              dataKey="month" 
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={axisFontSize}
              fontWeight={500}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={axisFontSize}
              fontWeight={500}
              tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
              width={isMobile ? 40 : 60}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelStyle={{ 
                color: isDark ? '#f1f5f9' : '#0f172a', 
                fontWeight: 600, 
                fontSize: '13px' 
              }}
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '13px',
                padding: '12px',
                color: isDark ? '#f1f5f9' : '#0f172a'
              }}
              cursor={{ stroke: isDark ? '#475569' : '#e2e8f0', strokeWidth: 1 }}
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
      </div>
    </div>
  )
}