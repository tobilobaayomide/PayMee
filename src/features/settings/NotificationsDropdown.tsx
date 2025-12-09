
import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

export function NotificationsDropdown() {
	// Minimal placeholder for notifications dropdown
	const [open, setOpen] = useState(false)
	return (
		<div className="relative">
			<button
				className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
				onClick={() => setOpen((v) => !v)}
				aria-label="Notifications"
			>
				<BellIcon className="h-6 w-6 text-slate-500 dark:text-slate-300" />
			</button>
			{open && (
				<div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 p-4">
					<div className="text-center text-slate-500 dark:text-slate-400 text-sm">No notifications</div>
				</div>
			)}
		</div>
	)
}