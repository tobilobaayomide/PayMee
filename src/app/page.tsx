'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatsOverview from '@/components/StatsOverview'
import RecentTransactions from '@/components/RecentTransactions'
import BalanceChart from '@/components/BalanceChart'
import QuickActions from '@/components/QuickActions'
import { MyCardsWidget } from '@/features/cards/MyCardsWidget'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { TransactionProvider } from '@/contexts/TransactionContext'
import { useDashboardStats } from '@/hooks'
import { useUser } from '@/components/providers/UserProvider'
import { SetTransactionPinModal } from '@/components/SetTransactionPinModal'
import { WelcomeModal } from '@/components/WelcomeModal'
import { fetchUserProfile, setTransactionPin, hashTransactionPin, markWelcomeSeen } from '@/lib/supabase/profiles'

export default function Home() {
  const { stats, error, isLoading, refreshStats } = useDashboardStats()
  const { user } = useUser()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showSetPinModal, setShowSetPinModal] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [userName, setUserName] = useState('')

  // Check if user needs to see welcome modal or set transaction PIN
  useEffect(() => {
    async function checkUserStatus() {
      if (!user?.id) {
        console.log('⏳ No user ID available yet')
        return
      }
      
      console.log('🔍 Checking user status for:', user.id)
      
      try {
        const profile = await fetchUserProfile(user.id)
        console.log('📋 User profile loaded:', profile)
        
        // If profile doesn't exist, don't show modals
        if (!profile) {
          console.error('❌ No profile found - trigger may not be working')
          return
        }

        // Store account number and name for modals
        setAccountNumber(profile.account_number)
        setUserName(profile.first_name || '')
        
        // Check if user needs to see welcome modal (first-time user)
        if (!profile.has_seen_welcome) {
          console.log('� New user - showing welcome modal')
          setShowWelcomeModal(true)
          return
        }
        
        // Check if transaction PIN is not set
        const needsPin = profile.transaction_pin_set === false || 
                        profile.transaction_pin_set === null || 
                        profile.transaction_pin_set === undefined
        
        console.log('🎯 Needs PIN?', needsPin)
        
        if (needsPin) {
          console.log('✅ SHOWING TRANSACTION PIN MODAL')
          setShowSetPinModal(true)
        } else {
          console.log('✓ User already has transaction PIN set')
        }
      } catch (error) {
        console.error('❌ Error checking user status:', error)
      } finally {
      }
    }

    checkUserStatus()
  }, [user?.id])

  // Handle welcome modal close - mark as seen and show PIN modal
  const handleWelcomeClose = async () => {
    if (!user?.id) return
    
    try {
      await markWelcomeSeen(user.id)
      console.log('✅ Welcome modal marked as seen')
      setShowWelcomeModal(false)
      
      // Now show the PIN setup modal
      setShowSetPinModal(true)
    } catch (error) {
      console.error('❌ Error marking welcome as seen:', error)
      // Still close the modal and show PIN setup even if marking fails
      setShowWelcomeModal(false)
      setShowSetPinModal(true)
    }
  }

  // Handle setting transaction PIN
  const handleSetTransactionPin = async (pin: string) => {
    if (!user?.id) return
    
    try {
      console.log('Setting transaction PIN for user:', user.id)
      const pinHash = hashTransactionPin(pin)
      await setTransactionPin(user.id, pinHash)
      console.log('Transaction PIN set successfully')
      
      // Reload profile to confirm PIN is set
      const profile = await fetchUserProfile(user.id)
      console.log('Profile after setting PIN:', profile)
    } catch (error) {
      console.error('Error setting transaction PIN:', error)
      throw error
    }
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-red-600">Error loading dashboard: {error}</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <TransactionProvider>
        <DashboardLayout>
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-6 w-full max-w-7xl mx-auto">
            {/* Account Balance Overview */}
            <StatsOverview
              totalBalance={stats.totalBalance}
              totalIncome={stats.totalIncome}
              totalExpenses={stats.totalExpenses}
              balanceChange={stats.balanceChange}
              incomeChange={stats.incomeChange}
              expenseChange={stats.expenseChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full">
                {/* Balance Chart */}
                <BalanceChart />
                {/* On mobile, show QuickActions before RecentTransactions */}
                <div className="block sm:hidden">
                  <QuickActions onTransactionComplete={refreshStats} />
                </div>
                <RecentTransactions />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4 sm:space-y-6 w-full">
                {/* My Cards */}
                <div className="hidden sm:block">
                  <MyCardsWidget />
                </div>

                {/* Quick Actions (desktop only) */}
                <div className="hidden sm:block">
                  <QuickActions onTransactionComplete={refreshStats} />
                </div>
              </div>
            </div>
          </div>
          
        </DashboardLayout>

        {/* Welcome Modal - Shows first for new users */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeClose}
          accountNumber={accountNumber}
          userName={userName}
        />

        {/* Transaction PIN Setup Modal - Shows after welcome */}
        <SetTransactionPinModal
          isOpen={showSetPinModal}
          onClose={() => setShowSetPinModal(false)}
          onSuccess={handleSetTransactionPin}
          canClose={false}
        />
      </TransactionProvider>
    </ProtectedRoute>
  )
}
