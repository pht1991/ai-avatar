<template>
  <PageFrame mode="flex">
    <!-- 滚动区域：编辑区 -->
    <scroll-view class="edit-scroll" scroll-y enhanced :show-scrollbar="false">
      <!-- ============ 编辑区域 ============ -->
      <view class="edit-section">
        <!-- 撤销/重做 -->
        <view class="history-bar">
          <view
            class="history-btn"
            :class="{ disabled: !canUndo }"
            @click="undo"
          >
            <text class="history-icon">↶</text>
          </view>
          <view
            class="history-btn"
            :class="{ disabled: !canRedo }"
            @click="redo"
          >
            <text class="history-icon">↷</text>
          </view>
        </view>

        <view
          class="edit-area"
          id="editArea"
          @touchstart="onEditTouchStart"
          @touchmove.stop.prevent="onEditTouchMove"
          @touchend="onEditTouchEnd"
          @touchcancel="onEditTouchEnd"
        >
          <!-- 照片层 -->
          <image
            v-if="photoPath"
            class="layer-photo"
            :src="photoPath"
            mode="aspectFill"
          />
          <view v-else class="photo-placeholder" @click="uploadPhoto">
            <text class="placeholder-icon">📷</text>
            <text class="placeholder-text">点击上传照片</text>
          </view>

          <!-- 边框层 -->
          <image
            v-if="borderSrc"
            class="layer-border"
            :src="borderSrc"
            mode="scaleToFill"
          />

          <!-- 装饰层 -->
          <view
            v-for="dec in decorations"
            :key="dec.id"
            class="decoration"
            :class="{ selected: dec.id === selectedDecId }"
            :style="decStyle(dec)"
          >
            <image :src="dec.src" mode="aspectFit" class="dec-img" />
            <!-- 选中边框 -->
            <view v-if="dec.id === selectedDecId" class="dec-outline" />
            <!-- 删除按钮 -->
            <view
              v-if="dec.id === selectedDecId"
              class="dec-delete"
              :style="{ transform: `rotate(${-dec.rotation}deg) scale(${1 / dec.scale})` }"
              @touchstart.stop="deleteDec(dec.id)"
            >
              <text class="dec-delete-icon">×</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- ============ 底部控制面板：工具栏 + 素材面板 ============ -->
    <view class="bottom-panel">
      <!-- ============ 工具栏 ============ -->
      <view class="toolbar">
        <view
          class="tab"
          :class="{ active: activeTab === 'photo' }"
          @click="activeTab = 'photo'"
        >
          <text class="tab-icon">📷</text>
          <text class="tab-label">照片</text>
        </view>
        <view
          class="tab"
          :class="{ active: activeTab === 'border' }"
          @click="activeTab = 'border'"
        >
          <text class="tab-icon">🖼️</text>
          <text class="tab-label">边框</text>
        </view>
        <view
          class="tab"
          :class="{ active: activeTab === 'decor' }"
          @click="activeTab = 'decor'"
        >
          <text class="tab-icon">✨</text>
          <text class="tab-label">装饰</text>
        </view>
      </view>

      <!-- ============ 素材面板 ============ -->
      <view class="material-panel">
        <!-- 照片面板 -->
        <view v-if="activeTab === 'photo'" class="panel-photo">
          <view class="action-btn" @click="uploadPhoto">
            <text class="action-btn-icon">{{ photoPath ? '🔄' : '📷' }}</text>
            <text class="action-btn-text">{{ photoPath ? '更换照片' : '上传照片' }}</text>
          </view>
          <text class="panel-hint">照片将自动裁剪为正方形</text>
        </view>

        <!-- 边框面板 -->
        <scroll-view v-if="activeTab === 'border'" scroll-x class="panel-scroll" :show-scrollbar="false">
          <view class="scroll-content">
            <view
              class="item-card item-none"
              :class="{ active: !borderSrc }"
              @click="clearBorder"
            >
              <text class="item-none-text">无</text>
            </view>
            <view
              v-for="style in styles"
              :key="style.id"
              class="item-card"
              :class="{ active: borderSrc === borderPath(style.id) }"
              @click="selectBuiltInBorder(style.id)"
            >
              <image :src="borderPath(style.id)" mode="aspectFill" class="item-img" />
            </view>
            <view class="item-card item-upload" @click="uploadBorder">
              <text class="item-upload-icon">＋</text>
              <text class="item-upload-text">自定义</text>
            </view>
          </view>
        </scroll-view>

        <!-- 装饰面板 -->
        <scroll-view v-if="activeTab === 'decor'" scroll-x class="panel-scroll" :show-scrollbar="false">
          <view class="scroll-content">
            <view class="item-card item-upload" @click="uploadDecor">
              <text class="item-upload-icon">＋</text>
              <text class="item-upload-text">添加</text>
            </view>
            <view
              v-for="dec in decorations"
              :key="dec.id"
              class="item-card"
              :class="{ active: dec.id === selectedDecId }"
              @click="selectDec(dec.id)"
            >
              <image :src="dec.src" mode="aspectFit" class="item-img" />
              <view class="item-del" @click.stop="deleteDec(dec.id)">
                <text class="item-del-icon">×</text>
              </view>
            </view>
            <view v-if="decorations.length === 0" class="empty-hint">
              <text class="empty-hint-text">点击「添加」上传装饰素材</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- ============ 底部操作 ============ -->
    <template #footer>
      <view class="bottom-bar">
        <button class="btn-action btn-save" :disabled="saving" @click="saveImage">
          <text class="btn-icon">💾</text>
          <text class="btn-label">{{ saving ? '保存中' : '保存' }}</text>
        </button>
        <button class="btn-action btn-share" @click="shareImage">
          <text class="btn-icon">📤</text>
          <text class="btn-label">分享</text>
        </button>
      </view>
    </template>
  </PageFrame>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import PageFrame from '@/components/page-frame.vue'
