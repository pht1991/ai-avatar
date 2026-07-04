<template>
  <PageFrame safeBottom>
    <view class="content-wrap">
    <view class="header">
      <text class="header-title">微信状态图</text>
      <text class="header-desc">选模板 · 编辑文字 · 设为微信状态</text>
    </view>

    <!-- 自定义空白画布入口 -->
    <view class="custom-entry" @click="openBlank">
      <view class="custom-icon-wrap">
        <text class="custom-icon">➕</text>
      </view>
      <view class="custom-info">
        <text class="custom-title">空白画布</text>
        <text class="custom-sub">自由创作 9:16 状态图</text>
      </view>
      <text class="custom-arrow">→</text>
    </view>

    <!-- 模板网格 -->
    <view class="section">
      <text class="section-title">精选模板</text>
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
import PageFrame from '@/components/page-frame.vue'

const templates = [
  {
    id: 'mood-happy',
    name: '今日开心',
    emoji: '😊',
    bg: 'linear-gradient(180deg, #FFE66D 0%, #FF6B6B 100%)',
    bgType: 'gradient',
    bgValue: ['#FFE66D', '#FF6B6B'],
    bgDir: '180deg',
    textAreas: [
      { text: '今天心情', fontSize: 32, color: '#FFFFFF', x: 105, y: 120, font: 'bold' },
      { text: '超级好！', fontSize: 40, color: '#FFFFFF', x: 105, y: 170, font: 'bold' },
      { text: '2026.07.04', fontSize: 14, color: 'rgba(255,255,255,0.7)', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'mood-calm',
    name: '平静时刻',
    emoji: '🌙',
    bg: 'linear-gradient(180deg, #2C3E50 0%, #4CA1AF 100%)',
    bgType: 'gradient',
    bgValue: ['#2C3E50', '#4CA1AF'],
    bgDir: '180deg',
    textAreas: [
      { text: '安静', fontSize: 36, color: '#FFFFFF', x: 105, y: 140, font: 'bold' },
      { text: '是一种力量', fontSize: 18, color: 'rgba(255,255,255,0.8)', x: 105, y: 180, font: 'normal' },
      { text: '— 晚安 —', fontSize: 14, color: 'rgba(255,255,255,0.5)', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'travel',
    name: '在路上',
    emoji: '✈️',
    bg: 'linear-gradient(180deg, #667EEA 0%, #764BA2 100%)',
    bgType: 'gradient',
    bgValue: ['#667EEA', '#764BA2'],
    bgDir: '180deg',
    textAreas: [
      { text: '在路上', fontSize: 36, color: '#FFFFFF', x: 105, y: 120, font: 'bold' },
      { text: '世界那么大', fontSize: 16, color: 'rgba(255,255,255,0.85)', x: 105, y: 165, font: 'normal' },
      { text: '我想去看看', fontSize: 16, color: 'rgba(255,255,255,0.85)', x: 105, y: 195, font: 'normal' },
    ],
  },
  {
    id: 'foodie',
    name: '美食打卡',
    emoji: '🍜',
    bg: 'linear-gradient(180deg, #FF9A9E 0%, #FECFEF 100%)',
    bgType: 'gradient',
    bgValue: ['#FF9A9E', '#FECFEF'],
    bgDir: '180deg',
    textAreas: [
      { text: '今天吃了', fontSize: 28, color: '#FFFFFF', x: 105, y: 120, font: 'bold' },
      { text: '好吃的！', fontSize: 36, color: '#FFFFFF', x: 105, y: 165, font: 'bold' },
      { text: '幸福感满满 ✨', fontSize: 14, color: 'rgba(255,255,255,0.8)', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'workout',
    name: '运动打卡',
    emoji: '💪',
    bg: 'linear-gradient(180deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
    bgType: 'gradient',
    bgValue: ['#0F2027', '#203A43', '#2C5364'],
    bgDir: '180deg',
    textAreas: [
      { text: 'DAY 30', fontSize: 42, color: '#00F0FF', x: 105, y: 120, font: 'bold' },
      { text: '坚持就是胜利', fontSize: 18, color: '#FFFFFF', x: 105, y: 170, font: 'normal' },
      { text: '今日已完成 ✅', fontSize: 14, color: 'rgba(0,240,255,0.7)', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'work',
    name: '专注工作',
    emoji: '💻',
    bg: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    bgType: 'gradient',
    bgValue: ['#1A1A2E', '#16213E', '#0F3460'],
    bgDir: '135deg',
    textAreas: [
      { text: 'FOCUS', fontSize: 40, color: '#E94560', x: 105, y: 120, font: 'bold' },
      { text: '正在专注工作中', fontSize: 16, color: '#FFFFFF', x: 105, y: 170, font: 'normal' },
      { text: '请勿打扰', fontSize: 14, color: 'rgba(255,255,255,0.5)', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'rainy',
    name: '下雨天',
    emoji: '🌧️',
    bg: 'linear-gradient(180deg, #485563 0%, #29323C 100%)',
    bgType: 'gradient',
    bgValue: ['#485563', '#29323C'],
    bgDir: '180deg',
    textAreas: [
      { text: '下雨了', fontSize: 34, color: '#A8D8EA', x: 105, y: 130, font: 'bold' },
      { text: '适合发呆', fontSize: 18, color: '#FFFFFF', x: 105, y: 175, font: 'normal' },
      { text: '🌧 🌧 🌧', fontSize: 20, color: 'rgba(168,216,234,0.5)', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'night',
    name: '深夜思绪',
    emoji: '🌃',
    bg: 'linear-gradient(180deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    bgType: 'gradient',
    bgValue: ['#0F0C29', '#302B63', '#24243E'],
    bgDir: '180deg',
    textAreas: [
      { text: '深夜', fontSize: 38, color: '#FFD700', x: 105, y: 120, font: 'bold' },
      { text: '总有些思绪', fontSize: 16, color: '#FFFFFF', x: 105, y: 168, font: 'normal' },
      { text: '在心底蔓延', fontSize: 16, color: 'rgba(255,255,255,0.7)', x: 105, y: 196, font: 'normal' },
    ],
  },
]

function openEditor(tpl) {
  const params = encodeURIComponent(JSON.stringify(tpl))
  uni.navigateTo({ url: `/pages-status/edit/edit?tpl=${params}` })
}

function openBlank() {
  uni.navigateTo({ url: '/pages-status/edit/edit?tpl=blank' })
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

/* ============ 空白画布入口 ============ */
.custom-entry {
  display: flex;
  align-items: center;
  background: rgba(255, 77, 109, 0.12);
  border: 1rpx solid rgba(255, 77, 109, 0.25);
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
  background: rgba(255, 77, 109, 0.25);
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
  aspect-ratio: 9 / 16;
  border-radius: 20rpx;
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
  gap: 6rpx;
}

.tpl-emoji {
  font-size: 44rpx;
}

.tpl-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #FFFFFF;
  text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.3);
}

</style>
