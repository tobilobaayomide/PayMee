'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { updateUserProfile } from '@/lib/supabase/profiles'
import { UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface CompleteProfileModalProps {
	isOpen: boolean
	onClose: () => void
	userId: string
	onProfileCompleted: () => void
}

export function CompleteProfileModal({ 
	isOpen, 
	onClose, 
	userId,
	onProfileCompleted 
}: CompleteProfileModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
    
		if (!formData.firstName.trim() || !formData.lastName.trim()) {
			alert('Please enter both first and last name')
			return
		}

		try {
			setIsSubmitting(true)
      
			await updateUserProfile(userId, {
				first_name: formData.firstName.trim(),
				last_name: formData.lastName.trim(),
			})

			onProfileCompleted()
			onClose()
		} catch (error) {
			console.error('Error updating profile:', error)
			alert('Failed to update profile. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	return (
		<Transition appear show={isOpen} as={Fragment}>
			{/* ...rest of the component... */}
		</Transition>
	)
}