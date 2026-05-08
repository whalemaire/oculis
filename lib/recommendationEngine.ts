export type Context = {
  style: string
  usage: string
  correction: string
  budget: string
  material: string
  colors: string
  personality: string
  frame_weight: string
}

export type FaceScan = {
  face_shape: string
  confidence: number
  ratio: number
  ipd: number
  face_width?: number
  face_height?: number
  forehead_width?: number
  jaw_width?: number
  cheek_width?: number
  nose_width?: number
  ratio_jaw_forehead?: number
  ratio_cheek_jaw?: number
  ratio_eye_spacing?: number
  ratio_symmetry?: number
}

export type FrameRecommendation = {
  name: string
  score: number
  explanation: string
  tags: string[]
  frameType: string
}

const FRAME_SHAPES: Record<string, string[]> = {
  oval:    ['Rectangulaire', 'Aviateur', 'Cat-eye', 'Wayfarer', 'Rond'],
  round:   ['Rectangulaire', 'Wayfarer', 'Cat-eye', 'Géométrique', 'Browline'],
  square:  ['Rond', 'Ovale', 'Aviateur', 'Cat-eye', 'Rimless'],
  heart:   ['Aviateur', 'Rond', 'Rimless', 'Rectangulaire fin', 'Browline'],
  oblong:  ['Wayfarer', 'Rond', 'Cat-eye', 'Oversized', 'Clubmaster'],
}

const STYLE_FRAMES: Record<string, string[]> = {
  'Classique':   ['Rectangulaire', 'Browline', 'Aviateur', 'Wayfarer'],
  'Moderne':     ['Géométrique', 'Rimless', 'Rectangulaire fin', 'Cat-eye'],
  'Streetwear':  ['Wayfarer', 'Oversized', 'Cat-eye', 'Clubmaster'],
  'Minimaliste': ['Rimless', 'Rectangulaire fin', 'Rond fin', 'Ovale fin'],
}

const USAGE_FRAMES: Record<string, string[]> = {
  'Quotidien':  ['Rectangulaire', 'Wayfarer', 'Aviateur', 'Rond'],
  'Écrans':     ['Rectangulaire', 'Rectangulaire fin', 'Géométrique', 'Browline'],
  'Sport':      ['Wayfarer', 'Oversized', 'Wrap', 'Aviateur'],
  'Fashion':    ['Cat-eye', 'Oversized', 'Géométrique', 'Clubmaster'],
}

const CORRECTION_FRAMES: Record<string, string[]> = {
  'Vue':         ['Rectangulaire', 'Rond', 'Aviateur', 'Browline', 'Wayfarer'],
  'Soleil':      ['Aviateur', 'Wayfarer', 'Oversized', 'Cat-eye', 'Wrap'],
  'Les deux':    ['Aviateur', 'Wayfarer', 'Rectangulaire', 'Cat-eye', 'Oversized'],
  'Sans correction': ['Cat-eye', 'Géométrique', 'Oversized', 'Rimless', 'Clubmaster'],
}

const ALL_FRAMES = [
  'Rectangulaire', 'Aviateur', 'Rond', 'Cat-eye', 'Wayfarer',
  'Géométrique', 'Rimless', 'Oversized', 'Browline', 'Clubmaster',
  'Rectangulaire fin', 'Ovale fin', 'Rond fin', 'Wrap',
]

const EXPLANATIONS: Record<string, string> = {
  'Rectangulaire': 'Structure et définition pour équilibrer les courbes naturelles de ton visage.',
  'Aviateur': 'Polyvalence intemporelle qui s\'adapte à toutes les occasions.',
  'Rond': 'Douceur et contraste pour affiner les traits anguleux.',
  'Cat-eye': 'Élégance et caractère pour un regard expressif.',
  'Wayfarer': 'Style iconique qui traverse les tendances sans vieillir.',
  'Géométrique': 'Modernité affirmée pour un look avant-gardiste.',
  'Rimless': 'Discrétion maximale pour laisser parler ton visage.',
  'Oversized': 'Impact visuel fort pour un style assumé.',
  'Browline': 'Classicisme revisité avec une touche de caractère.',
  'Clubmaster': 'Rétro chic pour un style sophistiqué et urbain.',
  'Rectangulaire fin': 'Élégance minimaliste pour un look professionnel.',
  'Ovale fin': 'Légèreté et subtilité pour un port naturel.',
  'Rond fin': 'Intellectuel et raffiné pour un style intemporel.',
  'Wrap': 'Performance et protection pour un usage actif.',
}

