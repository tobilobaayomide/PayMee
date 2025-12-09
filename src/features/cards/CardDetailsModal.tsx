'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, LockClosedIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { fetchTransactions } from '@/lib/supabase/transactions'
import type { Card } from './types'
import type { Transaction } from '@/features/transactions/types'

interface CardDetailsModalProps {
	isOpen: boolean
	onClose: () => void
	card: Card | null
	onManage?: (card: Card) => void
	onBlock?: (card: Card) => void
}

export function CardDetailsModal({ isOpen, onClose, card, onManage, onBlock }: CardDetailsModalProps) {
	const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		async function loadTransactions() {
			if (!card || !isOpen) return

			setIsLoading(true)
			try {
				const transactions = await fetchTransactions(card.id)
				setRecentTransactions(transactions.slice(0, 10))
			} catch (error) {
				console.error('Error loading card transactions:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadTransactions()
	}, [card, isOpen])

	if (!card) return null

	return (
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
					<div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" />
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
							{/* ...rest of the component... */}
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}