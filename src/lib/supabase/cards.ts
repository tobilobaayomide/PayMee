// Type for raw card data from Supabase
type RawCard = {
  id: string;
  type: string;
  last4: string;
  bank_name?: string;
  expiry_date: string;
  balance: number;
  is_active: boolean;
  color: string;
  is_blocked?: boolean;
  online_enabled?: boolean;
  international_enabled?: boolean;
  contactless_enabled?: boolean;
  pin_set?: boolean;
  atm_limit?: number;
  online_limit?: number;
  pos_limit?: number;
  atm_withdrawals_enabled?: boolean;
};
// Removed duplicate import
import { createClient } from '@/lib/supabase/client'
import type { Card, Transaction } from '@/types'

/**
 * Fetch user's card from Supabase
 */
export async function fetchUserCard(userId: string): Promise<Card | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // PGRST116 means no rows found - this is normal for new users without cards
    if (error.code === 'PGRST116') {
      console.log('ℹ️ No card found for user (this is normal for new users)')
      return null
    }
    console.error('❌ Error fetching card:', error)
    return null
  }

  if (!data) return null

  // Map Supabase card to our Card type
  return {
    id: data.id,
    type: data.type,
    last4: data.last4,
    bank: 'PayMee Bank',
    expiryDate: data.expiry_date,
    balance: data.balance,
    isActive: data.is_active,
    color: 'blue',
    isBlocked: data.is_blocked,
    onlineEnabled: data.online_enabled,
    internationalEnabled: data.international_enabled,
    contactlessEnabled: data.contactless_enabled,
    pinSet: data.pin_set || false,
    atmLimit: data.atm_limit,
    onlineLimit: data.online_limit,
    posLimit: data.pos_limit,
    atmWithdrawalsEnabled: data.atm_withdrawals_enabled,
  }
}

/**
 * Update card settings (toggles)
 */
export async function updateCardSettings(
  cardId: string,
  settings: {
    onlineEnabled?: boolean
    internationalEnabled?: boolean
    contactlessEnabled?: boolean
  }
) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (settings.onlineEnabled !== undefined) {
    updateData.online_enabled = settings.onlineEnabled
  }
  if (settings.internationalEnabled !== undefined) {
    updateData.international_enabled = settings.internationalEnabled
  }
  if (settings.contactlessEnabled !== undefined) {
    updateData.contactless_enabled = settings.contactlessEnabled
  }

  const { error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card settings:', error)
    throw error
  }
}

/**
 * Block or unblock card
 */
export async function updateCardBlockStatus(cardId: string, isBlocked: boolean) {
  const supabase = createClient()

  const { error } = await supabase
    .from('cards')
    .update({ is_blocked: isBlocked, is_active: !isBlocked })
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card block status:', error)
    throw error
  }
}

/**
 * Calculate card balance from transactions
 */
export async function calculateCardBalance(userId: string): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error calculating balance:', error)
    return 0
  }

  if (!data || data.length === 0) return 0

  let balance = 0
    data.forEach((transaction: { type: string; amount: number }) => {
    if (transaction.type === 'income') {
      balance += transaction.amount
    } else if (transaction.type === 'expense') {
      balance -= transaction.amount
    }
  })

  return balance
}

/**
 * Fetch all user's cards from Supabase
 */
export async function fetchAllUserCards(userId: string): Promise<Card[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cards:', error)
    return []
  }

  if (!data || data.length === 0) return []

  // Map Supabase cards to our Card type
  return data.map((card: RawCard) => ({
    id: card.id,
      type: card.type === 'debit' || card.type === 'credit' ? card.type : 'debit',
    last4: card.last4,
    bank: card.bank_name || 'PayMee Bank',
    expiryDate: card.expiry_date,
    balance: card.balance,
    isActive: card.is_active,
    color: card.color || 'blue',
    isBlocked: card.is_blocked,
    onlineEnabled: card.online_enabled,
    internationalEnabled: card.international_enabled,
    contactlessEnabled: card.contactless_enabled,
  }))
}

/**
 * Add a new card for the user
 */
export async function addCard(card: {
  userId: string
  type: 'debit' | 'credit'
  last4: string
  expiryDate: string
  bankName?: string
  color?: string
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('cards')
    .insert([{
      user_id: card.userId,
      type: card.type,
      last4: card.last4,
      expiry_date: card.expiryDate,
      bank_name: card.bankName || 'PayMee Bank',
      balance: 0,
      is_active: true,
      is_blocked: false,
      online_enabled: true,
      international_enabled: false,
      contactless_enabled: true,
      color: card.color || 'blue',
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding card:', error)
    throw error
  }

  return data
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) {
    console.error('Error deleting card:', error)
    throw error
  }
}

/**
 * Update card limit
 */
export async function updateCardLimit(cardId: string, dailyLimit: number) {
  const supabase = createClient()

  const { error } = await supabase
    .from('cards')
    .update({ daily_limit: dailyLimit })
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card limit:', error)
    throw error
  }
}

/**
 * Set card PIN (hashed)
 */
export async function setCardPin(cardId: string, pinHash: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('cards')
    .update({ pin_hash: pinHash, pin_set: true })
    .eq('id', cardId)

  if (error) {
    console.error('Error setting card PIN:', error)
    throw error
  }
}

/**
 * Verify card PIN
 */
export async function verifyCardPin(cardId: string, pinHash: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('cards')
    .select('pin_hash')
    .eq('id', cardId)
    .single()

  if (error) {
    console.error('Error verifying PIN:', error)
    return false
  }

  return data?.pin_hash === pinHash
}

/**
 * Simple hash function for PIN (in production, use bcrypt or similar)
 */
export function hashPin(pin: string): string {
  // In production, use a proper hashing library like bcrypt
  // This is a simple hash for demonstration
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

/**
 * Update card spending limits
 */
export async function updateCardLimits(
  cardId: string,
  limits: {
    atmLimit?: number
    onlineLimit?: number
    posLimit?: number
  }
) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (limits.atmLimit !== undefined) {
    updateData.atm_limit = limits.atmLimit
  }
  if (limits.onlineLimit !== undefined) {
    updateData.online_limit = limits.onlineLimit
  }
  if (limits.posLimit !== undefined) {
    updateData.pos_limit = limits.posLimit
  }

  const { error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card limits:', error)
    throw error
  }
}

/**
 * Update all card controls at once
 */
export async function updateCardControls(
  cardId: string,
  controls: {
    onlineEnabled?: boolean
    internationalEnabled?: boolean
    contactlessEnabled?: boolean
    atmWithdrawalsEnabled?: boolean
  }
) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (controls.onlineEnabled !== undefined) {
    updateData.online_enabled = controls.onlineEnabled
  }
  if (controls.internationalEnabled !== undefined) {
    updateData.international_enabled = controls.internationalEnabled
  }
  if (controls.contactlessEnabled !== undefined) {
    updateData.contactless_enabled = controls.contactlessEnabled
  }
  if (controls.atmWithdrawalsEnabled !== undefined) {
    updateData.atm_withdrawals_enabled = controls.atmWithdrawalsEnabled
  }

  const { error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card controls:', error)
    throw error
  }
}

/**
 * Fetch card with limits
 */
export async function fetchCardWithLimits(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('ℹ️ No card found for user')
      return null
    }
    console.error('❌ Error fetching card:', error)
    return null
  }

  return data
}
