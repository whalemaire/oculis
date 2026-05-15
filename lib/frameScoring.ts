import { Frame, FRAMES_CATALOG } from './framesData'

type ScanData = {
  face_shape: string
  ipd: number
  face_width: number
  ratio: number
  nose_width?: number
  ratio_cheek_jaw?: number
  shape_probabilities?: Record<string, number>
  gender?: string
  age?: number
  chin_height?: number
  forehead_width?: number
  nose_length?: number
  face_height?: number
}

type ContextData = {
  style?: string
  usage?: string
  correction?: string
  budget?: string
  material?: string
  frame_weight?: string
  gender?: string
  colors?: string
  personality?: string
  wearing_frequency?: string
  existing_glasses?: string
  brands?: string
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

  // === GENRE (8 points max) ===
  if (scan.gender) {
    const isFemale = scan.gender === 'Female'
    const isMale = scan.gender === 'Male'

    if (isFemale) {
      if (['Cat-eye', 'Ovale fin', 'Rond fin', 'Oversized'].includes(frame.style)) score += 8
      if (['Wayfarer', 'Rectangulaire'].includes(frame.style) && frame.gender === 'Homme') score -= 6
      if (frame.gender === 'Femme') score += 5
    }

    if (isMale) {
      if (['Rectangulaire', 'Aviateur', 'Wayfarer', 'Browline'].includes(frame.style)) score += 8
      if (['Cat-eye'].includes(frame.style)) score -= 10
      if (frame.gender === 'Homme') score += 5
    }
  }

  // === ÂGE (8 points max) ===
  if (scan.age) {
    const age = scan.age

    if (age < 12) {
      if (frame.total_width < 120) score += 15
      if (frame.weight_grams < 15) score += 10
      if (frame.style_tags.some((t: string) => ['Coloré', 'Accessible'].includes(t))) score += 8
      if (['Wayfarer', 'Rond', 'Rectangulaire'].includes(frame.style)) score += 8
      if (frame.price_range === '300€+') score -= 20
    } else if (age >= 12 && age < 18) {
      if (['Wayfarer', 'Cat-eye', 'Géométrique', 'Rond'].includes(frame.style)) score += 8
      if (frame.style_tags.some((t: string) => ['Streetwear', 'Coloré', 'Accessible'].includes(t))) score += 6
      if (frame.price_range === '300€+') score -= 10
    } else if (age < 25) {
      if (['Oversized', 'Géométrique', 'Cat-eye', 'Wayfarer'].includes(frame.style)) score += 8
      if (frame.style_tags.some(t => ['Coloré', 'Streetwear', 'Avant-garde'].includes(t))) score += 5
      if (['Browline', 'Clubmaster', 'Rimless'].includes(frame.style)) score -= 4
    } else if (age >= 25 && age < 40) {
      if (['Rectangulaire', 'Aviateur', 'Wayfarer', 'Rond'].includes(frame.style)) score += 6
      if (frame.style_tags.some(t => ['Classique', 'Moderne', 'Intemporel'].includes(t))) score += 4
    } else if (age >= 40 && age < 60) {
      if (['Browline', 'Clubmaster', 'Rectangulaire', 'Aviateur'].includes(frame.style)) score += 8
      if (frame.style_tags.some(t => ['Classique', 'Premium', 'Professionnel'].includes(t))) score += 5
      if (['Oversized', 'Géométrique'].includes(frame.style)) score -= 4
    } else if (age >= 60) {
      if (['Rimless', 'Rectangulaire fin', 'Ovale fin', 'Rond fin'].includes(frame.style)) score += 10
      if (frame.weight_grams < 15) score += 8
      if (['Oversized', 'Wrap'].includes(frame.style)) score -= 6
    }
  }

  // === COULEURS PORTÉES (6 points max) ===
  if (context.colors) {
    if (context.colors === 'Neutres') {
      if (frame.material === 'Métal') score += 6
      if (['Rimless', 'Rectangulaire fin', 'Aviateur'].includes(frame.style)) score += 4
      if (frame.style_tags.some(t => ['Coloré', 'Avant-garde'].includes(t))) score -= 5
    }
    if (context.colors === 'Colorées') {
      if (frame.material === 'Acétate') score += 6
      if (['Cat-eye', 'Oversized', 'Géométrique'].includes(frame.style)) score += 4
      if (frame.style_tags.some(t => ['Coloré', 'Artistique'].includes(t))) score += 4
    }
    if (context.colors === 'Sombres') {
      if (['Rectangulaire', 'Wayfarer', 'Browline'].includes(frame.style)) score += 5
      if (frame.style_tags.some(t => ['Classique', 'Premium'].includes(t))) score += 3
    }
    if (context.colors === 'Mixtes') {
      if (['Clubmaster', 'Browline', 'Wayfarer'].includes(frame.style)) score += 4
    }
  }

  // === PERSONNALITÉ (8 points max) ===
  if (context.personality) {
    if (context.personality === 'Discret') {
      if (['Rimless', 'Rectangulaire fin', 'Ovale fin', 'Rond fin'].includes(frame.style)) score += 8
      if (frame.weight_grams < 15) score += 4
      if (['Oversized', 'Cat-eye', 'Géométrique'].includes(frame.style)) score -= 8
    }
    if (context.personality === 'Affirmé') {
      if (['Oversized', 'Cat-eye', 'Géométrique', 'Clubmaster'].includes(frame.style)) score += 8
      if (frame.style_tags.some(t => ['Avant-garde', 'Coloré', 'Design'].includes(t))) score += 5
      if (['Rimless', 'Rectangulaire fin'].includes(frame.style)) score -= 5
    }
  }

  // === FRÉQUENCE DE PORT (5 points max) ===
  if (context.wearing_frequency) {
    if (context.wearing_frequency === 'Toute la journée') {
      if (frame.weight_grams < 15) score += 8
      if (['Rimless', 'Rectangulaire fin', 'Ovale fin'].includes(frame.style)) score += 5
      if (frame.weight_grams > 28) score -= 8
    }
    if (context.wearing_frequency === 'Occasionnellement') {
      if (['Cat-eye', 'Oversized', 'Géométrique'].includes(frame.style)) score += 4
    }
    if (context.wearing_frequency === 'Pour lire') {
      if (['Rectangulaire fin', 'Rimless', 'Rectangulaire'].includes(frame.style)) score += 6
      if (frame.weight_grams < 18) score += 4
    }
  }

  // === LUNETTES EXISTANTES (6 points max) ===
  if (context.existing_glasses) {
    if (context.existing_glasses === 'Je veux changer') {
      if (['Géométrique', 'Cat-eye', 'Oversized', 'Clubmaster'].includes(frame.style)) score += 6
    }
    if (context.existing_glasses === 'Première paire') {
      if (['Rectangulaire', 'Aviateur', 'Wayfarer', 'Rond'].includes(frame.style)) score += 8
      if (frame.style_tags.some(t => ['Classique', 'Intemporel', 'Accessible'].includes(t))) score += 4
      if (['Géométrique', 'Oversized', 'Avant-garde'].includes(frame.style)) score -= 6
    }
    if (context.existing_glasses === "J'aime mon style actuel") {
      if (context.style && frame.style_tags.includes(context.style)) score += 8
    }
  }

  // === MARQUES (filtre doux) ===
  if (context.brands) {
    if (context.brands === 'Marques connues') {
      const knownBrands = ['Ray-Ban', 'Persol', 'Oakley', 'Tom Ford', 'Gucci', 'Prada', 'Dior', 'Saint Laurent', 'Chloé']
      if (knownBrands.includes(frame.brand)) score += 8
      else score -= 3
    }
    if (context.brands === 'Indépendant') {
      const independentBrands = ['Anne et Valentin', 'Face à Face', 'Matsuda', 'Mykita', 'Lindberg', 'Silhouette', 'Alain Mikli']
      if (independentBrands.includes(frame.brand)) score += 10
      else score -= 2
    }
  }

  // === MORPHOLOGIE PRÉCISE (10 points max) ===

  if (scan.chin_height && scan.face_height) {
    const chinRatio = scan.chin_height / scan.face_height
    if (chinRatio < 0.18) {
      if (['Oversized', 'Cat-eye'].includes(frame.style)) score -= 6
      if (['Rectangulaire fin', 'Aviateur'].includes(frame.style)) score += 6
    }
    if (chinRatio > 0.28) {
      if (['Wayfarer', 'Browline'].includes(frame.style)) score += 6
      if (['Rimless', 'Rectangulaire fin'].includes(frame.style)) score -= 4
    }
  }

  if (scan.forehead_width && scan.face_width) {
    const foreheadRatio = scan.forehead_width / scan.face_width
    if (foreheadRatio < 0.80) {
      if (['Browline', 'Clubmaster'].includes(frame.style)) score -= 8
      if (['Aviateur', 'Ovale fin'].includes(frame.style)) score += 6
    }
    if (foreheadRatio > 0.95) {
      if (['Browline', 'Clubmaster'].includes(frame.style)) score += 8
      if (['Cat-eye'].includes(frame.style)) score -= 4
    }
  }

  if (scan.nose_length && scan.face_height) {
    const noseLengthRatio = scan.nose_length / scan.face_height
    if (noseLengthRatio > 0.38) {
      if (['Aviateur', 'Ovale fin'].includes(frame.style)) score += 8
      if (frame.bridge_width >= 20) score += 4
      if (['Browline'].includes(frame.style)) score -= 4
    }
    if (noseLengthRatio < 0.28) {
      if (['Browline', 'Cat-eye'].includes(frame.style)) score += 6
      if (['Aviateur'].includes(frame.style)) score -= 4
    }
  }

  if (scan.ratio) {
    if (scan.ratio >= 1.10 && scan.ratio <= 1.25) {
      if (['Rectangulaire', 'Aviateur', 'Wayfarer'].includes(frame.style)) score += 5
    }
    if (scan.ratio > 1.35) {
      if (['Wayfarer', 'Oversized', 'Clubmaster'].includes(frame.style)) score += 8
      if (['Rimless', 'Rectangulaire fin'].includes(frame.style)) score -= 6
    }
    if (scan.ratio < 1.05) {
      if (['Cat-eye', 'Browline', 'Rectangulaire'].includes(frame.style)) score += 8
      if (['Oversized', 'Rond'].includes(frame.style)) score -= 6
    }
  }

  if (score < 35) return 0

  const normalized = (() => {
    if (score >= 90) return Math.round(92 + (score - 90) * 0.6)
    if (score >= 70) return Math.round(78 + (score - 70) * 0.7)
    if (score >= 50) return Math.round(65 + (score - 50) * 0.65)
    if (score >= 35) return Math.round(60 + (score - 35) * 0.33)
    return 0
  })()

  return Math.min(98, Math.max(0, normalized))
}

export function getTopFrames(
  scan: ScanData,
  context: ContextData,
  limit: number = 10
): (Frame & { score: number })[] {
  return FRAMES_CATALOG
    .map(frame => ({ ...frame, score: scoreFrame(frame, scan, context) }))
    .filter(frame => frame.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
