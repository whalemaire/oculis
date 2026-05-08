export type Context = {
  style: string
  usage: string
  correction: string
  budget: string
  material: string
  colors: string
  personality: string
  frame_weight: string
  existing_glasses?: string
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

  // NIVEAU 2 — Scoring contextuel par combinaisons

  // Combinaison Style + Correction
  const styleCorrection = `${context.style}|${context.correction}`
  const styleCorrectionBonus: Record<string, { frames: string[], bonus: number }[]> = {
    'Classique|Vue': [
      { frames: ['Rectangulaire', 'Browline', 'Wayfarer'], bonus: 15 },
      { frames: ['Cat-eye', 'Oversized'], bonus: -10 },
    ],
    'Classique|Soleil': [
      { frames: ['Aviateur', 'Wayfarer', 'Browline'], bonus: 15 },
      { frames: ['Rimless', 'Géométrique'], bonus: -10 },
    ],
    'Classique|Les deux': [
      { frames: ['Wayfarer', 'Aviateur', 'Rectangulaire'], bonus: 12 },
    ],
    'Moderne|Vue': [
      { frames: ['Géométrique', 'Rimless', 'Rectangulaire fin'], bonus: 15 },
      { frames: ['Wayfarer', 'Browline'], bonus: -8 },
    ],
    'Moderne|Soleil': [
      { frames: ['Géométrique', 'Cat-eye', 'Oversized'], bonus: 15 },
      { frames: ['Wayfarer', 'Browline'], bonus: -8 },
    ],
    'Moderne|Les deux': [
      { frames: ['Géométrique', 'Rimless', 'Cat-eye'], bonus: 12 },
    ],
    'Streetwear|Vue': [
      { frames: ['Wayfarer', 'Clubmaster', 'Oversized'], bonus: 15 },
      { frames: ['Rimless', 'Rectangulaire fin'], bonus: -10 },
    ],
    'Streetwear|Soleil': [
      { frames: ['Oversized', 'Cat-eye', 'Wayfarer'], bonus: 18 },
      { frames: ['Rimless', 'Browline'], bonus: -10 },
    ],
    'Streetwear|Les deux': [
      { frames: ['Wayfarer', 'Oversized', 'Clubmaster'], bonus: 15 },
    ],
    'Minimaliste|Vue': [
      { frames: ['Rimless', 'Rectangulaire fin', 'Rond fin'], bonus: 18 },
      { frames: ['Oversized', 'Clubmaster'], bonus: -12 },
    ],
    'Minimaliste|Soleil': [
      { frames: ['Rimless', 'Aviateur', 'Géométrique'], bonus: 15 },
      { frames: ['Oversized', 'Wayfarer'], bonus: -10 },
    ],
    'Minimaliste|Les deux': [
      { frames: ['Rimless', 'Aviateur', 'Rectangulaire fin'], bonus: 15 },
    ],
  }

  const scBonus = styleCorrectionBonus[styleCorrection] || []
  scBonus.forEach(({ frames, bonus }) => {
    frames.forEach(frame => {
      if (scores[frame] !== undefined) scores[frame] += bonus
    })
  })

  // Combinaison Usage + Matière
  const usageMaterial = `${context.usage}|${context.material}`
  const usageMaterialBonus: Record<string, { frames: string[], bonus: number }[]> = {
    'Quotidien|Acétate': [
      { frames: ['Wayfarer', 'Rectangulaire', 'Clubmaster'], bonus: 10 },
    ],
    'Quotidien|Métal': [
      { frames: ['Aviateur', 'Rimless', 'Rectangulaire fin'], bonus: 10 },
    ],
    'Quotidien|Mixte': [
      { frames: ['Browline', 'Clubmaster', 'Wayfarer'], bonus: 8 },
    ],
    'Écrans|Acétate': [
      { frames: ['Rectangulaire', 'Browline'], bonus: 12 },
      { frames: ['Oversized', 'Wayfarer'], bonus: -6 },
    ],
    'Écrans|Métal': [
      { frames: ['Rectangulaire fin', 'Rimless', 'Géométrique'], bonus: 12 },
    ],
    'Sport|Acétate': [
      { frames: ['Wayfarer', 'Oversized'], bonus: 10 },
    ],
    'Sport|Métal': [
      { frames: ['Aviateur', 'Wrap', 'Rimless'], bonus: 12 },
    ],
    'Fashion|Acétate': [
      { frames: ['Cat-eye', 'Oversized', 'Clubmaster'], bonus: 15 },
    ],
    'Fashion|Métal': [
      { frames: ['Cat-eye', 'Géométrique', 'Aviateur'], bonus: 12 },
    ],
  }

  const umBonus = usageMaterialBonus[usageMaterial] || []
  umBonus.forEach(({ frames, bonus }) => {
    frames.forEach(frame => {
      if (scores[frame] !== undefined) scores[frame] += bonus
    })
  })

  // Combinaison Personnalité + Couleurs
  const personalityColors = `${context.personality}|${context.colors}`
  const personalityColorsBonus: Record<string, { frames: string[], bonus: number }[]> = {
    'Discret|Neutres': [
      { frames: ['Rimless', 'Rectangulaire fin', 'Aviateur'], bonus: 12 },
      { frames: ['Oversized', 'Cat-eye'], bonus: -8 },
    ],
    'Discret|Sombres': [
      { frames: ['Rectangulaire fin', 'Wayfarer', 'Aviateur'], bonus: 10 },
    ],
    'Affirmé|Colorées': [
      { frames: ['Cat-eye', 'Oversized', 'Géométrique'], bonus: 15 },
      { frames: ['Rimless', 'Rectangulaire fin'], bonus: -10 },
    ],
    'Affirmé|Sombres': [
      { frames: ['Wayfarer', 'Oversized', 'Browline'], bonus: 12 },
    ],
    'Affirmé|Neutres': [
      { frames: ['Wayfarer', 'Clubmaster', 'Géométrique'], bonus: 10 },
    ],
    'Affirmé|Mixtes': [
      { frames: ['Cat-eye', 'Géométrique', 'Clubmaster'], bonus: 12 },
    ],
    'Discret|Mixtes': [
      { frames: ['Aviateur', 'Rectangulaire', 'Browline'], bonus: 8 },
    ],
    'Discret|Colorées': [
      { frames: ['Rond fin', 'Géométrique', 'Rectangulaire fin'], bonus: 8 },
    ],
  }

  const pcBonus = personalityColorsBonus[personalityColors] || []
  pcBonus.forEach(({ frames, bonus }) => {
    frames.forEach(frame => {
      if (scores[frame] !== undefined) scores[frame] += bonus
    })
  })

  // Budget — filtre les montures hors gamme
  const budgetPenalty: Record<string, string[]> = {
    'Moins de 100€': ['Rimless', 'Géométrique'],
    '100-300€': [],
    '300€+': [],
  }
  const penalizedFrames = budgetPenalty[context.budget] || []
  penalizedFrames.forEach(frame => {
    if (scores[frame] !== undefined) scores[frame] -= 15
  })

  // Poids des montures — confort
  if (context.frame_weight === 'Légères') {
    scores['Rimless'] = (scores['Rimless'] || 0) + 12
    scores['Rectangulaire fin'] = (scores['Rectangulaire fin'] || 0) + 10
    scores['Aviateur'] = (scores['Aviateur'] || 0) + 8
    scores['Oversized'] = (scores['Oversized'] || 0) - 10
  } else if (context.frame_weight === 'Robustes') {
    scores['Wayfarer'] = (scores['Wayfarer'] || 0) + 10
    scores['Clubmaster'] = (scores['Clubmaster'] || 0) + 8
    scores['Rimless'] = (scores['Rimless'] || 0) - 8
  }

  // Expérience lunettes précédentes
  if (context.existing_glasses === 'Je veux changer') {
    const changeBonus = ['Cat-eye', 'Géométrique', 'Oversized', 'Clubmaster']
    changeBonus.forEach(frame => {
      if (scores[frame] !== undefined) scores[frame] += 8
    })
  } else if (context.existing_glasses === 'Première paire') {
    const safeFrames = ['Rectangulaire', 'Wayfarer', 'Aviateur']
    safeFrames.forEach(frame => {
      if (scores[frame] !== undefined) scores[frame] += 10
    })
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
