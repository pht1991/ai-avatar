<template>
  <view class="page-lucky">
    <!-- 标题 -->
    <view class="header">
      <text class="header-emoji">🎲</text>
      <text class="header-title">随机风格生成</text>
      <text class="header-desc">为你随机选择一种风格，每次都是惊喜</text>
    </view>

    <!-- 生成中 -->
    <view class="generating-area" v-if="state === 'generating'">
      <view class="spinner-wrap">
        <view class="spinner" />
      </view>
      <text class="generating-style" v-if="currentStyle">
        正在生成「{{ currentStyle.name }}」风格
      </text>
      <text class="generating-hint">AI 创作中，请稍候...</text>
    </view>

    <!-- 生成完成 -->
    <view class="result-area" v-else-if="state === 'done'">
      <view class="result-tag" :style="{ backgroundColor: currentStyle?.color }">
        <text>{{ currentStyle?.icon }} {{ currentStyle?.name }}</text>
      </view>
      <image
        class="result-img"
        :src="resultImageUrl"
        mode="aspectFit"
        @click="previewResult"
      />
      <view class="result-actions">
        <button
          class="btn-save"
          :class="{ loading: saving }"
          @click="saveResult"
          :disabled="saving"
        >
          {{ saving ? '保存中...' : '保存到相册' }}
        </button>
        <button class="btn-again" @click="regenerate" :disabled="state === 'generating'">
          再来一次
        </button>
      </view>
    </view>

    <!-- 生成失败 -->
    <view class="error-area" v-else-if="state === 'error'">
      <text class="error-icon">😞</text>
      <text class="error-text">生成失败，请重试</text>
      <button class="btn-retry" @click="regenerate">重新生成</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { STYLES } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'
import { generateAvatar } from '@/api/siliconflow.js'
import { compressImage, imageToBase64, imgSecurityCheck, base64ToTempFile, urlToTempFile, saveToAlbum, addWatermark } from '@/utils/image.js'

const store = useAppStore()

const state = ref('generating') // generating | done | error
const saving = ref(false)
const currentStyle = ref(null)
const resultImageUrl = ref('')
const resultTempPath = ref('')

// 压缩后的 base64（只处理一次，多次点「再来一次」复用）
let preparedBase64 = ''

onMounted(async () => {
  if (!store.uploadedImagePath) {
    uni.showToast({ title: '请先上传照片', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }
  await prepareImage()
  doGenerate()
})

// 预处理图片（压缩 + base64，只做一次）
async function prepareImage() {
  try {
    const compressed = await compressImage(store.uploadedImagePath, 512)
    await imgSecurityCheck(compressed)
    preparedBase64 = await imageToBase64(compressed)
  } catch (err) {
    console.error('[lucky] 图片预处理失败', err)
    uni.showModal({
      title: '图片处理失败',
      content: '请重新上传照片',
      showCancel: false,
      success: () => uni.navigateBack(),
    })
    throw err
  }
}

// 随机挑一种风格并生成
async function doGenerate() {
  state.value = 'generating'
  resultImageUrl.value = ''
  resultTempPath.value = ''

  // 随机挑风格（16 种里随机一种）
  const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)]
  currentStyle.value = randomStyle

  try {
    const prompt = `将这张照片中的人物转换为${randomStyle.name}风格。${randomStyle.description}。必须保留原人物的面部特征、性别和年龄。`
    const result = await generateAvatar(prompt, null, preparedBase64)

    // 处理返回值（字符串：data URI / URL / 纯 base64）
    let imgUrl = ''
    let tmpPath = ''
    let b64 = ''

    if (typeof result === 'string' && result.startsWith('data:image')) {
      imgUrl = result
      b64 = result.replace(/^data:image\/\w+;base64,/, '')
      try { tmpPath = await base64ToTempFile(b64) } catch (_) {}
    } else if (typeof result === 'string' && result.startsWith('http')) {
      imgUrl = result
      try { tmpPath = await urlToTempFile(result) } catch (_) {}
    } else if (typeof result === 'string') {
      b64 = result
      imgUrl = `data:image/png;base64,${result}`
      try { tmpPath = await base64ToTempFile(result) } catch (_) {}
    } else {
      throw new Error('API 返回格式异常')
    }

    if (!imgUrl && !tmpPath) throw new Error('未返回可用图片数据')

    resultImageUrl.value = imgUrl
    resultTempPath.value = tmpPath || ''

    // 扣除一次使用次数
    store.incrementDailyCount(1)

    // 写入历史
    store.generatedImages.unshift({
      styleId: randomStyle.id,
      styleName: randomStyle.name,
      image: b64 || imgUrl,
      date: new Date().toISOString(),
    })
    store.persistHistory()

    state.value = 'done'
  } catch (err) {
    console.error('[lucky] 生成失败', err)
    state.value = 'error'
  }
}

// 再来一次（重新随机）
function regenerate() {
  if (state.value === 'generating') return
  doGenerate()
}

// 预览大图
function previewResult() {
  if (!resultImageUrl.value) return
  uni.previewImage({ urls: [resultImageUrl.value], current: resultImageUrl.value })
}

// 保存到相册
async function saveResult() {
  const path = resultTempPath.value
  if (!path || saving.value) return
  saving.value = true
  try {
    uni.showLoading({ title: '处理中...' })
    let savePath = path
    try {
      savePath = await Promise.race([
        addWatermark(path, '风格头像助手'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ])
    } catch (_) {
      savePath = path
    }
    uni.hideLoading()
    await saveToAlbum(savePath)
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    console.error('[lucky] 保存失败', err)
    uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
  } finally {
    saving.value = false
  }
}

onShareAppMessage(() => ({
  title: `我用AI随机生成了「${currentStyle.value?.name || ''}」风格头像，你也来试试！`,
  path: '/pages-ai/index/index',
  imageUrl: resultTempPath.value || '',
}))
</script>

<style scoped>
.page-lucky {
  min-height: 100vh;
  background: #050010;
  padding: 60rpx 40rpx;
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 标题区 */
.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.header-emoji {
  display: block;
  font-size: 72rpx;
  margin-bottom: 16rpx;
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.header-desc {
  display: block;
  font-size: 26rpx;
  color: #888;
}

/* 生成中 */
.generating-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 60rpx 0;
}

.spinner-wrap {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 50%;
  margin-bottom: 16rpx;
}

.spinner {
  width: 72rpx;
  height: 72rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.15);
  border-top-color: #9333EA;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generating-style {
  font-size: 30rpx;
  color: #CF8BFF;
  font-weight: 600;
}

.generating-hint {
  font-size: 24rpx;
  color: #666;
}

/* 结果区 */
.result-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.result-tag {
  padding: 8rpx 28rpx;
  border-radius: 40rpx;
  margin-bottom: 8rpx;
}

.result-tag text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
}

.result-img {
  width: 100%;
  max-width: 600rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.03);
}

.result-actions {
  width: 100%;
  max-width: 600rpx;
  display: flex;
  gap: 20rpx;
  margin-top: 8rpx;
}

.btn-save,
.btn-again {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save {
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  color: #fff;
}

.btn-save.loading {
  opacity: 0.6;
}

.btn-again {
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  border: 1rpx solid rgba(255, 255, 255, 0.12);
}

/* 错误区 */
.error-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 60rpx 0;
}

.error-icon {
  font-size: 80rpx;
}

.error-text {
  font-size: 28rpx;
  color: #ff6b6b;
}

.btn-retry {
  width: 280rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  color: #ccc;
  font-size: 28rpx;
  margin-top: 12rpx;
}
</style>
