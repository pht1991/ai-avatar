// utils/canvas-export.js — 编辑器合成导出
// 将编辑器状态（照片 + 边框 + 装饰列表）合成为一张图片

/**
 * 加载 Canvas 图片
 */
function loadCanvasImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败: ' + src))
    img.src = src
  })
}

/**
 * 将编辑器状态导出为图片
 * @param {Object} params
 * @param {string} params.photoPath — 用户照片路径
 * @param {string} params.borderSrc — 边框素材路径（可为 null）
 * @param {Array} params.decorations — 装饰列表 [{ src, x, y, displayWidth, displayHeight, scale, rotation }]
 * @param {number} params.editAreaWidth — 编辑区域实际像素宽度
 * @returns {Promise<string>} 合成后的临时图片路径
 */
export function exportEditorCanvas(params) {
  const { photoPath, borderSrc, decorations, editAreaWidth } = params
  const canvasSize = 1024

  return new Promise(async (resolve, reject) => {
    // #ifdef MP-WEIXIN
    try {
      const canvas = wx.createOffscreenCanvas({ type: '2d', width: canvasSize, height: canvasSize })
      const ctx = canvas.getContext('2d')

      // 并行加载所有图片
      const loadTasks = []
      let photoImg = null
      let borderImg = null
      const decImgs = []

      if (photoPath) {
        loadTasks.push(
          loadCanvasImage(canvas, photoPath)
            .then((img) => { photoImg = img })
            .catch(() => {})
        )
      }
      if (borderSrc) {
        loadTasks.push(
          loadCanvasImage(canvas, borderSrc)
            .then((img) => { borderImg = img })
            .catch(() => {})
        )
      }
      for (let i = 0; i < decorations.length; i++) {
        const idx = i
        loadTasks.push(
          loadCanvasImage(canvas, decorations[idx].src)
            .then((img) => { decImgs[idx] = img })
            .catch(() => {})
        )
      }

      await Promise.all(loadTasks)

      // 1. 铺底色
      ctx.fillStyle = '#111122'
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      // 2. 绘制照片（居中裁剪为正方形）
      if (photoImg) {
        const scale = Math.max(canvasSize / photoImg.width, canvasSize / photoImg.height)
        const sw = canvasSize / scale
        const sh = canvasSize / scale
        const sx = (photoImg.width - sw) / 2
        const sy = (photoImg.height - sh) / 2
        ctx.drawImage(photoImg, sx, sy, sw, sh, 0, 0, canvasSize, canvasSize)
      }

      // 3. 叠加边框
      if (borderImg) {
        ctx.drawImage(borderImg, 0, 0, canvasSize, canvasSize)
      }

      // 4. 绘制装饰元素（按 zIndex 排序）
      const ratio = canvasSize / editAreaWidth
      const sortedDecs = decorations
        .map((d, i) => ({ d, i }))
        .sort((a, b) => (a.d.zIndex || 0) - (b.d.zIndex || 0))

      for (const { d, i } of sortedDecs) {
        const img = decImgs[i]
        if (!img) continue

        const cx = d.x * ratio
        const cy = d.y * ratio
        const cw = d.displayWidth * d.scale * ratio
        const ch = d.displayHeight * d.scale * ratio
        const rad = (d.rotation || 0) * Math.PI / 180

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rad)
        ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch)
        ctx.restore()
      }

      // 5. 导出
      wx.canvasToTempFilePath({
        canvas,
        x: 0, y: 0,
        width: canvasSize, height: canvasSize,
        destWidth: canvasSize, destHeight: canvasSize,
        fileType: 'png',
        success: (r) => resolve(r.tempFilePath),
        fail: (err) => reject(new Error('导出失败: ' + (err.errMsg || ''))),
      })
    } catch (e) {
      reject(new Error('Canvas 不可用: ' + (e.message || '')))
    }
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error('当前环境不支持离屏 Canvas'))
    // #endif
  })
}
