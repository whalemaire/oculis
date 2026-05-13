export type Frame = {
  id: string
  brand: string
  model: string
  style: string
  lens_width: number
  bridge_width: number
  temple_length: number
  lens_height: number
  total_width: number
  material: string
  weight_grams: number
  rim_type: string
  style_tags: string[]
  usage_tags: string[]
  correction_types: string[]
  gender: string
  price_range: string
  image_url: string
}

export const FRAMES_CATALOG: Frame[] = [
  // RAY-BAN
  { id: 'rb-2140', brand: 'Ray-Ban', model: 'Wayfarer RB2140', style: 'Wayfarer', lens_width: 50, bridge_width: 22, temple_length: 150, lens_height: 40, total_width: 140, material: 'Acétate', weight_grams: 28, rim_type: 'Full', style_tags: ['Classique', 'Iconique', 'Streetwear'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue', 'Soleil', 'Les deux'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'rb-3025', brand: 'Ray-Ban', model: 'Aviator RB3025', style: 'Aviateur', lens_width: 58, bridge_width: 14, temple_length: 135, lens_height: 52, total_width: 142, material: 'Métal', weight_grams: 18, rim_type: 'Full', style_tags: ['Classique', 'Intemporel'], usage_tags: ['Quotidien', 'Fashion', 'Sport'], correction_types: ['Soleil', 'Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'rb-4171', brand: 'Ray-Ban', model: 'Erika RB4171', style: 'Rond', lens_width: 54, bridge_width: 18, temple_length: 145, lens_height: 48, total_width: 140, material: 'Métal', weight_grams: 15, rim_type: 'Half', style_tags: ['Moderne', 'Minimaliste'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Soleil', 'Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'rb-5228', brand: 'Ray-Ban', model: 'RB5228', style: 'Rectangulaire', lens_width: 53, bridge_width: 17, temple_length: 140, lens_height: 38, total_width: 140, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Classique', 'Professionnel'], usage_tags: ['Quotidien', 'Écrans', 'Travail'], correction_types: ['Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'rb-4258', brand: 'Ray-Ban', model: 'RB4258', style: 'Rectangulaire', lens_width: 53, bridge_width: 17, temple_length: 145, lens_height: 36, total_width: 140, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Moderne', 'Classique'], usage_tags: ['Quotidien', 'Écrans'], correction_types: ['Vue', 'Soleil'], gender: 'Mixte', price_range: '100-300€', image_url: '' },

  // PERSOL
  { id: 'po-3007', brand: 'Persol', model: 'PO3007V', style: 'Rectangulaire', lens_width: 52, bridge_width: 18, temple_length: 145, lens_height: 38, total_width: 138, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Classique', 'Italien', 'Premium'], usage_tags: ['Quotidien', 'Travail'], correction_types: ['Vue'], gender: 'Homme', price_range: '100-300€', image_url: '' },
  { id: 'po-3152', brand: 'Persol', model: 'PO3152S', style: 'Rond', lens_width: 48, bridge_width: 22, temple_length: 145, lens_height: 44, total_width: 136, material: 'Acétate', weight_grams: 20, rim_type: 'Full', style_tags: ['Vintage', 'Classique'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Soleil', 'Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'po-3092', brand: 'Persol', model: 'PO3092SM', style: 'Browline', lens_width: 50, bridge_width: 22, temple_length: 145, lens_height: 38, total_width: 138, material: 'Mixte', weight_grams: 22, rim_type: 'Half', style_tags: ['Vintage', 'Classique', 'Premium'], usage_tags: ['Quotidien', 'Travail'], correction_types: ['Vue', 'Soleil'], gender: 'Mixte', price_range: '100-300€', image_url: '' },

  // OLIVER PEOPLES
  { id: 'op-ov5186', brand: 'Oliver Peoples', model: 'OV5186 Sheldrake', style: 'Browline', lens_width: 47, bridge_width: 24, temple_length: 145, lens_height: 40, total_width: 138, material: 'Mixte', weight_grams: 20, rim_type: 'Half', style_tags: ['Premium', 'Vintage', 'Classique'], usage_tags: ['Quotidien', 'Travail'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'op-ov5219', brand: 'Oliver Peoples', model: 'OV5219 Gregory Peck', style: 'Rond', lens_width: 47, bridge_width: 23, temple_length: 145, lens_height: 44, total_width: 136, material: 'Acétate', weight_grams: 18, rim_type: 'Full', style_tags: ['Premium', 'Intellectuel', 'Vintage'], usage_tags: ['Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'op-ov5183', brand: 'Oliver Peoples', model: 'OV5183 MP-2', style: 'Rectangulaire', lens_width: 50, bridge_width: 20, temple_length: 145, lens_height: 36, total_width: 138, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Premium', 'Minimaliste'], usage_tags: ['Quotidien', 'Travail', 'Écrans'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // OAKLEY
  { id: 'ok-holbrook', brand: 'Oakley', model: 'Holbrook OO9102', style: 'Wayfarer', lens_width: 57, bridge_width: 17, temple_length: 137, lens_height: 38, total_width: 145, material: 'Acétate', weight_grams: 26, rim_type: 'Full', style_tags: ['Sportif', 'Streetwear'], usage_tags: ['Sport', 'Quotidien', 'Fashion'], correction_types: ['Soleil'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'ok-frogskins', brand: 'Oakley', model: 'Frogskins OO9013', style: 'Wayfarer', lens_width: 55, bridge_width: 17, temple_length: 133, lens_height: 42, total_width: 138, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Sportif', 'Streetwear', 'Coloré'], usage_tags: ['Sport', 'Fashion'], correction_types: ['Soleil'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'ok-flak', brand: 'Oakley', model: 'Flak 2.0 XL OO9188', style: 'Wrap', lens_width: 59, bridge_width: 17, temple_length: 133, lens_height: 38, total_width: 148, material: 'Métal', weight_grams: 26, rim_type: 'Full', style_tags: ['Sportif', 'Performance'], usage_tags: ['Sport'], correction_types: ['Soleil'], gender: 'Mixte', price_range: '100-300€', image_url: '' },

  // MYKITA
  { id: 'mk-decades', brand: 'Mykita', model: 'Decades Decades', style: 'Géométrique', lens_width: 48, bridge_width: 20, temple_length: 140, lens_height: 42, total_width: 136, material: 'Métal', weight_grams: 12, rim_type: 'Full', style_tags: ['Moderne', 'Minimaliste', 'Design'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue', 'Soleil'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'mk-maison', brand: 'Mykita', model: 'Maison Margiela', style: 'Rectangulaire fin', lens_width: 50, bridge_width: 18, temple_length: 145, lens_height: 32, total_width: 140, material: 'Métal', weight_grams: 10, rim_type: 'Rimless', style_tags: ['Moderne', 'Minimaliste', 'Avant-garde'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // LINDBERG
  { id: 'lb-air', brand: 'Lindberg', model: 'Air Titanium', style: 'Rimless', lens_width: 50, bridge_width: 16, temple_length: 140, lens_height: 36, total_width: 136, material: 'Métal', weight_grams: 6, rim_type: 'Rimless', style_tags: ['Minimaliste', 'Premium', 'Invisible'], usage_tags: ['Quotidien', 'Travail', 'Écrans'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'lb-spirit', brand: 'Lindberg', model: 'Spirit Titanium', style: 'Rectangulaire fin', lens_width: 52, bridge_width: 18, temple_length: 140, lens_height: 34, total_width: 140, material: 'Métal', weight_grams: 8, rim_type: 'Rimless', style_tags: ['Minimaliste', 'Premium'], usage_tags: ['Travail', 'Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // WARBY PARKER
  { id: 'wp-durand', brand: 'Warby Parker', model: 'Durand', style: 'Rectangulaire', lens_width: 51, bridge_width: 20, temple_length: 145, lens_height: 38, total_width: 140, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Classique', 'Accessible'], usage_tags: ['Quotidien', 'Travail', 'Écrans'], correction_types: ['Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'wp-hardy', brand: 'Warby Parker', model: 'Hardy', style: 'Rond', lens_width: 46, bridge_width: 24, temple_length: 145, lens_height: 42, total_width: 136, material: 'Acétate', weight_grams: 18, rim_type: 'Full', style_tags: ['Vintage', 'Intellectuel'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'wp-percey', brand: 'Warby Parker', model: 'Percey', style: 'Aviateur', lens_width: 52, bridge_width: 18, temple_length: 140, lens_height: 44, total_width: 142, material: 'Métal', weight_grams: 14, rim_type: 'Full', style_tags: ['Classique', 'Accessible'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue', 'Soleil'], gender: 'Mixte', price_range: '100-300€', image_url: '' },

  // TOM FORD
  { id: 'tf-tf5178', brand: 'Tom Ford', model: 'TF5178', style: 'Rectangulaire', lens_width: 52, bridge_width: 16, temple_length: 140, lens_height: 36, total_width: 138, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Luxe', 'Classique', 'Premium'], usage_tags: ['Quotidien', 'Fashion', 'Travail'], correction_types: ['Vue'], gender: 'Homme', price_range: '300€+', image_url: '' },
  { id: 'tf-tf0035', brand: 'Tom Ford', model: 'TF0035 Marko', style: 'Wayfarer', lens_width: 54, bridge_width: 18, temple_length: 145, lens_height: 42, total_width: 142, material: 'Acétate', weight_grams: 26, rim_type: 'Full', style_tags: ['Luxe', 'Streetwear', 'Premium'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Homme', price_range: '300€+', image_url: '' },
  { id: 'tf-tf0144', brand: 'Tom Ford', model: 'TF0144 Whitney', style: 'Cat-eye', lens_width: 55, bridge_width: 16, temple_length: 135, lens_height: 44, total_width: 142, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Luxe', 'Glamour', 'Premium'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // SAINT LAURENT
  { id: 'sl-sl2', brand: 'Saint Laurent', model: 'SL 2', style: 'Rectangulaire fin', lens_width: 50, bridge_width: 20, temple_length: 145, lens_height: 30, total_width: 138, material: 'Métal', weight_grams: 14, rim_type: 'Full', style_tags: ['Luxe', 'Minimaliste', 'Avant-garde'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'sl-sl28', brand: 'Saint Laurent', model: 'SL 28', style: 'Cat-eye', lens_width: 56, bridge_width: 17, temple_length: 140, lens_height: 46, total_width: 144, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Luxe', 'Glamour', 'Iconique'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // GUCCI
  { id: 'gc-gg0006o', brand: 'Gucci', model: 'GG0006O', style: 'Rectangulaire', lens_width: 53, bridge_width: 17, temple_length: 140, lens_height: 38, total_width: 140, material: 'Acétate', weight_grams: 26, rim_type: 'Full', style_tags: ['Luxe', 'Classique', 'Premium'], usage_tags: ['Fashion', 'Quotidien', 'Travail'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'gc-gg0053o', brand: 'Gucci', model: 'GG0053O', style: 'Rond', lens_width: 46, bridge_width: 25, temple_length: 145, lens_height: 46, total_width: 134, material: 'Métal', weight_grams: 16, rim_type: 'Full', style_tags: ['Luxe', 'Vintage', 'Bohème'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // PRADA
  { id: 'pr-pr08ov', brand: 'Prada', model: 'PR 08OV', style: 'Rectangulaire', lens_width: 54, bridge_width: 18, temple_length: 140, lens_height: 38, total_width: 140, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Luxe', 'Classique'], usage_tags: ['Travail', 'Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Femme', price_range: '300€+', image_url: '' },
  { id: 'pr-pr14wv', brand: 'Prada', model: 'PR 14WV', style: 'Cat-eye', lens_width: 55, bridge_width: 17, temple_length: 140, lens_height: 46, total_width: 142, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Luxe', 'Moderne'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // SILHOUETTE
  { id: 'si-titan', brand: 'Silhouette', model: 'Titan Minimal Art', style: 'Rimless', lens_width: 50, bridge_width: 16, temple_length: 135, lens_height: 34, total_width: 136, material: 'Métal', weight_grams: 5, rim_type: 'Rimless', style_tags: ['Minimaliste', 'Premium', 'Invisible', 'Légèreté'], usage_tags: ['Quotidien', 'Travail', 'Écrans'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'si-spx', brand: 'Silhouette', model: 'SPX Art', style: 'Géométrique', lens_width: 48, bridge_width: 18, temple_length: 135, lens_height: 38, total_width: 132, material: 'Mixte', weight_grams: 8, rim_type: 'Half', style_tags: ['Moderne', 'Design', 'Minimaliste'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // POLICE
  { id: 'pl-v1971', brand: 'Police', model: 'V1971', style: 'Rectangulaire', lens_width: 55, bridge_width: 17, temple_length: 140, lens_height: 38, total_width: 142, material: 'Métal', weight_grams: 20, rim_type: 'Full', style_tags: ['Moderne', 'Sportif'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue', 'Soleil'], gender: 'Homme', price_range: '100-300€', image_url: '' },

  // JIMMY CHOO
  { id: 'jc-jc182', brand: 'Jimmy Choo', model: 'JC182', style: 'Cat-eye', lens_width: 57, bridge_width: 16, temple_length: 140, lens_height: 48, total_width: 144, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Luxe', 'Glamour', 'Féminin'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // CARRERA
  { id: 'ca-1001', brand: 'Carrera', model: 'Carrera 1001/S', style: 'Wayfarer', lens_width: 55, bridge_width: 18, temple_length: 145, lens_height: 40, total_width: 142, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Sportif', 'Classique'], usage_tags: ['Sport', 'Quotidien', 'Fashion'], correction_types: ['Soleil', 'Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },
  { id: 'ca-ducati', brand: 'Carrera', model: 'Ducati Carduc 007/S', style: 'Rectangulaire', lens_width: 60, bridge_width: 17, temple_length: 135, lens_height: 36, total_width: 146, material: 'Métal', weight_grams: 20, rim_type: 'Full', style_tags: ['Sportif', 'Moderne'], usage_tags: ['Sport', 'Quotidien'], correction_types: ['Soleil'], gender: 'Homme', price_range: '100-300€', image_url: '' },

  // LACOSTE
  { id: 'lc-l2812', brand: 'Lacoste', model: 'L2812', style: 'Rectangulaire', lens_width: 52, bridge_width: 18, temple_length: 140, lens_height: 38, total_width: 140, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Classique', 'Sportif', 'Preppy'], usage_tags: ['Quotidien', 'Sport', 'Travail'], correction_types: ['Vue'], gender: 'Mixte', price_range: '100-300€', image_url: '' },

  // BOSS
  { id: 'bs-1006', brand: 'Hugo Boss', model: 'BOSS 1006/IT', style: 'Rectangulaire', lens_width: 54, bridge_width: 18, temple_length: 145, lens_height: 36, total_width: 140, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Classique', 'Professionnel', 'Premium'], usage_tags: ['Travail', 'Quotidien'], correction_types: ['Vue'], gender: 'Homme', price_range: '100-300€', image_url: '' },
  { id: 'bs-1080', brand: 'Hugo Boss', model: 'BOSS 1080/S', style: 'Aviateur', lens_width: 56, bridge_width: 16, temple_length: 140, lens_height: 50, total_width: 144, material: 'Métal', weight_grams: 16, rim_type: 'Full', style_tags: ['Classique', 'Professionnel'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Soleil', 'Vue'], gender: 'Homme', price_range: '100-300€', image_url: '' },

  // SWAROVSKI
  { id: 'sw-sk5395', brand: 'Swarovski', model: 'SK5395', style: 'Cat-eye', lens_width: 54, bridge_width: 16, temple_length: 135, lens_height: 46, total_width: 140, material: 'Acétate', weight_grams: 20, rim_type: 'Full', style_tags: ['Luxe', 'Glamour', 'Brillant'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Femme', price_range: '100-300€', image_url: '' },

  // ALAIN MIKLI
  { id: 'am-a03078', brand: 'Alain Mikli', model: 'A03078', style: 'Géométrique', lens_width: 50, bridge_width: 18, temple_length: 140, lens_height: 44, total_width: 136, material: 'Acétate', weight_grams: 20, rim_type: 'Full', style_tags: ['Avant-garde', 'Design', 'Parisien'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'am-a03128', brand: 'Alain Mikli', model: 'A03128', style: 'Oversized', lens_width: 60, bridge_width: 16, temple_length: 145, lens_height: 52, total_width: 150, material: 'Acétate', weight_grams: 28, rim_type: 'Full', style_tags: ['Avant-garde', 'Affirmé', 'Design'], usage_tags: ['Fashion'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // ANNE ET VALENTIN
  { id: 'av-gaudi', brand: 'Anne et Valentin', model: 'Gaudi', style: 'Géométrique', lens_width: 48, bridge_width: 20, temple_length: 140, lens_height: 42, total_width: 134, material: 'Acétate', weight_grams: 18, rim_type: 'Full', style_tags: ['Avant-garde', 'Français', 'Artistique'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // FACE À FACE
  { id: 'ff-face1', brand: 'Face à Face', model: 'Bocca 2', style: 'Rectangulaire', lens_width: 52, bridge_width: 17, temple_length: 140, lens_height: 36, total_width: 138, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Français', 'Design', 'Coloré'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // CELINE
  { id: 'cl-cl50020i', brand: 'Celine', model: 'CL50020I', style: 'Cat-eye', lens_width: 58, bridge_width: 16, temple_length: 140, lens_height: 46, total_width: 146, material: 'Acétate', weight_grams: 24, rim_type: 'Full', style_tags: ['Luxe', 'Parisien', 'Minimaliste'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '300€+', image_url: '' },
  { id: 'cl-cl41414', brand: 'Celine', model: 'CL41414', style: 'Rectangulaire', lens_width: 53, bridge_width: 16, temple_length: 140, lens_height: 34, total_width: 138, material: 'Acétate', weight_grams: 20, rim_type: 'Full', style_tags: ['Luxe', 'Minimaliste', 'Parisien'], usage_tags: ['Travail', 'Quotidien'], correction_types: ['Vue'], gender: 'Femme', price_range: '300€+', image_url: '' },

  // DIOR
  { id: 'di-diorblacksuit', brand: 'Dior', model: 'DiorBlackSuit', style: 'Rectangulaire', lens_width: 53, bridge_width: 18, temple_length: 145, lens_height: 36, total_width: 140, material: 'Acétate', weight_grams: 22, rim_type: 'Full', style_tags: ['Luxe', 'Classique', 'Couture'], usage_tags: ['Fashion', 'Travail'], correction_types: ['Vue'], gender: 'Homme', price_range: '300€+', image_url: '' },
  { id: 'di-diorclub1', brand: 'Dior', model: 'DiorClub1', style: 'Browline', lens_width: 55, bridge_width: 16, temple_length: 135, lens_height: 44, total_width: 142, material: 'Mixte', weight_grams: 20, rim_type: 'Half', style_tags: ['Luxe', 'Vintage', 'Couture'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Soleil', 'Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },

  // CHLOÉ
  { id: 'ch-ce2736', brand: 'Chloé', model: 'CE2736', style: 'Rond', lens_width: 50, bridge_width: 22, temple_length: 140, lens_height: 48, total_width: 138, material: 'Métal', weight_grams: 14, rim_type: 'Full', style_tags: ['Bohème', 'Féminin', 'Romantique'], usage_tags: ['Quotidien', 'Fashion'], correction_types: ['Vue', 'Soleil'], gender: 'Femme', price_range: '100-300€', image_url: '' },

  // MATSUDA
  { id: 'mt-m1004', brand: 'Matsuda', model: 'M1004', style: 'Browline', lens_width: 46, bridge_width: 22, temple_length: 145, lens_height: 40, total_width: 134, material: 'Mixte', weight_grams: 16, rim_type: 'Half', style_tags: ['Japonais', 'Artisanal', 'Premium', 'Vintage'], usage_tags: ['Fashion', 'Quotidien'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
  { id: 'mt-m2001', brand: 'Matsuda', model: 'M2001', style: 'Rectangulaire fin', lens_width: 48, bridge_width: 20, temple_length: 145, lens_height: 30, total_width: 134, material: 'Métal', weight_grams: 12, rim_type: 'Full', style_tags: ['Japonais', 'Minimaliste', 'Premium'], usage_tags: ['Quotidien', 'Travail'], correction_types: ['Vue'], gender: 'Mixte', price_range: '300€+', image_url: '' },
]
