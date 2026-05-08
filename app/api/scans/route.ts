import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const {
    user_id, face_shape, confidence, gender, age,
    measurements, ratios
  } = await request.json()

  console.log('body reçu:', { user_id, face_shape, confidence, measurements, ratios })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: existing } = await supabase
    .from('scan')
    .select('id')
    .eq('user_id', user_id)
    .limit(1)

  const scanPayload = {
    user_id,
    face_shape,
    confidence,
    gender,
    age,
    ipd:               measurements?.ipd,
    face_width:        measurements?.faceWidth,
    face_height:       measurements?.faceHeight,
    forehead_width:    measurements?.foreheadWidth,
    jaw_width:         measurements?.jawWidth,
    cheek_width:       measurements?.cheekWidth,
    nose_width:        measurements?.noseWidth,
    nose_length:       measurements?.noseLength,
    chin_height:       measurements?.chinHeight,
    ratio:             ratios?.heightWidth,
    ratio_jaw_forehead: ratios?.jawForehead,
    ratio_cheek_jaw:   ratios?.cheekJaw,
    ratio_nose_face:   ratios?.noseFace,
    ratio_eye_spacing: ratios?.eyeSpacing,
    ratio_symmetry:    ratios?.symmetry,
  }

  let data, error

  if (existing && existing.length > 0) {
    ;({ data, error } = await supabase
      .from('scan')
      .update(scanPayload)
      .eq('user_id', user_id)
      .select())
  } else {
    ;({ data, error } = await supabase
      .from('scan')
      .insert([scanPayload])
      .select())
  }

  console.log('supabase error:', error)
  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase
    .from('context')
    .update({ name: 'Mon profil de base' })
    .eq('user_id', user_id)
    .eq('name', 'Mon profil de base')

  return NextResponse.json({ success: true, scan: data![0] })
}
