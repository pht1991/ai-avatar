<template>
  <PageFrame mode="flex">
    <!-- 画布区域 -->
    <view class="canvas-wrap">
      <canvas
        type="2d"
        id="poster-canvas"
        class="poster-canvas"
        :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      />
    </view>

    <!-- 文字列表 -->
    <view class="text-list" v-if="textAreas.length > 0">
      <view
        v-for="(item, idx) in textAreas"
        :key="idx"
        class="text-item"
        :class="{ active: activeIdx === idx }"
        @click="selectText(idx)"
      >
        <input
          v-if="editingIdx === idx"
          class="ti-input"
          :value="item.text"
          @input="e => onEditInput(e, idx)"
          @blur="onEditBlur(idx)"
          @confirm="onEditBlur(idx)"
          :focus="true"
          :hold-keyboard="true"
        />
        <text v-else class="ti-content">{{ item.text || '文字' }}</text>
        <view class="ti-info">
          <view class="ti-color-dot" :style="{ background: item.color }" />
          <text class="ti-font-label">{{ item.font === 'bold' ? '粗' : '细' }}</text>
        </view>
        <view class="ti-actions">
          <text class="ti-btn" @click.stop="editText(idx)">✎</text>
          <text class="ti-btn ti-del" @click.stop="removeText(idx)">✕</text>
        </view>
      </view>
    </view>

    <!-- 底部工具栏 -->
    <template #footer>
    <scroll-view class="tool-scroll" scroll-x enhanced show-scrollbar="false">
      <view class="tool-row">
        <view class="tb-item" @click="addText">
          <text class="tb-icon">T</text>
          <text class="tb-label">加文字</text>
        </view>
        <view class="tb-item" @click="cycleColor">
          <view class="tb-color" :style="{ background: currentColor }" />
          <text class="tb-label">颜色</text>
        </view>
        <view class="tb-item" @click="cycleFont">
          <text class="tb-icon">{{ fontIcon }}</text>
          <text class="tb-label">{{ fontLabel }}</text>
        </view>
        <view class="tb-item" @click="changeSize(-2)">
          <text class="tb-icon">A-</text>
          <text class="tb-label">缩小</text>
        </view>
        <view class="tb-item" @click="changeSize(2)">
          <text class="tb-icon">A+</text>
          <text class="tb-label">放大</text>
        </view>
        <view class="tb-item" @click="showBgPanel = true">
          <text class="tb-icon">🎨</text>
          <text class="tb-label">背景</text>
        </view>
        <view class="tb-item" @click="showRatioPanel = true">
          <text class="tb-icon">📐</text>
          <text class="tb-label">比例</text>
        </view>
        <view class="tb-item tb-export" @click="showExport = true">
          <text class="tb-icon">↗</text>
          <text class="tb-label">导出</text>
        </view>
      </view>
    </scroll-view>
    </template>
  </PageFrame>

  <!-- 背景面板（根级 cover-view） -->
  <cover-view v-if="showBgPanel" class="panel-overlay" @click.self="showBgPanel = false">
    <cover-view class="panel-card">
      <cover-view class="panel-title">选择背景</cover-view>

      <cover-view class="panel-section-title">纯色</cover-view>
      <cover-view class="color-grid">
        <cover-view
          v-for="c in colorPalette"
          :key="c"
          class="color-item"
          :class="{ selected: bgType === 'solid' && bgValue === c }"
          :style="{ background: c }"
          @click="setBgSolid(c)"
        />
      </cover-view>

      <cover-view class="panel-section-title">渐变</cover-view>
      <cover-view class="gradient-list">
        <cover-view
          v-for="g in gradientPresets"
          :key="g.name"
          class="gradient-item"
          :class="{ selected: bgType === 'gradient' && bgValue[0] === g.colors[0] }"
          :style="{ background: `linear-gradient(${g.dir}, ${g.colors.join(',')})` }"
          @click="setBgGradient(g.colors, g.dir)"
        >
          <cover-view class="gradient-name">{{ g.name }}</cover-view>
        </cover-view>
      </cover-view>

      <cover-view class="panel-section-title">自定义图片</cover-view>
      <cover-view class="panel-btn" @click="pickBgImage">从相册选择背景图</cover-view>

      <cover-view class="panel-btn cancel" @click="showBgPanel = false">关闭</cover-view>
    </cover-view>
  </cover-view>

  <!-- 比例选择面板 -->
  <cover-view v-if="showRatioPanel" class="panel-overlay" @click.self="showRatioPanel = false">
    <cover-view class="panel-card">
      <cover-view class="panel-title">选择比例</cover-view>
      <cover-view class="ratio-list">
        <cover-view
          v-for="r in ratios"
          :key="r.label"
          class="ratio-item"
          :class="{ selected: currentRatio === r.label }"
          @click="changeRatio(r)"
        >
          <cover-view class="ratio-label">{{ r.label }}</cover-view>
          <cover-view class="ratio-desc">{{ r.desc }}</cover-view>
        </cover-view>
      </cover-view>
      <cover-view class="panel-btn cancel" @click="showRatioPanel = false">关闭</cover-view>
    </cover-view>
  </cover-view>

  <!-- 导出面板 -->
  <cover-view v-if="showExport" class="panel-overlay" @click.self="showExport = false">
    <cover-view class="panel-card">
      <cover-view class="panel-title">选择导出格式</cover-view>
      <cover-view class="format-options">
        <cover-view class="fmt-opt" @click="doExport('jpg')">
          <cover-view class="fmt-name">JPG</cover-view>
          <cover-view class="fmt-desc">体积小，适合分享</cover-view>
        </cover-view>
        <cover-view class="fmt-opt" @click="doExport('png')">
          <cover-view class="fmt-name">PNG</cover-view>
          <cover-view class="fmt-desc">高清无损，推荐打印</cover-view>
        </cover-view>
      </cover-view>
      <cover-view class="panel-btn cancel" @click="showExport = false">取消</cover-view>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageFrame from '@/components/page-frame.vue'

