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

  // Système probabiliste — chaque forme reçoit un score 0-100
  const shapeScores = {
    oval:   0,
    round:  0,
    square: 0,
    heart:  0,
    oblong: 0,
  }

  // --- Oval ---
  if (ratioHeightWidth >= 1.10 && ratioHeightWidth <= 1.40) shapeScores.oval += 30
  if (ratioJawForehead >= 0.85 && ratioJawForehead <= 1.05) shapeScores.oval += 25
  if (ratioCheekJaw >= 1.0 && ratioCheekJaw <= 1.15) shapeScores.oval += 25
  if (ratioForeheadFace >= 0.75 && ratioForeheadFace <= 0.95) shapeScores.oval += 20

  // --- Round ---
  if (ratioHeightWidth < 1.10) shapeScores.round += 35
  if (ratioCheekJaw > 1.10) shapeScores.round += 30
  if (ratioJawForehead < 0.90) shapeScores.round += 20
  if (ratioHeightWidth < 1.05) shapeScores.round += 15

  // --- Square ---
  if (ratioJawForehead > 1.05) shapeScores.square += 30
  if (ratioHeightWidth < 1.20) shapeScores.square += 25
  if (ratioCheekJaw < 0.90) shapeScores.square += 25
  if (ratioJawForehead > 1.15) shapeScores.square += 20

  // --- Heart ---
  if (ratioForeheadFace > 0.90) shapeScores.heart += 30
  if (ratioJawForehead < 0.80) shapeScores.heart += 35
  if (ratioCheekJaw > 1.15) shapeScores.heart += 20
  if (ratioJawForehead < 0.75) shapeScores.heart += 15

  // --- Oblong ---
  if (ratioHeightWidth > 1.40) shapeScores.oblong += 40
  if (ratioJawForehead >= 0.85 && ratioJawForehead <= 1.10) shapeScores.oblong += 25
  if (ratioHeightWidth > 1.50) shapeScores.oblong += 20
  if (ratioCheekJaw >= 0.90 && ratioCheekJaw <= 1.10) shapeScores.oblong += 15

  // --- Pénalités croisées ---
  if (ratioHeightWidth > 1.25) {
    shapeScores.square = Math.round(shapeScores.square * 0.3)
    shapeScores.oval += 15
    shapeScores.oblong += 10
  }
  if (ratioHeightWidth < 1.10) {
    shapeScores.oblong = Math.round(shapeScores.oblong * 0.2)
    shapeScores.round += 15
  }
  if (ratioCheekJaw > 1.05) {
    shapeScores.square = Math.round(shapeScores.square * 0.5)
    shapeScores.oval += 10
    shapeScores.round += 10
  }
  if (ratioJawForehead > 1.15 && ratioHeightWidth < 1.15) {
    shapeScores.square += 20
  }
  if (ratioJawForehead < 0.78) {
    shapeScores.heart += 20
    shapeScores.square = Math.round(shapeScores.square * 0.3)
  }

  // Normalise les scores en pourcentages
  const totalScore = Object.values(shapeScores).reduce((a, b) => a + b, 0)
  const shapeProbabilities = Object.fromEntries(
    Object.entries(shapeScores).map(([k, v]) => [k, Math.round((v / totalScore) * 100)])
  ) as Record<string, number>

  // Forme dominante
  const faceShape = Object.entries(shapeProbabilities)
    .sort(([, a], [, b]) => b - a)[0][0]

  // Top 3 formes pour le moteur hybride
  const topShapes = Object.entries(shapeProbabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([shape, prob]) => ({ shape, probability: prob }))

  console.log('Shape probabilities:', shapeProbabilities)
  console.log('Primary shape:', faceShape, 'Top shapes:', topShapes)

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
    shapeProbabilities,
    topShapes,
    confidence: Math.round(face.attributes?.facequality?.value) || 85,
    gender: face.attributes?.gender?.value,
    age: face.attributes?.age?.value,
    measurements,
    ratios,
  })
}
