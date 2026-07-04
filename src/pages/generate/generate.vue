<template>
  <PageFrame>
    <view class="generate-content">
    <!-- 流程阶段 1: 选择照片 -->
    <template v-if="phase === 'select'">
      <view class="select-area">
        <view class="select-card" @click="choosePhoto">
          <view class="select-icon-wrap">
            <text class="select-icon">📷</text>
          </view>
          <text class="select-title">选择一张照片</text>
          <text class="select-desc">支持拍照或从相册选择</text>
          <text class="select-hint">我们不会上传你的照片</text>
        </view>

        <view class="selected-style-badge" v-if="currentStyle">
          <text class="badge-label">已选风格：</text>
          <view class="badge-tag" :style="{ backgroundColor: currentStyle.color + '22', borderColor: currentStyle.color + '44' }">
            <text class="badge-icon">{{ currentStyle.icon }}</text>
            <text class="badge-name" :style="{ color: currentStyle.color }">{{ currentStyle.name }}</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 流程阶段 2: 处理中 -->
    <template v-if="phase === 'processing'">
      <view class="process-area">
        <!-- 预览图缩略图 -->
        <view class="preview-thumb">
          <image :src="photoPath" mode="aspectFill" class="preview-img" />
          <view class="preview-overlay">
            <view class="glow-ring" :style="{ borderColor: currentStyle?.color || '#6c5ce7' }" />
          </view>
        </view>

        <text class="process-title">正在添加艺术相框</text>
        <text class="process-style" :style="{ color: currentStyle?.color || '#6c5ce7' }">
          {{ currentStyle?.icon }} {{ currentStyle?.name }}
        </text>

        <!-- 步骤指示器 -->
        <view class="steps">
          <view
            v-for="(s, si) in stepsData"
            :key="si"
            class="step-item"
            :class="{ active: si === activeStep, done: si < activeStep }"
          >
            <view v-if="si < 3" class="step-connector" :class="{ 'conn-on': si < activeStep }" :style="si < activeStep ? { backgroundColor: styleColor } : {}" />
            <view
              class="step-dot"
              :style="si <= activeStep ? { backgroundColor: styleColor, borderColor: styleColor } : {}"
            >
              <text v-if="si < activeStep" class="step-check">&#10003;</text>
              <text v-else class="step-num">{{ si + 1 }}</text>
            </view>
            <text class="step-label" :class="{ 'step-label-on': si <= activeStep }">{{ s.label }}</text>
          </view>
        </view>

        <text class="elapsed-text">已耗时 {{ elapsed }} 秒</text>
      </view>
    </template>
    </view>
  </PageFrame>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store/index.js'
import PageFrame from '@/components/page-frame.vue'
import { getStyleById } from '@/config/styles.js'
import { chooseImage } from '@/utils/image.js'
import { applyStyleToPhoto } from '@/utils/style-processor.js'

const store = useAppStore()
const phase = ref('select')
const photoPath = ref('')
const activeStep = ref(0)
const elapsed = ref(0)

const currentStyle = computed(() => getStyleById(store.selectedStyleId))
const styleColor = computed(() => currentStyle.value?.color || '#6c5ce7')

const stepsData = [
  { label: '裁剪构图' },
  { label: '添加相框' },
  { label: '绘制装饰' },
  { label: '完成出品' },
]

let stepTimer = null
let elapsedTimer = null

onMounted(() => {
  // 直接进入选择照片阶段，不做其他操作
})

onUnmounted(() => {
  clearAllTimers()
})

function clearAllTimers() {
  if (stepTimer) { clearInterval(stepTimer); stepTimer = null }
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
}

function startStepAnimation() {
  activeStep.value = 0
  elapsed.value = 0
  let stepIdx = 0

  stepTimer = setInterval(() => {
    stepIdx++
    if (stepIdx < 4) {
      activeStep.value = stepIdx
    } else {
      clearInterval(stepTimer)
      stepTimer = null
    }
  }, 600)

  elapsedTimer = setInterval(() => {
    elapsed.value++
  }, 1000)
}

