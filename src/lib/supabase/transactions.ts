import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }

  // Convert date strings to Date objects and filter out invalid dates
  return (data || []).map(transaction => ({
    ...transaction,
    date: new Date(transaction.date)
  })).filter(transaction => {
    // Filter out transactions with invalid dates
    return transaction.date && !isNaN(transaction.date.getTime())
  })
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error) {
    console.error('Error fetching transaction:', error)
    return null
  }

  if (!data) return null

  // Convert date string to Date object
  return {
    ...data,
    date: new Date(data.date)
  }
}

export async function addTransaction(transaction: Omit<Transaction, 'id'> & { user_id: string }) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single()

  if (error) {
    console.error('Error adding transaction:', error)
    throw error
  }

  return data
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    throw error
  }

  return data
}

export async function deleteTransaction(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}
