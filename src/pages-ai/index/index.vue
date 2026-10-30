<template>
  <view class="page-index">

    <!-- 顶部 Hero -->
    <view class="hero">
      <view class="hero-decoration">
        <view class="circle c1" />
        <view class="circle c2" />
        <view class="circle c3" />
      </view>
      <text class="hero-title">图百变</text>
      <text class="hero-subtitle">上传一张照片，变身 16 种风格</text>
      <view class="hero-demo">
        <view class="demo-before">
          <text class="demo-label">原图</text>
          <view class="demo-img-placeholder">
            <text class="demo-icon">📷</text>
          </view>
        </view>
        <view class="demo-arrow">
          <text class="arrow-icon">→</text>
        </view>
        <view class="demo-after">
          <text class="demo-label">AI生成</text>
          <view class="demo-img-placeholder">
            <text class="demo-icon">✨</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 风格选择区域 -->
    <view class="section">
      <text class="section-title">选择风格</text>
      <text class="section-desc">点击选择一种风格，AI 将为你生成同款头像</text>

      <view class="style-grid">
        <view
          v-for="style in styles"
          :key="style.id"
          class="style-card"
          :class="{ active: selectedId === style.id }"
          :style="{
            borderColor: selectedId === style.id ? style.color : 'rgba(255,255,255,0.1)',
            backgroundColor: selectedId === style.id ? style.bgColor : 'rgba(255,255,255,0.03)',
          }"
          @click="selectStyle(style.id)"
        >
          <text class="style-icon">{{ style.icon }}</text>
          <text class="style-name">{{ style.name }}</text>
          <text class="style-desc">{{ style.description }}</text>
          <view
            v-if="selectedId === style.id"
            class="style-check"
            :style="{ backgroundColor: style.color }"
          >
            <text class="check-mark">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action">
      <view class="usage-info">
        <text class="usage-text">今日剩余免费次数：{{ store.remainingFree }} 次</text>
      </view>
      <button
        class="btn-upload"
        :disabled="!selectedId"
        @click="goUpload"
      >
        <text class="btn-text">
          {{ selectedId ? '上传照片 · 开始生成' : '请先选择一种风格' }}
        </text>
      </button>
      <view class="bottom-links">
        <text class="link" @click="goHistory">历史记录</text>
        <text class="link">|</text>
        <text class="link highlight" @click="goStyleLab">风格实验室</text>
        <text class="link">|</text>
        <text class="link" @click="showAbout">关于我们</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { STYLES } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'

const styles = STYLES
const selectedId = ref('')
const store = useAppStore()

// 从分享链接进入时，自动选中对应风格
onLoad((options) => {
  if (options?.styleId) {
    selectedId.value = options.styleId
  }
})

onShow(() => {
  store.loadDailyCount()
})

function selectStyle(id) {
  selectedId.value = id
}

function goUpload() {
  if (!selectedId.value) {
    uni.showToast({ title: '请先选择一种风格', icon: 'none' })
    return
  }
  store.setStyle(selectedId.value)
  uni.navigateTo({ url: '/pages-ai/upload/upload' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages-ai/history/history' })
}

function goStyleLab() {
  uni.navigateTo({ url: '/pages/editor/index' })
}

function showAbout() {
  uni.showModal({
    title: '关于 图百变',
    content: '上传一张正面清晰照片，AI 帮你生成多种风格头像。生成结果仅供娱乐，请勿用于正式场合。',
    showCancel: false,
  })
}
</script>

<style scoped>
.page-index {
  min-height: 100vh;
  background: #050010;
  padding-bottom: 40rpx;
}

.hero {
  position: relative;
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  overflow: hidden;
}

.hero-decoration {
  position: absolute;
  top: -60rpx;
  left: 50%;
  transform: translateX(-50%);
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}
.c1 {
  width: 300rpx;
  height: 300rpx;
  background: #9333EA;
  top: -20rpx;
  left: -100rpx;
}
.c2 {
  width: 200rpx;
  height: 200rpx;
  background: #00d4ff;
  top: 40rpx;
  left: 80rpx;
}
.c3 {
  width: 140rpx;
  height: 140rpx;
  background: #ff6b9d;
  top: 100rpx;
  left: -40rpx;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12rpx;
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}

.hero-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  position: relative;
  z-index: 1;
}

.demo-before,
.demo-after {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.demo-label {
  font-size: 22rpx;
  color: #888;
}

.demo-img-placeholder {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 2rpx dashed rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-icon {
  font-size: 48rpx;
}

.demo-arrow {
  padding-bottom: 20rpx;
}

.arrow-icon {
  font-size: 36rpx;
  color: #00d4ff;
  font-weight: 700;
}

.section {
  padding: 0 32rpx;
  margin-top: 20rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8rpx;
}

.section-desc {
  display: block;
  font-size: 24rpx;
  color: #777;
  margin-bottom: 28rpx;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.style-card {
  position: relative;
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.style-card:active {
  transform: scale(0.97);
}

.style-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 12rpx;
}

.style-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 6rpx;
}

.style-desc {
  display: block;
  font-size: 22rpx;
  color: #777;
}

.style-check {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.bottom-action {
  position: sticky;
  bottom: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, #050010 40%);
}

.usage-info {
  text-align: center;
  margin-bottom: 16rpx;
}

.usage-text {
  font-size: 24rpx;
  color: #666;
}

.btn-upload {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  border-radius: 48rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.btn-upload[disabled] {
  background: rgba(255, 255, 255, 0.08);
}

.btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

.btn-upload[disabled] .btn-text {
  color: #555;
}

.bottom-links {
  display: flex;
  justify-content: center;
  gap: 24rpx;
}

.link {
  font-size: 24rpx;
  color: #555;
}

.link.highlight {
  color: #CF8BFF;
  font-weight: 600;
}

</style>
