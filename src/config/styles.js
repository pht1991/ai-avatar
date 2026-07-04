// config/styles.js - 风格 Prompt 模板配置

export const STYLES = [
  {
    id: 'gufeng',
    name: '古风汉服',
    icon: '🏮',
    color: '#C8553D',
    bgColor: 'rgba(200, 85, 61, 0.15)',
    description: '穿越千年，风华绝代',
    prompt: `portrait of a person in traditional Chinese hanfu clothing, 
flowing silk robes with intricate embroidery, classical hairstyle 
with traditional hair ornaments, ancient Chinese palace courtyard background with 
cherry blossoms, soft diffused golden hour lighting, subtle classical 
makeup, photorealistic, masterpiece, 8k resolution`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, modern clothing, western style, sunglasses, watch, low quality, blurry, deformed face',
    strength: 0.35,
  },
  {
    id: 'anime',
    name: '动漫二次元',
    icon: '🎨',
    color: '#FF6B9D',
    bgColor: 'rgba(255, 107, 157, 0.15)',
    description: '打破次元壁',
    prompt: `anime style portrait, detailed character illustration, 
large expressive eyes with highlights, cel-shaded coloring, vibrant 
color palette, clean line art, soft gradient background with bokeh, 
studio quality anime art, high resolution`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, realistic, 3d, photorealistic, western cartoon style, low quality',
    strength: 0.35,
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    icon: '🤖',
    color: '#00D4FF',
    bgColor: 'rgba(0, 212, 255, 0.15)',
    description: '未来已来',
    prompt: `cyberpunk portrait, neon lights reflecting on skin, rain-soaked 
futuristic city background at night, subtle glowing tech elements, 
purple and cyan color palette, cinematic lighting, blade runner 
aesthetic, photorealistic, 8k, octane render`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, daylight, nature, medieval, low quality, blurry',
    strength: 0.3,
  },
  {
    id: 'q3d',
    name: '3D Q版',
    icon: '🧸',
    color: '#FFD93D',
    bgColor: 'rgba(255, 217, 61, 0.15)',
    description: '可爱加倍',
    prompt: `cute chibi 3D character, oversized head small body, round 
cheeks, big sparkling eyes, soft clay-like texture, pixar style 
rendering, bright pastel colors, adorable happy expression, 
solid light color background, high quality 3D render, isometric view`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, realistic, scary, dark, low quality, deformed',
    strength: 0.3,
  },
  {
    id: 'watercolor',
    name: '水彩手绘',
    icon: '🎨',
    color: '#6EC6FF',
    bgColor: 'rgba(110, 198, 255, 0.15)',
    description: '温柔如诗',
    prompt: `watercolor painting portrait, soft flowing washes of color, 
artistic visible brushstrokes, delicate and dreamy atmosphere, 
white paper texture visible at edges, elegant fine art style, 
wet-on-wet technique, beautiful soft bleeding edges, museum quality`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, digital art, sharp edges, dark colors, low quality',
    strength: 0.25,
  },
  {
    id: 'retro',
    name: '复古胶片',
    icon: '📷',
    color: '#FF8C42',
    bgColor: 'rgba(255, 140, 66, 0.15)',
    description: '时光留声',
    prompt: `retro film photography portrait, 90s aesthetic, warm film grain, 
soft focus, slight overexposure, analog camera look, kodak portra 
color palette, vintage clothing style, nostalgic mood, golden 
afternoon light, authentic film texture`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, digital look, modern, sharp hdr, low quality',
    strength: 0.3,
  },
  {
    id: 'flat',
    name: '极简插画',
    icon: '✏️',
    color: '#A29BFE',
    bgColor: 'rgba(162, 155, 254, 0.15)',
    description: '简约不简单',
    prompt: `minimalist vector illustration portrait, flat design style, 
clean geometric shapes, limited color palette of 5 colors, bold 
outlines, modern art style, solid background, editorial illustration, 
high quality digital art`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, realistic, 3d, complex background, gradients, low quality',
    strength: 0.25,
  },
  {
    id: 'oil',
    name: '油画肖像',
    icon: '🖼️',
    color: '#E17055',
    bgColor: 'rgba(225, 112, 85, 0.15)',
    description: '艺术殿堂',
    prompt: `classical oil painting portrait, visible thick brushstrokes, 
impasto technique, dramatic chiaroscuro lighting, renaissance style, 
rich deep colors, canvas texture, old masters inspired, museum 
quality fine art, ornate gold frame`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, digital, modern, photography, low quality',
    strength: 0.25,
  },

  {
    id: 'pixel',
    name: '像素风',
    icon: '👾',
    color: '#00E676',
    bgColor: 'rgba(0, 230, 118, 0.15)',
    description: '8-bit 复古游戏',
    prompt: `pixel art portrait, 8-bit retro game style, limited color palette,
visible pixel grid, sprite art aesthetic, chunky pixel blocks,
simple flat background, nostalgic 90s video game character,
SNES RPG portrait style, clean pixel edges`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, photorealistic, smooth gradients, blur, low quality',
    strength: 0.3,
  },
  {
    id: 'ukiyoe',
    name: '浮世绘',
    icon: '🌊',
    color: '#1A5276',
    bgColor: 'rgba(26, 82, 118, 0.15)',
    description: '神奈川冲浪里',
    prompt: `ukiyo-e woodblock print portrait, Japanese Edo period art style,
bold black outlines, flat color areas, subtle wood grain texture,
traditional Japanese aesthetic, muted natural colors,
Hokusai inspired, washi paper background, decorative border patterns`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, realistic, 3d, photography, western style, low quality',
    strength: 0.3,
  },
  {
    id: 'vangogh',
    name: '梵高印象派',
    icon: '🌻',
    color: '#F39C12',
    bgColor: 'rgba(243, 156, 18, 0.15)',
    description: '星空下的笔触',
    prompt: `Vincent van Gogh style portrait, impressionist oil painting,
thick swirling brushstrokes, vibrant contrasting colors, expressive
post-impressionist technique, visible canvas texture, emotional
intensity, starry night inspired background, dynamic movement in strokes`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, photorealistic, smooth, digital art, sharp lines, low quality',
    strength: 0.25,
  },
  {
    id: 'disney',
    name: '迪士尼风',
    icon: '🏰',
    color: '#9B59B6',
    bgColor: 'rgba(155, 89, 182, 0.15)',
    description: '童话主人公',
    prompt: `Disney Pixar 3D animation style portrait, smooth rounded features,
big expressive eyes with catchlights, warm appealing character design,
soft subsurface scattering skin, magical sparkle effects,
enchanting fairy tale atmosphere, vibrant saturated colors,
high quality 3D render, animated film quality`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, realistic, scary, dark, low quality, deformed',
    strength: 0.3,
  },
  {
    id: 'sketch',
    name: '黑白素描',
    icon: '✍️',
    color: '#BDC3C7',
    bgColor: 'rgba(189, 195, 199, 0.15)',
    description: '线条之美',
    prompt: `pencil sketch portrait, fine art black and white drawing,
detailed cross-hatching shading technique, visible graphite texture,
white paper background with subtle paper grain, academic drawing style,
clean precise lines, dramatic lighting contrast, monochrome masterpiece`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, color, digital art, paint, messy, low quality',
    strength: 0.3,
  },
  {
    id: 'vaporwave',
    name: '蒸汽波',
    icon: '🌴',
    color: '#FF6EC7',
    bgColor: 'rgba(255, 110, 199, 0.15)',
    description: '复古未来主义',
    prompt: `vaporwave aesthetic portrait, synthwave style, neon pink and cyan
color scheme, chrome and metallic reflections, glitch effects,
geometric grid background, retro 80s Miami vibe, palm tree silhouette,
sunset gradient, dreamy nostalgic atmosphere, digital art`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, natural lighting, traditional, realistic, low quality',
    strength: 0.3,
  },
  {
    id: 'japanese',
    name: '日系和风',
    icon: '⛩️',
    color: '#E74C3C',
    bgColor: 'rgba(231, 76, 60, 0.15)',
    description: '唯美小清新',
    prompt: `Japanese aesthetic portrait, soft natural lighting, cherry blossom
petals floating, traditional Japanese garden background with maple
trees, clean and minimal composition, pastel color palette,
yukata or kimono clothing, serene and peaceful mood, film photography
look, dreamy bokeh, high quality`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, western style, dark, aggressive, low quality',
    strength: 0.3,
  },
  {
    id: 'cybergufeng',
    name: '赛博古风',
    icon: '⚡',
    color: '#2ECC71',
    bgColor: 'rgba(46, 204, 113, 0.15)',
    description: '古风x科技碰撞',
    prompt: `cyberpunk meets ancient China aesthetic portrait, traditional hanfu
with glowing neon trim and holographic embroidery, futuristic ancient
palace with floating lanterns and neon signs, jade accessories with
circuit patterns, dramatic purple and gold lighting, sci-fi meets
wuxia atmosphere, highly detailed, 8k masterpiece`,
    negative: 'nsfw, gender swap, gender change, opposite gender, feminization, masculinization, modern western clothing, ordinary, low quality, blurry',
    strength: 0.3,
  },
]

export function getStyleById(id) {
  return STYLES.find((s) => s.id === id) || STYLES[0]
}
