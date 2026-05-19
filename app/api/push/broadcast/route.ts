import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// web-push does not ship TypeScript declarations in this project setup.
// Keep the import untyped to avoid blocking the route build.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push') as any

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, body, url, urgency, tag } = await request.json()

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:test@example.com'

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'VAPID keys are not configured' }, { status: 500 })
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let sent = 0
    let failed = 0

    for (const row of subscriptions ?? []) {
      try {
        await webpush.sendNotification({
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth_key,
          },
        }, JSON.stringify({ title, body, url, urgency, tag }))
        sent += 1
      } catch (pushError: any) {
        if (pushError?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint)
        }
        console.error('Push send failed:', pushError)
        failed += 1
      }
    }

    return NextResponse.json({ ok: true, sent, failed })
  } catch (err: any) {
    console.error('Broadcast route failed:', err)
    return NextResponse.json({ error: err.message || 'Broadcast failed' }, { status: 500 })
  }
}