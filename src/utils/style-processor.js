// utils/style-processor.js — 纯前端 Canvas 风格处理（无 AI 依赖）
// 将用户照片 + 装饰边框/调色层合成为风格化图片

import { STYLES } from '@/config/styles.js'

/**
 * 风格装饰配置 — 每种风格独有的 Canvas 绘制参数
 * 键为 style.id，值为边框+装饰+调色的配置
 */
export const STYLE_DECOR = {
  gufeng: {
    frame: { type: 'rounded', radius: 24, borderW: 6, color: '#C8553D', innerColor: 'rgba(200,85,61,0.08)' },
    overlay: { color: 'rgba(180,60,40,0.10)' },
    decors: [
      { type: 'cloud', x: 0.08, y: 0.12, s: 0.14, color: '#C8553D66' },
      { type: 'cloud', x: 0.88, y: 0.82, s: 0.12, color: '#C8553D66' },
      { type: 'circle_ring', x: 0.85, y: 0.10, r: 0.18, color: '#C8553D44' },
    ],
    caption: { text: '古风汉服', color: '#C8553D' },
  },
  anime: {
    frame: { type: 'rounded', radius: 20, borderW: 5, color: '#FF6B9D', dash: [10, 4] },
    overlay: { color: 'rgba(255,107,157,0.07)' },
    decors: [
      { type: 'star4', x: 0.15, y: 0.12, s: 0.08, color: '#FF6B9D88' },
      { type: 'star4', x: 0.82, y: 0.18, s: 0.07, color: '#FF6B9D88' },
      { type: 'star4', x: 0.10, y: 0.80, s: 0.06, color: '#FF6B9D66' },
      { type: 'star4', x: 0.78, y: 0.85, s: 0.09, color: '#FFD93D88' },
      { type: 'sparkle', x: 0.92, y: 0.08, s: 0.04, color: '#FFFFFF' },
    ],
    caption: { text: '动漫二次元', color: '#FF6B9D' },
  },
  cyberpunk: {
    frame: { type: 'corner', cornerLen: 0.22, borderW: 4 },
    overlay: { color: 'rgba(0,180,220,0.10)' },
    decors: [
      { type: 'grid', rows: 5, cols: 5, alpha: 0.12, color: '#00D4FF' },
      { type: 'scanline', yPos: 0.35, alpha: 0.15, color: '#00D4FF' },
      { type: 'glitch_bar', x: 0.10, y: 0.25, w: 0.6, h: 0.02, color: '#FF6B9D66' },
      { type: 'glitch_bar', x: 0.40, y: 0.72, w: 0.3, h: 0.015, color: '#00D4FF88' },
    ],
    caption: { text: '赛博朋克', color: '#00D4FF' },
  },
  q3d: {
    frame: { type: 'bubble', radius: 28, borderW: 5, color: '#FFD93D' },
    overlay: { color: 'rgba(255,217,61,0.08)' },
    decors: [
      { type: 'star5', x: 0.12, y: 0.10, s: 0.08, color: '#FFD93D88' },
      { type: 'star5', x: 0.88, y: 0.14, s: 0.07, color: '#FF9F43AA' },
      { type: 'star5', x: 0.08, y: 0.88, s: 0.06, color: '#FFD93D66' },
      { type: 'circle_solid', x: 0.90, y: 0.85, r: 0.05, color: '#FF9F4388' },
      { type: 'circle_solid', x: 0.14, y: 0.78, r: 0.03, color: '#FFD93D88' },
    ],
    caption: { text: '3D Q版', color: '#FFD93D' },
  },
  watercolor: {
    frame: { type: 'soft_edge', innerPad: 0.04 },
    overlay: { color: 'rgba(110,198,255,0.12)' },
    decors: [
      { type: 'splash', x: 0.05, y: 0.10, s: 0.15, color: '#6EC6FF33' },
      { type: 'splash', x: 0.80, y: 0.75, s: 0.12, color: '#74B9FF33' },
      { type: 'splash', x: 0.55, y: 0.08, s: 0.08, color: '#A29BFE33' },
      { type: 'watercolor_wash', x: 0.90, y: 0.15, s: 0.18, color: '#6EC6FF22' },
      { type: 'watercolor_wash', x: 0.08, y: 0.88, s: 0.14, color: '#74B9FF22' },
    ],
    caption: { text: '水彩手绘', color: '#6EC6FF' },
  },
  retro: {
    frame: { type: 'film', borderW: 5, color: '#FF8C42' },
    overlay: { color: 'rgba(255,140,66,0.08)' },
    decors: [
      { type: 'film_sprockets', side: 'left', count: 8, color: '#FF8C4266' },
      { type: 'film_sprockets', side: 'right', count: 8, color: '#FF8C4266' },
      { type: 'date_stamp', text: '1998.06.26', x: 0.05, y: 0.92, color: '#FF8C42AA' },
      { type: 'vignette', alpha: 0.35 },
    ],
    caption: { text: '复古胶片', color: '#FF8C42' },
  },
  flat: {
    frame: { type: 'geometric', color: '#A29BFE', borderW: 4 },
    overlay: { color: 'rgba(162,155,254,0.06)' },
    decors: [
      { type: 'tri', x: 0.12, y: 0.10, s: 0.08, color: '#A29BFE66' },
      { type: 'rect', x: 0.83, y: 0.08, s: 0.07, color: '#6C5CE766' },
      { type: 'circle_solid', x: 0.07, y: 0.85, r: 0.04, color: '#A29BFE88' },
      { type: 'circle_solid', x: 0.88, y: 0.88, r: 0.06, color: '#6C5CE766' },
    ],
    caption: { text: '极简插画', color: '#A29BFE' },
  },
  oil: {
    frame: { type: 'ornate', borderW: 7, color: '#E17055', innerColor: 'rgba(225,112,85,0.06)' },
    overlay: { color: 'rgba(200,100,70,0.10)' },
    decors: [
      { type: 'ornate_corner', corner: 'tl', s: 0.14, color: '#E1705588' },
      { type: 'ornate_corner', corner: 'tr', s: 0.14, color: '#E1705588' },
      { type: 'ornate_corner', corner: 'bl', s: 0.14, color: '#E1705588' },
      { type: 'ornate_corner', corner: 'br', s: 0.14, color: '#E1705588' },
    ],
    caption: { text: '油画肖像', color: '#E17055' },
  },
  pixel: {
    frame: { type: 'pixelated', borderW: 3, color: '#00E676', blockSize: 8 },
    overlay: { color: 'rgba(0,230,118,0.06)' },
    decors: [
      { type: 'pixel_heart', x: 0.10, y: 0.10, s: 4, color: '#FF6B9D88' },
      { type: 'pixel_coin', x: 0.85, y: 0.85, s: 4, color: '#FFD93D88' },
      { type: 'pixel_text', text: 'LV.99', x: 0.75, y: 0.06, s: 10, color: '#00E67688' },
    ],
    caption: { text: '像素风', color: '#00E676' },
  },
  ukiyoe: {
    frame: { type: 'japanese', borderW: 5, color: '#1A5276', innerColor: 'rgba(26,82,118,0.06)' },
    overlay: { color: 'rgba(20,60,100,0.10)' },
    decors: [
      { type: 'nami', x: 0.05, y: 0.85, s: 0.25, color: '#1A527666' },
      { type: 'en_maru', x: 0.85, y: 0.85, r: 0.14, color: '#D3540066' },
    ],
    caption: { text: '浮世绘', color: '#1A5276' },
  },
  vangogh: {
    frame: { type: 'swirl', borderW: 4, color: '#F39C12' },
    overlay: { color: 'rgba(243,156,18,0.10)' },
    decors: [
      { type: 'swirl_brush', x: 0.90, y: 0.12, s: 0.16, color: '#F39C1244' },
      { type: 'swirl_brush', x: 0.08, y: 0.78, s: 0.13, color: '#E67E2244' },
      { type: 'star4', x: 0.50, y: 0.08, s: 0.05, color: '#F1C40F88' },
    ],
    caption: { text: '梵高印象派', color: '#F39C12' },
  },
  disney: {
    frame: { type: 'rounded', radius: 26, borderW: 5, color: '#9B59B6' },
    overlay: { color: 'rgba(155,89,182,0.08)' },
    decors: [
      { type: 'star5', x: 0.10, y: 0.08, s: 0.07, color: '#9B59B688' },
      { type: 'star5', x: 0.90, y: 0.15, s: 0.06, color: '#F1C40F88' },
      { type: 'sparkle_line', x: 0.12, y: 0.90, s: 0.15, color: '#9B59B666' },
      { type: 'sparkle_line', x: 0.78, y: 0.88, s: 0.12, color: '#F1C40F66' },
      { type: 'sparkle', x: 0.05, y: 0.82, s: 0.03, color: '#FFFFFF88' },
    ],
    caption: { text: '迪士尼风', color: '#9B59B6' },
  },
  sketch: {
    frame: { type: 'simple_line', color: '#BDC3C7', borderW: 3 },
    overlay: { color: 'rgba(200,200,200,0.04)' },
    decors: [
      { type: 'hatch', x: 0.05, y: 0.05, s: 0.15, color: '#BDC3C733' },
      { type: 'hatch', x: 0.80, y: 0.80, s: 0.12, color: '#BDC3C733' },
    ],
    caption: { text: '黑白素描', color: '#BDC3C7' },
  },
  vaporwave: {
    frame: { type: 'rounded', radius: 18, borderW: 4, color: '#FF6EC7' },
    overlay: { color: 'rgba(255,110,199,0.08)' },
    decors: [
      { type: 'grid', rows: 6, cols: 6, alpha: 0.08, color: '#FF6EC7' },
      { type: 'sun_circle', x: 0.55, y: 0.85, r: 0.13, color: '#FF6EC744' },
      { type: 'stripes', dir: 'h', count: 4, alpha: 0.06, color: '#00D4FF44' },
    ],
    caption: { text: '蒸汽波', color: '#FF6EC7' },
  },
  japanese: {
    frame: { type: 'rounded', radius: 16, borderW: 4, color: '#E74C3C', innerColor: 'rgba(231,76,60,0.05)' },
    overlay: { color: 'rgba(220,60,50,0.08)' },
    decors: [
      { type: 'sakura', x: 0.12, y: 0.08, s: 0.10, color: '#E74C3C66' },
      { type: 'sakura', x: 0.88, y: 0.14, s: 0.08, color: '#FF6B9D66' },
      { type: 'sakura', x: 0.06, y: 0.82, s: 0.09, color: '#E74C3C44' },
      { type: 'sakura', x: 0.82, y: 0.88, s: 0.10, color: '#FF6B9D44' },
    ],
    caption: { text: '日系和风', color: '#E74C3C' },
  },
  cybergufeng: {
    frame: { type: 'corner', cornerLen: 0.20, borderW: 4 },
    overlay: { color: 'rgba(46,204,113,0.08)' },
    decors: [
      { type: 'circuit_line', x1: 0.05, y1: 0.12, x2: 0.25, y2: 0.12, color: '#2ECC7166' },
      { type: 'circuit_line', x1: 0.70, y1: 0.88, x2: 0.95, y2: 0.88, color: '#2ECC7166' },
      { type: 'hex', x: 0.88, y: 0.12, s: 0.10, color: '#2ECC7144' },
      { type: 'hex', x: 0.08, y: 0.88, s: 0.08, color: '#C8553D44' },
      { type: 'glitch_bar', x: 0.30, y: 0.15, w: 0.3, h: 0.015, color: '#2ECC7166' },
    ],
    caption: { text: '赛博古风', color: '#2ECC71' },
  },
}

