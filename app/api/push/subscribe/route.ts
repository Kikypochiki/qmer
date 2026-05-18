import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, p256dh, auth_key } = body

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        nurse_id: session.user.id,
        endpoint,
        p256dh,
        auth_key,
        user_agent: request.headers.get('user-agent')
      }, { onConflict: 'endpoint' })

    if (error) {
      console.error('Subscription error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
