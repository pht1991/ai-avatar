<template>
  <PageFrame safeBottom>
    <view class="content-wrap">
    <view class="header">
      <text class="header-title">海报生成</text>
      <text class="header-desc">选模板 · 编排文字 · 导出高清海报</text>
    </view>

    <!-- 自定义空白画布入口 -->
    <view class="custom-entry" @click="openBlank">
      <view class="custom-icon-wrap">
        <text class="custom-icon">➕</text>
      </view>
      <view class="custom-info">
        <text class="custom-title">空白画布</text>
        <text class="custom-sub">自由创作，自定义比例和背景</text>
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
            <view class="tpl-ratio">{{ tpl.ratio }}</view>
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
    id: 'movie',
    name: '电影海报',
    emoji: '🎬',
    ratio: '2:3',
    bg: 'radial-gradient(ellipse at 30% 20%, #1a0a2e, #0a0a0a)',
    bgType: 'gradient',
    bgValue: ['#1a0a2e', '#0a0a0a'],
    bgDir: 'to bottom',
    textAreas: [
      { text: '影 片 标 题', fontSize: 36, color: '#FFD700', x: 150, y: 190, font: 'bold' },
      { text: 'SUBTITLE HERE', fontSize: 16, color: '#CCCCCC', x: 150, y: 235, font: 'normal' },
      { text: '导演：某某某  主演：某某某 / 某某某', fontSize: 12, color: '#999999', x: 150, y: 395, font: 'normal' },
      { text: '2026 · 即将上映', fontSize: 14, color: '#FF6B6B', x: 150, y: 425, font: 'bold' },
    ],
  },
  {
    id: 'album',
    name: '唱片封面',
    emoji: '💿',
    ratio: '1:1',
    bg: 'linear-gradient(135deg, #2D1B69, #0F0F23)',
    bgType: 'gradient',
    bgValue: ['#2D1B69', '#0F0F23'],
    bgDir: '135deg',
    textAreas: [
      { text: '专 辑 名 称', fontSize: 28, color: '#FFFFFF', x: 150, y: 130, font: 'bold' },
      { text: '艺人名字', fontSize: 16, color: '#CF8BFF', x: 150, y: 170, font: 'normal' },
      { text: '2026', fontSize: 12, color: '#999999', x: 150, y: 198, font: 'normal' },
    ],
  },
  {
    id: 'magazine',
    name: '杂志封面',
    emoji: '📰',
    ratio: '3:4',
    bg: 'linear-gradient(180deg, #FF6B6B 0%, #FFE66D 50%, #FFFFFF 100%)',
    bgType: 'gradient',
    bgValue: ['#FF6B6B', '#FFE66D', '#FFFFFF'],
    bgDir: '180deg',
    textAreas: [
      { text: 'FASHION', fontSize: 42, color: '#FFFFFF', x: 188, y: 160, font: 'bold' },
      { text: 'WEEKLY', fontSize: 24, color: '#FFFFFF', x: 188, y: 200, font: 'normal' },
      { text: '夏季穿搭指南', fontSize: 18, color: '#333333', x: 188, y: 380, font: 'bold' },
      { text: '2026.07 第128期', fontSize: 12, color: '#666666', x: 188, y: 408, font: 'normal' },
    ],
  },
  {
    id: 'event',
    name: '活动宣传',
    emoji: '🎪',
    ratio: '2:3',
    bg: 'linear-gradient(180deg, #667EEA 0%, #764BA2 100%)',
    bgType: 'gradient',
    bgValue: ['#667EEA', '#764BA2'],
    bgDir: '180deg',
    textAreas: [
      { text: '活 动 名 称', fontSize: 32, color: '#FFFFFF', x: 200, y: 260, font: 'bold' },
      { text: '时间：2026年7月15日', fontSize: 14, color: 'rgba(255,255,255,0.85)', x: 200, y: 310, font: 'normal' },
      { text: '地点：某某文化艺术中心', fontSize: 14, color: 'rgba(255,255,255,0.85)', x: 200, y: 336, font: 'normal' },
      { text: '立即报名 →', fontSize: 16, color: '#FFD700', x: 200, y: 380, font: 'bold' },
    ],
  },
  {
    id: 'minimal',
    name: '极简白',
    emoji: '⬜',
    ratio: '3:4',
    bg: '#F8F9FA',
    bgType: 'solid',
    bgValue: '#F8F9FA',
    textAreas: [
      { text: '标题文字', fontSize: 32, color: '#1A1A2E', x: 188, y: 260, font: 'bold' },
      { text: '副标题或描述内容', fontSize: 14, color: '#666666', x: 188, y: 300, font: 'normal' },
    ],
  },
  {
    id: 'vintage',
    name: '复古胶片',
    emoji: '📷',
    ratio: '2:3',
    bg: 'linear-gradient(180deg, #F5E6CA 0%, #D4A574 100%)',
    bgType: 'gradient',
    bgValue: ['#F5E6CA', '#D4A574'],
    bgDir: '180deg',
    textAreas: [
      { text: '记 忆', fontSize: 36, color: '#5C3D2E', x: 200, y: 240, font: 'bold' },
      { text: 'MEMORIES', fontSize: 16, color: '#8B5E3C', x: 200, y: 282, font: 'normal' },
      { text: '拍摄于 2026 · 夏季', fontSize: 12, color: '#A67C52', x: 200, y: 420, font: 'normal' },
    ],
  },
  {
    id: 'tech',
    name: '科技感',
    emoji: '🤖',
    ratio: '16:9',
    bg: 'linear-gradient(135deg, #0A0A1A 0%, #1A1040 50%, #0A2A3A 100%)',
    bgType: 'gradient',
    bgValue: ['#0A0A1A', '#1A1040', '#0A2A3A'],
    bgDir: '135deg',
    textAreas: [
      { text: 'TECH TALK', fontSize: 34, color: '#00F0FF', x: 160, y: 60, font: 'bold' },
      { text: '人工智能与未来趋势', fontSize: 18, color: '#FFFFFF', x: 160, y: 100, font: 'normal' },
      { text: '2026.07.20  14:00', fontSize: 14, color: '#00F0FF', x: 160, y: 130, font: 'normal' },
    ],
  },
  {
    id: 'nature',
    name: '自然清新',
    emoji: '🌿',
    ratio: '2:3',
    bg: 'linear-gradient(180deg, #A8E6CF 0%, #DCEDC1 50%, #FFD3B6 100%)',
    bgType: 'gradient',
    bgValue: ['#A8E6CF', '#DCEDC1', '#FFD3B6'],
    bgDir: '180deg',
    textAreas: [
      { text: '遇见自然', fontSize: 34, color: '#2D6A4F', x: 200, y: 260, font: 'bold' },
      { text: 'Nature & Life', fontSize: 16, color: '#40916C', x: 200, y: 302, font: 'normal' },
      { text: '享受每一刻的宁静', fontSize: 13, color: '#52B788', x: 200, y: 330, font: 'normal' },
    ],
  },
]

function openEditor(tpl) {
  const params = encodeURIComponent(JSON.stringify(tpl))
  uni.navigateTo({ url: `/pages-poster/edit/edit?tpl=${params}` })
}

function openBlank() {
  uni.navigateTo({ url: '/pages-poster/edit/edit?tpl=blank' })
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
  background: rgba(34, 197, 94, 0.12);
  border: 1rpx solid rgba(34, 197, 94, 0.25);
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
  background: rgba(34, 197, 94, 0.25);
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
  aspect-ratio: 0.75;
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
  gap: 6rpx;
  position: relative;
}

.tpl-emoji {
  font-size: 44rpx;
}

.tpl-label {
  font-size: 22rpx;
  font-weight: 600;
}

.tpl-ratio {
  position: absolute;
  bottom: 8rpx;
  right: 10rpx;
  font-size: 18rpx;
  color: rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.5);
  padding: 2rpx 10rpx;
  border-radius: 12rpx;
}

</style>