/* ================================================================
   Canvas 绘制函数
   ================================================================ */

/**
 * 将照片处理为指定风格，返回新图片临时路径
 * @param {string} photoPath — 用户照片本地路径
 * @param {string} styleId — 风格 id
 * @returns {Promise<string>} 处理后的图片临时路径
 */
/**
 * 将照片处理为指定风格，返回新图片临时路径
 * 处理流程：照片 → 色彩覆盖 → Canvas边框 → 装饰 → 标签 → **PNG边框素材叠加**
 * @param {string} photoPath — 用户照片本地路径
 * @param {string} styleId — 风格 id
 * @returns {Promise<string>} 处理后的图片临时路径
 */
export function applyStyleToPhoto(photoPath, styleId) {
  const styleInfo = STYLES.find((s) => s.id === styleId) || STYLES[0]
  const decor = STYLE_DECOR[styleId] || STYLE_DECOR['gufeng']
  const canvasW = 1024
  const canvasH = 1024
  // PNG边框素材路径（与 scripts/generate_borders.py 生成的文件对应）
  const borderImagePath = `/static/borders/${styleId}.png`

  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: photoPath,
      success: (imgInfo) => {
        tryDraw(imgInfo.width, imgInfo.height)
      },
      fail: (err) => reject(new Error('无法读取图片信息: ' + (err.errMsg || ''))),
    })

    function doExport(canvas) {
      wx.canvasToTempFilePath({
        canvas,
        x: 0, y: 0, width: canvasW, height: canvasH,
        destWidth: canvasW, destHeight: canvasH,
        fileType: 'png',
        success: (r) => resolve(r.tempFilePath),
        fail: (err) => reject(new Error('导出失败: ' + (err.errMsg || ''))),
      })
    }

    function tryDraw(imgW, imgH) {
      // #ifdef MP-WEIXIN
      try {
        const canvas = wx.createOffscreenCanvas({ type: '2d', width: canvasW, height: canvasH })
        const ctx = canvas.getContext('2d')

        // Step 1: 铺底色
        ctx.fillStyle = '#111122'
        ctx.fillRect(0, 0, canvasW, canvasH)

        // Step 2: 绘制用户照片（居中裁剪为正方形）
        const img = canvas.createImage()
        img.onload = () => {
          // 等比例填充裁剪
          const scale = Math.max(canvasW / imgW, canvasH / imgH)
          const sw = canvasW / scale
          const sh = canvasH / scale
          const sx = (imgW - sw) / 2
          const sy = (imgH - sh) / 2
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH)

          // Step 3: 色彩覆盖层
          if (decor.overlay) {
            ctx.fillStyle = decor.overlay.color
            ctx.fillRect(0, 0, canvasW, canvasH)
          }

          // Step 4: 绘制边框（Canvas 程序化绘制）
          drawFrame(ctx, canvasW, canvasH, decor.frame, styleInfo.color)

          // Step 5: 绘制装饰元素
          drawDecors(ctx, canvasW, canvasH, decor.decors || [])

          // Step 6: 绘制风格标签
          if (decor.caption) {
            drawCaption(ctx, canvasW, canvasH, decor.caption)
          }

          // Step 7: 叠加 PNG 边框素材（高质量设计边框）
          const borderImg = canvas.createImage()
          borderImg.onload = () => {
            ctx.drawImage(borderImg, 0, 0, canvasW, canvasH)
            doExport(canvas)
          }
          borderImg.onerror = () => {
            // 边框素材加载失败时降级：直接输出（已有Canvas绘制的边框）
            console.warn(`[border] ${styleId}.png 加载失败，使用 Canvas 边框`)
            doExport(canvas)
          }
          borderImg.src = borderImagePath
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = photoPath
      } catch (e) {
        reject(new Error('Canvas 不可用: ' + (e.message || '')))
      }
      // #endif

      // #ifndef MP-WEIXIN
      reject(new Error('当前环境不支持离屏 Canvas'))
      // #endif
    }
  })
}

