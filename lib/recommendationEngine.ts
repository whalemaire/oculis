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
  chin_height?: number
  ratio_jaw_forehead?: number
  ratio_cheek_jaw?: number
  ratio_eye_spacing?: number
  ratio_symmetry?: number
  shape_probabilities?: Record<string, number>
  top_shapes?: { shape: string, probability: number }[]
}

export type UserFeedback = {
  frame_style: string
  signal_type: string
  weight: number
  created_at: string
  context_id?: string
}

export type FrameRecommendation = {
  name: string
  score: number
  explanation: string
  tags: string[]
  frameType: string
}


const FRAME_SIMILARITY: Record<string, Record<string, number>> = {
  'Rectangulaire':     { 'Browline': 0.7, 'Wayfarer': 0.6, 'Clubmaster': 0.5, 'Rectangulaire fin': 0.8 },
  'Rectangulaire fin': { 'Rimless': 0.8, 'Rectangulaire': 0.8, 'Géométrique': 0.6 },
  'Rond':              { 'Ovale fin': 0.8, 'Rond fin': 0.9, 'Aviateur': 0.5 },
  'Rond fin':          { 'Rond': 0.9, 'Ovale fin': 0.8, 'Rimless': 0.7 },
  'Ovale fin':         { 'Rond': 0.8, 'Rond fin': 0.8, 'Aviateur': 0.6 },
  'Aviateur':          { 'Ovale fin': 0.6, 'Wayfarer': 0.5, 'Rond': 0.5 },
  'Cat-eye':           { 'Oversized': 0.7, 'Géométrique': 0.6, 'Browline': 0.4 },
  'Oversized':         { 'Cat-eye': 0.7, 'Wayfarer': 0.6, 'Clubmaster': 0.5 },
  'Wayfarer':          { 'Rectangulaire': 0.6, 'Clubmaster': 0.7, 'Oversized': 0.6 },
  'Géométrique':       { 'Rectangulaire fin': 0.6, 'Cat-eye': 0.6, 'Rimless': 0.5 },
  'Rimless':           { 'Rectangulaire fin': 0.8, 'Rond fin': 0.7, 'Géométrique': 0.5 },
  'Browline':          { 'Rectangulaire': 0.7, 'Clubmaster': 0.8, 'Wayfarer': 0.5 },
  'Clubmaster':        { 'Browline': 0.8, 'Wayfarer': 0.7, 'Oversized': 0.5 },
  'Wrap':              { 'Oversized': 0.4, 'Aviateur': 0.4 },
}

