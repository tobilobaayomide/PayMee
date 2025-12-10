'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useUser } from '@/components/providers/UserProvider'
import { fetchUserProfile, UserProfile } from '@/lib/supabase/profiles'
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  QrCodeIcon,
  ShareIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

interface ReceiveMoneyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReceiveMoneyModal({ isOpen, onClose }: ReceiveMoneyModalProps) {
  const { user } = useUser()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile when modal opens
  const loadProfile = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const userProfile = await fetchUserProfile(user.id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && user?.id) {
      loadProfile()
    }
  }, [isOpen, user?.id])

  // Use profile data or fallback values
  const accountNumber = profile?.account_number || '0000000000'
  const firstName = profile?.first_name || 'User'
  const lastName = profile?.last_name || ''
  const accountName = `${firstName} ${lastName}`.trim()
  const bankName = 'PayMee Bank'

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  const shareAccountDetails = async () => {
    const text = `Send money to my ${bankName} account:\n\nAccount Name: ${accountName}\nAccount Number: ${accountNumber}\nBank: ${bankName}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Account Details',
          text: text,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(text, 'share')
    }
  }

  return (
    <>
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-neutral-800">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                      <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                      >
                        Receive Money
                      </Dialog.Title>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Share your account details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Account Details Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 text-white">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                      <p className="text-blue-200 text-sm mt-2">Loading account details...</p>
                    </div>
                  ) : !profile ? (
                    <div className="text-center py-8">
                      <p className="text-blue-200 text-sm">Account not set up yet</p>
                      <p className="text-xs text-blue-300 mt-2">Please complete your profile</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-blue-200 text-sm mb-4">Your Account Details</p>
                      
                      {/* Account Name */}
                      <div className="mb-4">
                        <label className="text-xs text-blue-200 uppercase tracking-wide">Account Name</label>
                        <p className="text-lg font-semibold mt-1">{accountName}</p>
                      </div>

                      {/* Account Number */}
                      <div className="mb-4">
                        <label className="text-xs text-blue-200 uppercase tracking-wide">Account Number</label>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-2xl font-bold tracking-wider">{accountNumber}</p>
                          <button
                            onClick={() => copyToClipboard(accountNumber, 'account')}
                            className="ml-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            {copiedField === 'account' ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <ClipboardDocumentIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bank Name */}
                      <div>
                        <label className="text-xs text-blue-200 uppercase tracking-wide">Bank Name</label>
                        <p className="text-base font-medium mt-1">{bankName}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* QR Code Toggle */}
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="w-full mb-4 py-3 px-4 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-colors flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <QrCodeIcon className="h-5 w-5" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>

                {/* QR Code Display */}
                {showQR && (
                  <div className="mb-6 p-4 bg-white dark:bg-neutral-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-neutral-700">
                    <div className="flex flex-col items-center">
                      {/* QR Code Placeholder - You can integrate a QR library like 'qrcode.react' */}
                      <div className="w-48 h-48 bg-slate-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center mb-3">
                        <div className="text-center text-slate-500 dark:text-slate-400">
                          <QrCodeIcon className="h-16 w-16 mx-auto mb-2" />
                          <p className="text-sm">QR Code</p>
                          <p className="text-xs mt-1">Account: {accountNumber}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Scan this QR code to get account details
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Copy All Details */}
                  <button
                    onClick={() => copyToClipboard(
                      `Account Name: ${accountName}\nAccount Number: ${accountNumber}\nBank: ${bankName}`,
                      'all'
                    )}
                    disabled={isLoading || !profile}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copiedField === 'all' ? (
                      <>
                        <CheckIcon className="h-5 w-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-5 w-5" />
                        Copy Account Details
                      </>
                    )}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={shareAccountDetails}
                    disabled={isLoading || !profile}
                    className="w-full py-3 px-4 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShareIcon className="h-5 w-5" />
                    Share Details
                  </button>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                    Share these details with anyone who wants to send you money
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    </>
  )
}
