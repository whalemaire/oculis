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

  // Style — 20%
  const styleFrames = STYLE_FRAMES[context.style] || []
  styleFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (20 - index * 4)
  })

  // Usage — 20%
  const usageFrames = USAGE_FRAMES[context.usage] || []
  usageFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (20 - index * 4)
  })

  // Correction — 15%
  const correctionFrames = CORRECTION_FRAMES[context.correction] || []
  correctionFrames.forEach((frame, index) => {
    scores[frame] = (scores[frame] || 0) + (15 - index * 2)
  })

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
