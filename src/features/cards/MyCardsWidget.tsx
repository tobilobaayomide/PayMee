'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/components/providers/UserProvider'
import { fetchUserCard } from '@/lib/supabase/cards'
import type { Card } from './types'

interface PaymeeCardProps {
	cardNumber: string
	expiryDate: string
	cardholderName: string
	bank: string
	cardType: 'debit' | 'credit'
	color: string
	isActive: boolean
}

function PaymeeCard({ cardNumber, expiryDate, cardholderName, bank, cardType, color, isActive }: PaymeeCardProps) {
	const getGradientClass = (colorName: string) => {
		const gradients: Record<string, string> = {
			primary: 'bg-gradient-to-br from-blue-500 to-purple-600',
			blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
			gold: 'bg-gradient-to-br from-yellow-500 to-orange-600',
			platinum: 'bg-gradient-to-br from-gray-400 to-gray-600',
			black: 'bg-gradient-to-br from-gray-800 to-black'
		}
		return gradients[colorName] || gradients.primary
	}

	return (
		<div className={`relative overflow-hidden ${getGradientClass(color)} rounded-xl p-4 sm:p-6 text-white shadow-xl ${!isActive ? 'opacity-60' : ''}`}>
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
				<div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
			</div>
			<div className="relative z-10">
				<div className="flex justify-between items-start mb-4 sm:mb-6 lg:mb-8">
					<div>
						<div className="text-white/80 text-xs font-medium tracking-wider uppercase mb-1">{bank}</div>
						<div className="text-white/60 text-xs capitalize">{cardType} Card</div>
					</div>
					<div className="w-6 h-6 sm:w-8 sm:h-8">
						{isActive ? (
							<svg viewBox="0 0 32 32" className="w-full h-full">
								<rect width="32" height="32" rx="6" fill="white" fillOpacity="0.2"/>
								<path d="M8 12h16v8H8z" fill="white" fillOpacity="0.3"/>
								<circle cx="12" cy="16" r="6" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
								<circle cx="20" cy="16" r="6" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
							</svg>
						) : (
							<div className="text-white/40 text-xs">INACTIVE</div>
						)}
					</div>
				</div>
				<div className="mb-3 sm:mb-4">
					<div className="text-white font-mono text-base sm:text-lg tracking-wider">
						{cardNumber}
					</div>
				</div>
				<div className="flex justify-between items-end">
					<div>
						<div className="text-white/60 text-xs mb-1">Card Holder</div>
						<div className="text-white font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{cardholderName}</div>
					</div>
					<div>
						<div className="text-white/60 text-xs mb-1">Expires</div>
						<div className="text-white font-medium text-xs sm:text-sm">{expiryDate}</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export function MyCardsWidget() {
	const { user } = useUser()
	const [card, setCard] = useState<Card | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadCard() {
			if (!user) return
			setLoading(true)
			const data = await fetchUserCard(user.id)
			setCard(data)
			setLoading(false)
		}
		loadCard()
	}, [user])

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

	const formatCardNumber = (last4: string) => {
		return `•••• •••• •••• ${last4}`
	}

	if (loading) {
		return (
			<div className="compact-card rounded-xl p-4 sm:p-5">
				<div className="mb-3 sm:mb-4">
					<h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center">
						<div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
						My Cards
					</h3>
				</div>
				<div className="animate-pulse">
					<div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
				</div>
			</div>
		)
	}

	if (!card) {
		return (
			<div className="compact-card rounded-xl p-5">
				<div className="text-center py-8">
					<p className="text-slate-500 dark:text-slate-400">No cards available</p>
				</div>
			</div>
		)
	}

	return (
		<div className="compact-card rounded-xl p-4 sm:p-5">
			<div className="mb-3 sm:mb-4">
				<h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center">
					<div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
					My Cards
				</h3>
				<p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 uppercase tracking-wide">
					1 card • {card.isActive ? '1 active' : '0 active'}
				</p>
			</div>
			<div className="space-y-3 sm:space-y-4">
				<PaymeeCard
					cardNumber={formatCardNumber(card.last4)}
					expiryDate={card.expiryDate}
					cardholderName={getCardholderName()}
					bank={card.bank}
					cardType={card.type}
					color={card.color}
					isActive={card.isActive}
				/>
				<Link href="/cards">
					<button className="w-full bg-slate-50 mt-4 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl px-4 sm:px-6 py-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-200 group">
						<div className="flex items-center justify-center gap-2">
							<span className="font-medium text-xs sm:text-sm">VIEW CARD</span>
						</div>
					</button>
				</Link>
			</div>
		</div>
	)
}