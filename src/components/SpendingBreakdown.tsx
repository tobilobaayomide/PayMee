import { formatCurrency } from '@/lib/utils'
import { CategorySpending } from '@/lib/supabase/analytics'

interface SpendingBreakdownProps {
  data: CategorySpending[]
  dateRangeLabel?: string
}

export default function SpendingBreakdown({ data, dateRangeLabel = 'This period' }: SpendingBreakdownProps) {
  const spendingData = data.length > 0 ? data : []
  const total = spendingData.reduce((sum, item) => sum + item.amount, 0)
  let currentAngle = 0
  
  return (
    <div className="space-y-2">
      {/* Professional Pie Chart - Compact */}
      <div className="flex items-center justify-center relative">
        <div className="relative w-36 h-36">
          {/* Outer ring shadow */}
          <div className="absolute inset-2 rounded-full shadow-lg bg-white dark:bg-neutral-800"></div>
          
          {/* SVG Pie Chart */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {spendingData.map((item, index) => {
              const percentage = (item.amount / total) * 100
              const angle = (percentage / 100) * 360
              const startAngle = currentAngle
              const endAngle = currentAngle + angle
              
              // Calculate path for pie slice
              const startAngleRad = (startAngle * Math.PI) / 180
              const endAngleRad = (endAngle * Math.PI) / 180
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const x1 = 50 + 42 * Math.cos(startAngleRad)
              const y1 = 50 + 42 * Math.sin(startAngleRad)
              const x2 = 50 + 42 * Math.cos(endAngleRad)
              const y2 = 50 + 42 * Math.sin(endAngleRad)
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 42 42 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              currentAngle = endAngle
              
              return (
                <g key={index}>
                  {/* Main slice */}
                  <path
                    d={pathData}
                    fill={item.hex}
                    className="hover:opacity-90 transition-all duration-300 cursor-pointer drop-shadow-sm"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  {/* Hover effect */}
                  <path
                    d={pathData}
                    fill="transparent"
                    className="hover:stroke-slate-400 dark:hover:stroke-slate-600 hover:stroke-2 transition-all duration-300"
                  />
                </g>
              )
            })}
            
            {/* Center circle - uses currentColor to adapt to theme */}
            <circle cx="50" cy="50" r="18" className="fill-white dark:fill-neutral-800 stroke-slate-200 dark:stroke-neutral-700" strokeWidth="1" />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Total</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">₦{(total/1000000).toFixed(1)}M</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Professional Legend - Compact */}
      <div className="space-y-1">
        {spendingData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-neutral-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              {/* Color indicator - use hex for consistency */}
              <div className="relative">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.hex }}></div>
                <div className="absolute inset-0 rounded-full ring-1 ring-white dark:ring-neutral-700"></div>
              </div>
              
              {/* Category info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-xs">{item.category}</p>
                  {item.trend && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      item.trend.startsWith('+') 
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {item.trend}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
            
            {/* Amount */}
            <div className="text-right">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Card */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2 border border-blue-100 dark:border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">Total Spending</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">All categories</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(total)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">{dateRangeLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}