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

  console.log('Landmarks disponibles:', Object.keys(landmarks))
  console.log('Valeurs landmarks:', JSON.stringify(landmarks, null, 2))

  const chin = landmarks.contour_chin
  const leftCheek = landmarks.contour_left5
  const rightCheek = landmarks.contour_right5
  const leftJaw = landmarks.contour_left3
  const rightJaw = landmarks.contour_right3
  const leftBrow = landmarks.left_eyebrow_upper_middle
  const rightBrow = landmarks.right_eyebrow_upper_middle

  const faceWidth = Math.abs(rightCheek.x - leftCheek.x)
  const jawWidth = Math.abs(rightJaw.x - leftJaw.x)
  const browY = (leftBrow.y + rightBrow.y) / 2
  const faceHeight = Math.abs(chin.y - browY)
  const foreheadWidth = Math.abs(
    landmarks.right_eyebrow_right_corner.x - landmarks.left_eyebrow_left_corner.x
  )

  const ratio = faceHeight / faceWidth
  const jawRatio = jawWidth / faceWidth
  const foreheadRatio = foreheadWidth / faceWidth

  console.log('Mesures corrigées:', { faceWidth, jawWidth, foreheadWidth, faceHeight, ratio, jawRatio, foreheadRatio })

  let faceShape = 'oval'
  if (ratio < 1.05) {
    faceShape = 'round'
  } else if (ratio >= 1.40) {
    faceShape = 'oblong'
  } else if (jawRatio > 0.85 && foreheadRatio > 0.85) {
    faceShape = 'square'
  } else if (foreheadRatio > jawRatio + 0.15) {
    faceShape = 'heart'
  } else {
    faceShape = 'oval'
  }

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
