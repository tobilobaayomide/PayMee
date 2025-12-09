'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useUser } from '@/components/providers/UserProvider'
import { createClient } from '@/lib/supabase/client'
import { 
  fetchUserProfile, 
  updateUserProfile, 
  updateUserEmail,
  updateUserMetadata,
  updateUserPassword,
  uploadAvatar,
  type UserProfile 
} from '@/lib/supabase/profiles'
import {
  fetchUserSessions,
  revokeSession,
  createSession,
  type UserSession
} from '@/lib/supabase/sessions'
import {
  fetchCardWithLimits,
  updateCardLimits,
  updateCardControls
} from '@/lib/supabase/cards'
import {
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

type NotificationPreferences = {
  transactions: boolean
  security: boolean
  marketing: boolean
  email: boolean
  push: boolean
  sms: boolean
}

export default function SettingsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 2FA states
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [phoneForVerification, setPhoneForVerification] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  
  // Sessions states
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  
  // Card states
  const [cardId, setCardId] = useState<string | null>(null)
  const [atmLimit, setAtmLimit] = useState('')
  const [onlineLimit, setOnlineLimit] = useState('')
  const [posLimit, setPosLimit] = useState('')
  const [cardControls, setCardControls] = useState({
    onlineEnabled: true,
    internationalEnabled: false,
    contactlessEnabled: true,
    atmWithdrawalsEnabled: true
  })
  
  // Notifications
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    transactions: true,
    security: true,
    marketing: false,
    email: true,
    push: true,
    sms: false
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'cards', name: 'Cards & Limits', icon: CreditCardIcon }
  ]

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return
      
      setLoading(true)
      try {
        // Get data from profiles table
        const data = await fetchUserProfile(user.id)
        
        // Merge with auth.users metadata (prioritize what exists)
        const authFirstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0]
        const authLastName = user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ')
        
        if (data) {
          setProfile(data)
          // Use profiles table data first, fallback to auth metadata
          setFirstName(data.first_name || authFirstName || '')
          setLastName(data.last_name || authLastName || '')
          setPhone(data.phone || user.user_metadata?.phone || '')
          setAvatarPreview(data.avatar_url || user.user_metadata?.avatar_url)
          if (data.notification_preferences) {
            setNotifications(data.notification_preferences as NotificationPreferences)
          }
        } else {
          // If no profile exists, use auth metadata
          setFirstName(authFirstName || '')
          setLastName(authLastName || '')
          setPhone(user.user_metadata?.phone || '')
          setAvatarPreview(user.user_metadata?.avatar_url)
        }
        setEmail(user.email || '')
        
        console.log('📋 Loaded profile data:', {
          fromProfiles: data,
          fromAuth: {
            first_name: authFirstName,
            last_name: authLastName,
            phone: user.user_metadata?.phone,
            avatar: user.user_metadata?.avatar_url
          },
          final: {
            firstName: data?.first_name || authFirstName,
            lastName: data?.last_name || authLastName
          }
        })
        
        // Load card data
        const cardData = await fetchCardWithLimits(user.id)
        if (cardData) {
          setCardId(cardData.id)
          setAtmLimit(cardData.atm_limit?.toString() || '200000')
          setOnlineLimit(cardData.online_limit?.toString() || '500000')
          setPosLimit(cardData.pos_limit?.toString() || '1000000')
          setCardControls({
            onlineEnabled: cardData.online_enabled ?? true,
            internationalEnabled: cardData.international_enabled ?? false,
            contactlessEnabled: cardData.contactless_enabled ?? true,
            atmWithdrawalsEnabled: cardData.atm_withdrawals_enabled ?? true
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        showMessage('error', 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Helper to show messages
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user?.id) return
    
    setSaving(true)
    try {
      // Upload avatar if changed
      if (avatarFile) {
        await uploadAvatar(user.id, avatarFile)
      }

      // Update profile in profiles table
      await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null
      })

      // Also update auth.users metadata to keep in sync
      const fullName = `${firstName} ${lastName}`.trim()
      await updateUserMetadata({
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone: phone || null
      })

      // Update email if changed
      if (email !== user.email) {
        await updateUserEmail(email)
        showMessage('success', 'Profile updated! Please check your email to confirm the new address.')
      } else {
        showMessage('success', 'Profile updated successfully!')
      }

      // Reload profile
      const updated = await fetchUserProfile(user.id)
      if (updated) setProfile(updated)
      
      console.log('✅ Profile saved:', { firstName, lastName, phone, email })
    } catch (error: any) {
      console.error('Error saving profile:', error)
      showMessage('error', error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      await updateUserPassword(newPassword)
      showMessage('success', 'Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error changing password:', error)
      showMessage('error', error.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  // Save notifications
  const handleSaveNotifications = async () => {
    if (!user?.id) return
    
    setSaving(true)
    try {
      await updateUserProfile(user.id, {
        notification_preferences: notifications
      })
      showMessage('success', 'Notification preferences saved!')
    } catch (error: any) {
      console.error('Error saving notifications:', error)
      showMessage('error', error.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  // Save card limits
  const handleSaveCardLimits = async () => {
    if (!cardId) {
      showMessage('error', 'No card found. Please contact support.')
      return
    }

    setSaving(true)
    try {
      // Parse and validate limits
      const atmLimitNum = parseFloat(atmLimit.replace(/[^0-9.]/g, ''))
      const onlineLimitNum = parseFloat(onlineLimit.replace(/[^0-9.]/g, ''))
      const posLimitNum = parseFloat(posLimit.replace(/[^0-9.]/g, ''))

      if (isNaN(atmLimitNum) || isNaN(onlineLimitNum) || isNaN(posLimitNum)) {
        throw new Error('Invalid limit values')
      }

      // Update limits in database
      await updateCardLimits(cardId, {
        atmLimit: atmLimitNum,
        onlineLimit: onlineLimitNum,
        posLimit: posLimitNum
      })

      // Update controls in database
      await updateCardControls(cardId, cardControls)

      showMessage('success', 'Card settings updated successfully!')
    } catch (error: any) {
      console.error('Error saving card settings:', error)
      showMessage('error', error.message || 'Failed to save card settings')
    } finally {
      setSaving(false)
    }
  }

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const updateCardControl = (key: string, value: boolean) => {
    setCardControls(prev => ({ ...prev, [key]: value }))
  }

  // Format currency for display
  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    if (!num) return ''
    return `₦${parseInt(num).toLocaleString()}`
  }

  const handleLimitChange = (setter: (value: string) => void, value: string) => {
    // Remove non-numeric characters except for the naira symbol
    const numericValue = value.replace(/[^0-9]/g, '')
    setter(numericValue)
  }

  // Handle 2FA setup
  const handleSetup2FA = () => {
    if (!phone) {
      showMessage('error', 'Please add a phone number in your profile first')
      return
    }
    setPhoneForVerification(phone)
    setShow2FAModal(true)
  }

  const handleSendVerificationCode = async () => {
    if (!phoneForVerification) {
      showMessage('error', 'Please enter a phone number')
      return
    }

    setSaving(true)
    try {
      // In a real app, you would send an SMS via Twilio or similar service
      // For now, we'll simulate it
      console.log('Sending verification code to:', phoneForVerification)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setVerificationSent(true)
      showMessage('success', 'Verification code sent to your phone!')
    } catch (error: any) {
      console.error('Error sending verification code:', error)
      showMessage('error', 'Failed to send verification code')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      showMessage('error', 'Please enter the verification code')
      return
    }

    setSaving(true)
    try {
      // In a real app, you would verify the code with your backend
      // For now, we'll simulate it (accept any 6-digit code)
      if (verificationCode.length !== 6) {
        throw new Error('Verification code must be 6 digits')
      }

      console.log('Verifying code:', verificationCode)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTwoFactorEnabled(true)
      setShow2FAModal(false)
      setVerificationCode('')
      setVerificationSent(false)
      showMessage('success', '2FA enabled successfully!')
    } catch (error: any) {
      console.error('Error verifying code:', error)
      showMessage('error', error.message || 'Invalid verification code')
    } finally {
      setSaving(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      return
    }

    setSaving(true)
    try {
      // In a real app, you would disable 2FA on the backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTwoFactorEnabled(false)
      showMessage('success', '2FA disabled successfully')
    } catch (error: any) {
      console.error('Error disabling 2FA:', error)
      showMessage('error', 'Failed to disable 2FA')
    } finally {
      setSaving(false)
    }
  }

  // Handle active sessions
  const handleViewSessions = async () => {
    setShowSessionsModal(true)
    setLoadingSessions(true)
    
    try {
      if (!user?.id) return
      
      // Get current session
      const { data: { session } } = await createClient().auth.getSession()
      
      // Fetch real sessions from database
      let sessions = await fetchUserSessions(user.id)
      
      // If no sessions exist, create one for the current session
      if (sessions.length === 0 && session) {
        console.log('No sessions found, creating current session...')
        await createSession(session.user.id, session.access_token)
        // Fetch again after creating
        sessions = await fetchUserSessions(user.id)
      }
      
      setActiveSessions(sessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      showMessage('error', 'Failed to load active sessions')
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to sign out this device?')) {
      return
    }

    setSaving(true)
    try {
      const success = await revokeSession(sessionId)
      
      if (success) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
        showMessage('success', 'Session revoked successfully')
      } else {
        throw new Error('Failed to revoke session')
      }
    } catch (error: any) {
      console.error('Error revoking session:', error)
      showMessage('error', error.message || 'Failed to revoke session')
    } finally {
      setSaving(false)
    }
  }

  const getUserInitials = () => {
    if (firstName) return firstName.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="px-2 sm:px-0">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400">Manage your account preferences and security</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-xs sm:text-sm font-medium ${
              message.type === 'success' 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Stack nav/content on mobile, grid on desktop */}
        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-4 xl:gap-6">
          {/* Settings Navigation */}
          <div className="order-1 compact-card rounded-xl p-3 sm:p-5">
            <nav className="space-y-1 sm:space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-left transition-all duration-200 text-xs sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="order-2 xl:col-span-3">
            {activeTab === 'profile' && (
              <div className="compact-card rounded-xl p-3 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">Profile Information</h3>
                  <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 mt-1">Update your personal details</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Profile Avatar Section */}
                  <div className="flex items-center gap-3 sm:gap-6 p-2 sm:p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                    <div className="relative">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Profile" 
                          className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{firstName || 'User'} {lastName}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{email}</p>
                      <label htmlFor="avatar-upload" className="mt-1 sm:mt-2 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm cursor-pointer">
                        Change Profile Picture
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Add your phone number"
                      className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                    />
                  </div>

                  {/* Account Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Account Status</label>
                      <div className="flex items-center gap-2 p-2 sm:p-3 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs sm:text-base text-green-700 dark:text-green-400 font-medium">Verified Account</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Member Since</label>
                      <div className="p-2 sm:p-3 border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                        <span className="text-xs sm:text-base text-slate-600 dark:text-slate-400">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="compact-card rounded-xl p-3 sm:p-6">
                  <div className="mb-3 sm:mb-6">
                    <h3 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">Security Settings</h3>
                    <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 mt-1">Manage your account security</p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {/* Password Change */}
                    <div className="p-2 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                        <div className="p-1 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-xs sm:text-base">Password</h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Change your account password</p>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-4">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        />
                        <button 
                          onClick={handleChangePassword}
                          disabled={saving || !newPassword || !confirmPassword}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm disabled:opacity-50"
                        >
                          {saving ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-2 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-1 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-xs sm:text-base">Two-Factor Authentication</h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {twoFactorEnabled || phone ? (
                              <><span className="text-green-600 dark:text-green-400 font-medium">{twoFactorEnabled ? 'Enabled' : 'Ready to Enable'}</span> {phone && `• SMS to ${phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 *** **$3')}`}</>
                            ) : (
                              <><span className="text-amber-600 dark:text-amber-400 font-medium">Setup Required</span> • Add phone number to enable SMS 2FA</>
                            )}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={twoFactorEnabled ? handleDisable2FA : handleSetup2FA}
                        disabled={!phone && !twoFactorEnabled}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {twoFactorEnabled ? 'Disable' : 'Setup'}
                      </button>
                    </div>

                    {/* Login Activity */}
                    <div className="flex items-center justify-between p-2 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-1 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <DevicePhoneMobileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-xs sm:text-base">Active Sessions</h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">1 device currently signed in</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleViewSessions}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="compact-card rounded-xl p-3 sm:p-6">
                <div className="mb-3 sm:mb-6">
                  <h3 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
                  <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 mt-1">Choose how you want to be notified</p>
                </div>

                <div className="space-y-3 sm:space-y-6">
                  {/* Notification Types */}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2 sm:mb-4 text-xs sm:text-base">What to notify about</h4>
                    <div className="space-y-2 sm:space-y-4">
                      {[
                        { key: 'transactions', label: 'Transaction Updates', desc: 'Get notified about your transactions' },
                        { key: 'security', label: 'Security Alerts', desc: 'Important security notifications' },
                        { key: 'marketing', label: 'Promotions & News', desc: 'Special offers and product updates' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-2 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-base">{item.label}</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications]}
                              onChange={(e) => updateNotification(item.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 sm:w-11 sm:h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Methods */}
                  <div className="pt-3 sm:pt-6 border-t border-slate-200 dark:border-neutral-700">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2 sm:mb-4 text-xs sm:text-base">How to notify</h4>
                    <div className="space-y-2 sm:space-y-4">
                      {[
                        { key: 'email', label: 'Email', desc: 'Send notifications to your email' },
                        { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                        { key: 'sms', label: 'SMS', desc: 'Text messages to your phone' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-2 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-base">{item.label}</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications]}
                              onChange={(e) => updateNotification(item.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 sm:w-11 sm:h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="compact-card rounded-xl p-3 sm:p-6">
                <div className="mb-3 sm:mb-6">
                  <h3 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">Cards & Spending Limits</h3>
                  <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 mt-1">Manage your card settings and limits</p>
                </div>

                {!cardId ? (
                  <div className="text-center py-4 sm:py-8">
                    <CreditCardIcon className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-600 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">No card found</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1">You need to have an active card to manage settings</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-6">
                    {/* Spending Limits */}
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2 sm:mb-4 text-xs sm:text-base">Daily Spending Limits</h4>
                      <div className="space-y-2 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">ATM Withdrawal Limit</label>
                          <input
                            type="text"
                            value={formatCurrency(atmLimit)}
                            onChange={(e) => handleLimitChange(setAtmLimit, e.target.value)}
                            placeholder="₦200,000"
                            className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Online Transaction Limit</label>
                          <input
                            type="text"
                            value={formatCurrency(onlineLimit)}
                            onChange={(e) => handleLimitChange(setOnlineLimit, e.target.value)}
                            placeholder="₦500,000"
                            className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">POS Transaction Limit</label>
                          <input
                            type="text"
                            value={formatCurrency(posLimit)}
                            onChange={(e) => handleLimitChange(setPosLimit, e.target.value)}
                            placeholder="₦1,000,000"
                            className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Controls */}
                    <div className="pt-3 sm:pt-6 border-t border-slate-200 dark:border-neutral-700">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2 sm:mb-4 text-xs sm:text-base">Card Controls</h4>
                      <div className="space-y-2 sm:space-y-4">
                        {[
                          { key: 'onlineEnabled', label: 'Online Transactions', desc: 'Allow online and e-commerce transactions' },
                          { key: 'internationalEnabled', label: 'International Transactions', desc: 'Allow transactions outside Nigeria' },
                          { key: 'contactlessEnabled', label: 'Contactless Payments', desc: 'Enable tap-to-pay functionality' },
                          { key: 'atmWithdrawalsEnabled', label: 'ATM Withdrawals', desc: 'Allow cash withdrawals from ATMs' }
                        ].map((control) => (
                          <div key={control.key} className="flex items-center justify-between p-2 sm:p-4 border border-slate-200 dark:border-neutral-700 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-base">{control.label}</p>
                              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{control.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cardControls[control.key as keyof typeof cardControls]}
                                onChange={(e) => updateCardControl(control.key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 sm:w-11 sm:h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveCardLimits}
                      disabled={saving}
                      className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Enable Two-Factor Authentication
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Add an extra layer of security to your account
              </p>
            </div>

            <div className="space-y-4">
              {!verificationSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneForVerification}
                      onChange={(e) => setPhoneForVerification(e.target.value)}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      We'll send a verification code to this number
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShow2FAModal(false)
                        setPhoneForVerification('')
                      }}
                      className="flex-1 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={saving || !phoneForVerification}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      ✓ Verification code sent to {phoneForVerification}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                      Enter the 6-digit code we sent to your phone
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setVerificationSent(false)
                        setVerificationCode('')
                      }}
                      className="flex-1 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerify2FA}
                      disabled={saving || verificationCode.length !== 6}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                  </div>

                  <button
                    onClick={handleSendVerificationCode}
                    disabled={saving}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2"
                  >
                    Resend Code
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-neutral-800 max-h-[80vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Active Sessions
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Devices and browsers currently signed into your account
              </p>
            </div>

            <div className="space-y-4">
              {loadingSessions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-slate-600 dark:text-slate-400">Loading sessions...</p>
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="text-center py-8">
                  <DevicePhoneMobileIcon className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No active sessions found</p>
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-4 border border-slate-200 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {session.device_info || `${session.browser} on ${session.os}`}
                          </h4>
                          {session.is_current && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {session.location || 'Unknown location'} {session.ip_address && `• ${session.ip_address}`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          Last active: {new Date(session.last_active).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!session.is_current && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={saving}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm ml-4 disabled:opacity-50"
                      >
                        {saving ? 'Revoking...' : 'Sign Out'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-700">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="w-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </ProtectedRoute>
  )
}