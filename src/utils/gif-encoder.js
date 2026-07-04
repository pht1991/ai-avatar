/**
 * 纯 JS GIF 编码器（无外部依赖，兼容微信小程序）
 * 将多帧 ImageData 编码为 GIF 文件（ArrayBuffer）
 */

/**
 * LZW 压缩
 */
function lzwEncode(data, minCodeSize) {
  const clearCode = 1 << minCodeSize
  const eoiCode = clearCode + 1
  let codeSize = minCodeSize + 1
  let codeMask = (1 << codeSize) - 1
  let nextCode = eoiCode + 1
  const dict = new Map()

  const outputBits = []
  let curBits = 0
  let curBitsLen = 0

  function writeBits(value, len) {
    for (let i = 0; i < len; i++) {
      curBits |= ((value >> i) & 1) << curBitsLen
      curBitsLen++
      if (curBitsLen === 8) {
        outputBits.push(curBits & 0xFF)
        curBits = 0
        curBitsLen = 0
      }
    }
  }

  writeBits(clearCode, codeSize)

  let w = String.fromCharCode(data[0])
  for (let i = 1; i < data.length; i++) {
    const k = String.fromCharCode(data[i])
    const wk = w + k
    if (dict.has(wk)) {
      w = wk
    } else {
      writeBits(dict.get(w) || w.charCodeAt(0), codeSize)
      dict.set(wk, nextCode)
      nextCode++
      w = k

      if (nextCode > codeMask) {
        if (codeSize < 12) {
          codeSize++
          codeMask = (1 << codeSize) - 1
        }
      }
      // 字典满了就清空
      if (nextCode >= 4096) {
        writeBits(clearCode, codeSize)
        dict.clear()
        nextCode = eoiCode + 1
        codeSize = minCodeSize + 1
        codeMask = (1 << codeSize) - 1
      }
    }
  }
  writeBits(dict.get(w) || w.charCodeAt(0), codeSize)
  writeBits(eoiCode, codeSize)

  // 补齐最后字节
  if (curBitsLen > 0) {
    outputBits.push(curBits & 0xFF)
  }

  return new Uint8Array(outputBits)
}

/**
 * 颜色量化: 从所有帧中提取 256 色调色板
 */
function quantize(frames) {
  const buckets = new Map()

  for (const frame of frames) {
    const data = frame.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
      if (a < 128) continue
      const qr = Math.round(r / 8) * 8
      const qg = Math.round(g / 8) * 8
      const qb = Math.round(b / 8) * 8
      const key = `${qr},${qg},${qb}`
      buckets.set(key, (buckets.get(key) || 0) + 1)
    }
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1])
  const palette = sorted.slice(0, 256).map(([key]) => {
    const [r, g, b] = key.split(',').map(Number)
    return { r, g, b }
  })

  // 确保包含黑白
  const hasColor = (r, g, b) => palette.some(c => c.r === r && c.g === g && c.b === b)
  if (!hasColor(0, 0, 0)) palette.unshift({ r: 0, g: 0, b: 0 })
  if (!hasColor(255, 255, 255)) palette.unshift({ r: 255, g: 255, b: 255 })
  const finalPalette = palette.slice(0, 256)

  const paletteArr = new Uint8Array(768)
  for (let i = 0; i < finalPalette.length; i++) {
    paletteArr[i * 3] = finalPalette[i].r
    paletteArr[i * 3 + 1] = finalPalette[i].g
    paletteArr[i * 3 + 2] = finalPalette[i].b
  }

  const indexedFrames = frames.map(frame => {
    const data = frame.data
    const indices = new Uint8Array(frame.width * frame.height)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
      const px = i / 4
      if (a < 128) {
        indices[px] = 0
      } else {
        indices[px] = findClosest(finalPalette, r, g, b)
      }
    }
    return indices
  })

  return { palette: paletteArr, indexedFrames, numColors: finalPalette.length }
}

function findClosest(palette, r, g, b) {
  let minDist = Infinity
  let minIdx = 0
  for (let i = 0; i < palette.length; i++) {
    const dr = palette[i].r - r
    const dg = palette[i].g - g
    const db = palette[i].b - b
    const dist = dr * dr + dg * dg + db * db
    if (dist < minDist) {
      minDist = dist
      minIdx = i
      if (dist === 0) break
    }
  }
  return minIdx
}

/**
 * 编码多帧为 GIF
 * @param {ImageData[]} frames
 * @param {number} delay - 每帧延迟 (毫秒)
 * @param {number} repeat - 循环次数 (0=无限)
 * @returns {ArrayBuffer}
 */
