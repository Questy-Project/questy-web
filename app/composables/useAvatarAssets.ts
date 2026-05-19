const HERO_CLASS_SLUG: Record<string, string> = {
  'Aventurier':      'aventurier',
  'Guerrier':        'guerrier',
  'Voleur':          'voleur',
  'Tank':            'tank',
  'Mage':            'mage',
  'Prêtre':          'pretre',
  'Paladin':         'paladin',
  'Berserker':       'berserker',
  'Mage de guerre':  'mage_de_guerre',
  'Druide':          'druide',
  'Sage lettré':     'sage_lettre',
  'Chevalier':       'chevalier',
  'Templier':        'templier',
  'Champion':        'champion',
  'Rôdeur':          'rodeur',
  'Illusionniste':   'illusionniste',
  'Moine':           'moine',
  'Danseur de lame': 'danseur_de_lame',
  'Alchimiste':      'alchimiste',
  'Colosse':         'colosse',
  'Nécromant':       'necromant',
  'Chaman':          'chaman',
};

// Classes avec casque (armor_head par-dessus outfit_head)
const CLASSES_WITH_ARMOR_HEAD = new Set([
  'guerrier', 'tank', 'paladin', 'berserker',
  'mage_de_guerre', 'chevalier', 'templier', 'champion', 'colosse',
]);

// Classes avec armure corps (inclut CLASSES_WITH_ARMOR_HEAD + rodeur et danseur_de_lame sans casque)
const CLASSES_WITH_ARMOR_BODY = new Set([
  ...CLASSES_WITH_ARMOR_HEAD,
  'rodeur',
  'danseur_de_lame',
]);

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export interface AvatarLayers {
  body: HTMLImageElement | null;
  hair: HTMLImageElement | null;
  outfitLegs: HTMLImageElement | null;
  outfitTorso: HTMLImageElement | null;
  outfitHead: HTMLImageElement | null;
  armorLegs: HTMLImageElement | null;
  armorTorso: HTMLImageElement | null;
  armorHead: HTMLImageElement | null;
  weapon: HTMLImageElement | null;
}

export async function useAvatarAssets(
  silhouette: string,
  skinTone: number,
  hairStyle: number,
  hairColor: number,
  heroClass: string,
): Promise<AvatarLayers> {
  const slug = HERO_CLASS_SLUG[heroClass] ?? 'aventurier';
  const base = '/avatar';

  const hasArmorHead = CLASSES_WITH_ARMOR_HEAD.has(slug);
  const hasArmorBody = CLASSES_WITH_ARMOR_BODY.has(slug);

  const [body, hair, outfitLegs, outfitTorso, outfitHead, armorLegs, armorTorso, armorHead, weapon] =
    await Promise.all([
      loadImage(`${base}/body/${silhouette}_skin${skinTone}.png`),
      loadImage(`${base}/hair/style${hairStyle}_color${hairColor}.png`),
      loadImage(`${base}/outfit/legs/${slug}_default.png`),
      loadImage(`${base}/outfit/torso/${slug}_default.png`),
      loadImage(`${base}/outfit/head/${slug}_default.png`),
      hasArmorBody ? loadImage(`${base}/armor/legs/${slug}_default.png`) : Promise.resolve(null),
      hasArmorBody ? loadImage(`${base}/armor/torso/${slug}_default.png`) : Promise.resolve(null),
      hasArmorHead ? loadImage(`${base}/armor/head/${slug}_default.png`) : Promise.resolve(null),
      loadImage(`${base}/weapon/${slug}_default.png`),
    ]);

  return { body, hair, outfitLegs, outfitTorso, outfitHead, armorLegs, armorTorso, armorHead, weapon };
}
