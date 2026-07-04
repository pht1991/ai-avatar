<template>
  <!-- ============ 隐私协议弹窗 ============ -->
  <PageFrame mode="scroll" safeBottom>
  <view v-if="showPrivacy" class="privacy-overlay">
      <view class="privacy-card">
        <text class="privacy-title">服务协议和隐私政策</text>
        <scroll-view class="privacy-body" scroll-y>
          <text class="privacy-text">
            欢迎使用 风格头像助手！

【信息收集】
我们提供照片编辑、风格化处理等功能，需要获取您的相册/相机权限以选择照片，不会主动收集您的任何个人信息。

【数据使用】
所有图片处理均在本地设备上通过 Canvas 完成，包括添加边框、装饰素材、文字等操作，不会上传至任何服务器。

【本地存储】
编辑后的图片仅保存在您的本地相册中，可随时删除。

点击「同意并继续」即表示您已阅读并接受以上条款。
          </text>
        </scroll-view>
        <view class="privacy-actions">
          <button class="privacy-btn disagree" @click="declinePrivacy">暂不同意</button>
          <button class="privacy-btn agree" @click="agreePrivacy">同意并继续</button>
        </view>
      </view>
    </view>

    <view class="home-content" :style="{ paddingTop: navBarHeightRpx + 'rpx' }">
      <!-- ============ Banner 区 ============ -->
      <view class="banner">
        <view class="banner-glow" />
        <view class="banner-content">
          <view class="banner-left">
            <view class="banner-tag">AI · 本地处理</view>
            <text class="banner-title">风格头像助手</text>
            <text class="banner-desc">精美边框 · 装饰素材 · 自由编排</text>
            <view class="banner-cta" @click="goEditor">
              <text class="cta-text">立即创作</text>
              <text class="cta-arrow">→</text>
            </view>
          </view>
          <view class="banner-right">
            <view class="banner-preview">
              <text class="preview-icon">🎨</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ============ 常用功能 ============ -->
      <view class="section">
        <text class="section-title">常用功能</text>
        <view class="func-grid">
          <view
            v-for="item in funcList"
            :key="item.id"
            class="func-card"
            :class="{ locked: !item.open }"
            :style="{
              backgroundColor: item.bgColor,
              borderColor: item.borderColor,
            }"
            @click="item.open ? goPage(item.path) : null"
          >
            <view class="func-card-left">
              <view class="func-icon-wrap" :style="{ background: item.iconBg || 'rgba(255,255,255,0.08)' }">
                <text class="func-icon">{{ item.icon }}</text>
              </view>
            </view>
            <view class="func-card-body">
              <text class="func-name">{{ item.name }}</text>
              <text class="func-sub">{{ item.sub }}</text>
            </view>
            <view v-if="!item.open" class="func-badge">即将上线</view>
            <view v-else class="func-arrow">→</view>
          </view>
        </view>
      </view>

      <!-- ============ 底部 ============ -->
    </view>
  </PageFrame>
</template>

<script setup>
import { ref } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import PageFrame from '@/components/page-frame.vue'

/* ===================== 胶囊适配 ===================== */
const systemInfo = uni.getSystemInfoSync()
const navBarHeightRpx = Math.round((systemInfo.statusBarHeight + 44) * 750 / systemInfo.screenWidth)

/* ===================== 隐私协议 ===================== */
const PRIVACY_VERSION = 2
const showPrivacy = ref(false)

{
  const agreed = uni.getStorageSync('privacy_version_home')
  if (agreed !== PRIVACY_VERSION) {
    showPrivacy.value = true
  }
}

function agreePrivacy() {
  uni.setStorageSync('privacy_version_home', PRIVACY_VERSION)
  showPrivacy.value = false
}

function declinePrivacy() {
  uni.showToast({ title: '同意协议后才能使用', icon: 'none', duration: 2500 })
  setTimeout(() => {
    uni.exitMiniProgram?.()
  }, 2500)
}

/* ===================== 分享 ===================== */
onShareAppMessage(() => ({
  title: '风格头像助手 — 给照片加上精美相框和装饰',
  path: '/pages/index/index',
}))

