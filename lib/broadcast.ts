export async function broadcastNotification(payload: {
  title: string
  body: string
  url: string
  urgency: 'high' | 'normal'
  tag: string
}): Promise<void> {
  const fastapiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
  if (!fastapiUrl) return

  try {
    await fetch(`${fastapiUrl}/api/push/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('[QMeR+ notify] broadcast failed', e)
    // Non-fatal — clinical operations must not be blocked by notification failures
  }
}