/* ===================== 比例配置 ===================== */
const ratios = [
  { label: '2:3', w: 300, h: 450, desc: '竖版海报' },
  { label: '3:4', w: 300, h: 400, desc: '杂志封面' },
  { label: '1:1', w: 300, h: 300, desc: '唱片封面' },
  { label: '16:9', w: 320, h: 180, desc: '横版横幅' },
  { label: '9:16', w: 210, h: 374, desc: '快拍/故事' },
]

const colorPalette = [
  '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD',
  '#000000', '#212529', '#343A40', '#495057', '#6C757D', '#868E96',
  '#FF6B6B', '#FA5252', '#F03E3E', '#E03131', '#C92A2A',
  '#FF922B', '#FD7E14', '#F76707', '#E8590C', '#D9480F',
  '#FFD43B', '#FCC419', '#FAB005', '#F59F00', '#E67700',
  '#51CF66', '#40C057', '#37B24D', '#2F9E44', '#2B8A3E',
  '#22B8CF', '#15AABF', '#0C8599', '#0B7285',
  '#4C6EF5', '#3B5BDB', '#364FC7', '#2B3F9E',
  '#7950F2', '#7048E8', '#6741D9', '#5F3DC4',
  '#E599F7', '#DA77F2', '#CC5DE8', '#BE4BDB',
]

const gradientPresets = [
  { name: '日落', colors: ['#FF6B6B', '#FFE66D'], dir: '180deg' },
  { name: '深海', colors: ['#667EEA', '#764BA2'], dir: '180deg' },
  { name: '极光', colors: ['#A8E6CF', '#3D84A8'], dir: '135deg' },
  { name: '烈焰', colors: ['#FF0844', '#FFB199'], dir: '180deg' },
  { name: '暮光', colors: ['#2C3E50', '#3498DB'], dir: '135deg' },
  { name: '樱花', colors: ['#FFE5EC', '#FFB3C6'], dir: '180deg' },
  { name: '薄荷', colors: ['#00B4DB', '#0083B0'], dir: '180deg' },
  { name: '星空', colors: ['#0F0C29', '#302B63', '#24243E'], dir: '180deg' },
]

