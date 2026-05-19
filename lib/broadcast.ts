export async function broadcastNotification(payload: {
  title: string
  body: string
  url: string
  urgency: 'high' | 'normal'
  tag: string
}): Promise<void> {
  try {
    const response = await fetch('/api/push/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error('[CO5MO notify] local broadcast failed', response.status, errorBody)

      const fastapiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
      if (fastapiUrl) {
        const fallback = await fetch(`${fastapiUrl}/api/push/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!fallback.ok) {
          const fallbackError = await fallback.text().catch(() => '')
          console.error('[CO5MO notify] fallback broadcast failed', fallback.status, fallbackError)
        }
      }
    }
  } catch (e) {
    console.error('[CO5MO notify] broadcast failed', e)
    // Non-fatal — clinical operations must not be blocked by notification failures
  }
}