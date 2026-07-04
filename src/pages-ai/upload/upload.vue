<template>
  <view class="page-upload">
    <!-- 当前风格提示 -->
    <view class="current-style" :style="{ borderColor: currentStyle.color }">
      <text class="style-badge" :style="{ backgroundColor: currentStyle.color }">
        {{ currentStyle.icon }} {{ currentStyle.name }}
      </text>
      <text class="style-tip">{{ currentStyle.description }}</text>
    </view>

    <!-- 图片区域 -->
    <view class="image-area">
      <view v-if="!imagePath" class="image-empty" @click="pickImage">
        <text class="empty-icon">📷</text>
        <text class="empty-title">点击选择照片</text>
        <text class="empty-desc">建议选择正面清晰人像 · 1:1 比例最佳</text>
      </view>

      <view v-else class="image-preview">
        <image
          class="preview-img"
          :src="imagePath"
          mode="aspectFill"
        />
        <view class="preview-actions">
          <button class="preview-btn" @click="pickImage">
            <text class="btn-label">重选照片</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 提示 -->
    <view class="tips">
      <text class="tip-title">小提示</text>
      <text class="tip-item">正面、清晰、光线充足的照片效果最好</text>
      <text class="tip-item">避免戴墨镜或遮挡面部</text>
      <text class="tip-item">生成需要 3~8 秒，请耐心等待</text>
    </view>

    <!-- 底部生成按钮 -->
    <view class="bottom-action">
      <button
        class="btn-generate"
        :class="{ ready: imagePath }"
        :disabled="!imagePath || store.isGenerating"
        @click="startGenerate"
      >
        <text class="btn-icon">✨</text>
        <text class="btn-text">
          {{ store.isGenerating ? '生成中...' : '立即生成' }}
        </text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { STYLES, getStyleById } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'
import { chooseImage } from '@/utils/image.js'

const store = useAppStore()
const imagePath = ref('')

const currentStyle = computed(() => {
  return getStyleById(store.selectedStyleId)
})

async function pickImage() {
  try {
    const path = await chooseImage()
    imagePath.value = path
    store.setUploadedImage(path)
  } catch (err) {
    // cancel：用户主动取消
    // auth deny / permission：已在 chooseImage 内部弹窗引导设置
    // privacy：微信隐私拦截
    if (!err.message && err.errMsg?.includes('cancel')) {
      // nothing
    }
  }
}

function startGenerate() {
  if (!imagePath.value) {
    uni.showToast({ title: '请先选择照片', icon: 'none' })
    return
  }
  if (!store.canGenerateFree) {
    uni.showToast({ title: '今日免费次数已用完，请明天再来', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages-ai/generate/generate' })
}
</script>

<style scoped>
.page-upload {
  min-height: 100vh;
  background: #050010;
  padding: 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.current-style {
  border: 2rpx solid;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 32rpx;
  background: rgba(255, 255, 255, 0.03);
}

.style-badge {
  display: inline-block;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 8rpx;
}

.style-tip {
  display: block;
  font-size: 24rpx;
  color: #888;
}

.image-area {
  margin-bottom: 32rpx;
}

.image-empty {
  height: 520rpx;
  border-radius: 24rpx;
  border: 3rpx dashed rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.02);
}

.image-empty:active {
  background: rgba(255, 255, 255, 0.04);
}

.empty-icon {
  font-size: 80rpx;
}

.empty-title {
  font-size: 30rpx;
  color: #ccc;
  font-weight: 500;
}

.empty-desc {
  font-size: 24rpx;
  color: #666;
}

.image-preview {
  position: relative;
}

.preview-img {
  width: 100%;
  height: 520rpx;
  border-radius: 24rpx;
}

.preview-actions {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
}

.preview-btn {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 30rpx;
  padding: 12rpx 28rpx;
  border: none;
}

.btn-label {
  font-size: 24rpx;
  color: #fff;
}

.tips {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 40rpx;
}

.tip-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 12rpx;
}

.tip-item {
  display: block;
  font-size: 24rpx;
  color: #777;
  line-height: 2;
  padding-left: 20rpx;
  position: relative;
}

.tip-item::before {
  content: '·';
  position: absolute;
  left: 8rpx;
  color: #9333EA;
}

.bottom-action {
  position: sticky;
  bottom: 0;
}

.btn-generate {
  width: 100%;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.btn-generate.ready {
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  box-shadow: 0 8rpx 30rpx rgba(108, 92, 231, 0.3);
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.btn-generate[disabled] .btn-text {
  color: #555;
}
</style>