/* ===================== 状态 ===================== */
const canvasW = ref(300)
const canvasH = ref(450)
const currentRatio = ref('2:3')

const bgType = ref('gradient')
const bgValue = ref(['#1a0a2e', '#0a0a0a'])
const bgDir = ref('to bottom')
const bgImage = ref('')

const textAreas = ref([])
const activeIdx = ref(-1)
const editingIdx = ref(-1)
const currentColor = ref('#FFFFFF')
const currentFont = ref('bold')

const showBgPanel = ref(false)
const showRatioPanel = ref(false)
const showExport = ref(false)

let canvas = null
let ctx = null

// 拖拽相关
let touchStartX = 0
let touchStartY = 0
let touchItemIdx = -1
let touchOffsetX = 0
let touchOffsetY = 0
let hasMoved = false
let canvasRect = null

/* ===================== 字体 ===================== */
const fontParams = {
  bold: { label: '粗体', icon: 'B' },
  normal: { label: '细体', icon: 'B' },
}

const fontIcon = ref('B')
const fontLabel = ref('粗体')

/* ===================== 初始化 ===================== */
onLoad((options) => {
  if (options && options.tpl) {
    if (options.tpl === 'blank') {
      initBlank()
    } else {
      try {
        const tpl = JSON.parse(decodeURIComponent(options.tpl))
        initFromTemplate(tpl)
      } catch (e) {
        console.error('parse tpl error', e)
        initBlank()
      }
    }
  } else {
    initBlank()
  }
})

function initBlank() {
  bgType.value = 'solid'
  bgValue.value = '#212529'
  currentRatio.value = '2:3'
  applyRatio('2:3')
  textAreas.value = [{ text: '双击编辑标题', fontSize: 32, color: '#FFFFFF', x: 150, y: 160, font: 'bold' }]
  activeIdx.value = 0
  if (ctx) render()
}

function initFromTemplate(tpl) {
  bgType.value = tpl.bgType || 'gradient'
  bgValue.value = tpl.bgValue || ['#1a0a2e', '#0a0a0a']
  bgDir.value = (tpl.bgDir || 'to bottom').replace('deg', 'deg')
  currentRatio.value = tpl.ratio || '2:3'
  applyRatio(tpl.ratio || '2:3')

  textAreas.value = (tpl.textAreas || []).map(a => ({
    text: a.text,
    fontSize: a.fontSize || 28,
    color: a.color || '#FFFFFF',
    x: a.x || (canvasW.value / 2),
    y: a.y || (canvasH.value / 2),
    font: a.font || 'bold',
  }))
  activeIdx.value = textAreas.value.length > 0 ? 0 : -1

  if (tpl.bgImage) {
    bgImage.value = tpl.bgImage
  }
  if (ctx) render()
}

/* ===================== 比例 ===================== */
function applyRatio(label) {
  const r = ratios.find(x => x.label === label)
  if (!r) return
  canvasW.value = r.w
  canvasH.value = r.h
  currentRatio.value = label
}

function changeRatio(r) {
  applyRatio(r.label)
  // 按比例调整文字位置
  const ratioW = r.w / canvasW._raw || 1
  const ratioH = r.h / canvasH._raw || 1
  textAreas.value.forEach(item => {
    item.x = Math.min(item.x * (r.w / 300), r.w)
    item.y = Math.min(item.y * (r.h / 450), r.h)
  })
  showRatioPanel.value = false
  nextTick(() => {
    initCanvas()
  })
}

/* ===================== Canvas ===================== */
onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})

function initCanvas() {
  const query = uni.createSelectorQuery().select('#poster-canvas')
  query
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        console.error('Canvas node not found')
        return
      }
      canvas = res[0].node
      const dpr = uni.getSystemInfoSync().pixelRatio
      canvas.width = canvasW.value * dpr
      canvas.height = canvasH.value * dpr
      ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      render()
    })
}

