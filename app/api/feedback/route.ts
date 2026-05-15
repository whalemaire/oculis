import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const { user_id, frame_id, frame_style, signal_type, context_id } = await request.json()

  const weight = signal_type === 'like' ? 2.0
    : signal_type === 'dislike' ? -2.0
    : signal_type === 'click_optician' ? 1.0
    : 0.5

  // Supprime le feedback existant pour cette monture si il existe
  await supabase
    .from('feedback')
    .delete()
    .eq('user_id', user_id)
    .eq('frame_id', frame_id)

  // Insère le nouveau feedback
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ user_id, frame_id, frame_style, signal_type, weight, context_id }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, feedback: data[0] })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) return NextResponse.json({ error: 'missing user_id' }, { status: 400 })

  const { data } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ feedbacks: data || [] })
}
