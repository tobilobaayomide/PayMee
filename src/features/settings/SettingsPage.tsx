// SettingsPage moved from src/app/settings/page.tsx
// (see full code in src/app/settings/page.tsx)

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

export function SettingsPage() {
	// ...full implementation from src/app/settings/page.tsx...
}