function render() {
  if (!ctx) return
  const w = canvasW.value
  const h = canvasH.value
  ctx.clearRect(0, 0, w, h)

  // 背景
  if (bgImage.value) {
    const img = canvas.createImage()
    img.src = bgImage.value
    img.onload = () => {
      // 缩放填充
      const scale = Math.max(w / img.width, h / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh)

      // 半透明黑色遮罩，让文字更可读
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(0, 0, w, h)

      drawTexts()
    }
    img.onerror = () => {
      drawBg()
      drawTexts()
    }
  } else {
    drawBg()
    drawTexts()
  }
}

function drawBg() {
  const w = canvasW.value
  const h = canvasH.value
  if (bgType.value === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    if (bgDir.value.includes('135') || bgDir.value.includes('135deg')) {
      const g2 = ctx.createLinearGradient(0, 0, w, h)
      const colors = Array.isArray(bgValue.value) ? bgValue.value : [bgValue.value, bgValue.value]
      colors.forEach((c, i) => g2.addColorStop(i / Math.max(colors.length - 1, 1), c))
      ctx.fillStyle = g2
    } else {
      const gradH = ctx.createLinearGradient(0, 0, 0, h)
      const colors = Array.isArray(bgValue.value) ? bgValue.value : [bgValue.value, bgValue.value]
      colors.forEach((c, i) => gradH.addColorStop(i / Math.max(colors.length - 1, 1), c))
      ctx.fillStyle = gradH
    }
  } else {
    ctx.fillStyle = bgValue.value
  }
  ctx.fillRect(0, 0, w, h)
}

function drawTexts() {
  textAreas.value.forEach(item => {
    ctx.save()
    const fontStr = `${item.font === 'bold' ? 'bold' : 'normal'} ${item.fontSize}px sans-serif`
    ctx.font = fontStr
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = item.color
    ctx.fillText(item.text, item.x, item.y)
    ctx.restore()
  })
}

/* ===================== 触摸拖拽 ===================== */
function getCanvasRect() {
  return new Promise((resolve) => {
    uni.createSelectorQuery().select('#poster-canvas').boundingClientRect((rect) => {
      canvasRect = rect
      resolve(rect)
    }).exec()
  })
}

async function onTouchStart(e) {
  await getCanvasRect()
  const touch = e.touches[0]
  const x = touch.clientX - canvasRect.left
  const y = touch.clientY - canvasRect.top
  touchStartX = x
  touchStartY = y
  hasMoved = false

  // 从后往前找（后绘制的在上层）
  for (let i = textAreas.value.length - 1; i >= 0; i--) {
    const item = textAreas.value[i]
    ctx.font = `${item.font === 'bold' ? 'bold' : 'normal'} ${item.fontSize || 24}px sans-serif`
    const metrics = ctx.measureText(item.text)
    const tw = metrics.width
    const th = item.fontSize || 24
    if (Math.abs(x - item.x) < tw / 2 + 16 && Math.abs(y - item.y) < th / 2 + 16) {
      touchItemIdx = i
      touchOffsetX = x - item.x
      touchOffsetY = y - item.y
      activeIdx.value = i
      render()
      return
    }
  }
  touchItemIdx = -1
}

async function onTouchMove(e) {
  if (touchItemIdx < 0) return
  if (!canvasRect) await getCanvasRect()
  const touch = e.touches[0]
  const x = touch.clientX - canvasRect.left
  const y = touch.clientY - canvasRect.top

  if (!hasMoved) {
    const dx = x - touchStartX
    const dy = y - touchStartY
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      hasMoved = true
    }
  }

  textAreas.value[touchItemIdx].x = x - touchOffsetX
  textAreas.value[touchItemIdx].y = y - touchOffsetY
  render()
}

function onTouchEnd() {
  touchItemIdx = -1
  hasMoved = false
}