import { STYLES } from '@/config/styles.js'
import { chooseImage, saveToAlbum, getImageSize } from '@/utils/image.js'
import { exportEditorCanvas } from '@/utils/canvas-export.js'

/* ===================== 状态 ===================== */
const styles = STYLES
const activeTab = ref('photo')

const photoPath = ref('')
const borderSrc = ref('')
const decorations = ref([])
const selectedDecId = ref(null)
const editAreaRect = ref(null)
const saving = ref(false)
const lastExportPath = ref('')

let decIdCounter = 0
let zCounter = 0
let gesture = null

/* ===================== 历史记录 ===================== */
const MAX_HISTORY = 30
const history = ref([])
const redoStack = ref([])
const canUndo = computed(() => history.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

function snapshot() {
  return {
    photoPath: photoPath.value,
    borderSrc: borderSrc.value,
    decorations: decorations.value.map((d) => ({ ...d })),
    selectedDecId: selectedDecId.value,
  }
}

function pushHistory() {
  history.value.push(snapshot())
  if (history.value.length > MAX_HISTORY) {
    history.value.shift()
  }
  redoStack.value = []
}

function applySnapshot(s) {
  photoPath.value = s.photoPath
  borderSrc.value = s.borderSrc
  decorations.value = s.decorations.map((d) => ({ ...d }))
  selectedDecId.value = s.selectedDecId
}

function undo() {
  if (history.value.length === 0) return
  redoStack.value.push(snapshot())
  const prev = history.value.pop()
  applySnapshot(prev)
}

function redo() {
  if (redoStack.value.length === 0) return
  history.value.push(snapshot())
  const next = redoStack.value.pop()
  applySnapshot(next)
}

/* ===================== 生命周期 ===================== */
onMounted(() => {
  nextTick(() => {
    setTimeout(measureEditArea, 150)
  })
})

onShareAppMessage(() => ({
  title: '照片风格实验室 — 给照片加上精美相框和装饰',
  path: '/pages/editor/index',
  imageUrl: lastExportPath.value || '',
}))

/* ===================== 工具方法 ===================== */
function borderPath(styleId) {
  return `/static/borders/${styleId}.png`
}

function measureEditArea() {
  const query = uni.createSelectorQuery()
  query.select('#editArea').boundingClientRect()
  query.exec((res) => {
    if (res && res[0]) {
      editAreaRect.value = res[0]
    }
  })
}

function decStyle(dec) {
  return {
    left: (dec.x - dec.displayWidth / 2) + 'px',
    top: (dec.y - dec.displayHeight / 2) + 'px',
    width: dec.displayWidth + 'px',
    height: dec.displayHeight + 'px',
    transform: `rotate(${dec.rotation}deg) scale(${dec.scale})`,
    zIndex: dec.zIndex,
  }
}

function selectDec(id) {
  selectedDecId.value = id
  const dec = decorations.value.find((d) => d.id === id)
  if (dec) dec.zIndex = ++zCounter
}

/* ===================== 照片上传 ===================== */
async function uploadPhoto() {
  try {
    const path = await chooseImage()
    pushHistory()
    photoPath.value = path
    activeTab.value = 'border'
    // 重新测量编辑区（防止首次未获取到）
    if (!editAreaRect.value) measureEditArea()
  } catch (e) {
    // 用户取消 / 隐私拦截 / 权限问题 → 静默处理，不弹 toast
    if (e?.errMsg?.includes('cancel')) return
    console.warn('[editor] uploadPhoto fail:', e?.errMsg || e)
  }
}

/* ===================== 边框管理 ===================== */
function selectBuiltInBorder(styleId) {
  pushHistory()
  borderSrc.value = borderPath(styleId)
}

function clearBorder() {
  pushHistory()
  borderSrc.value = ''
}

async function uploadBorder() {
  try {
    const path = await chooseImage()
    pushHistory()
    borderSrc.value = path // 替换原有边框
    uni.showToast({ title: '边框已更新', icon: 'none' })
  } catch (e) {
    if (e?.errMsg?.includes('cancel')) return
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}

/* ===================== 装饰管理 ===================== */
async function uploadDecor() {
  try {
    const path = await chooseImage()
    const info = await getImageSize(path)

    const editW = editAreaRect.value?.width || 300
    const editH = editAreaRect.value?.height || 300

    // 默认尺寸：编辑区宽度的 30%，保持宽高比
    let displayW = editW * 0.3
    let displayH = displayW * (info.height / info.width)

    // 高度上限：编辑区高度的 50%
    if (displayH > editH * 0.5) {
      const r = (editH * 0.5) / displayH
      displayW *= r
      displayH *= r
    }

    const newDec = {
      id: ++decIdCounter,
      src: path,
      x: editW / 2,
      y: editH / 2,
      displayWidth: displayW,
      displayHeight: displayH,
      scale: 1,
      rotation: 0,
      zIndex: ++zCounter,
    }

    pushHistory()
    decorations.value.push(newDec)
    selectedDecId.value = newDec.id
  } catch (e) {
    if (e?.errMsg?.includes('cancel')) return
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}

function deleteDec(id) {
  const idx = decorations.value.findIndex((d) => d.id === id)
  if (idx >= 0) {
    pushHistory()
    decorations.value.splice(idx, 1)
    if (selectedDecId.value === id) {
      selectedDecId.value = null
    }
  }
}

/* ===================== 触摸手势 ===================== */

/**
 * 命中测试：判断触摸点是否落在某个装饰上（考虑旋转和缩放）
 */
function isPointInDecoration(localX, localY, dec) {
  const dx = localX - dec.x
  const dy = localY - dec.y
  const rad = (dec.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const s = dec.scale
  // 逆变换：先逆旋转，再逆缩放
  const px = (dx * cos + dy * sin) / s
  const py = (-dx * sin + dy * cos) / s
  const hw = dec.displayWidth / 2
  const hh = dec.displayHeight / 2
  return Math.abs(px) <= hw && Math.abs(py) <= hh
}

/**
 * 从顶层到底层查找命中的装饰
 */
function hitTestDecoration(localX, localY) {
  const sorted = [...decorations.value].sort((a, b) => b.zIndex - a.zIndex)
  for (const dec of sorted) {
    if (isPointInDecoration(localX, localY, dec)) {
      return dec
    }
  }
  return null
}

function onEditTouchStart(e) {
  const touches = e.touches
  const rect = editAreaRect.value
  if (!rect) {
    measureEditArea()
    return
  }

  if (touches.length === 1) {
    // 单指：命中测试
    const touch = touches[0]
    const localX = touch.clientX - rect.left
    const localY = touch.clientY - rect.top
    const hitDec = hitTestDecoration(localX, localY)

    if (hitDec) {
      selectedDecId.value = hitDec.id
      hitDec.zIndex = ++zCounter
      pushHistory()
      gesture = {
        type: 'drag',
        decId: hitDec.id,
        startX: touch.clientX,
        startY: touch.clientY,
        origX: hitDec.x,
        origY: hitDec.y,
      }
    } else {
      // 点击空白区域取消选中
      selectedDecId.value = null
      gesture = null
    }
  } else if (touches.length >= 2) {
    // 双指：如果已有拖拽手势，升级为缩放旋转
    if (gesture && gesture.type === 'drag') {
      const dec = decorations.value.find((d) => d.id === gesture.decId)
      if (dec) {
        startPinch(dec, touches[0], touches[1])
      }
    } else if (!gesture) {
      // 两指同时落下：用第一指命中测试
      const localX = touches[0].clientX - rect.left
      const localY = touches[0].clientY - rect.top
      const hitDec = hitTestDecoration(localX, localY)
      if (hitDec) {
        selectedDecId.value = hitDec.id
        hitDec.zIndex = ++zCounter
        pushHistory()
        startPinch(hitDec, touches[0], touches[1])
      }
    }
  }
}

function onEditTouchMove(e) {
  if (!gesture) return
  const dec = decorations.value.find((d) => d.id === gesture.decId)
  if (!dec) return

  const touches = e.touches

  if (gesture.type === 'drag' && touches.length >= 1) {
    const dx = touches[0].clientX - gesture.startX
    const dy = touches[0].clientY - gesture.startY
    dec.x = gesture.origX + dx
    dec.y = gesture.origY + dy
  } else if (gesture.type === 'pinch' && touches.length >= 2) {
    const dx = touches[1].clientX - touches[0].clientX
    const dy = touches[1].clientY - touches[0].clientY
    const dist = Math.hypot(dx, dy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI

    // 缩放
    const scaleRatio = dist / gesture.startDist
    dec.scale = Math.max(0.15, Math.min(6, gesture.origScale * scaleRatio))

    // 旋转
    dec.rotation = gesture.origRotation + (angle - gesture.startAngle)

    // 双指中心拖拽
    const cx = (touches[0].clientX + touches[1].clientX) / 2
    const cy = (touches[0].clientY + touches[1].clientY) / 2
    dec.x = gesture.origX + (cx - gesture.centerX)
    dec.y = gesture.origY + (cy - gesture.centerY)
  }
}

function onEditTouchEnd(e) {
  if (!gesture) return
  const dec = decorations.value.find((d) => d.id === gesture.decId)
  const remaining = e.touches

  if (remaining.length === 0) {
    gesture = null
  } else if (remaining.length === 1 && dec) {
    // 双指→单指：切换为拖拽
    gesture = {
      type: 'drag',
      decId: gesture.decId,
      startX: remaining[0].clientX,
      startY: remaining[0].clientY,
      origX: dec.x,
      origY: dec.y,
    }
  } else if (remaining.length >= 2 && dec) {
    // 仍有双指：更新 pinch 起点
    startPinch(dec, remaining[0], remaining[1])
  }
}

function startPinch(dec, t0, t1) {
  const dx = t1.clientX - t0.clientX
  const dy = t1.clientY - t0.clientY
  gesture = {
    type: 'pinch',
    decId: dec.id,
    startDist: Math.hypot(dx, dy),
    startAngle: (Math.atan2(dy, dx) * 180) / Math.PI,
    origScale: dec.scale,
    origRotation: dec.rotation,
    centerX: (t0.clientX + t1.clientX) / 2,
    centerY: (t0.clientY + t1.clientY) / 2,
    origX: dec.x,
    origY: dec.y,
  }
}

/* ===================== 保存 & 分享 ===================== */
function hasContent() {
  return photoPath.value || borderSrc.value || decorations.value.length > 0
}

async function exportCanvas() {
  const editW = editAreaRect.value?.width || 300
  return exportEditorCanvas({
    photoPath: photoPath.value,
    borderSrc: borderSrc.value,
    decorations: [...decorations.value],
    editAreaWidth: editW,
  })
}

async function saveImage() {
  if (!hasContent()) {
    uni.showToast({ title: '请先添加照片或素材', icon: 'none' })
    return
  }

  saving.value = true
  uni.showLoading({ title: '保存中...', mask: true })

  try {
    const tempPath = await exportCanvas()
    lastExportPath.value = tempPath
    await saveToAlbum(tempPath)
    uni.hideLoading()
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    console.error('[editor] 保存失败', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

async function shareImage() {
  if (!hasContent()) {
    uni.showToast({ title: '请先添加照片或素材', icon: 'none' })
    return
  }

  uni.showLoading({ title: '处理中...', mask: true })

  try {
    const tempPath = await exportCanvas()
    lastExportPath.value = tempPath
    uni.hideLoading()

    // #ifdef MP-WEIXIN
    if (wx.showShareImageMenu) {
      wx.showShareImageMenu({
        path: tempPath,
        fail: () => {
          // 降级：预览图片，用户长按分享
          uni.previewImage({ urls: [tempPath], current: tempPath })
        },
      })
    } else {
      uni.previewImage({ urls: [tempPath], current: tempPath })
      uni.showToast({ title: '长按图片可分享', icon: 'none' })
    }
    // #endif
  } catch (err) {
    uni.hideLoading()
    console.error('[editor] 分享失败', err)
    uni.showToast({ title: '处理失败', icon: 'none' })
  }
}

/* ===================== 导航 ===================== */
function goAI() {
  uni.navigateTo({ url: '/pages-ai/index/index' })
}
</script>

<style scoped>
/* ============ 滚动区域 ============ */
.edit-scroll {
  flex: 1;
  min-height: 0;
  width: 100%;
}

/* ============ 编辑区域 ============ */
.edit-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 88rpx 4rpx 4rpx;
  min-height: 620rpx;
  position: relative;
}

.history-bar {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  display: flex;
  gap: 6rpx;
  z-index: 200;
}

.history-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8rpx);
}

.history-btn:active {
  background: rgba(147, 51, 234, 0.1);
}

.history-btn.disabled {
  opacity: 0.3;
}

.history-icon {
  font-size: 32rpx;
  color: #ccc;
  line-height: 1;
}

.edit-area {
  position: relative;
  width: 620rpx;
  height: 620rpx;
  max-width: calc(100vw - 32rpx);
  max-height: calc(100vh - 320rpx);
  border-radius: 12rpx;
  overflow: hidden;
  background: #0D0A18;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.layer-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.placeholder-icon {
  font-size: 60rpx;
}

.placeholder-text {
  font-size: 24rpx;
  color: #666;
}

.layer-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* ============ 装饰元素 ============ */
.decoration {
  position: absolute;
  transform-origin: center center;
}

.dec-img {
  width: 100%;
  height: 100%;
}

.dec-outline {
  position: absolute;
  top: -4rpx;
  left: -4rpx;
  right: -4rpx;
  bottom: -4rpx;
  border: 2rpx dashed #9333EA;
  border-radius: 4rpx;
  pointer-events: none;
}

.dec-delete {
  position: absolute;
  top: -16rpx;
  right: -16rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ff4444;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
}

.dec-delete-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1;
}

/* ============ 底部控制面板：工具栏 + 素材面板 ============ */
.bottom-panel {
  width: 100%;
  box-sizing: border-box;
  background: #050010;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
  padding: 16rpx 32rpx 12rpx;
}

/* ============ 工具栏 ============ */
.toolbar {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 0;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.tab.active {
  background: rgba(147, 51, 234, 0.15);
  border-color: rgba(147, 51, 234, 0.4);
}

.tab-icon {
  font-size: 28rpx;
  margin-bottom: 2rpx;
}

.tab-label {
  font-size: 20rpx;
  color: #888;
}

.tab.active .tab-label {
  color: #CF8BFF;
  font-weight: 600;
}

/* ============ 素材面板 ============ */
.material-panel {
  padding: 0;
  min-height: 108rpx;
}

.panel-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 40rpx;
  background: rgba(147, 51, 234, 0.12);
  border: 2rpx solid rgba(147, 51, 234, 0.3);
  border-radius: 36rpx;
}

.action-btn:active {
  background: rgba(147, 51, 234, 0.1);
}

.action-btn-icon {
  font-size: 28rpx;
}

.action-btn-text {
  font-size: 26rpx;
  color: #CF8BFF;
  font-weight: 600;
}

.panel-hint {
  font-size: 20rpx;
  color: #555;
}

.panel-scroll {
  width: 100%;
  white-space: nowrap;
}

.scroll-content {
  display: inline-flex;
  gap: 10rpx;
  padding: 2rpx;
}

.item-card {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card.active {
  border-color: #9333EA;
  box-shadow: 0 0 12rpx rgba(147, 51, 234, 0.3);
}

.item-img {
  width: 100%;
  height: 100%;
}

.item-none {
  background: rgba(255, 255, 255, 0.06);
}

.item-none-text {
  font-size: 22rpx;
  color: #888;
}

.item-upload {
  background: rgba(147, 51, 234, 0.08);
  border: 2rpx dashed rgba(147, 51, 234, 0.25);
  flex-direction: column;
  gap: 2rpx;
}

.item-upload-icon {
  font-size: 36rpx;
  color: #9333EA;
  line-height: 1;
}

.item-upload-text {
  font-size: 18rpx;
  color: #9333EA;
}

.item-del {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #ff4444;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.item-del-icon {
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
}

.empty-hint {
  display: inline-flex;
  align-items: center;
  padding: 0 12rpx;
  height: 96rpx;
}

.empty-hint-text {
  font-size: 22rpx;
  color: #555;
  white-space: normal;
}

/* ============ 底部操作 ============ */
.bottom-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  box-sizing: border-box;
  padding: 12rpx 32rpx 20rpx;
  background: #050010;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.btn-action {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.btn-action::after {
  border: none;
}

.btn-save {
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  color: #fff;
}

.btn-save[disabled] {
  background: rgba(255, 255, 255, 0.08);
  color: #555;
}

.btn-share {
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
}

.btn-icon {
  font-size: 28rpx;
}

.btn-label {
  font-size: 28rpx;
}

</style>
