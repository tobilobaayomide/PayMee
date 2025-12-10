'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useUser } from '@/components/providers/UserProvider'
import { formatCurrency } from '@/lib/utils'
import { fetchUserCard, updateCardSettings, updateCardBlockStatus, setCardPin, verifyCardPin, hashPin } from '@/lib/supabase/cards'
import { fetchTransactions } from '@/lib/supabase/transactions'
import { useDashboardStats } from '@/hooks'
import type { Card, Transaction } from '@/types'
import {
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  PlusIcon,
  LockClosedIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline' // removed WifiIcon (unused)
import { CardManagementModal } from '@/features/cards/CardManagementModal'
import { BlockCardModal } from '@/features/cards/BlockCardModal'
import { SetPinModal } from '@/features/cards/SetPinModal'
import { PinVerificationModal } from '@/components/PinVerificationModal'

export default function CardsPage() {
  const { user } = useUser()
  const { stats, isLoading: statsLoading, refreshStats } = useDashboardStats()
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [card, setCard] = useState<Card | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showSetPinModal, setShowSetPinModal] = useState(false)
  const [showPinVerifyModal, setShowPinVerifyModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)

  // Load card data, balance, and recent transactions
  useEffect(() => {
    async function loadCardData() {
      if (!user?.id) return

      try {
        setIsLoading(true)
        
        // Fetch card data from database (should be auto-created by trigger on signup)
        const userCard = await fetchUserCard(user.id)
        
        if (!userCard) {
          // No card found - this shouldn't happen if the trigger is set up correctly
          console.error('No card found for user. The database trigger may not be set up.')
          setCard(null)
          setIsLoading(false)
          return
        }
        
        setCard(userCard)
        
        // Fetch recent transactions (last 3)
        const allTransactions = await fetchTransactions(user.id)
        const recent = allTransactions
          .filter(t => !isNaN(t.date.getTime()))
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 3)
        setRecentTransactions(recent)
        
      } catch (error) {
        console.error('Error loading card data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCardData()
  }, [user?.id])

  // Check if PIN needs to be set on mount
  useEffect(() => {
    if (card && !card.pinSet) {
      // Show PIN setup modal for new users
      setShowSetPinModal(true)
    }
  }, [card])

  // Get cardholder name
  const getCardholderName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.toUpperCase()
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0]
      return emailName.replace(/[._]/g, ' ').toUpperCase()
    }
    return 'CARD HOLDER'
  }

  // Generate full card number for display
  const getFullCardNumber = (last4: string) => {
    // Generate a realistic-looking full card number
    // Format: XXXX XXXX XXXX YYYY where YYYY is the last4
    const prefix = '5399' // Mastercard BIN
    
    // Generate middle 8 digits based on user ID for consistency
    const userIdHash = user?.id ? parseInt(user.id.slice(0, 8), 16) : 12345678
    const middle1 = String(userIdHash).slice(0, 4).padStart(4, '0')
    const middle2 = String(userIdHash).slice(4, 8).padStart(4, '0')
    
    return `${prefix} ${middle1} ${middle2} ${last4}`
  }

  // Handle card control toggles
  const handleToggle = async (setting: 'online' | 'international' | 'contactless', value: boolean) => {
    if (!card || isSaving) return

    try {
      setIsSaving(true)
      
  const settings: Record<string, boolean> = {}
      if (setting === 'online') settings.onlineEnabled = value
      if (setting === 'international') settings.internationalEnabled = value
      if (setting === 'contactless') settings.contactlessEnabled = value

      await updateCardSettings(card.id, settings)
      
      // Update local state
      setCard({ ...card, ...settings })
    } catch (error) {
      console.error('Error updating card settings:', error)
      alert('Failed to update card settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Reload card data after modal actions
  const reloadCardData = async () => {
    if (!user?.id) return
    try {
      const userCard = await fetchUserCard(user.id)
      if (userCard) setCard(userCard)
      
      const allTransactions = await fetchTransactions(user.id)
      const recent = allTransactions
        .filter(t => !isNaN(t.date.getTime()))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 3)
      setRecentTransactions(recent)
      
      // Refresh stats
      if (refreshStats) refreshStats()
    } catch (error) {
      console.error('Error reloading card data:', error)
    }
  }

  // Handle set PIN
  const handleSetPin = async (pin: string) => {
    if (!card) return

    try {
      const pinHash = hashPin(pin)
      await setCardPin(card.id, pinHash)
      
      // Reload card data to get updated pinSet from database
      await reloadCardData()
    } catch (error) {
      console.error('Error setting PIN:', error)
      throw error
    }
  }

  // Handle PIN verification
  const handleVerifyPin = async (pin: string) => {
    if (!card) return

    try {
      setIsVerifyingPin(true)
      const pinHash = hashPin(pin)
      const isValid = await verifyCardPin(card.id, pinHash)
      
      if (isValid) {
        setShowPinVerifyModal(false)
        setIsVerifyingPin(false)
        // Execute pending action
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        }
      } else {
        setIsVerifyingPin(false)
        alert('Incorrect PIN. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying PIN:', error)
      setIsVerifyingPin(false)
      alert('Failed to verify PIN. Please try again.')
    }
  }

  // Require PIN verification before sensitive actions
  const requirePinVerification = (action: () => void) => {
    if (!card?.pinSet) {
      alert('Please set up your PIN first')
      setShowSetPinModal(true)
      return
    }
    
    setPendingAction(() => action)
    setShowPinVerifyModal(true)
  }

  // Handle block card (with PIN verification)
  const handleBlockCardClick = () => {
    requirePinVerification(() => setShowBlockModal(true))
  }

  // Handle block card
  const handleBlockCard = async (reason: string) => {
    if (!card || isSaving) return

    try {
      setIsSaving(true)
      const isBlocked = card.isBlocked || false
      await updateCardBlockStatus(card.id, !isBlocked)
      
      // Update local state
      setCard({ ...card, isBlocked: !isBlocked, isActive: isBlocked })
      
      // Log the reason if blocking
      if (!isBlocked && reason) {
        console.log('Card blocked. Reason:', reason)
        // In a real app, you would save this to the database
      }
      
      // Success - no error thrown
    } catch (error) {
      console.error('Error blocking/unblocking card:', error)
      throw error // Let the modal handle the error
    } finally {
      setIsSaving(false)
    }
  }

  // Handle modal success callback
  const handleSettingsSuccess = () => {
    setShowSettingsModal(false)
    reloadCardData()
  }

  // Format relative time for transactions
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diffMs / (1000 * 60))
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    }
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isLoading || statsLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading card data...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!card) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <CreditCardIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Card Found</h3>
            <p className="text-slate-500">You don&apos;t have any cards yet.</p>
            <button className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <PlusIcon className="h-5 w-5" />
              Request Card
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-2 sm:px-0">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">My PayMee Card</h1>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">Manage your PayMee debit card</p>
          </div>

          {/* Stack sections on mobile, grid on desktop */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Card Display */}
            <div className="order-1 lg:col-span-2">
              <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 sm:p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-8">
                  <h2 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">PayMee Debit Card</h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="p-1 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      title={showCardNumber ? "Hide card number" : "Show card number"}
                    >
                      {showCardNumber ? (
                        <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      ) : (
                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="p-1 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Flip card"
                    >
                      <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Card with Flip Animation */}
                <div className="perspective-1000 mb-4 sm:mb-8">
                  <div 
                    className={`relative w-full h-40 sm:h-72 transition-transform duration-700 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front of Card */}
                    <div 
                      className={`absolute inset-0 w-full h-40 sm:h-72 rounded-2xl p-3 sm:p-8 lg:p-10 text-white shadow-xl bg-gradient-to-br from-blue-500 to-${card.isActive ? 'blue-700' : 'purple-600'} overflow-hidden`}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
                      </div>

                      {/* Card Content */}
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white/80 text-xs font-medium tracking-wider uppercase mb-1">{card.bank}</div>
                            <div className="text-white/60 text-xs capitalize">{card.type} Card</div>
                          </div>
                          <div className="w-6 h-6 sm:w-8 sm:h-8">
                            {card.isActive && !card.isBlocked ? (
                              <svg viewBox="0 0 32 32" className="w-full h-full">
                                <rect width="32" height="32" rx="6" fill="white" fillOpacity="0.2"/>
                                <path d="M8 12h16v8H8z" fill="white" fillOpacity="0.3"/>
                                <circle cx="12" cy="16" r="6" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
                                <circle cx="20" cy="16" r="6" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
                              </svg>
                            ) : (
                              <div className="text-white/40 text-xs">{card.isBlocked ? 'BLOCKED' : 'INACTIVE'}</div>
                            )}
                          </div>
                        </div>

                        {/* Card Number - Centered */}
                        <div className="flex-1 flex items-center">
                          <div className="text-white font-mono text-lg sm:text-xl lg:text-2xl tracking-wider">
                            {showCardNumber ? getFullCardNumber(card.last4) : `•••• •••• •••• ${card.last4}`}
                          </div>
                        </div>

                        {/* Card Details - Bottom */}
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-white/60 text-xs mb-1">Card Holder</div>
                            <div className="text-white font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{getCardholderName()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white/60 text-xs mb-1">Expires</div>
                            <div className="text-white font-medium text-sm sm:text-base">{card.expiryDate}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div 
                      className="absolute inset-0 w-full h-40 sm:h-72 rounded-2xl shadow-xl bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {/* Background Pattern for back */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
                      </div>

                      {/* Magnetic Stripe */}
                      <div className="w-full h-6 sm:h-12 bg-black/80 mt-2 sm:mt-6"></div>
                      
                      {/* CVV Area */}
                      <div className="p-2 sm:p-6 lg:p-8 pt-2 sm:pt-6">
                        <div className="bg-white rounded p-2 sm:p-4 mb-3 sm:mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">CVV</span>
                            <span className="text-xs sm:text-sm font-mono text-slate-900">
                              {showCardNumber ? '913' : '•••'}
                            </span>
                          </div>
                        
                        </div>
                        
                        {/* Bank Info */}
                        <div className="text-white space-y-1">
                          <p className="text-xs opacity-70">24/7 Customer Service: 1-800-PAYMEE</p>
                          <p className="text-xs opacity-70">www.paymeebank.com</p>
                          <p className="text-xs opacity-70">This card is property of PayMee Bank Nigeria</p>
                        </div>

                        {/* Card Network Logo */}
                        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8">
                          <div className="w-10 h-6 sm:w-12 sm:h-8 bg-white/20 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-white">VISA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
                  <button 
                    onClick={handleBlockCardClick}
                    disabled={isSaving}
                    className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-600 rounded-lg p-2 sm:p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-center">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                        <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                        {card?.isBlocked ? 'Unblock' : 'Block'}
                      </p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-600 rounded-lg p-2 sm:p-4 hover:bg-slate-50 dark:hover:bg-neutral-600 transition-colors group"
                  >
                    <div className="text-center">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-slate-100 dark:bg-neutral-600 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:bg-slate-200 dark:group-hover:bg-neutral-500 transition-colors">
                        <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">Settings</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar (stacked below on mobile) */}
            <div className="order-2 flex flex-col gap-4">
              {/* Card Summary - hide Card Type on mobile, compact font */}
              <div className="compact-card rounded-xl p-3 sm:p-6">
                <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 sm:mb-4">Card Summary</h3>
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">Available Balance</span>
                    <span className="text-xs sm:text-base font-semibold text-slate-900 dark:text-white">
                      {statsLoading ? '...' : formatCurrency(stats.totalBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">Card Status</span>
                    <span className={`text-xs sm:text-base font-medium ${card?.isBlocked ? 'text-red-600' : card?.isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                      {card?.isBlocked ? 'Blocked' : card?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="hidden sm:flex justify-between">
                    <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">Card Type</span>
                    <span className="text-xs sm:text-base text-slate-900 dark:text-white capitalize">{card?.type} Card</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions - more compact on mobile */}
              <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 sm:mb-4">Recent Transactions</h3>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-1 sm:p-3 bg-slate-50 dark:bg-neutral-800/50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">{transaction.description}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{formatRelativeTime(transaction.date)}</p>
                        </div>
                        <span className={`text-xs sm:text-base font-medium ml-2 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}> 
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No recent transactions</p>
                  </div>
                )}
                <Link href="/transactions" className="block w-full mt-2 sm:mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
                  View All Transactions
                </Link>
              </div>

              {/* Card Controls - compact on mobile */}
              <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 sm:mb-4">Card Controls</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">Online Transactions</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={card?.onlineEnabled || false}
                        onChange={(e) => handleToggle('online', e.target.checked)}
                        disabled={isSaving || card?.isBlocked}
                        className="sr-only peer" 
                      />
                      <div className="w-7 h-4 sm:w-11 sm:h-6 bg-slate-200 dark:bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">International Use</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={card?.internationalEnabled || false}
                        onChange={(e) => handleToggle('international', e.target.checked)}
                        disabled={isSaving || card?.isBlocked}
                        className="sr-only peer" 
                      />
                      <div className="w-7 h-4 sm:w-11 sm:h-6 bg-slate-200 dark:bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">Contactless Payments</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={card?.contactlessEnabled || false}
                        onChange={(e) => handleToggle('contactless', e.target.checked)}
                        disabled={isSaving || card?.isBlocked}
                        className="sr-only peer" 
                      />
                      <div className="w-7 h-4 sm:w-11 sm:h-6 bg-slate-200 dark:bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <SetPinModal />

        <PinVerificationModal
          isOpen={showPinVerifyModal}
          onClose={() => {
            setShowPinVerifyModal(false)
            setPendingAction(null)
            setIsVerifyingPin(false)
          }}
          onVerify={handleVerifyPin}
          isVerifying={isVerifyingPin}
        />

        <BlockCardModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockCard}
          isBlocked={card?.isBlocked || false}
          cardLast4={card?.last4 || '****'}
        />

        <CardManagementModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          card={card}
          onSuccess={handleSettingsSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
