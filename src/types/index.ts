export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  category: string
  date: Date
  status: 'completed' | 'pending' | 'failed'
  reference?: string
}

export interface Card {
  id: string
  type: 'debit' | 'credit'
  last4: string
  bank: string
  expiryDate: string
  balance: number
  isActive: boolean
  color: string
  isBlocked?: boolean
  onlineEnabled?: boolean
  internationalEnabled?: boolean
  contactlessEnabled?: boolean
  pinSet?: boolean
  atmLimit?: number
  onlineLimit?: number
  posLimit?: number
  atmWithdrawalsEnabled?: boolean
}

export interface Account {
  id: string
  name: string
  type: 'savings' | 'current' | 'investment'
  balance: number
  currency: string
  bank: string
  accountNumber: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  bvn: string
  nin: string
  address: {
    street: string
    city: string
    state: string
    country: string
  }
}

export interface DashboardStats {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  monthlyGrowth: number
  transactionCount: number
  activeCards: number
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction'
  is_read: boolean
  link?: string
  transaction_id?: string
  created_at: Date
}