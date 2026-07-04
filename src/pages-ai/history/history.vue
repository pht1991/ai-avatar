<template>
  <view class="page-history">
    <!-- 头部统计 -->
    <view class="history-header">
      <text class="header-title">我的风格头像</text>
      <text class="header-count">共 {{ history.length }} 张</text>
    </view>

    <!-- 空状态 -->
    <view v-if="history.length === 0" class="empty">
      <text class="empty-icon">📭</text>
      <text class="empty-title">还没有生成记录</text>
      <text class="empty-desc">去首页生成你的第一张风格头像吧</text>
      <button class="empty-btn" @click="goHome">去生成</button>
    </view>

    <!-- 图片网格 -->
    <view v-else class="history-grid">
      <view
        v-for="(item, index) in history"
        :key="item.id"
        class="history-item"
        @click="viewItem(item)"
      >
        <image
          class="history-img"
          :src="getImageSrc(item.image)"
          mode="aspectFill"
        />
        <view class="history-overlay">
          <text class="overlay-style">{{ getStyleName(item.styleId) }}</text>
          <text class="overlay-date">{{ formatDate(item.createdAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 清空按钮 -->
    <view v-if="history.length > 0" class="clear-area">
      <text class="clear-btn" @click="clearAll">清空全部记录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getStyleById } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'

const store = useAppStore()
const history = computed(() => store.generatedImages)
const HISTORY_KEY = 'avatar_history'

onShow(() => {
  // 内存中有数据（同一次会话刚生成的）→ 不覆盖
  // 内存无数据（冷启动）→ 从存储恢复
  if (store.generatedImages.length === 0) {
    store.loadHistory()
  }
})

function getStyleName(styleId) {
  const style = getStyleById(styleId)
  return style ? style.name : '未知风格'
}

function getImageSrc(raw) {
  if (!raw) return ''
  return /^https?:\/\//.test(raw) ? raw : `data:image/png;base64,${raw}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}

function viewItem(item) {
  store.currentResultImage = item.image
  store.selectedStyleId = item.styleId
  uni.navigateTo({ url: '/pages-ai/result/result?from=history' })
}

function clearAll() {
  uni.showModal({
    title: '确认清空',
    content: '将删除全部历史记录，确认清空？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync(HISTORY_KEY)
        store.generatedImages.splice(0, store.generatedImages.length)
      }
    },
  })
}

function goHome() {
  uni.reLaunch({ url: '/pages-ai/index/index' })
}
</script>

<style scoped>
.page-history {
  min-height: 100vh;
  background: #050010;
  padding: 32rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 32rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #e0e0e0;
}

.header-count {
  font-size: 24rpx;
  color: #666;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-title {
  font-size: 30rpx;
  color: #888;
  font-weight: 500;
}

.empty-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.empty-btn {
  width: 260rpx;
  height: 80rpx;
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  border-radius: 40rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fff;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.history-item {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  aspect-ratio: 1;
}

.history-img {
  width: 100%;
  height: 100%;
}

.history-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12rpx 16rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.overlay-style {
  display: block;
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
}

.overlay-date {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
}

.clear-area {
  margin-top: 48rpx;
  text-align: center;
}

.clear-btn {
  font-size: 26rpx;
  color: #555;
  text-decoration: underline;
}
</style>
