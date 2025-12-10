'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline' // removed unused ExclamationTriangleIcon

interface BlockCardModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (reason: string) => Promise<void>
	isBlocked: boolean
	cardLast4: string
}

const BLOCK_REASONS = [
	{ value: 'lost', label: 'Lost Card'},
	{ value: 'stolen', label: 'Stolen Card' },
	{ value: 'suspicious', label: 'Suspicious Activity'},
	{ value: 'other', label: 'Other Reason' },
]

export function BlockCardModal({ isOpen, onClose, onConfirm, isBlocked, cardLast4 }: BlockCardModalProps) {
	const [selectedReason, setSelectedReason] = useState('')
	const [otherReason, setOtherReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [successMessage, setSuccessMessage] = useState({ title: '', description: '' })

	useEffect(() => {
		if (isOpen) {
			setSelectedReason('')
			setOtherReason('')
			setIsSubmitting(false)
			setShowSuccess(false)
		}
	}, [isOpen])

	if (!isOpen) return null

	const handleSubmit = async () => {
		if (!isBlocked && !selectedReason) {
			alert('Please select a reason for blocking your card')
			return
		}

		try {
			setIsSubmitting(true)
			const reason = selectedReason === 'other' ? otherReason : selectedReason
			await onConfirm(reason)
			setSuccessMessage({
				title: isBlocked ? 'Card Unblocked!' : 'Card Blocked!',
				description: isBlocked 
					? 'Your card is now active and ready to use.' 
					: 'Your card has been blocked successfully. You will not be able to make transactions until you unblock it.'
			})
			setShowSuccess(true)
			} catch (error) {
				// removed unused variable 'error'
				alert('Failed to update card status. Please try again.')
			} finally {
				setIsSubmitting(false)
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
											{isBlocked ? 'Unblock Card' : 'Block Card'}
										</Dialog.Title>
										<button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
											<XMarkIcon className="h-6 w-6" />
										</button>
									</div>
									{showSuccess ? (
										<div className="flex flex-col items-center justify-center py-8">
											<CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
											<h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{successMessage.title}</h4>
											<p className="text-slate-600 dark:text-slate-400 text-center mb-4">{successMessage.description}</p>
											<button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Close</button>
										</div>
									) : (
										<form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
											{!isBlocked && (
												<div className="mb-4">
													<label className="block text-sm font-medium mb-2">Reason for blocking card</label>
													<select
														className="w-full rounded border p-2 dark:bg-neutral-800 dark:border-neutral-700"
														value={selectedReason}
														onChange={e => setSelectedReason(e.target.value)}
														required
													>
														<option value="">Select reason</option>
														{BLOCK_REASONS.map(r => (
															<option key={r.value} value={r.value}>{r.label}</option>
														))}
													</select>
													{selectedReason === 'other' && (
														<input
															type="text"
															className="w-full rounded border p-2 mt-2"
															placeholder="Enter reason"
															value={otherReason}
															onChange={e => setOtherReason(e.target.value)}
															required
														/>
													)}
												</div>
											)}
											<div className="flex flex-col gap-2 mb-4">
												<span className="text-sm text-slate-600 dark:text-slate-400">Card ending in <span className="font-semibold">{cardLast4}</span></span>
											</div>
											<button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50" disabled={isSubmitting}>
												{isBlocked ? (isSubmitting ? 'Unblocking...' : 'Unblock Card') : (isSubmitting ? 'Blocking...' : 'Block Card')}
											</button>
										</form>
									)}
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		)
}