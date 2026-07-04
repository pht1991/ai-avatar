<template>
  <PageFrame safeBottom>
    <view class="content-wrap">
    <view class="header">
      <text class="header-title">表情包工厂</text>
      <text class="header-desc">选模板 · 加文字 · 导出表情</text>
    </view>

    <!-- 自定义图片入口 -->
    <view class="custom-entry" @click="useCustomPhoto">
      <view class="custom-icon-wrap">
        <text class="custom-icon">📷</text>
      </view>
      <view class="custom-info">
        <text class="custom-title">使用自己的照片</text>
        <text class="custom-sub">从相册选择或拍照</text>
      </view>
      <text class="custom-arrow">→</text>
    </view>

    <!-- 模板网格 -->
    <view class="section">
      <text class="section-title">经典模板</text>
      <view class="template-grid">
        <view
          v-for="tpl in templates"
          :key="tpl.id"
          class="tpl-card"
          @click="openEditor(tpl)"
        >
          <view class="tpl-preview" :style="{ background: tpl.bg }">
            <text class="tpl-emoji">{{ tpl.emoji }}</text>
            <text class="tpl-label">{{ tpl.name }}</text>
          </view>
        </view>
      </view>
    </view>

    </view>
  </PageFrame>
</template>

<script setup>
import { ref } from 'vue'
import PageFrame from '@/components/page-frame.vue'

/* ===================== 模板数据 ===================== */
const templates = ref([
  { id: 'panda',     name: '熊猫头',   emoji: '🐼', bg: 'linear-gradient(135deg, #FFF8E1, #FFE082)' },
  { id: 'golden',     name: '金馆长',   emoji: '😂', bg: 'linear-gradient(135deg, #E8F5E9, #A5D6A7)' },
  { id: 'doge',       name: 'Doge',     emoji: '🐕', bg: 'linear-gradient(135deg, #E3F2FD, #90CAF9)' },
  { id: 'blur',       name: '模糊图',   emoji: '🌫️', bg: 'linear-gradient(135deg, #F3E5F5, #CE93D8)' },
  { id: 'sponge',    name: '海绵宝宝', emoji: '🧽', bg: 'linear-gradient(135deg, #FFF9C4, #FFF176)' },
  { id: 'pepe',       name: 'Pepe',     emoji: '🐸', bg: 'linear-gradient(135deg, #E8F5E9, #66BB6A)' },
  { id: 'distracted', name: '分心男',   emoji: '🤔', bg: 'linear-gradient(135deg, #FFF3E0, #FFCC80)' },
  { id: 'button',     name: '按钮猫',   emoji: '🐱', bg: 'linear-gradient(135deg, #FCE4EC, #EF9A9A)' },
])

/* ===================== 导航 ===================== */
function useCustomPhoto() {
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success(res) {
      const path = res.tempFiles[0].tempFilePath
      uni.navigateTo({ url: `/pages-meme/edit/edit?image=${encodeURIComponent(path)}&tpl=custom` })
    },
    fail(err) {
      console.error('chooseMedia fail', err)
      if (err.errno === 112 || (err.errMsg && err.errMsg.includes('privacy'))) {
        uni.showModal({
          title: '提示',
          content: '需要同意隐私保护协议才能访问相册。请前往「设置」->「隐私与安全」开启相册权限。',
          showCancel: false,
        })
      } else {
        uni.showToast({ title: '无法打开相册，请检查权限', icon: 'none', duration: 2000 })
      }
    },
  })
}

function openEditor(tpl) {
  uni.navigateTo({ url: `/pages-meme/edit/edit?tpl=${tpl.id}` })
}
</script>

<style scoped>
.content-wrap {
  padding: 24rpx;
}

.header {
  margin-bottom: 32rpx;
}

.header-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.header-desc {
  display: block;
  font-size: 26rpx;
  color: #A8A8C2;
}

/* ============ 自定义图片入口 ============ */
.custom-entry {
  display: flex;
  align-items: center;
  background: rgba(147, 51, 234, 0.12);
  border: 1rpx solid rgba(147, 51, 234, 0.25);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 36rpx;
}

.custom-entry:active {
  opacity: 0.8;
}

.custom-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(147, 51, 234, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.custom-icon {
  font-size: 36rpx;
}

.custom-info {
  flex: 1;
}

.custom-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}

.custom-sub {
  display: block;
  font-size: 22rpx;
  color: #A8A8C2;
}

.custom-arrow {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

/* ============ 区段 ============ */
.section {
  margin-bottom: 36rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}

/* ============ 模板网格 ============ */
.template-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tpl-card {
  width: calc((100% - 32rpx) / 3);
  aspect-ratio: 1;
  border-radius: 24rpx;
  overflow: hidden;
}

.tpl-card:active {
  opacity: 0.8;
  transform: scale(0.96);
}

.tpl-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.tpl-emoji {
  font-size: 48rpx;
}

.tpl-label {
  font-size: 22rpx;
  color: #333333;
  font-weight: 600;
}

</style>
