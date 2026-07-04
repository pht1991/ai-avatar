// utils/share.js - 分享功能

/**
 * 生成微信分享卡片图片（5:4 比例，适配朋友圈）
 * @param {string} imagePath - 本地图片路径
 * @param {string} styleName - 风格名称
 * @returns {Promise<string>} 分享卡片临时文件路径
 */
export function generateShareCard(imagePath, styleName) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    const canvas = wx.createOffscreenCanvas({ type: '2d', width: 500, height: 400 })
    const ctx = canvas.getContext('2d')

    const img = canvas.createImage()
    img.onload = () => {
      // 背景
      ctx.fillStyle = '#0f0f23'
      ctx.fillRect(0, 0, 500, 400)

      // 中心展示图片（等比缩放，320x320 区域）
      const maxW = 320; const maxH = 320
      const scale = Math.min(maxW / img.width, maxH / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = (500 - dw) / 2
      const dy = 18
      ctx.drawImage(img, dx, dy, dw, dh)

      // 圆角遮罩装饰
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(dx, dy, dw, dh, [12])
      ctx.stroke()

      // 风格名称
      ctx.font = 'bold 20px sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(`${styleName || '精选'}风格头像`, 250, dy + dh + 32)

      // 引导文案
      ctx.font = '13px sans-serif'
      ctx.fillStyle = '#888888'
      ctx.fillText('扫码生成你的专属头像 →', 250, dy + dh + 56)

      wx.canvasToTempFilePath({
        canvas,
        x: 0, y: 0, width: 500, height: 400,
        destWidth: 500, destHeight: 400,
        fileType: 'png',
        success: (res) => resolve(res.tempFilePath),
        fail: reject,
      })
    }
    img.onerror = (err) => reject(err || new Error('图片加载失败'))
    img.src = imagePath
    // #endif

    // #ifndef MP-WEIXIN
    resolve('')
    // #endif
  })
}

/**
 * 返回分享配置对象（供页面 onShareAppMessage 使用）
 */
export function setupShare(title, imageUrl) {
  return {
    title: title || '风格头像助手 — 一键生成你的专属头像',
    path: '/pages/index/index',
    imageUrl: imageUrl || '',
  }
}
