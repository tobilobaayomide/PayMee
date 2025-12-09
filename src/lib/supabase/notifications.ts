import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Fetch user's notifications from Supabase
 */
export async function fetchNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  if (!data) return []

  // Map Supabase notifications to our Notification type
  return data.map((notification) => ({
    id: notification.id,
    user_id: notification.user_id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    is_read: notification.is_read,
    link: notification.link,
    transaction_id: notification.transaction_id,
    created_at: new Date(notification.created_at),
  }))
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'transaction' = 'info',
  link?: string,
  transactionId?: string
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      link,
      transaction_id: transactionId,
      is_read: false,
    })

  if (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting all notifications:', error)
    throw error
  }
}

/**
 * Subscribe to real-time notification updates
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void,
  onDelete?: (notificationId: string) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notification: Notification = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type,
          is_read: payload.new.is_read,
          link: payload.new.link,
          transaction_id: payload.new.transaction_id,
          created_at: new Date(payload.new.created_at),
        }
        onNotification(notification)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onDelete) {
          onDelete(payload.old.id)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from notifications channel
 */
export async function unsubscribeFromNotifications(channel: RealtimeChannel) {
  const supabase = createClient()
  await supabase.removeChannel(channel)
}