/* ===================== 背景 ===================== */
function setBgSolid(color) {
  bgType.value = 'solid'
  bgValue.value = color
  bgImage.value = ''
  render()
}

function setBgGradient(colors, dir) {
  bgType.value = 'gradient'
  bgValue.value = colors
  bgDir.value = dir
  bgImage.value = ''
  render()
}

function pickBgImage() {
  showBgPanel.value = false
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album'],
    success(res) {
      bgImage.value = res.tempFiles[0].tempFilePath
      bgType.value = 'image'
      render()
    },
    fail(err) {
      console.error('chooseMedia fail', err)
      uni.showToast({ title: '无法打开相册', icon: 'none' })
    },
  })
}

/* ===================== 文字操作 ===================== */
function addText() {
  const newItem = {
    text: '新文字',
    fontSize: 24,
    color: currentColor.value,
    x: canvasW.value / 2,
    y: canvasH.value / 2,
    font: currentFont.value,
  }
  textAreas.value.push(newItem)
  activeIdx.value = textAreas.value.length - 1
  editText(textAreas.value.length - 1)
  render()
}

function editText(idx) {
  editingIdx.value = idx
}

function onEditInput(e, idx) {
  const item = textAreas.value[idx]
  if (!item) return
  item.text = e.detail.value || ''
  render()
}

function onEditBlur(idx) {
  const item = textAreas.value[idx]
  if (item && (!item.text || item.text.trim() === '')) {
    item.text = '文字'
  }
  editingIdx.value = -1
  render()
}

function selectText(idx) {
  activeIdx.value = idx
}

function removeText(idx) {
  if (editingIdx.value === idx) {
    editingIdx.value = -1
  }
  textAreas.value.splice(idx, 1)
  if (activeIdx.value >= textAreas.value.length) {
    activeIdx.value = textAreas.value.length - 1
  }
  render()
}

function changeSize(delta) {
  const idx = activeIdx.value
  if (idx < 0 || idx >= textAreas.value.length) return
  const item = textAreas.value[idx]
  item.fontSize = Math.max(8, Math.min(72, item.fontSize + delta))
  render()
}

const colorCycle = [
  '#FFFFFF', '#FFD700', '#FF6B6B', '#51CF66', '#4C6EF5',
  '#22B8CF', '#7950F2', '#E599F7', '#FF922B', '#000000',
  '#333333', '#666666',
]

function cycleColor() {
  const current = currentColor.value
  const idx = colorCycle.indexOf(current)
  const next = colorCycle[(idx + 1) % colorCycle.length]
  currentColor.value = next

  const active = textAreas.value[activeIdx.value]
  if (active) {
    active.color = next
    render()
  }
}

function cycleFont() {
  currentFont.value = currentFont.value === 'bold' ? 'normal' : 'bold'
  fontIcon.value = fontParams[currentFont.value].icon
  fontLabel.value = fontParams[currentFont.value].label

  const active = textAreas.value[activeIdx.value]
  if (active) {
    active.font = currentFont.value
    render()
  }
}

/* ===================== 导出 ===================== */
function doExport(format) {
  showExport.value = false
  uni.showLoading({ title: '导出中...' })

  const fileType = format === 'jpg' ? 'jpg' : 'png'
  uni.canvasToTempFilePath({
    canvas: canvas,
    fileType: fileType,
    quality: 0.95,
    success(res) {
      uni.hideLoading()
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success() {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail() {
          uni.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片，请在设置中开启',
            confirmText: '去设置',
            success(mRes) {
              if (mRes.confirm) uni.openSetting()
            },
          })
        },
      })
    },
    fail(err) {
      uni.hideLoading()
      console.error('export fail', err)
      uni.showToast({ title: '导出失败，请重试', icon: 'none' })
    },
  })
}
</script>

<style scoped>
/* ============ 画布 ============ */
.canvas-wrap {
  padding-top: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.5);
  margin-bottom: 20rpx;
  flex-shrink: 0;
  align-self: center;
}

