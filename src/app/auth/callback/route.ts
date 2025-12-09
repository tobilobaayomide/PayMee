import { createClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/supabase/sessions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback received:', { code: !!code, origin, next })

  if (code) {
    try {
      const supabase = await createClient()
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange code result:', { error: error?.message, hasSession: !!data.session })
      
      if (!error && data.session) {
        // Create session record in database
        try {
          await createSession(data.session.user.id, data.session.access_token)
          console.log('Session record created successfully')
        } catch (sessionError) {
          console.error('Failed to create session record:', sessionError)
          // Don't fail the auth flow if session creation fails
        }
        
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        // If next is /login, it means this is an email confirmation
        // Add a success parameter to show confirmation message
        const redirectUrl = next === '/login' ? '/login?confirmed=true' : next
        
        console.log('Redirecting to:', `${origin}${redirectUrl}`)
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectUrl}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
        } else {
          return NextResponse.redirect(`${origin}${redirectUrl}`)
        }
      } else if (error) {
        console.error('Session exchange error:', error.message)
      }
    } catch (err) {
      console.error('Callback error:', err)
    }
  } else {
    console.log('No code parameter received')
  }

  console.log('Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}