<template>
  <PageFrame safeBottom>
    <view class="result-content">
    <!-- 结果展示 -->
    <view class="result-showcase">
      <view class="single-result">
        <text class="result-label">处理完成</text>
        <image
          class="single-img"
          :src="imageSrc"
          mode="aspectFill"
          @click="previewImage"
        />
        <text class="tap-hint">点击图片查看大图</text>
      </view>

      <!-- 风格标签 -->
      <view class="style-tag" :style="{ backgroundColor: currentStyle?.color + '20', borderColor: currentStyle?.color }">
        <text :style="{ color: currentStyle?.color }">
          {{ currentStyle?.icon }} {{ currentStyle?.name }}
        </text>
      </view>
    </view>

    <!-- 更多操作 -->
    <view class="actions">
      <view class="action-card" @click="retryOther">
        <view class="action-icon-wrap">
          <text class="action-icon">🎨</text>
        </view>
        <view class="action-info">
          <text class="action-title">换个风格</text>
          <text class="action-desc">同张照片试试其他相框</text>
        </view>
        <text class="action-arrow">›</text>
      </view>

      <view class="action-card" @click="retryNew">
        <view class="action-icon-wrap">
          <text class="action-icon">📷</text>
        </view>
        <view class="action-info">
          <text class="action-title">换张照片</text>
          <text class="action-desc">重新选照片生成</text>
        </view>
        <text class="action-arrow">›</text>
      </view>
    </view>

    <!-- 保存分享 -->
    <view class="save-share">
      <button class="btn-save" @click="saveImage" :disabled="saving">
        <text>{{ saving ? '💾 保存中...' : '💾 保存到相册' }}</text>
      </button>
      <button class="btn-share" open-type="share">
        <text>📤 分享给朋友</text>
      </button>
    </view>
    </view>
  </PageFrame>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import PageFrame from '@/components/page-frame.vue'
import { getStyleById } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'
import { saveToAlbum, base64ToTempFile, addWatermark } from '@/utils/image.js'

const store = useAppStore()
const imageSrc = ref('')
const saving = ref(false)

const currentStyle = computed(() => getStyleById(store.selectedStyleId))

// 读取 store 中的结果图
const result = store.currentResultImage
if (result) {
  imageSrc.value = typeof result === 'string' && result.startsWith('data:')
    ? result
    : result
}

// 分享
onShareAppMessage(() => ({
  title: `我用「图百变」给照片加上了${currentStyle.value?.name || '精美'}相框！`,
  path: `/pages/editor/index?styleId=${store.selectedStyleId}`,
  imageUrl: imageSrc.value,
}))

async function saveImage() {
  saving.value = true
  uni.showLoading({ title: '保存中...', mask: true })

  try {
    let savePath

    // 如果是 base64，先走水印再转文件
    if (imageSrc.value.startsWith('data:')) {
      const base64 = imageSrc.value.includes(',') ? imageSrc.value.split(',')[1] : imageSrc.value
      const tmpPath = await base64ToTempFile(base64)
      const watermarked = await addWatermark(tmpPath, '图百变')
      savePath = watermarked || tmpPath
    } else {
      savePath = imageSrc.value
    }

    await saveToAlbum(savePath)
    uni.hideLoading()
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (err) {
    uni.hideLoading()
    console.error('[stylelab result] 保存失败', err)
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function previewImage() {
  uni.previewImage({
    urls: [imageSrc.value],
    current: imageSrc.value,
  })
}

function retryOther() {
  uni.redirectTo({ url: '/pages/editor/index' })
}

function retryNew() {
  uni.redirectTo({ url: '/pages/generate/generate' })
}
</script>

<style scoped>
.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 32rpx;
}

.result-showcase {
  width: 100%;
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.single-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.result-label {
  font-size: 28rpx;
  color: #CF8BFF;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.single-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(108,92,231,0.2);
}

.tap-hint {
  font-size: 22rpx;
  color: #555;
  margin-top: 12rpx;
}

.style-tag {
  margin-top: 28rpx;
  padding: 10rpx 28rpx;
  border-radius: 24rpx;
  border: 1rpx solid;
}

.style-tag text {
  font-size: 26rpx;
  font-weight: 600;
}

/* 操作区 */
.actions {
  width: 100%;
  max-width: 560rpx;
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: rgba(255,255,255,0.04);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255,255,255,0.06);
}

.action-card:active {
  background: rgba(108,92,231,0.08);
}

.action-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(108,92,231,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.action-icon {
  font-size: 36rpx;
}

.action-info {
  flex: 1;
}

.action-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 4rpx;
}

.action-desc {
  display: block;
  font-size: 22rpx;
  color: #777;
}

.action-arrow {
  font-size: 36rpx;
  color: #555;
}

/* 保存分享 */
.save-share {
  width: 100%;
  max-width: 560rpx;
  margin-top: 48rpx;
  display: flex;
  gap: 20rpx;
}

.btn-save,
.btn-share {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-save {
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  color: #fff;
}

.btn-share {
  background: rgba(255,255,255,0.08);
  color: #e0e0e0;
}
</style>