/* ====================== 边框绘制 ====================== */

function drawFrame(ctx, w, h, frame, fallbackColor) {
  const color = frame.color || fallbackColor || '#C8553D'
  const bw = frame.borderW || 5
  const pad = bw / 2

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = bw
  ctx.lineCap = 'round'

  if (frame.type === 'rounded') {
    const r = (frame.radius || 20)
    drawRoundedRect(ctx, pad, pad, w - bw, h - bw, r)
    ctx.stroke()
    // 内发光
    if (frame.innerColor) {
      ctx.strokeStyle = frame.innerColor
      ctx.lineWidth = bw * 2.5
      drawRoundedRect(ctx, pad, pad, w - bw, h - bw, r)
      ctx.stroke()
    }
  } else if (frame.type === 'corner') {
    drawCornerFrame(ctx, w, h, bw, color, frame.cornerLen || 0.22)
  } else if (frame.type === 'bubble') {
    const r = (frame.radius || 28)
    drawRoundedRect(ctx, pad, pad, w - bw, h - bw, r)
    ctx.stroke()
    // 气泡高光
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = bw * 0.5
    drawRoundedRect(ctx, pad + 12, pad + 12, w - bw - 24, h - bw - 24, r - 4)
    ctx.stroke()
  } else if (frame.type === 'soft_edge') {
    // 软边：渐变从透明到半透明
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, color + '22')
    grad.addColorStop(0.06, color + '11')
    grad.addColorStop(0.94, color + '11')
    grad.addColorStop(1, color + '22')
    ctx.strokeStyle = grad
    ctx.lineWidth = bw * 8
    ctx.strokeRect(pad, pad, w - bw * 2, h - bw * 2)
  } else if (frame.type === 'film') {
    // 胶片边框 — 上下黑条
    const barH = h * 0.06
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, w, barH)
    ctx.fillRect(0, h - barH, w, barH)
    // 齿孔
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    const holeR = barH * 0.25
    for (let i = holeR; i < w; i += barH * 1.2) {
      ctx.beginPath()
      ctx.arc(i, barH / 2, holeR, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(i, h - barH / 2, holeR, 0, Math.PI * 2)
      ctx.fill()
    }
    // 橙色细线
    ctx.strokeStyle = color
    ctx.lineWidth = bw
    ctx.strokeRect(pad, pad, w - bw, h - bw)
  } else if (frame.type === 'geometric') {
    // 几何切角框
    const off = bw * 3
    ctx.beginPath()
    ctx.moveTo(off, bw)
    ctx.lineTo(w - off, bw)
    ctx.lineTo(w - bw, off)
    ctx.lineTo(w - bw, h - off)
    ctx.lineTo(w - off, h - bw)
    ctx.lineTo(off, h - bw)
    ctx.lineTo(bw, h - off)
    ctx.lineTo(bw, off)
    ctx.closePath()
    ctx.stroke()
  } else if (frame.type === 'ornate') {
    drawRoundedRect(ctx, pad, pad, w - bw, h - bw, 16)
    ctx.stroke()
    // 内层细线
    ctx.strokeStyle = color + '55'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, bw * 2, bw * 2, w - bw * 4, h - bw * 4, 14)
    ctx.stroke()
  } else if (frame.type === 'pixelated') {
    const bs = frame.blockSize || 8
    ctx.lineWidth = bw
    for (let x = bw; x < w; x += bs) {
      ctx.fillStyle = color + '44'
      ctx.fillRect(x, 0, bs - 1, bw)
      ctx.fillRect(x, h - bw, bs - 1, bw)
    }
    for (let y = bw; y < h; y += bs) {
      ctx.fillStyle = color + '44'
      ctx.fillRect(0, y, bw, bs - 1)
      ctx.fillRect(w - bw, y, bw, bs - 1)
    }
    ctx.strokeStyle = color
    ctx.strokeRect(pad, pad, w - bw, h - bw)
  } else if (frame.type === 'swirl') {
    drawRoundedRect(ctx, pad, pad, w - bw, h - bw, 30)
    ctx.stroke()
    // 添加旋涡纹理
    ctx.strokeStyle = color + '33'
    ctx.lineWidth = bw * 0.6
    for (let i = 1; i <= 3; i++) {
      drawRoundedRect(ctx, bw * i, bw * i, w - bw * i * 2, h - bw * i * 2, 30 - i * 2)
      ctx.stroke()
    }
  } else if (frame.type === 'japanese') {
    drawRoundedRect(ctx, pad, pad, w - bw, h - bw, 8)
    ctx.stroke()
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    drawRoundedRect(ctx, bw * 3, bw * 3, w - bw * 6, h - bw * 6, 6)
    ctx.stroke()
  } else {
    // fallback: simple rounded
    drawRoundedRect(ctx, pad, pad, w - bw, h - bw, 16)
    ctx.stroke()
  }
  ctx.restore()
}