.poster-canvas {
  display: block;
}

/* ============ 文字列表 ============ */
.text-list {
  width: 100%;
  max-width: 640rpx;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
  flex-shrink: 0;
  align-self: center;
}

.text-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 10rpx;
}

.text-item.active {
  background: rgba(147, 51, 234, 0.12);
  border-color: rgba(147, 51, 234, 0.3);
}

.ti-content {
  font-size: 24rpx;
  color: #FFFFFF;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ti-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1rpx solid rgba(147, 51, 234, 0.4);
  border-radius: 8rpx;
  padding: 6rpx 12rpx;
  font-size: 24rpx;
  color: #FFFFFF;
}

.ti-info {
  display: flex;
  align-items: center;
  margin: 0 8rpx;
}

.ti-color-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(255,255,255,0.2);
  margin-right: 4rpx;
}

.ti-font-label {
  font-size: 18rpx;
  color: #A8A8C2;
}

.ti-actions {
  display: flex;
  gap: 4rpx;
  margin-left: 8rpx;
}

.ti-btn {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  font-size: 26rpx;
  color: #A8A8C2;
  border-radius: 12rpx;
  background: rgba(255,255,255,0.06);
}

.ti-btn.ti-del {
  color: #FF6B6B;
}

/* ============ 底部工具栏 ============ */
.tool-scroll {
  width: 100%;
  white-space: nowrap;
  background: #050010;
  padding: 16rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.tool-row {
  display: inline-flex;
  padding: 0 24rpx;
  gap: 8rpx;
}

.tb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 92rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.tb-item:active {
  opacity: 0.7;
}

.tb-export {
  background: linear-gradient(135deg, rgba(147,51,234,0.3), rgba(6,182,212,0.3));
}

.tb-icon {
  font-size: 28rpx;
  color: #FFFFFF;
  margin-bottom: 2rpx;
}

.tb-label {
  font-size: 18rpx;
  color: #A8A8C2;
}

.tb-color {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.3);
  margin-bottom: 2rpx;
}
</style>

<!-- 全局样式（弹窗 overlay cover-view 不支持 scoped） -->
<style>
.panel-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.panel-card {
  width: 100%;
  max-height: 80vh;
  background: #1A0D33;
  border-radius: 32rpx 32rpx 0 0;
  padding: 36rpx 28rpx 48rpx;
  overflow-y: auto;
}

.panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
  margin-bottom: 24rpx;
}

.panel-section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #A8A8C2;
  margin: 16rpx 0 12rpx;
}

/* 颜色网格 */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.color-item {
  width: 54rpx;
  height: 54rpx;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.color-item.selected {
  border-color: #FFFFFF;
  box-shadow: 0 0 0 2rpx #9333EA;
}

/* 渐变列表 */
.gradient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.gradient-item {
  width: calc((100% - 28rpx) / 3);
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
}

.gradient-item.selected {
  border-color: #FFFFFF;
  box-shadow: 0 0 0 2rpx #9333EA;
}

.gradient-name {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 600;
  text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.5);
}

/* 按钮 */
.panel-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background: rgba(147, 51, 234, 0.2);
  border: 1rpx solid rgba(147, 51, 234, 0.3);
  text-align: center;
  line-height: 80rpx;
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #CF8BFF;
  font-weight: 600;
}

.panel-btn.cancel {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255,255,255,0.15);
  color: #A8A8C2;
}

/* 比例列表 */
.ratio-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.ratio-item {
  width: calc((100% - 28rpx) / 3);
  height: 90rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ratio-item.selected {
  background: rgba(147, 51, 234, 0.2);
  border-color: #9333EA;
}

.ratio-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.ratio-desc {
  font-size: 20rpx;
  color: #A8A8C2;
  margin-top: 2rpx;
}

/* 导出格式 */
.format-options {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.fmt-opt {
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255,255,255,0.1);
}

.fmt-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 6rpx;
}

.fmt-desc {
  font-size: 22rpx;
  color: #A8A8C2;
}
</style>
