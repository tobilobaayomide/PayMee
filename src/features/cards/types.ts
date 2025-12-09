export interface Card {
	id: string
	type: 'debit' | 'credit'
	last4: string
	bank: string
	expiryDate: string
	balance: number
	isActive: boolean
	color: string
	isBlocked?: boolean
	onlineEnabled?: boolean
	internationalEnabled?: boolean
	contactlessEnabled?: boolean
	pinSet?: boolean
	atmLimit?: number
	onlineLimit?: number
	posLimit?: number
	atmWithdrawalsEnabled?: boolean
}