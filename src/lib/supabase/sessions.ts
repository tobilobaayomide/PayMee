import { createClient } from '@/lib/supabase/client'

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  device_info: string | null
  browser: string | null
  os: string | null
  ip_address: string | null
  location: string | null
  user_agent: string | null
  last_active: string
  created_at: string
  expires_at: string
  is_current: boolean
}

/**
 * Detect browser and OS from user agent
 */
export function detectDeviceInfo() {
  const userAgent = navigator.userAgent
  
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'
  
  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge'
  } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
    browser = 'Opera'
  }
  
  // Detect OS
  if (userAgent.includes('Mac OS X')) {
    os = 'macOS'
  } else if (userAgent.includes('Windows NT 10')) {
    os = 'Windows 10/11'
  } else if (userAgent.includes('Windows')) {
    os = 'Windows'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('iPhone')) {
    os = 'iOS'
  } else if (userAgent.includes('iPad')) {
    os = 'iPadOS'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
  }
  
  return {
    browser,
    os,
    device_info: `${browser} on ${os}`,
    user_agent: userAgent
  }
}

/**
 * Create a new session record
 */
export async function createSession(userId: string, sessionToken: string): Promise<UserSession | null> {
  const supabase = createClient()
  const deviceInfo = detectDeviceInfo()
  
  try {
    // Mark all other sessions as not current
    await supabase
      .from('user_sessions')
      .update({ is_current: false })
      .eq('user_id', userId)
    
    // Create new session
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        device_info: deviceInfo.device_info,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        user_agent: deviceInfo.user_agent,
        is_current: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating session:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

/**
 * Fetch all active sessions for a user
 */
export async function fetchUserSessions(userId: string): Promise<UserSession[]> {
  const supabase = createClient()
  
  try {
    // Clean up expired sessions first
    await supabase.rpc('clean_expired_sessions')
    
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false })
    
    if (error) {
      console.error('Error fetching sessions:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

/**
 * Update session last active timestamp
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  const supabase = createClient()
  
  try {
    await supabase
      .from('user_sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('session_token', sessionToken)
  } catch (error) {
    console.error('Error updating session activity:', error)
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId)
    
    if (error) {
      console.error('Error revoking session:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error revoking session:', error)
    return false
  }
}

/**
 * Revoke all sessions except current
 */
export async function revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .neq('id', currentSessionId)
    
    if (error) {
      console.error('Error revoking other sessions:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error revoking other sessions:', error)
    return false
  }
}

/**
 * Clean up expired sessions for a user
 */
export async function cleanExpiredSessions(userId: string): Promise<void> {
  const supabase = createClient()
  
  try {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString())
  } catch (error) {
    console.error('Error cleaning expired sessions:', error)
  }
}