const getDecayFactor = (createdAt: string): number => {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  if (days < 7)   return 1.0
  if (days < 30)  return 0.8
  if (days < 90)  return 0.6
  if (days < 180) return 0.4
  return 0.2
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
  context: Context,
  feedbacks: UserFeedback[] = [],
  currentContextId?: string
): FrameRecommendation[] {
  const scores: Record<string, number> = {}

  // === DIMENSION 1 : Morphologie (35%) ===
  const shapeCompatibility: Record<string, Record<string, number>> = {
    oval:   { 'Rectangulaire': 95, 'Aviateur': 90, 'Cat-eye': 88, 'Wayfarer': 85, 'Rond': 80, 'Géométrique': 82, 'Browline': 78, 'Clubmaster': 75, 'Rimless': 70, 'Oversized': 72, 'Rectangulaire fin': 85, 'Ovale fin': 75, 'Rond fin': 72, 'Wrap': 60 },
    round:  { 'Rectangulaire': 95, 'Wayfarer': 90, 'Cat-eye': 85, 'Géométrique': 88, 'Browline': 82, 'Clubmaster': 78, 'Aviateur': 70, 'Rimless': 65, 'Oversized': 60, 'Rectangulaire fin': 88, 'Rond': 40, 'Ovale fin': 45, 'Rond fin': 38, 'Wrap': 55 },
    square: { 'Rond': 95, 'Ovale fin': 92, 'Cat-eye': 88, 'Aviateur': 85, 'Rimless': 82, 'Rond fin': 90, 'Rectangulaire': 60, 'Wayfarer': 65, 'Géométrique': 70, 'Browline': 68, 'Clubmaster': 65, 'Oversized': 60, 'Rectangulaire fin': 55, 'Wrap': 50 },
    heart:  { 'Aviateur': 95, 'Rond': 90, 'Rimless': 88, 'Ovale fin': 85, 'Rectangulaire fin': 82, 'Cat-eye': 70, 'Wayfarer': 72, 'Géométrique': 68, 'Rectangulaire': 65, 'Browline': 62, 'Clubmaster': 60, 'Oversized': 55, 'Rond fin': 85, 'Wrap': 50 },
    oblong: { 'Wayfarer': 95, 'Oversized': 90, 'Rond': 88, 'Cat-eye': 85, 'Clubmaster': 82, 'Browline': 80, 'Rectangulaire': 60, 'Aviateur': 65, 'Géométrique': 70, 'Rimless': 55, 'Rectangulaire fin': 50, 'Ovale fin': 72, 'Rond fin': 85, 'Wrap': 60 },
  }

  const morphScores: Record<string, number> = {}
  ALL_FRAMES.forEach(frame => {
    let morphScore = 0
    if (scan.shape_probabilities) {
      Object.entries(scan.shape_probabilities).forEach(([shape, prob]) => {
        const compat = shapeCompatibility[shape]?.[frame] || 60
        morphScore += (compat * prob) / 100
      })
    } else {
      morphScore = shapeCompatibility[scan.face_shape]?.[frame] || 60
    }
    morphScores[frame] = morphScore * 0.35
  })

  // === DIMENSION 2 : Fitting physique (20%) ===
  const fittingScores: Record<string, number> = {}
  ALL_FRAMES.forEach(frame => {
    let fittingScore = 70

    if (scan.ipd) {
      if (scan.ipd < 100) {
        if (['Rimless', 'Rectangulaire fin', 'Rond fin'].includes(frame)) fittingScore += 15
        if (['Oversized', 'Wayfarer'].includes(frame)) fittingScore -= 15
      } else if (scan.ipd > 130) {
        if (['Wayfarer', 'Oversized', 'Browline'].includes(frame)) fittingScore += 15
        if (['Rimless', 'Rectangulaire fin'].includes(frame)) fittingScore -= 10
      }
    }

    if (scan.ratio) {
      if (scan.ratio > 1.30) {
        if (['Cat-eye', 'Oversized'].includes(frame)) fittingScore -= 8
        if (['Wayfarer', 'Rectangulaire'].includes(frame)) fittingScore += 8
      } else if (scan.ratio < 1.05) {
        if (['Cat-eye', 'Browline'].includes(frame)) fittingScore += 10
      }
    }

    if (scan.nose_width && scan.face_width) {
      const noseRatio = scan.nose_width / scan.face_width
      if (noseRatio > 0.38) {
        if (['Rimless', 'Rectangulaire fin'].includes(frame)) fittingScore -= 12
        if (['Wayfarer', 'Oversized'].includes(frame)) fittingScore += 8
      } else if (noseRatio < 0.28) {
        if (['Rimless', 'Aviateur'].includes(frame)) fittingScore += 10
      }
    }

    if (scan.ratio_cheek_jaw) {
      if (scan.ratio_cheek_jaw < 0.85) {
        if (['Rond', 'Ovale fin', 'Rond fin'].includes(frame)) fittingScore += 12
        if (['Rectangulaire', 'Wayfarer'].includes(frame)) fittingScore -= 8
      } else if (scan.ratio_cheek_jaw > 1.10) {
        if (['Rectangulaire fin', 'Aviateur', 'Géométrique'].includes(frame)) fittingScore += 10
      }
    }

    fittingScores[frame] = Math.min(100, Math.max(0, fittingScore)) * 0.20
  })

  // Score de base = morphologie + fitting physique
  ALL_FRAMES.forEach(frame => {
    scores[frame] = (morphScores[frame] || 0) + (fittingScores[frame] || 0)
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

  // NIVEAU 3 — Feedback utilisateur (15%)
  if (feedbacks.length > 0) {
    const feedbackBonus: Record<string, number> = {}
    ALL_FRAMES.forEach(frame => { feedbackBonus[frame] = 0 })

    feedbacks.forEach(fb => {
      const decay = getDecayFactor(fb.created_at)
      const contextBonus = fb.context_id && fb.context_id === currentContextId ? 1.5 : 1.0
      const effectiveWeight = fb.weight * decay * contextBonus

      if (feedbackBonus[fb.frame_style] !== undefined) {
        feedbackBonus[fb.frame_style] += effectiveWeight * 10
      }

      const similarities = FRAME_SIMILARITY[fb.frame_style] || {}
      Object.entries(similarities).forEach(([similarFrame, similarity]) => {
        if (feedbackBonus[similarFrame] !== undefined) {
          feedbackBonus[similarFrame] += effectiveWeight * similarity * 6
        }
      })
    })

    const maxBonus = Math.max(...Object.values(feedbackBonus).map(Math.abs), 1)
    ALL_FRAMES.forEach(frame => {
      const normalized = (feedbackBonus[frame] / maxBonus) * 15
      scores[frame] = (scores[frame] || 0) + normalized
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