export function getRecommendations(
  scan: FaceScan,
  context: Context
): FrameRecommendation[] {
  const scores: Record<string, number> = {}

  ALL_FRAMES.forEach(frame => { scores[frame] = 0 })

  // Forme du visage — 35%
  const shapeFrames = FRAME_SHAPES[scan.face_shape] || FRAME_SHAPES['oval']
  shapeFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (35 - index * 5)
  })

  // Style — fallback niveau 1
  const styleFrames = STYLE_FRAMES[context.style] || []
  styleFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (10 - index * 2)
  })

  // Usage — fallback niveau 1
  const usageFrames = USAGE_FRAMES[context.usage] || []
  usageFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (10 - index * 2)
  })

  // Correction — fallback niveau 1
  const correctionFrames = CORRECTION_FRAMES[context.correction] || []
  correctionFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (8 - index * 1)
  })

  // Ajustement par ratio précis — affine le scoring de forme
  const ratioBonus: Record<string, { frames: string[], bonus: number }[]> = {
    oval: [
      { frames: ['Rectangulaire', 'Rectangulaire fin'], bonus: scan.ratio > 1.25 ? -8 : 5 },
      { frames: ['Rond', 'Rond fin'], bonus: scan.ratio > 1.25 ? 8 : -3 },
    ],
    round: [
      { frames: ['Rectangulaire', 'Wayfarer'], bonus: 8 },
      { frames: ['Rond', 'Ovale fin'], bonus: -10 },
    ],
    square: [
      { frames: ['Rond', 'Ovale fin', 'Rond fin'], bonus: 10 },
      { frames: ['Rectangulaire', 'Wayfarer'], bonus: -8 },
    ],
    heart: [
      { frames: ['Aviateur', 'Rond'], bonus: 8 },
      { frames: ['Cat-eye', 'Oversized'], bonus: -8 },
    ],
    oblong: [
      { frames: ['Wayfarer', 'Oversized', 'Rond'], bonus: 10 },
      { frames: ['Rectangulaire fin', 'Rimless'], bonus: -8 },
    ],
  }

  const shapeRatioBonus = ratioBonus[scan.face_shape] || []
  shapeRatioBonus.forEach(({ frames, bonus }) => {
    frames.forEach(frame => {
      if (scores[frame] !== undefined) scores[frame] += bonus
    })
  })

  // Ajustement par IPD
  const ipdNormalized = scan.ipd
  if (ipdNormalized < 100) {
    scores['Rectangulaire fin'] = (scores['Rectangulaire fin'] || 0) + 10
    scores['Rimless'] = (scores['Rimless'] || 0) + 8
    scores['Oversized'] = (scores['Oversized'] || 0) - 10
  } else if (ipdNormalized > 130) {
    scores['Wayfarer'] = (scores['Wayfarer'] || 0) + 10
    scores['Oversized'] = (scores['Oversized'] || 0) + 8
    scores['Rectangulaire fin'] = (scores['Rectangulaire fin'] || 0) - 8
  }

  // Ajustement par ratio mâchoire/front
  if (scan.ratio_jaw_forehead) {
    if (scan.ratio_jaw_forehead > 1.1) {
      scores['Rond'] = (scores['Rond'] || 0) + 8
      scores['Rond fin'] = (scores['Rond fin'] || 0) + 8
      scores['Ovale fin'] = (scores['Ovale fin'] || 0) + 6
      scores['Rectangulaire'] = (scores['Rectangulaire'] || 0) - 5
    } else if (scan.ratio_jaw_forehead < 0.85) {
      scores['Aviateur'] = (scores['Aviateur'] || 0) + 8
      scores['Wayfarer'] = (scores['Wayfarer'] || 0) + 6
      scores['Cat-eye'] = (scores['Cat-eye'] || 0) - 5
    }
  }

  // Ajustement par ratio pommettes/mâchoire
  if (scan.ratio_cheek_jaw) {
    if (scan.ratio_cheek_jaw > 1.1) {
      scores['Rectangulaire fin'] = (scores['Rectangulaire fin'] || 0) + 8
      scores['Aviateur'] = (scores['Aviateur'] || 0) + 6
      scores['Oversized'] = (scores['Oversized'] || 0) - 5
    }
  }

  // Ajustement par espacement des yeux
  if (scan.ratio_eye_spacing) {
    if (scan.ratio_eye_spacing > 0.55) {
      scores['Wayfarer'] = (scores['Wayfarer'] || 0) + 6
      scores['Oversized'] = (scores['Oversized'] || 0) + 6
      scores['Rimless'] = (scores['Rimless'] || 0) - 4
    } else if (scan.ratio_eye_spacing < 0.42) {
      scores['Rimless'] = (scores['Rimless'] || 0) + 8
      scores['Rectangulaire fin'] = (scores['Rectangulaire fin'] || 0) + 6
      scores['Oversized'] = (scores['Oversized'] || 0) - 6
    }
  }

  // Ajustement par ratio hauteur/largeur précis
  if (scan.ratio) {
    if (scan.ratio > 1.25) {
      scores['Wayfarer'] = (scores['Wayfarer'] || 0) + 8
      scores['Oversized'] = (scores['Oversized'] || 0) + 6
      scores['Rectangulaire fin'] = (scores['Rectangulaire fin'] || 0) - 6
    } else if (scan.ratio < 1.0) {
      scores['Cat-eye'] = (scores['Cat-eye'] || 0) + 6
      scores['Browline'] = (scores['Browline'] || 0) + 6
      scores['Wayfarer'] = (scores['Wayfarer'] || 0) - 4
    }
  }

  // Si confidence faible, lisse les scores pour éviter une polarisation excessive
  if (scan.confidence < 75) {
    Object.keys(scores).forEach(frame => {
      scores[frame] = scores[frame] * 0.8 + 10
    })
  }

  // Normalise les scores entre 60 et 98
  const maxScore = Math.max(...Object.values(scores))
  const minScore = Math.min(...Object.values(scores))

  const normalized: Record<string, number> = {}
  Object.entries(scores).forEach(([frame, score]) => {
    normalized[frame] = Math.round(60 + ((score - minScore) / (maxScore - minScore)) * 38)
  })

  // Trie et retourne le top 3
  return Object.entries(normalized)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, score]) => ({
      name,
      score,
      explanation: EXPLANATIONS[name] || '',
      tags: [context.style, context.usage, context.correction].filter(Boolean),
      frameType: name,
    }))
}
