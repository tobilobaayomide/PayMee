import {
  HomeIcon,
  CreditCardIcon,
  ChartBarIcon,
  ListBulletIcon,
  CogIcon,
} from '@heroicons/react/24/outline'
import { NavigationItem } from '@/types'

export const mainNavigation: NavigationItem[] = [
  { 
    name: 'Overview', 
    href: '/dashboard', 
    icon: HomeIcon,
    description: 'Dashboard overview and account summary'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon,
    description: 'Financial insights and spending analysis'
  },
  { 
    name: 'Transactions', 
    href: '/transactions', 
    icon: ListBulletIcon,
    description: 'Transaction history and management'
  },
  { 
    name: 'Cards', 
    href: '/cards', 
    icon: CreditCardIcon,
    description: 'Payment cards and card management'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon,
    description: 'Account settings and preferences'
  },
]

// You can also add other navigation groups if needed
export const secondaryNavigation: NavigationItem[] = [
  // Add secondary navigation items here if needed in the future
]

// Helper function to get current page info
export const getCurrentPageInfo = (pathname: string): NavigationItem | null => {
  return mainNavigation.find(item => item.href === pathname) || null
}