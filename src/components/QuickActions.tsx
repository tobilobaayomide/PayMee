'use client'

import { useState } from 'react'
import { SendMoneyModal } from '@/components/quickactions/SendMoneyModal'
import { ReceiveMoneyModal } from '@/components/quickactions/ReceiveMoneyModal'
import { PayBillsModal } from '@/components/quickactions/PayBillsModal'
import { TopUpModal } from '@/components/quickactions/TopUpModal'
import { InvestmentModal } from '@/components/quickactions/InvestmentModal'
import { ExchangeModal } from '@/components/quickactions/ExchangeModal'
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline'

const actions = [
  {
    name: 'Send Money',
    icon: ArrowUpIcon,
    color: 'bg-blue-600',
    action: 'send_money',
  },
  {
    name: 'Receive',
    icon: ArrowDownIcon,
    color: 'bg-blue-600',
    action: 'receive',
  },
  {
    name: 'Pay Bills',
    icon: BanknotesIcon,
    color: 'bg-blue-600',
    action: 'pay_bills',
  },
  {
    name: 'Top Up',
    icon: CreditCardIcon,
    color: 'bg-blue-600',
    action: 'top_up',
  },
  {
    name: 'Investment',
    icon: PlusCircleIcon,
    color: 'bg-blue-600',
    action: 'investment',
  },
  {
    name: 'Exchange',
    icon: ArrowsRightLeftIcon,
    color: 'bg-blue-600',
    action: 'exchange',
  },
]

export default function QuickActions({ onTransactionComplete }: { onTransactionComplete?: () => void }) {
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false)
  const [isReceiveMoneyOpen, setIsReceiveMoneyOpen] = useState(false)
  const [isPayBillsOpen, setIsPayBillsOpen] = useState(false)
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [isInvestmentOpen, setIsInvestmentOpen] = useState(false)
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'send_money':
        setIsSendMoneyOpen(true)
        break
      case 'receive':
        setIsReceiveMoneyOpen(true)
        break
      case 'pay_bills':
        setIsPayBillsOpen(true)
        break
      case 'top_up':
        setIsTopUpOpen(true)
        break
      case 'investment':
        setIsInvestmentOpen(true)
        break
      case 'exchange':
        setIsExchangeOpen(true)
        break
      default:
        break
    }
  }

  const handleSendMoneySuccess = (transaction: any) => {
    // Refresh dashboard stats
    console.log('Money sent successfully:', transaction)
    if (onTransactionComplete) {
      onTransactionComplete()
    }
  }

  const handlePayBillSuccess = (transaction: any) => {
    // Refresh dashboard stats
    console.log('Bill paid successfully:', transaction)
    if (onTransactionComplete) {
      onTransactionComplete()
    }
  }

  const handleTopUpSuccess = (transaction: any) => {
    // Refresh dashboard stats
    console.log('Top up successful:', transaction)
    if (onTransactionComplete) {
      onTransactionComplete()
    }
  }

  const handleInvestmentSuccess = (transaction: any) => {
    // Refresh dashboard stats
    console.log('Investment created successfully:', transaction)
    if (onTransactionComplete) {
      onTransactionComplete()
    }
  }

  const handleExchangeSuccess = (transaction: any) => {
    // Refresh dashboard stats
    console.log('Exchange completed successfully:', transaction)
    if (onTransactionComplete) {
      onTransactionComplete()
    }
  }

  return (
    <div className="compact-card rounded-xl p-4 sm:p-5 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Quick Actions
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 uppercase tracking-wide">Fast transactions</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={() => handleActionClick(action.action)}
            className="group p-2 sm:p-3 rounded-lg border border-slate-200 dark:border-neutral-800 text-center transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md hover:scale-105 bg-white dark:bg-neutral-900"
          >
            <div className={`inline-flex p-1.5 sm:p-2 rounded-md ${action.color} mb-1 sm:mb-2 group-hover:shadow-md transition-all duration-200`}>
              <action.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
              {action.name}
            </p>
          </button>
        ))}
      </div>

      {/* Send Money Modal */}
      <SendMoneyModal
        isOpen={isSendMoneyOpen}
        onClose={() => setIsSendMoneyOpen(false)}
        onSuccess={handleSendMoneySuccess}
      />

      {/* Receive Money Modal */}
      <ReceiveMoneyModal
        isOpen={isReceiveMoneyOpen}
        onClose={() => setIsReceiveMoneyOpen(false)}
      />

      {/* Pay Bills Modal */}
      <PayBillsModal
        isOpen={isPayBillsOpen}
        onClose={() => setIsPayBillsOpen(false)}
        onSuccess={handlePayBillSuccess}
      />

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
      />

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isInvestmentOpen}
        onClose={() => setIsInvestmentOpen(false)}
        onSuccess={handleInvestmentSuccess}
      />

      {/* Exchange Modal */}
      <ExchangeModal
        isOpen={isExchangeOpen}
        onClose={() => setIsExchangeOpen(false)}
        onSuccess={handleExchangeSuccess}
      />
    </div>
  )
}