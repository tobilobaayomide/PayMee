'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { updateCardSettings, updateCardLimits } from '@/lib/supabase/cards'
import type { Card } from './types'

interface CardManagementModalProps {
	isOpen: boolean
	onClose: () => void
	card: Card | null
	onSuccess?: () => void
}

export function CardManagementModal({ isOpen, onClose, card, onSuccess }: CardManagementModalProps) {
	const [onlineEnabled, setOnlineEnabled] = useState(false)
	const [internationalEnabled, setInternationalEnabled] = useState(false)
	const [contactlessEnabled, setContactlessEnabled] = useState(false)
	const [atmLimit, setAtmLimit] = useState('200000')
	const [onlineLimit, setOnlineLimit] = useState('500000')
	const [posLimit, setPosLimit] = useState('1000000')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (card) {
			setOnlineEnabled(card.onlineEnabled || false)
			setInternationalEnabled(card.internationalEnabled || false)
			setContactlessEnabled(card.contactlessEnabled || false)
			setAtmLimit(card.atmLimit?.toString() || '200000')
			setOnlineLimit(card.onlineLimit?.toString() || '500000')
			setPosLimit(card.posLimit?.toString() || '1000000')
		}
	}, [card])

	if (!card) return null

	const handleSaveSettings = async () => {
		setError('')
		setLoading(true)

		try {
			await updateCardSettings(card.id, {
				onlineEnabled,
				internationalEnabled,
				contactlessEnabled,
			})

			await updateCardLimits(card.id, {
				atmLimit: parseFloat(atmLimit),
				onlineLimit: parseFloat(onlineLimit),
				posLimit: parseFloat(posLimit),
			})

			alert('Card settings saved successfully!')
			onClose()
			if (onSuccess) onSuccess()
  		} catch (err: unknown) {
  			if (err && typeof err === 'object' && 'message' in err) {
  				setError((err as { message?: string }).message || 'Failed to save card settings')
  			} else {
  				setError('Failed to save card settings')
  			}
  		} finally {
			setLoading(false)
		}
	}

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
						<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
									<div className="flex items-center justify-between mb-6">
										<Dialog.Title as="h3" className="text-lg font-semibold text-slate-900 dark:text-white">
											Card Settings
										</Dialog.Title>
										<button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
											<XMarkIcon className="h-6 w-6" />
										</button>
									</div>
									{/* Settings Form */}
									<form onSubmit={e => { e.preventDefault(); handleSaveSettings(); }} className="space-y-4">
										<div className="flex flex-col gap-2">
											<label className="flex items-center gap-2">
												<input type="checkbox" checked={onlineEnabled} onChange={e => setOnlineEnabled(e.target.checked)} />
												<span>Enable Online Transactions</span>
											</label>
											<label className="flex items-center gap-2">
												<input type="checkbox" checked={internationalEnabled} onChange={e => setInternationalEnabled(e.target.checked)} />
												<span>Enable International Use</span>
											</label>
											<label className="flex items-center gap-2">
												<input type="checkbox" checked={contactlessEnabled} onChange={e => setContactlessEnabled(e.target.checked)} />
												<span>Enable Contactless Payments</span>
											</label>
										</div>
										<div className="flex flex-col gap-2">
											<label className="block text-sm font-medium">ATM Limit</label>
											<input type="number" className="w-full rounded border p-2 dark:bg-neutral-800 dark:border-neutral-700" value={atmLimit} onChange={e => setAtmLimit(e.target.value)} min={0} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="block text-sm font-medium">Online Limit</label>
											<input type="number" className="w-full rounded border p-2 dark:bg-neutral-800 dark:border-neutral-700" value={onlineLimit} onChange={e => setOnlineLimit(e.target.value)} min={0} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="block text-sm font-medium">POS Limit</label>
											<input type="number" className="w-full rounded border p-2 dark:bg-neutral-800 dark:border-neutral-700" value={posLimit} onChange={e => setPosLimit(e.target.value)} min={0} />
										</div>
										{error && <div className="text-red-600 text-sm">{error}</div>}
										<button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={loading}>
											{loading ? 'Saving...' : 'Save Settings'}
										</button>
									</form>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		)
}