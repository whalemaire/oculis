import { Frame, FRAMES_CATALOG } from './framesData'

type ScanData = {
  face_shape: string
  ipd: number
  face_width: number
  ratio: number
  nose_width?: number
  ratio_cheek_jaw?: number
  shape_probabilities?: Record<string, number>
}

type ContextData = {
  style?: string
  usage?: string
  correction?: string
  budget?: string
  material?: string
  frame_weight?: string
  gender?: string
}

export function scoreFrame(frame: Frame, scan: ScanData, context: ContextData): number {
  let score = 0

  // === MATCHING BIOMÉTRIQUE (50%) ===

  // 1. Largeur monture vs largeur visage
  if (scan.face_width) {
    const idealWidth = scan.face_width * 0.95
    const diff = Math.abs(frame.total_width - idealWidth)
    if (diff < 5) score += 20
    else if (diff < 10) score += 15
    else if (diff < 15) score += 8
    else score -= 5
  }

  // 2. Pont vs largeur nez
  if (scan.nose_width && scan.face_width) {
    const noseRatio = scan.nose_width / scan.face_width
    if (noseRatio > 0.35 && frame.bridge_width >= 18) score += 10
    else if (noseRatio < 0.28 && frame.bridge_width <= 18) score += 10
    else if (noseRatio >= 0.28 && noseRatio <= 0.35 && frame.bridge_width >= 16 && frame.bridge_width <= 20) score += 10
  }

  // 3. IPD vs largeur verre
  if (scan.ipd) {
    const idealLensWidth = scan.ipd * 0.42
    const diff = Math.abs(frame.lens_width - idealLensWidth)
    if (diff < 3) score += 15
    else if (diff < 6) score += 8
    else score -= 5
  }

  // 4. Compatibilité forme visage
  const shapeCompatibility: Record<string, Record<string, number>> = {
    'Wayfarer':          { oval: 18, round: 20, square: 14, heart: 14, oblong: 22 },
    'Aviateur':          { oval: 20, round: 16, square: 18, heart: 22, oblong: 14 },
    'Rectangulaire':     { oval: 22, round: 22, square: 14, heart: 16, oblong: 14 },
    'Rectangulaire fin': { oval: 20, round: 20, square: 12, heart: 18, oblong: 12 },
    'Rond':              { oval: 18, round: 10, square: 22, heart: 20, oblong: 20 },
    'Rond fin':          { oval: 18, round: 10, square: 22, heart: 22, oblong: 18 },
    'Ovale fin':         { oval: 16, round: 12, square: 20, heart: 20, oblong: 16 },
    'Cat-eye':           { oval: 18, round: 16, square: 20, heart: 14, oblong: 16 },
    'Oversized':         { oval: 16, round: 14, square: 14, heart: 12, oblong: 20 },
    'Géométrique':       { oval: 18, round: 20, square: 16, heart: 16, oblong: 14 },
    'Rimless':           { oval: 16, round: 14, square: 18, heart: 20, oblong: 14 },
    'Browline':          { oval: 16, round: 18, square: 14, heart: 16, oblong: 16 },
    'Clubmaster':        { oval: 16, round: 18, square: 14, heart: 14, oblong: 20 },
    'Wrap':              { oval: 12, round: 12, square: 12, heart: 12, oblong: 14 },
  }

  if (scan.shape_probabilities) {
    const compat = shapeCompatibility[frame.style] || {}
    let morphScore = 0
    Object.entries(scan.shape_probabilities).forEach(([shape, prob]) => {
      morphScore += ((compat[shape] || 12) * prob) / 100
    })
    score += Math.round(morphScore)
  } else {
    const compat = shapeCompatibility[frame.style] || {}
    score += compat[scan.face_shape] || 12
  }

  // === MATCHING CONTEXTUEL (50%) ===

  // 5. Style
  if (context.style && frame.style_tags.includes(context.style)) score += 15
  if (context.style === 'Minimaliste' && ['Rimless', 'Rectangulaire fin', 'Métal'].includes(frame.style)) score += 8
  if (context.style === 'Streetwear' && frame.style_tags.some(t => ['Streetwear', 'Sportif', 'Coloré'].includes(t))) score += 8
  if (context.style === 'Classique' && frame.style_tags.some(t => ['Classique', 'Intemporel'].includes(t))) score += 8
  if (context.style === 'Moderne' && frame.style_tags.some(t => ['Moderne', 'Design', 'Avant-garde'].includes(t))) score += 8

  // 6. Usage
  if (context.usage && frame.usage_tags.includes(context.usage)) score += 12

  // 7. Correction
  if (context.correction && frame.correction_types.includes(context.correction)) score += 15
  else if (context.correction && !frame.correction_types.includes(context.correction)) score -= 20

  // 8. Budget
  if (context.budget && frame.price_range === context.budget) score += 10
  else if (context.budget === 'Moins de 100€' && frame.price_range === '100-300€') score -= 5
  else if (context.budget === 'Moins de 100€' && frame.price_range === '300€+') score -= 20

  // 9. Matière
  if (context.material && context.material !== 'Peu importe' && frame.material === context.material) score += 8

  // 10. Poids
  if (context.frame_weight === 'Légères' && frame.weight_grams < 15) score += 10
  if (context.frame_weight === 'Légères' && frame.weight_grams > 25) score -= 10
  if (context.frame_weight === 'Robustes' && frame.weight_grams > 22) score += 8

  // 11. Genre
  if (frame.gender !== 'Mixte') {
    if (context.gender && frame.gender !== context.gender) score -= 15
  }

  const rawScore = Math.max(0, score)
  const normalized = Math.round(60 + (rawScore / 120) * 38)
  return Math.min(98, normalized)
}

export function getTopFrames(
  scan: ScanData,
  context: ContextData,
  limit: number = 10
): (Frame & { score: number })[] {
  return FRAMES_CATALOG
    .map(frame => ({ ...frame, score: scoreFrame(frame, scan, context) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
