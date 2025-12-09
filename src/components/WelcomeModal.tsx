'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  accountNumber: string
  userName?: string
}

export function WelcomeModal({ isOpen, onClose, accountNumber, userName }: WelcomeModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      Welcome to Paymee! 🎉
                    </Dialog.Title>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    {userName ? `Hi ${userName}! ` : 'Hi! '}
                    Your account has been successfully created.
                  </p>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Your Account Number
                    </p>
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200">
                      <span className="text-2xl font-bold text-gray-900 tracking-wider">
                        {accountNumber}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="ml-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Copy account number"
                      >
                        {copied ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardDocumentIcon className="h-5 w-5 text-blue-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Share this number to receive money from other Paymee users
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Next Step:</strong> You'll be asked to set up a transaction PIN to secure your account.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