function encode(frames, delay = 500, repeat = 0) {
  if (!frames.length) throw new Error('no frames')

  const w = frames[0].width
  const h = frames[0].height

  const { palette, indexedFrames, numColors } = quantize(frames)

  // 计算调色板颜色数（必须为 2 的幂）
  let colorBits = 1
  while ((1 << colorBits) < numColors) colorBits++
  const numPaletteColors = 1 << colorBits
  const paletteSize = numPaletteColors * 3

  // 预估 GIF 大小
  const estimatedSize = w * h * frames.length + 2048
  const chunks = []

  // --- GIF Header ---
  const header = new Uint8Array(13)
  header.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 0) // GIF89a
  // Logical Screen Descriptor
  header[6] = w & 0xFF; header[7] = (w >> 8) & 0xFF
  header[8] = h & 0xFF; header[9] = (h >> 8) & 0xFF
  // Packed: global color table flag = 1, color res = 7, sort = 0, size = colorBits-1
  header[10] = 0xF0 | (colorBits - 1)
  header[11] = 0 // background color index
  header[12] = 0 // pixel aspect ratio
  chunks.push(header)

  // Global Color Table
  chunks.push(palette.slice(0, paletteSize))

  // --- Netscape Extension (loop) ---
  const netscape = new Uint8Array(19)
  netscape[0] = 0x21; netscape[1] = 0xFF; netscape[2] = 0x0B // Extension
  netscape[3] = 0x4E; netscape[4] = 0x45; netscape[5] = 0x54 // "NET"
  netscape[6] = 0x53; netscape[7] = 0x43; netscape[8] = 0x41 // "SCA"
  netscape[9] = 0x50; netscape[10] = 0x45; netscape[11] = 0x32 // "PE2"
  netscape[12] = 0x2E; netscape[13] = 0x30 // ".0"
  netscape[14] = 0x03 // block size
  netscape[15] = 0x01 // sub-block id
  netscape[16] = repeat & 0xFF
  netscape[17] = (repeat >> 8) & 0xFF
  netscape[18] = 0x00 // block terminator
  chunks.push(netscape)

  const delayCs = Math.max(2, Math.round(delay / 10))

  for (let i = 0; i < indexedFrames.length; i++) {
    // --- Graphic Control Extension ---
    const gce = new Uint8Array(8)
    gce[0] = 0x21; gce[1] = 0xF9; gce[2] = 0x04 // Extension
    // disposal method = 2 (restore to background), no transparent color
    gce[3] = 0x04
    gce[4] = delayCs & 0xFF
    gce[5] = (delayCs >> 8) & 0xFF
    gce[6] = 0 // transparent color index (none)
    gce[7] = 0x00 // block terminator
    chunks.push(gce)

    // --- Image Descriptor ---
    const imgDesc = new Uint8Array(10)
    imgDesc[0] = 0x2C // Image Separator
    imgDesc[1] = 0; imgDesc[2] = 0 // left
    imgDesc[3] = 0; imgDesc[4] = 0 // top
    imgDesc[5] = w & 0xFF; imgDesc[6] = (w >> 8) & 0xFF
    imgDesc[7] = h & 0xFF; imgDesc[8] = (h >> 8) & 0xFF
    imgDesc[9] = 0 // no local color table
    chunks.push(imgDesc)

    // --- LZW 压缩的像素数据 ---
    const minCodeSize = Math.max(2, colorBits)
    const compressed = lzwEncode(indexedFrames[i], minCodeSize)

    // 写入 LZW minimum code size
    const lzwHeader = new Uint8Array(1)
    lzwHeader[0] = minCodeSize
    chunks.push(lzwHeader)

    // 分块写入 (每块最多 255 字节)
    let offset = 0
    while (offset < compressed.length) {
      const blockSize = Math.min(255, compressed.length - offset)
      const block = new Uint8Array(blockSize + 1)
      block[0] = blockSize
      block.set(compressed.subarray(offset, offset + blockSize), 1)
      chunks.push(block)
      offset += blockSize
    }

    // 块结束标记
    const endBlock = new Uint8Array(1)
    endBlock[0] = 0x00
    chunks.push(endBlock)
  }

  // --- GIF Trailer ---
  const trailer = new Uint8Array(1)
  trailer[0] = 0x3B
  chunks.push(trailer)

  // 合并所有块
  const totalSize = chunks.reduce((sum, c) => sum + c.length, 0)
  const result = new ArrayBuffer(totalSize)
  const view = new Uint8Array(result)
  let offset = 0
  for (const c of chunks) {
    view.set(c, offset)
    offset += c.length
  }

  return result
}

/**
 * 将 ArrayBuffer 保存到小程序文件系统
 * @param {ArrayBuffer} buf
 * @returns {Promise<string>} 文件路径
 */
function saveToFile(buf) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager()
    const dir = `${wx.env.USER_DATA_PATH}`
    const path = `${dir}/meme_${Date.now()}.gif`
    try {
      fs.writeFileSync(path, buf, 'binary')
      resolve(path)
    } catch (e) {
      try {
        fs.writeFile({
          filePath: path,
          data: buf,
          success: () => resolve(path),
          fail: reject,
        })
      } catch (e2) {
        reject(e2)
      }
    }
  })
}

export { encode, saveToFile }
