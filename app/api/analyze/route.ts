import { NextResponse } from 'next/server'

function dist(a: {x:number,y:number}, b: {x:number,y:number}) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}
function midpoint(a: {x:number,y:number}, b: {x:number,y:number}) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}
function round(n: number) {
  return Math.round(n * 1000) / 1000
}

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
  const l = face.landmark

  const faceWidth      = Math.abs(l.contour_right5.x - l.contour_left5.x)
  const faceHeight     = dist(l.contour_chin,             midpoint(l.left_eyebrow_upper_middle, l.right_eyebrow_upper_middle))
  const foreheadWidth  = Math.abs(l.right_eyebrow_right_corner.x - l.left_eyebrow_left_corner.x)
  const jawWidth       = Math.abs(l.contour_right3.x - l.contour_left3.x)
  const cheekWidth     = Math.abs(l.contour_right6.x - l.contour_left6.x)
  const noseWidth      = dist(l.nose_left,                l.nose_right)
  const noseLength     = dist(l.nose_contour_left1,       l.nose_contour_lower_middle)
  const ipd            = dist(l.left_eye_center,          l.right_eye_center)
  const chinHeight     = dist(l.contour_chin,             l.mouth_lower_lip_bottom)

  const ratioHeightWidth  = round(faceHeight / faceWidth)
  const ratioJawForehead  = round(jawWidth / foreheadWidth)
  const ratioCheekJaw     = round(cheekWidth / jawWidth)
  const ratioNoseFace     = round(noseWidth / faceWidth)
  const ratioEyeSpacing   = round(ipd / faceWidth)
  const ratioForeheadFace = round(foreheadWidth / faceWidth)
  const ratioChinFace     = round(chinHeight / faceHeight)

  const leftHalfWidth  = dist(l.contour_left5,  { x: (l.contour_left5.x + l.contour_right5.x) / 2, y: (l.contour_left5.y + l.contour_right5.y) / 2 })
  const rightHalfWidth = dist(l.contour_right5, { x: (l.contour_left5.x + l.contour_right5.x) / 2, y: (l.contour_left5.y + l.contour_right5.y) / 2 })
  const symmetryScore  = Math.round((1 - Math.abs(leftHalfWidth - rightHalfWidth) / faceWidth) * 1000) / 1000

  let faceShape = 'oval'
  if (ratioHeightWidth < 1.05) {
    faceShape = 'round'
  } else if (ratioHeightWidth > 1.40) {
    faceShape = 'oblong'
  } else if (ratioJawForehead > 0.95 && ratioCheekJaw < 1.05) {
    faceShape = 'square'
  } else if (ratioForeheadFace > 0.72 && ratioJawForehead < 0.75) {
    faceShape = 'heart'
  } else {
    faceShape = 'oval'
  }

  const measurements = {
    faceWidth:     Math.round(faceWidth),
    faceHeight:    Math.round(faceHeight),
    foreheadWidth: Math.round(foreheadWidth),
    jawWidth:      Math.round(jawWidth),
    cheekWidth:    Math.round(cheekWidth),
    noseWidth:     Math.round(noseWidth),
    noseLength:    Math.round(noseLength),
    ipd:           Math.round(ipd),
    chinHeight:    Math.round(chinHeight),
  }

  const ratios = {
    heightWidth:  ratioHeightWidth,
    jawForehead:  ratioJawForehead,
    cheekJaw:     ratioCheekJaw,
    noseFace:     ratioNoseFace,
    eyeSpacing:   ratioEyeSpacing,
    foreheadFace: ratioForeheadFace,
    chinFace:     ratioChinFace,
    symmetry:     symmetryScore,
  }

  console.log('Measurements:', measurements)
  console.log('Ratios:', ratios)
  console.log('faceShape:', faceShape)

  return NextResponse.json({
    faceShape,
    confidence: Math.round(face.attributes?.facequality?.value) || 85,
    gender: face.attributes?.gender?.value,
    age: face.attributes?.age?.value,
    measurements,
    ratios,
  })
}