/* ====================== 装饰元素绘制 ====================== */

function drawDecors(ctx, w, h, decors) {
  for (const d of decors) {
    ctx.save()
    switch (d.type) {
      case 'star4': drawStar4(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'star5': drawStar5(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'sparkle': drawSparkle(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'cloud': drawCloud(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'circle_ring': drawCircleRing(ctx, w * d.x, h * d.y, w * d.r, d.color); break
      case 'circle_solid': drawCircleSolid(ctx, w * d.x, h * d.y, w * d.r, d.color); break
      case 'splash': drawSplash(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'watercolor_wash': drawWash(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'grid': drawGrid(ctx, w, h, d.rows || 6, d.cols || 6, d.alpha || 0.1, d.color); break
      case 'scanline': drawScanline(ctx, w, h, d.yPos || 0.5, d.alpha || 0.15, d.color); break
      case 'glitch_bar': drawGlitchBar(ctx, w * d.x, h * d.y, w * d.w, h * d.h, d.color); break
      case 'hatch': drawHatch(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'tri': drawTri(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'rect': drawDecoRect(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'ormate_corner': drawOrnateCorner(ctx, w, h, d.corner, w * d.s, d.color); break
      case 'vignette': drawVignette(ctx, w, h, d.alpha); break
      case 'film_sprockets': drawSprockets(ctx, w, h, d.side, d.count, d.color); break
      case 'date_stamp': drawDateStamp(ctx, w * d.x, h * d.y, d.text, d.color); break
      case 'nami': drawNami(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'en_maru': drawCircleRing(ctx, w * d.x, h * d.y, w * d.r, d.color); break
      case 'sakura': drawSakura(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'sparkle_line': drawSparkleLine(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'sun_circle': drawSunCircle(ctx, w * d.x, h * d.y, w * d.r, d.color); break
      case 'stripes': drawStripes(ctx, w, h, d.dir, d.count, d.alpha, d.color); break
      case 'swirl_brush': drawSwirlBrush(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'hex': drawHex(ctx, w * d.x, h * d.y, w * d.s, d.color); break
      case 'circuit_line': drawCircuitLine(ctx, w * d.x1, h * d.y1, w * d.x2, h * d.y2, d.color); break
      case 'pixel_heart': drawPixelHeart(ctx, w * d.x, h * d.y, d.s, d.color); break
      case 'pixel_coin': drawPixelCoin(ctx, w * d.x, h * d.y, d.s, d.color); break
      case 'pixel_text': drawPixelText(ctx, w * d.x, h * d.y, d.text, d.s, d.color); break
    }
    ctx.restore()
  }
}

/* ====================== 通用形状 ====================== */

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawCornerFrame(ctx, w, h, bw, color, len) {
  const cl = w * len
  ctx.strokeStyle = color
  ctx.lineWidth = bw
  // 左上
  ctx.beginPath(); ctx.moveTo(bw, bw + cl); ctx.lineTo(bw, bw); ctx.lineTo(bw + cl, bw); ctx.stroke()
  // 右上
  ctx.beginPath(); ctx.moveTo(w - bw - cl, bw); ctx.lineTo(w - bw, bw); ctx.lineTo(w - bw, bw + cl); ctx.stroke()
  // 左下
  ctx.beginPath(); ctx.moveTo(bw, h - bw - cl); ctx.lineTo(bw, h - bw); ctx.lineTo(bw + cl, h - bw); ctx.stroke()
  // 右下
  ctx.beginPath(); ctx.moveTo(w - bw - cl, h - bw); ctx.lineTo(w - bw, h - bw); ctx.lineTo(w - bw, h - bw - cl); ctx.stroke()
}

// 四角星
function drawStar4(ctx, cx, cy, sz, color) {
  const s = sz * 0.5
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s)
  }
  ctx.closePath()
  ctx.fill()
}

// 五角星
function drawStar5(ctx, cx, cy, sz, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? sz : sz * 0.4
    const a = (Math.PI / 5) * i - Math.PI / 2
    const method = i === 0 ? 'moveTo' : 'lineTo'
    ctx[method](cx + Math.cos(a) * r, cy + Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fill()
}

// 闪光点
function drawSparkle(ctx, cx, cy, sz, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, sz, 0, Math.PI * 2)
  ctx.fill()
  // 十字光芒
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - sz * 2.5, cy); ctx.lineTo(cx + sz * 2.5, cy)
  ctx.moveTo(cx, cy - sz * 2.5); ctx.lineTo(cx, cy + sz * 2.5)
  ctx.stroke()
}

// 祥云
function drawCloud(ctx, cx, cy, sz, color) {
  const r = sz * 0.35
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx - r * 0.8, cy, r, Math.PI, 0.3)
  ctx.arc(cx, cy - r * 0.5, r * 0.8, Math.PI * 0.2, Math.PI * 0.8)
  ctx.arc(cx + r * 0.8, cy, r, Math.PI * 0.6, 0)
  ctx.arc(cx, cy + r * 0.3, r * 0.7, 0, Math.PI)
  ctx.closePath()
  ctx.fill()
}

// 圆环
function drawCircleRing(ctx, cx, cy, r, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
}

// 实心圆
function drawCircleSolid(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

// 泼溅
function drawSplash(ctx, cx, cy, sz, color) {
  ctx.fillStyle = color
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(cx + (Math.random() - 0.5) * sz * 0.6, cy + (Math.random() - 0.5) * sz * 0.6, sz * (0.15 + Math.random() * 0.15), 0, Math.PI * 2)
    ctx.fill()
  }
}

// 水彩晕染
function drawWash(ctx, cx, cy, sz, color) {
  const grad = ctx.createRadialGradient(cx, cy, sz * 0.1, cx, cy, sz)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, sz, 0, Math.PI * 2)
  ctx.fill()
}

// 网格
function drawGrid(ctx, w, h, rows, cols, alpha, color) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = 0.5
  for (let i = 1; i < cols; i++) {
    const x = (w / cols) * i
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let i = 1; i < rows; i++) {
    const y = (h / rows) * i
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// 扫描线
function drawScanline(ctx, w, h, yPos, alpha, color) {
  ctx.globalAlpha = alpha
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, 'transparent')
  grad.addColorStop(yPos - 0.02, 'transparent')
  grad.addColorStop(yPos, color)
  grad.addColorStop(yPos + 0.02, 'transparent')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1
}

// 故障条
function drawGlitchBar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
  // 偏移条
  ctx.fillRect(x + 8, y + h * 3, w * 0.3, h * 0.6)
}

// 排线
function drawHatch(ctx, cx, cy, sz, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(cx - sz * 0.4, cy - sz * 0.4 + i * sz * 0.12)
    ctx.lineTo(cx + sz * 0.4, cy - sz * 0.4 + i * sz * 0.12)
    ctx.stroke()
  }
}

// 三角
function drawTri(ctx, cx, cy, sz, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx, cy - sz)
  ctx.lineTo(cx + sz * 0.866, cy + sz * 0.5)
  ctx.lineTo(cx - sz * 0.866, cy + sz * 0.5)
  ctx.closePath()
  ctx.fill()
}

// 矩形
function drawDecoRect(ctx, cx, cy, sz, color) {
  ctx.fillStyle = color
  ctx.fillRect(cx - sz, cy - sz * 0.6, sz * 2, sz * 1.2)
}

// 华丽角饰
function drawOrnateCorner(ctx, w, h, corner, sz, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  let cx, cy, dirX, dirY
  switch (corner) {
    case 'tl': cx = sz * 0.6; cy = sz * 0.6; dirX = 1; dirY = 1; break
    case 'tr': cx = w - sz * 0.6; cy = sz * 0.6; dirX = -1; dirY = 1; break
    case 'bl': cx = sz * 0.6; cy = h - sz * 0.6; dirX = 1; dirY = -1; break
    case 'br': cx = w - sz * 0.6; cy = h - sz * 0.6; dirX = -1; dirY = -1; break
  }
  ctx.beginPath()
  ctx.arc(cx, cy, sz * 0.5, Math.PI * 0.75 + (corner === 'tl' || corner === 'br' ? 0 : Math.PI), Math.PI * 1.75 + (corner === 'tl' || corner === 'br' ? 0 : Math.PI))
  ctx.stroke()
  // 小圆点
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx + dirX * sz * 0.35, cy + dirY * sz * 0.35, 3, 0, Math.PI * 2)
  ctx.fill()
}

// 暗角
function drawVignette(ctx, w, h, alpha) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.75)
  grad.addColorStop(0, 'transparent')
  grad.addColorStop(1, `rgba(0,0,0,${alpha})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

// 胶片齿孔
function drawSprockets(ctx, w, h, side, count, color) {
  const barH = h * 0.06
  const holeR = barH * 0.28
  const xBase = side === 'left' ? holeR * 2 : w - holeR * 2
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const y = barH * 1.5 + (h - barH * 3) / (count - 1) * i
    ctx.beginPath()
    ctx.arc(xBase, y, holeR, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 日期戳
function drawDateStamp(ctx, x, y, text, color) {
  ctx.font = '18px monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.fillText(text, x, y)
}

// 浪花（浮世绘风格）
function drawNami(ctx, cx, cy, sz, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  const pts = 5
  for (let i = 0; i <= pts; i++) {
    const t = i / pts
    const x = cx - sz * 0.65 + t * sz * 1.3
    const y = cy + Math.sin(t * Math.PI * 3) * sz * 0.35
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
  // 浪尖小点
  ctx.fillStyle = color
  for (let i = 1; i < pts; i++) {
    const t = i / pts
    const x = cx - sz * 0.65 + t * sz * 1.3
    const y = cy + Math.sin(t * Math.PI * 3) * sz * 0.35 - 6
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

// 樱花
function drawSakura(ctx, cx, cy, sz, color) {
  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 / 5) * i - Math.PI / 2
    ctx.beginPath()
    ctx.ellipse(cx + Math.cos(a) * sz * 0.5, cy + Math.sin(a) * sz * 0.5, sz * 0.25, sz * 0.15, a, 0, Math.PI * 2)
    ctx.fill()
  }
  // 花心
  ctx.fillStyle = '#FFEAA7'
  ctx.beginPath()
  ctx.arc(cx, cy, sz * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

// 闪光线条（迪士尼风）
function drawSparkleLine(ctx, cx, cy, sz, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - sz, cy - sz * 0.3)
  ctx.quadraticCurveTo(cx, cy - sz * 0.6, cx + sz, cy - sz * 0.3)
  ctx.stroke()
  // 两端小星
  drawStar4(ctx, cx - sz, cy - sz * 0.3, sz * 0.1, color)
  drawStar4(ctx, cx + sz, cy - sz * 0.3, sz * 0.1, color)
}

// 太阳圆（蒸汽波风）
function drawSunCircle(ctx, cx, cy, r, color) {
  const grad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r)
  grad.addColorStop(0, color)
  grad.addColorStop(0.6, color + '22')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  // 横条纹遮罩
  ctx.globalCompositeOperation = 'destination-out'
  for (let i = -r; i < r; i += r * 0.25) {
    ctx.fillRect(cx - r, cy + i, r * 2, r * 0.12)
  }
  ctx.globalCompositeOperation = 'source-over'
}

// 条纹
function drawStripes(ctx, w, h, dir, count, alpha, color) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  const gap = dir === 'h' ? h / (count * 2) : w / (count * 2)
  for (let i = 0; i < count; i++) {
    if (dir === 'h') {
      ctx.fillRect(0, gap * (i * 2 + 0.4), w, gap * 0.6)
    } else {
      ctx.fillRect(gap * (i * 2 + 0.4), 0, gap * 0.6, h)
    }
  }
  ctx.globalAlpha = 1
}

// 旋涡笔触（梵高）
function drawSwirlBrush(ctx, cx, cy, sz, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let t = 0; t <= Math.PI * 2.5; t += 0.1) {
    const r = sz * (t / (Math.PI * 2.5))
    const x = cx + Math.cos(t) * r * 0.6
    const y = cy + Math.sin(t) * r * 0.6 - sz * 0.3 + t * sz * 0.06
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
}

// 六边形
function drawHex(ctx, cx, cy, sz, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    const x = cx + Math.cos(a) * sz
    const y = cy + Math.sin(a) * sz
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

// 电路走线
function drawCircuitLine(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  const mx = (x1 + x2) / 2
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(mx, y1)
  ctx.lineTo(mx, y2)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  // 端点圆
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x1, y1, 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x2, y2, 4, 0, Math.PI * 2); ctx.fill()
}

// 像素爱心
function drawPixelHeart(ctx, cx, cy, s, color) {
  ctx.fillStyle = color
  const g = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ]
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[r].length; c++) {
      if (g[r][c]) ctx.fillRect(cx + c * s - s * 2.5, cy + r * s - s * 2.5, s, s)
    }
  }
}

// 像素金币
function drawPixelCoin(ctx, cx, cy, s, color) {
  ctx.fillStyle = color
  const g = [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ]
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[r].length; c++) {
      if (g[r][c]) ctx.fillRect(cx + c * s - s * 2, cy + r * s - s * 2, s, s)
    }
  }
}

// 像素文字
function drawPixelText(ctx, cx, cy, text, s, color) {
  ctx.font = `${s * 2}px monospace`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(text, cx, cy)
}

/* ====================== 标签文字 ====================== */

function drawCaption(ctx, w, h, caption) {
  const fontSize = 28
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.fillStyle = caption.color
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  // 背景条
  const m = ctx.measureText(caption.text)
  const tw = m.width
  const padX = 16, padY = 10
  ctx.fillStyle = 'rgba(15,15,35,0.7)'
  ctx.fillRect(w - tw - padX * 2 - 16, h - fontSize - padY * 2 - 12, tw + padX * 2, fontSize + padY * 2)
  // 文字
  ctx.fillStyle = caption.color
  ctx.fillText(caption.text, w - 24, h - 16)
}

/* ====================== 工具函数 ====================== */

/**
 * 获取风格装饰配置
 */
export function getStyleDecor(styleId) {
  return STYLE_DECOR[styleId] || STYLE_DECOR['gufeng']
}