async function choosePhoto() {
  try {
    const path = await chooseImage()
    photoPath.value = path
    store.setUploadedImage(path)
    await startProcessing()
  } catch (e) {
    if (e?.errMsg?.includes('cancel')) return
    console.error('[stylelab] 选择照片失败', e)
  }
}

async function startProcessing() {
  phase.value = 'processing'
  startStepAnimation()

  try {
    const resultPath = await applyStyleToPhoto(photoPath.value, store.selectedStyleId)
    clearAllTimers()
    activeStep.value = 3

    // 读 base64 存 store（用于结果页显示和历史记录）
    const fs = uni.getFileSystemManager()
    const styleName = currentStyle.value?.name || '风格'
    const styleInfo = currentStyle.value
    fs.readFile({
      filePath: resultPath,
      encoding: 'base64',
      success: (res) => {
        const base64 = 'data:image/png;base64,' + res.data
        store.finishGeneration(base64)
        // 延迟跳转，让用户看到步骤全部完成
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/result/result' })
        }, 500)
      },
      fail: () => {
        // base64 读失败也跳转（路径仍有效）
        store.currentResultImage = resultPath
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/result/result' })
        }, 500)
      },
    })
  } catch (err) {
    clearAllTimers()
    console.error('[stylelab] 处理失败', err)
    uni.showModal({
      title: '处理失败',
      content: err.message || '图片处理出错，请重试',
      confirmText: '重试',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          phase.value = 'select'
        } else {
          uni.navigateBack()
        }
      },
    })
  }
}
</script>

<style scoped>
.generate-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

/* ========== 选择照片阶段 ========== */

.select-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 560rpx;
}

.select-card {
  width: 100%;
  padding: 80rpx 40rpx;
  background: rgba(255,255,255,0.04);
  border: 2rpx dashed rgba(255,255,255,0.15);
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.select-card:active {
  background: rgba(108,92,231,0.1);
  border-color: rgba(108,92,231,0.4);
}

.select-icon-wrap {
  width: 120rpx; height: 120rpx;
  border-radius: 60rpx;
  background: rgba(108,92,231,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.select-icon {
  font-size: 60rpx;
}

.select-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 12rpx;
}

.select-desc {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}

.select-hint {
  font-size: 22rpx;
  color: #555;
}

.selected-style-badge {
  margin-top: 32rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.badge-label {
  font-size: 24rpx;
  color: #888;
}

.badge-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid;
}

.badge-icon {
  font-size: 28rpx;
}

.badge-name {
  font-size: 24rpx;
  font-weight: 600;
}

/* ========== 处理中阶段 ========== */

.process-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 560rpx;
}

.preview-thumb {
  width: 280rpx;
  height: 280rpx;
  border-radius: 30rpx;
  overflow: hidden;
  position: relative;
  margin-bottom: 48rpx;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glow-ring {
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  border: 3rpx solid;
  opacity: 0.4;
  animation: ring-pulse 2s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.08); opacity: 0.6; }
}

.process-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 8rpx;
}

.process-style {
  font-size: 26rpx;
  margin-bottom: 48rpx;
}

/* 步骤指示器 */
.steps {
  width: 100%;
  max-width: 520rpx;
  display: flex;
  align-items: flex-start;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-connector {
  position: absolute;
  top: 20rpx;
  left: 50%;
  width: 100%;
  height: 2rpx;
  background: rgba(255,255,255,0.06);
}

.conn-on {
  background: rgba(255,255,255,0.3);
}

.step-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-item.active .step-dot {
  animation: dot-pulse 0.6s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

.step-num {
  font-size: 22rpx;
  color: #888;
}

.step-check {
  font-size: 22rpx;
  color: #fff;
  font-weight: 700;
}

.step-label {
  font-size: 20rpx;
  color: #555;
  transition: color 0.3s ease;
}

.step-label-on {
  color: #e0e0e0;
}

.elapsed-text {
  margin-top: 48rpx;
  font-size: 24rpx;
  color: #555;
}
</style>