/* ===================== 功能列表 ===================== */
const funcList = [
  {
    id: 'editor',
    icon: '🎨',
    name: '照片美化',
    sub: '16种精美边框，自定义贴纸',
    open: true,
    path: '/pages/editor/index',
    bgColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
    iconBg: 'rgba(147, 51, 234, 0.25)',
  },
  // AI 头像功能临时注释，非企业主体无法过审，升级后恢复
  // {
  //   id: 'avatar',
  //   icon: '✨',
  //   name: 'AI 头像',
  //   sub: 'AI 智能生成风格头像',
  //   open: true,
  //   path: '/pages-ai/index/index',
  //   bgColor: 'rgba(6, 182, 212, 0.15)',
  //   borderColor: 'rgba(6, 182, 212, 0.3)',
  //   iconBg: 'rgba(6, 182, 212, 0.25)',
  // },
  {
    id: 'meme',
    icon: '😄',
    name: '表情包工厂',
    sub: '热梗模板，一键生成GIF',
    open: true,
    path: '/pages-meme/index/index',
    bgColor: 'rgba(255, 180, 84, 0.12)',
    borderColor: 'rgba(255, 180, 84, 0.2)',
    iconBg: 'rgba(255, 180, 84, 0.2)',
  },
  {
    id: 'poster',
    icon: '🖼️',
    name: '海报生成',
    sub: '电影/唱片/杂志封面',
    open: true,
    path: '/pages-poster/index/index',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    iconBg: 'rgba(34, 197, 94, 0.2)',
  },
  {
    id: 'status',
    icon: '📱',
    name: '微信状态图',
    sub: '适配新版微信样式',
    open: true,
    path: '/pages-status/index/index',
    bgColor: 'rgba(255, 77, 109, 0.12)',
    borderColor: 'rgba(255, 77, 109, 0.2)',
    iconBg: 'rgba(255, 77, 109, 0.2)',
  },
  {
    id: 'article',
    icon: '📝',
    name: '文字卡片',
    sub: '精美排版文字分享',
    open: true,
    path: '/pages-article/index/index',
    bgColor: 'rgba(255, 167, 38, 0.12)',
    borderColor: 'rgba(255, 167, 38, 0.25)',
    iconBg: 'rgba(255, 167, 38, 0.2)',
  },
]

/* ===================== 导航 ===================== */
function goPage(path) {
  uni.navigateTo({ url: path })
}

function goEditor() {
  uni.navigateTo({ url: '/pages/editor/index' })
}
</script>

<style scoped>
/* ============ Banner ============ */
.banner {
  position: relative;
  margin: 24rpx 24rpx 0;
  height: 360rpx;
  border-radius: 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #330073 0%, #041A59 60%, #050010 100%);
}

.banner-glow {
  position: absolute;
  top: -80rpx;
  right: -60rpx;
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(147,51,234,0.5) 0%, transparent 70%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  padding: 36rpx 32rpx;
  height: 100%;
}

.banner-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-tag {
  align-self: flex-start;
  padding: 6rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(147, 51, 234, 0.3);
  border: 1rpx solid rgba(147, 51, 234, 0.6);
  font-size: 22rpx;
  color: #CF8BFF;
  margin-bottom: 16rpx;
}

.banner-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.banner-desc {
  display: block;
  font-size: 26rpx;
  color: #A8A8C2;
  margin-bottom: 24rpx;
}

.banner-cta {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 36rpx;
  border-radius: 36rpx;
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
}

.cta-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.cta-arrow {
  font-size: 26rpx;
  color: #FFFFFF;
}

.banner-right {
  width: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #6633CC 0%, #06B6D4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 48rpx rgba(147, 51, 234, 0.5);
}

.preview-icon {
  font-size: 72rpx;
}

/* ============ 区段 ============ */
.section {
  padding: 0 28rpx;
  margin-top: 36rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}

/* ============ 功能网格 ============ */
.func-grid {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.func-card {
  width: 100%;
  height: auto;
  box-sizing: border-box;
  border: 1rpx solid;
  border-radius: 24rpx;
  padding: 20rpx 28rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.func-card:active {
  transform: scale(0.98);
  opacity: 0.8;
}

.func-card.locked {
  opacity: 0.45;
}

.func-card.locked:active {
  transform: none;
  opacity: 0.45;
}

.func-card-left {
  margin-right: 20rpx;
  flex-shrink: 0;
}

.func-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.func-icon {
  font-size: 36rpx;
  line-height: 1;
}

.func-card-body {
  flex: 1;
  min-width: 0;
}

.func-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}

.func-sub {
  font-size: 22rpx;
  color: #A8A8C2;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.func-badge {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  font-size: 20rpx;
  color: #A8A8C2;
  margin-left: 12rpx;
}

.func-arrow {
  flex-shrink: 0;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.3);
  margin-left: 12rpx;
}

/* ============ 隐私协议弹窗 ============ */
.privacy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
}

.privacy-card {
  width: 580rpx;
  background: #1A0D33;
  border-radius: 32rpx;
  border: 1rpx solid rgba(147, 51, 234, 0.2);
  padding: 48rpx 36rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.privacy-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 28rpx;
}

.privacy-body {
  width: 100%;
  max-height: 560rpx;
  margin-bottom: 32rpx;
}

.privacy-text {
  font-size: 26rpx;
  color: #A8A8C2;
  line-height: 1.8;
  white-space: pre-line;
}

.privacy-actions {
  width: 100%;
  display: flex;
  gap: 20rpx;
}

.privacy-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 42rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.privacy-btn.disagree {
  background: rgba(255, 255, 255, 0.08);
  color: #A8A8C2;
}

.privacy-btn.agree {
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  color: #FFFFFF;
}
</style>
