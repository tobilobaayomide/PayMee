import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  account_number: string
  transaction_pin_set?: boolean
  transaction_pin_hash?: string | null
  has_seen_welcome?: boolean
  notification_preferences?: Record<string, boolean> | null
  created_at: string
  updated_at: string
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, avatar_url, account_number, transaction_pin_set, transaction_pin_hash, has_seen_welcome, notification_preferences, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('❌ Error fetching user profile:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error
    })
    
    // Provide helpful error messages
    if (error.code === 'PGRST116') {
      console.error('🔍 Profile not found. You may need to:')
      console.error('   1. Run the SQL scripts to create the profiles table')
      console.error('   2. Create a profile for this user manually')
      console.error('   3. Sign out and sign up again to trigger profile creation')
    } else if (error.code === '42P01') {
      console.error('🔍 profiles table does not exist!')
      console.error('   ➡️  Go to Supabase Dashboard → SQL Editor')
      console.error('   ➡️  Run the supabase_profiles_table.sql script')
    }
    
    return null
  }

  console.log('✅ Fetched profile from database:', data)
  return data
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'phone' | 'avatar_url' | 'notification_preferences'>>
): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

/**
 * Update user email in auth.users
 */
export async function updateUserEmail(newEmail: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (error) {
    console.error('Error updating email:', error)
    throw error
  }
}

/**
 * Update user metadata in auth.users
 */
export async function updateUserMetadata(metadata: Record<string, any>): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.updateUser({
    data: metadata
  })

  if (error) {
    console.error('Error updating user metadata:', error)
    throw error
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(newPassword: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Error updating password:', error)
    throw error
  }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = createClient()
  
  // Create unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    throw uploadError
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  await updateUserProfile(userId, { avatar_url: publicUrl })

  return publicUrl
}

export async function createUserProfile(
  userId: string,
  profile: Pick<UserProfile, 'first_name' | 'last_name' | 'account_number'>
): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, ...profile }])
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  return data
}

/**
 * Simple hash function for transaction PIN (for demonstration)
 * In production, use a proper hashing library like bcrypt
 */
export function hashTransactionPin(pin: string): string {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}

/**
 * Set transaction PIN for a user
 */
export async function setTransactionPin(userId: string, pinHash: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      transaction_pin_hash: pinHash,
      transaction_pin_set: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error setting transaction PIN:', error)
    throw new Error('Failed to set transaction PIN')
  }
}

/**
 * Mark welcome modal as seen
 */
export async function markWelcomeSeen(userId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      has_seen_welcome: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error marking welcome as seen:', error)
    throw new Error('Failed to update profile')
  }
}

/**
 * Verify transaction PIN for a user
 */
export async function verifyTransactionPin(userId: string, pinHash: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('transaction_pin_hash')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error verifying transaction PIN:', error)
    return false
  }

  return data?.transaction_pin_hash === pinHash
}
