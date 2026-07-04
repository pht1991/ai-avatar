<template>
  <PageFrame safeBottom>
    <view class="content-wrap">
    <view class="header">
      <text class="header-title">文字卡片</text>
      <text class="header-desc">精美排版 · 金句分享 · 一键导出</text>
    </view>

    <!-- 自定义空白画布入口 -->
    <view class="custom-entry" @click="openBlank">
      <view class="custom-icon-wrap">
        <text class="custom-icon">➕</text>
      </view>
      <view class="custom-info">
        <text class="custom-title">空白画布</text>
        <text class="custom-sub">自由创作 1:1 / 9:16 / 16:9</text>
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
    id: 'quote-daily',
    name: '每日金句',
    emoji: '💬',
    bg: 'linear-gradient(180deg, #2C3E50 0%, #4CA1AF 100%)',
    bgType: 'gradient',
    bgValue: ['#2C3E50', '#4CA1AF'],
    bgDir: '180deg',
    ratio: '1:1',
    canvasW: 300, canvasH: 300,
    textAreas: [
      { text: '「 今日金句 」', fontSize: 26, color: '#FFFFFF', x: 150, y: 100, font: 'bold' },
      { text: '生活不是等待风暴过去，', fontSize: 18, color: 'rgba(255,255,255,0.85)', x: 150, y: 150, font: 'normal' },
      { text: '而是学会在雨中跳舞。', fontSize: 18, color: 'rgba(255,255,255,0.85)', x: 150, y: 180, font: 'normal' },
      { text: '— 维维·加博', fontSize: 14, color: 'rgba(255,255,255,0.5)', x: 150, y: 240, font: 'normal' },
    ],
  },
  {
    id: 'quote-card',
    name: '语录卡片',
    emoji: '📖',
    bg: 'linear-gradient(135deg, #1A1A2E 0%, #E94560 100%)',
    bgType: 'gradient',
    bgValue: ['#1A1A2E', '#E94560'],
    bgDir: '135deg',
    ratio: '1:1',
    canvasW: 300, canvasH: 300,
    textAreas: [
      { text: '「', fontSize: 48, color: 'rgba(233,69,96,0.6)', x: 150, y: 80, font: 'normal' },
      { text: '行动是治愈恐惧的', fontSize: 18, color: '#FFFFFF', x: 40, y: 140, font: 'normal', align: 'left' },
      { text: '良药', fontSize: 32, color: '#E94560', x: 40, y: 175, font: 'bold', align: 'left' },
      { text: '而犹豫会不断滋养恐惧。', fontSize: 16, color: 'rgba(255,255,255,0.7)', x: 40, y: 215, font: 'normal', align: 'left' },
      { text: '— 戴尔·卡耐基', fontSize: 14, color: 'rgba(255,255,255,0.4)', x: 150, y: 260, font: 'normal' },
    ],
  },
  {
    id: 'note-paper',
    name: '便签纸',
    emoji: '📝',
    bg: '#FFF8E7',
    bgType: 'solid',
    bgValue: '#FFF8E7',
    bgDir: '180deg',
    ratio: '9:16',
    canvasW: 210, canvasH: 374,
    textAreas: [
      { text: '📝 今日便签', fontSize: 22, color: '#5D4037', x: 105, y: 60, font: 'bold' },
      { text: '完成了一天的工作 ✅', fontSize: 16, color: '#795548', x: 105, y: 110, font: 'normal' },
      { text: '读了一章好书 📖', fontSize: 16, color: '#795548', x: 105, y: 140, font: 'normal' },
      { text: '跑步 5 公里 🏃', fontSize: 16, color: '#795548', x: 105, y: 170, font: 'normal' },
      { text: '明天继续加油！💪', fontSize: 18, color: '#FF6B6B', x: 105, y: 230, font: 'bold' },
      { text: new Date().toISOString().slice(0,10), fontSize: 12, color: '#BCAAA4', x: 105, y: 340, font: 'normal' },
    ],
  },
  {
    id: 'minimal-banner',
    name: '极简横幅',
    emoji: '▬',
    bg: '#000000',
    bgType: 'solid',
    bgValue: '#000000',
    bgDir: '180deg',
    ratio: '16:9',
    canvasW: 400, canvasH: 225,
    textAreas: [
      { text: 'LESS IS MORE', fontSize: 36, color: '#FFFFFF', x: 200, y: 100, font: 'bold' },
      { text: '极简之美', fontSize: 20, color: 'rgba(255,255,255,0.6)', x: 200, y: 145, font: 'normal' },
    ],
  },
  {
    id: 'poetry',
    name: '诗歌排版',
    emoji: '🎋',
    bg: 'linear-gradient(180deg, #0F0C29 0%, #24243E 100%)',
    bgType: 'gradient',
    bgValue: ['#0F0C29', '#24243E'],
    bgDir: '180deg',
    ratio: '9:16',
    canvasW: 210, canvasH: 374,
    textAreas: [
      { text: '夜空', fontSize: 32, color: '#FFD700', x: 105, y: 100, font: 'bold' },
      { text: '', fontSize: 14, color: 'rgba(255,255,255,0.4)', x: 105, y: 140, font: 'normal' },
      { text: '繁星点点', fontSize: 20, color: '#FFFFFF', x: 105, y: 175, font: 'normal' },
      { text: '是夜对你的低语', fontSize: 20, color: 'rgba(255,255,255,0.8)', x: 105, y: 210, font: 'normal' },
      { text: '—', fontSize: 14, color: 'rgba(255,255,255,0.3)', x: 105, y: 260, font: 'normal' },
    ],
  },
  {
    id: 'countdown',
    name: '倒计时',
    emoji: '⏰',
    bg: 'linear-gradient(180deg, #FF0844 0%, #FFB199 100%)',
    bgType: 'gradient',
    bgValue: ['#FF0844', '#FFB199'],
    bgDir: '180deg',
    ratio: '1:1',
    canvasW: 300, canvasH: 300,
    textAreas: [
      { text: 'D - 1', fontSize: 52, color: '#FFFFFF', x: 150, y: 120, font: 'bold' },
      { text: '距离目标', fontSize: 20, color: 'rgba(255,255,255,0.85)', x: 150, y: 175, font: 'normal' },
      { text: '只差一步！', fontSize: 24, color: '#FFD700', x: 150, y: 215, font: 'bold' },
    ],
  },
  {
    id: 'festival',
    name: '节日祝福',
    emoji: '🎊',
    bg: 'linear-gradient(135deg, #FF6B6B 0%, #FFD43B 100%)',
    bgType: 'gradient',
    bgValue: ['#FF6B6B', '#FFD43B'],
    bgDir: '135deg',
    ratio: '1:1',
    canvasW: 300, canvasH: 300,
    textAreas: [
      { text: '🎊', fontSize: 48, color: '#FFFFFF', x: 150, y: 90, font: 'normal' },
      { text: '节日快乐', fontSize: 36, color: '#FFFFFF', x: 150, y: 150, font: 'bold' },
      { text: '愿你每天开心 😊', fontSize: 18, color: 'rgba(255,255,255,0.9)', x: 150, y: 200, font: 'normal' },
    ],
  },
  {
    id: 'checkin',
    name: '打卡日历',
    emoji: '📅',
    bg: 'linear-gradient(180deg, #51CF66 0%, #2F9E44 100%)',
    bgType: 'gradient',
    bgValue: ['#51CF66', '#2F9E44'],
    bgDir: '180deg',
    ratio: '1:1',
    canvasW: 300, canvasH: 300,
    textAreas: [
      { text: '📅', fontSize: 44, color: '#FFFFFF', x: 150, y: 80, font: 'normal' },
      { text: '2026.07.04', fontSize: 22, color: '#FFFFFF', x: 150, y: 130, font: 'bold' },
      { text: '已坚持 30 天', fontSize: 24, color: '#FFFFFF', x: 150, y: 170, font: 'bold' },
      { text: '继续加油！💪', fontSize: 16, color: 'rgba(255,255,255,0.8)', x: 150, y: 220, font: 'normal' },
    ],
  },
]

function openEditor(tpl) {
  const params = encodeURIComponent(JSON.stringify(tpl))
  uni.navigateTo({ url: `/pages-article/edit/edit?tpl=${params}` })
}

function openBlank() {
  uni.navigateTo({ url: '/pages-article/edit/edit?tpl=blank' })
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
  background: rgba(255, 167, 38, 0.12);
  border: 1rpx solid rgba(255, 167, 38, 0.25);
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
  background: rgba(255, 167, 38, 0.25);
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
  aspect-ratio: 1 / 1;
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
