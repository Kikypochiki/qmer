import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Configurable table name for storing AI predictions from the client
export const SUPABASE_PREDICTIONS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_PREDICTIONS_TABLE || 'predictions'
