import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user?.id) {
      const { data: contexts } = await supabase
        .from('context')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)

      if (!contexts || contexts.length === 0) {
        return NextResponse.redirect(new URL('/contexts/new', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/opticians', requestUrl.origin))
}
