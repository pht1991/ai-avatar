// utils/image.js - 图片处理工具

/**
 * 压缩图片到指定大小以下（单位 KB），quality 递减避免无效递归
 */
export function compressImage(path, maxSizeKB = 512, quality = 80) {
  return new Promise((resolve) => {
    uni.compressImage({
      src: path,
      quality,
      success: (res) => {
        uni.getFileInfo({
          filePath: res.tempFilePath,
          success: (info) => {
            if (info.size / 1024 <= maxSizeKB) {
              resolve(res.tempFilePath)
            } else if (quality > 30) {
              compressImage(res.tempFilePath, maxSizeKB, quality - 20).then(resolve)
            } else {
              resolve(res.tempFilePath)
            }
          },
          fail: () => resolve(res.tempFilePath),
        })
      },
      fail: () => resolve(path),
    })
  })
}

/**
 * 图片文件转 Base64
 */
export function imageToBase64(path) {
  return new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager()
    fs.readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => resolve(res.data),
      fail: reject,
    })
  })
}

/**
 * Base64 字符串转临时文件路径
 */
export function base64ToTempFile(base64) {
  return new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/avatar_${Date.now()}.png`
    fs.writeFile({
      filePath,
      data: base64,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: reject,
    })
  })
}

/**
 * 检查并请求相册/相机权限，用户拒绝后引导打开设置
 * @returns {Promise<boolean>} 是否有权限
 */
function ensureAlbumPermission() {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting || {}
        // 仅在明确拒绝过时才引导去设置，不主动弹授权框（让 chooseMedia 自己处理）
        if (auth['scope.camera'] === false || auth['scope.writePhotosAlbum'] === false) {
          uni.showModal({
            title: '权限未开启',
            content: '需要相册或相机权限才能选择照片，请在设置中开启',
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    resolve(settingRes.authSetting['scope.camera'] !== false)
                  },
                  fail: () => resolve(false),
                })
              } else {
                resolve(false)
              }
            },
          })
          return
        }
        resolve(true)
      },
      fail: () => resolve(true), // getSetting 失败不阻塞
    })
    // #endif

    // #ifndef MP-WEIXIN
    resolve(true)
    // #endif
  })
}

/**
 * 从相册选择图片（支持拍照），带权限校验
 */
export async function chooseImage() {
  const hasAuth = await ensureAlbumPermission()
  if (!hasAuth) {
    uni.showToast({ title: '需要相册/相机权限', icon: 'none' })
    return Promise.reject(new Error('用户未授权'))
  }

  return new Promise((resolve, reject) => {
    uni.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        resolve(res.tempFiles[0].tempFilePath)
      },
      fail: (err) => {
        console.warn('[chooseMedia] fail:', JSON.stringify(err))
        // 用户取消 → 静默 reject
        if (err.errMsg?.includes('cancel')) {
          reject(err)
          return
        }
        // errno:112 = 后台未声明隐私协议，提示用户
        if (err.errno === 112) {
          uni.showModal({
            title: '隐私协议提示',
            content: '该功能需要在小程序后台配置《用户隐私保护指引》，声明"收集你选中的照片或视频信息"后才能使用。请在微信小程序管理后台进行配置。',
            showCancel: false,
          })
        }
        reject(err)
      },
    })
  })
}

/**
 * 从 URL 下载图片到本地临时文件（用于 saveToAlbum 前预处理）
 * 注意：真机需要在微信后台配置 downloadFile 合法域名白名单
 */
export function urlToTempFile(url) {
  return new Promise((resolve, reject) => {
    const ext = (url.match(/\.(png|jpg|jpeg|webp|gif|bmp)(\?.*)?$/i) || [])[1] || 'png'
    const savePath = `${wx.env.USER_DATA_PATH}/avatar_url_${Date.now()}.${ext}`
    uni.downloadFile({
      url,
      success: (dlRes) => {
        if (dlRes.statusCode !== 200) {
          reject(new Error(`下载失败 HTTP ${dlRes.statusCode}`))
          return
        }
        const fs = uni.getFileSystemManager()
        try {
          fs.copyFileSync(dlRes.tempFilePath, savePath)
          resolve(savePath)
        } catch (e) {
          resolve(ensureImageExt(dlRes.tempFilePath))
        }
      },
      fail: (err) => {
        reject(new Error(`图片下载失败: ${err.errMsg || '未知错误'}`))
      },
    })
  })
}

/**
 * 确保文件有图片扩展名（微信保存到相册需要正确扩展名，否则存为 bin）
 */
function ensureImageExt(filePath) {
  const IMG_EXTS = /\.(png|jpg|jpeg|webp|bmp|gif)$/i
  if (IMG_EXTS.test(filePath)) {
    return filePath
  }
  const fs = uni.getFileSystemManager()
  const extPath = `${wx.env.USER_DATA_PATH}/avatar_save_${Date.now()}.png`
  try {
    fs.copyFileSync(filePath, extPath)
    return extPath
  } catch (_) {
    return filePath
  }
}

/**
 * 保存图片到相册
 */
export function saveToAlbum(filePath) {
  const savePath = ensureImageExt(filePath)
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.saveImageToPhotosAlbum({
      filePath: savePath,
      success: () => resolve(),
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          uni.showModal({
            title: '需要相册权限',
            content: '请前往设置开启相册权限以保存图片',
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting({})
              }
            },
          })
        }
        // errno:112 = 后台未声明隐私协议
        if (err.errno === 112) {
          uni.showModal({
            title: '隐私协议提示',
            content: '该功能需要在小程序后台配置《用户隐私保护指引》，声明"使用你的相册权限"后才能使用。请在微信小程序管理后台进行配置。',
            showCancel: false,
          })
        }
        reject(err)
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    resolve(filePath) // 非微信环境跳过
    // #endif
  })
}

/**
 * 图片安全检测
 */
export function imgSecurityCheck(filePath) {
  return new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager()
    fs.access({
      path: filePath,
      success: () => {},
      fail: () => {
        reject(new Error('图片文件不存在，请重新选择'))
        return
      },
    })

    uni.getFileInfo({
      filePath,
      success: (info) => {
        const sizeMB = info.size / (1024 * 1024)
        if (sizeMB > 10) {
          reject(new Error(`图片过大(${sizeMB.toFixed(1)}MB)，请选择小于10MB的照片`))
          return
        }
        if (info.size < 1024) {
          reject(new Error('图片文件过小，请重新选择清晰照片'))
          return
        }
        uni.getImageInfo({
          src: filePath,
          success: (imgInfo) => {
            const type = (imgInfo.type || '').toLowerCase()
            const allowedTypes = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']
            if (type && !allowedTypes.includes(type)) {
              reject(new Error(`不支持的图片格式(${type})，请选择 JPG/PNG/WebP 格式照片`))
              return
            }
            if (imgInfo.width < 64 || imgInfo.height < 64) {
              reject(new Error('图片分辨率过低，请选择至少 64x64 像素的照片'))
              return
            }
            if (imgInfo.width > 8192 || imgInfo.height > 8192) {
              reject(new Error('图片分辨率过高，请选择不超过 8192 像素的照片'))
              return
            }
            resolve({ width: imgInfo.width, height: imgInfo.height, type: imgInfo.type, size: info.size })
          },
          fail: () => {
            reject(new Error('无法解析图片信息，请确认选择了有效的图片文件'))
          },
        })
      },
      fail: () => {
        reject(new Error('无法读取图片信息，请重新选择'))
      },
    })
  })
}

/**
 * 检测图片宽高比
 */
export function getImageSize(path) {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: path,
      success: (res) => resolve({ width: res.width, height: res.height }),
      fail: reject,
    })
  })
}

/**
 * 给图片添加文字水印（canvas 绘制），返回带水印的临时文件路径
 * 超时 8 秒自动降级返回原图
 */
export function addWatermark(imagePath, text = '风格头像助手') {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('[watermark] 超时，降级返回原图')
      resolve(imagePath)
    }, 8000)

    uni.getImageInfo({
      src: imagePath,
      success: (imgInfo) => {
        const w = imgInfo.width
        const h = imgInfo.height
        try {
          // #ifdef MP-WEIXIN
          const canvas = wx.createOffscreenCanvas({ type: '2d', width: w, height: h })
          const ctx = canvas.getContext('2d')
          const img = canvas.createImage()
          img.onload = () => {
            clearTimeout(timeout)
            ctx.drawImage(img, 0, 0, w, h)
            const fontSize = Math.max(20, Math.floor(w / 18))
            const padding = fontSize
            ctx.font = `bold ${fontSize}px sans-serif`
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.lineWidth = 2
            ctx.textAlign = 'right'
            ctx.textBaseline = 'bottom'
            ctx.strokeText(text, w - padding, h - padding)
            ctx.fillText(text, w - padding, h - padding)
            wx.canvasToTempFilePath({
              canvas,
              x: 0, y: 0, width: w, height: h,
              destWidth: w, destHeight: h,
              fileType: 'png',
              success: (r) => resolve(r.tempFilePath),
              fail: () => { clearTimeout(timeout); resolve(imagePath) },
            })
          }
          img.onerror = () => { clearTimeout(timeout); resolve(imagePath) }
          img.src = imagePath
          // #endif

          // #ifndef MP-WEIXIN
          clearTimeout(timeout)
          resolve(imagePath)
          // #endif
        } catch (e) {
          clearTimeout(timeout)
          console.warn('[watermark] offscreenCanvas 不可用，跳过水印', e)
          resolve(imagePath)
        }
      },
      fail: () => { clearTimeout(timeout); resolve(imagePath) },
    })
  })
}
