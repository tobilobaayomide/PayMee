export interface Transaction {
	id: string
	type: 'income' | 'expense' | 'transfer'
	amount: number
	description: string
	category: string
	date: Date
	status: 'completed' | 'pending' | 'failed'
	reference?: string
}