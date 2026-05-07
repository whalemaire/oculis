import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { imageBase64 } = await request.json()

  const formData = new URLSearchParams()
  formData.append('api_key', process.env.FACEPP_API_KEY!)
  formData.append('api_secret', process.env.FACEPP_API_SECRET!)
  formData.append('image_base64', imageBase64)
  formData.append('return_attributes', 'gender,age,facequality')
  formData.append('return_landmark', '1')

  const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  console.log('Face++ response:', JSON.stringify(data, null, 2))

  if (!data.faces || data.faces.length === 0) {
    return NextResponse.json({ error: 'no_face' }, { status: 400 })
  }

  const face = data.faces[0]
  const landmarks = face.landmark

  const faceWidth = Math.abs(landmarks.contour_left1.x - landmarks.contour_right1.x)
  const faceHeight = Math.abs(landmarks.contour_chin.y - landmarks.contour_left1.y)
  const ratio = faceHeight / faceWidth

  let faceShape = 'oval'
  if (ratio >= 1.20) faceShape = 'oblong'
  else if (ratio >= 1.05) faceShape = 'oval'
  else if (ratio >= 0.95) faceShape = 'square'
  else faceShape = 'round'

  const leftEye = landmarks.left_eye_center
  const rightEye = landmarks.right_eye_center
  const ipd = Math.round(Math.abs(rightEye.x - leftEye.x))

  const qualityValue = face.attributes?.facequality?.value
  console.log('facequality raw value:', qualityValue)

  console.log('Résultat final:', { faceShape, confidence: qualityValue ? Math.round(qualityValue) : 85, ratio, faceWidth, faceHeight, ipd })

  return NextResponse.json({
    faceShape,
    confidence: Math.round(face.attributes?.facequality?.value) || 85,
    age: face.attributes?.age?.value,
    gender: face.attributes?.gender?.value,
    ipd,
    ratio: Math.round(ratio * 100) / 100,
  })
}
