import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  console.log('body reçu:', body)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('context')
    .insert([body])
    .select()

  console.log('supabase error:', error)
  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: existingContexts } = await supabase
    .from('context')
    .select('id')
    .eq('user_id', body.user_id)

  if (existingContexts && existingContexts.length === 1) {
    await supabase
      .from('context')
      .insert([{
        user_id: body.user_id,
        name: `Mon profil de base`,
        style: null,
        usage: null,
        budget: null,
        correction: null,
        material: null,
        colors: null,
        personality: null,
        wearing_frequency: null,
        frame_weight: null,
        existing_glasses: null,
        brands: null,
        is_active: false
      }])
  }

  return NextResponse.json({ success: true, context: data[0] })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) return NextResponse.json({ error: 'missing user_id' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: existing } = await supabase
    .from('context')
    .select('id')
    .eq('user_id', user_id)
    .eq('name', 'Mon profil de base')
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ exists: true })
  }

  await supabase
    .from('context')
    .insert([{
      user_id,
      name: `Mon profil de base`,
      is_active: false
    }])

  return NextResponse.json({ created: true })
}
