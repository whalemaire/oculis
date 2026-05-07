import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const HTML_PATH = resolve('./design-reference/oculis.html');
const OUTPUT_PATH = resolve('./design-reference/design-tokens.json');

(async () => {
  console.log('🚀 Lancement du navigateur...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('📄 Chargement du fichier HTML...');
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0', timeout: 60000 });

  // Attendre un peu pour que tout se rende
  await new Promise(r => setTimeout(r, 3000));

  console.log('🎨 Extraction des design tokens...');

  const tokens = await page.evaluate(() => {
    const colors = new Map();
    const fontFamilies = new Map();
    const fontSizes = new Map();
    const fontWeights = new Map();
    const borderRadii = new Map();
    const shadows = new Map();
    const spacings = new Map();

    const increment = (map, key) => {
      if (!key || key === 'none' || key === 'normal' || key === '0px') return;
      map.set(key, (map.get(key) || 0) + 1);
    };

    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const s = window.getComputedStyle(el);
      increment(colors, s.color);
      increment(colors, s.backgroundColor);
      increment(colors, s.borderColor);
      increment(fontFamilies, s.fontFamily);
      increment(fontSizes, s.fontSize);
      increment(fontWeights, s.fontWeight);
      increment(borderRadii, s.borderRadius);
      increment(shadows, s.boxShadow);
      increment(spacings, s.padding);
      increment(spacings, s.margin);
    });

    // Trier par fréquence d'utilisation
    const sortByFreq = (map) =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count }));

    // Filtrer les couleurs transparentes/vides
    const cleanColors = sortByFreq(colors).filter(
      c => !c.value.includes('rgba(0, 0, 0, 0)') && c.value !== 'transparent'
    );

    return {
      colors: cleanColors,
      fontFamilies: sortByFreq(fontFamilies),
      fontSizes: sortByFreq(fontSizes),
      fontWeights: sortByFreq(fontWeights),
      borderRadii: sortByFreq(borderRadii),
      shadows: sortByFreq(shadows),
      spacings: sortByFreq(spacings).slice(0, 30), // top 30
    };
  });

  writeFileSync(OUTPUT_PATH, JSON.stringify(tokens, null, 2));
  console.log(`✅ Tokens extraits dans : ${OUTPUT_PATH}`);
  console.log(`   - ${tokens.colors.length} couleurs uniques`);
  console.log(`   - ${tokens.fontFamilies.length} polices`);
  console.log(`   - ${tokens.fontSizes.length} tailles de police`);

  await browser.close();
})();