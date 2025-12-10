'use client'

import { useState } from 'react'
import { XMarkIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface SetPinModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: (pin: string) => Promise<void>
	cardLast4: string
}

export function SetPinModal({ isOpen, onClose, onSuccess, cardLast4 }: SetPinModalProps) {
	const [pin, setPin] = useState('')
	const [confirmPin, setConfirmPin] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [showSuccess, setShowSuccess] = useState(false)

	if (!isOpen) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (pin.length < 4 || pin.length > 6) {
			setError('PIN must be 4-6 digits')
			return
		}

		if (!/^\d+$/.test(pin)) {
			setError('PIN must contain only numbers')
			return
		}

		if (pin !== confirmPin) {
			setError('PINs do not match')
			return
		}

		try {
			setIsSubmitting(true)
			await onSuccess(pin)
			setShowSuccess(true)
			setTimeout(() => {
				setShowSuccess(false)
				setPin('')
				setConfirmPin('')
				setIsSubmitting(false)
				onClose()
			}, 2000)
		} catch (error: unknown) {
			console.error('Error setting PIN:', error)
			if (error && typeof error === 'object' && 'message' in error) {
				setError((error as { message?: string }).message || 'Failed to set PIN. Please try again.')
			} else {
				setError('Failed to set PIN. Please try again.')
			}
			setIsSubmitting(false)
		}
	}

	// ...rest of the component...
}