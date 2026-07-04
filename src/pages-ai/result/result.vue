<template>
  <view class="page-result">
    <!-- 结果展示 -->
    <view class="result-showcase">
      <!-- 对比展示（仅从生成页跳转时展示，历史记录进入时原图路径已失效，不展示） -->
      <view v-if="!fromHistory" class="compare">
        <view class="compare-item before">
          <text class="compare-label">原图</text>
          <image
            class="compare-img"
            :src="store.uploadedImagePath"
            mode="aspectFill"
          />
        </view>
        <view class="compare-arrow">
          <text class="arrow">→</text>
        </view>
        <view class="compare-item after">
          <text class="compare-label">AI 生成</text>
          <image
            class="compare-img"
            :src="imageSrc"
            mode="aspectFill"
          />
        </view>
      </view>

      <!-- 历史记录模式：只展示生成图大图 -->
      <view v-else class="single-result">
        <text class="compare-label">AI 生成</text>
        <image
          class="single-img"
          :src="imageSrc"
          mode="aspectFill"
        />
      </view>

      <!-- 风格标签 -->
      <view class="style-tag" :style="{ backgroundColor: currentStyle?.color + '20', borderColor: currentStyle?.color }">
        <text :style="{ color: currentStyle?.color }">
          {{ currentStyle?.icon }} {{ currentStyle?.name }}风格
        </text>
      </view>
    </view>

    <!-- 操作按钮区（仅从生成页跳转时展示，历史记录无原图无法重新生成） -->
    <view v-if="!fromHistory" class="actions">
      <!-- 换风格重试 -->
      <view class="action-card" @click="retryAnother">
        <view class="action-icon-wrap">
          <text class="action-icon">🔄</text>
        </view>
        <view class="action-info">
          <text class="action-title">换个风格再试</text>
          <text class="action-desc">回到首页选择其他风格</text>
        </view>
        <text class="action-arrow">›</text>
      </view>

      <!-- 同风格重试 -->
      <view class="action-card" @click="retrySame">
        <view class="action-icon-wrap">
          <text class="action-icon">🎲</text>
        </view>
        <view class="action-info">
          <text class="action-title">同风格再生成一次</text>
          <text class="action-desc">AI 每次生成结果都不同</text>
        </view>
        <text class="action-arrow">›</text>
      </view>
    </view>

    <!-- 随机风格生成 -->
    <view class="generate-all-section">
      <view class="action-card highlight" @click="goGenerateAll">
        <view class="action-icon-wrap done">
          <text class="action-icon">🎲</text>
        </view>
        <view class="action-info">
          <text class="action-title">随机换个风格试试</text>
          <text class="action-desc">AI 随机为你选一种风格，每次都是惊喜</text>
        </view>
        <text class="action-arrow highlight-arrow">›</text>
      </view>
    </view>

    <!-- 保存分享 -->
    <view class="save-share">
      <button class="btn-save" :class="{ disabled: preparing || saving }" @click="saveImage" :disabled="saving">
        <text>{{ preparing ? '⏳ 图片准备中...' : saving ? '💾 保存中...' : '💾 保存到相册' }}</text>
      </button>
      <button class="btn-share" open-type="share">
        <text>📤 分享给朋友</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getStyleById } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'
import { base64ToTempFile, urlToTempFile, saveToAlbum, addWatermark } from '@/utils/image.js'
import { generateShareCard } from '@/utils/share.js'

const store = useAppStore()
const imageSrc = ref('')
const tempFilePath = ref('')
const shareCardPath = ref('')
const preparing = ref(true)
const saving = ref(false)

// from=history 时：隐藏原图对比，原图路径是临时路径，重启后失效无意义
const fromHistory = ref(false)

onLoad((options) => {
  fromHistory.value = options?.from === 'history'
})

const currentStyle = computed(() => getStyleById(store.selectedStyleId))

onMounted(async () => {
  // 启用分享菜单（含朋友圈）
  // #ifdef MP-WEIXIN
  wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
  // #endif

  if (!store.currentResultImage) {
    uni.showToast({ title: '没有生成结果', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  const raw = store.currentResultImage

  // 统一处理：优先 base64，fallback URL
  if (/^https?:\/\//.test(raw)) {
    // URL 模式：直接 downloadFile（需在微信后台配置域名白名单）
    imageSrc.value = raw
    try {
      const p = await urlToTempFile(raw)
      tempFilePath.value = p
      generateShareCard(p, currentStyle.value?.name).then(p => shareCardPath.value = p).catch(() => {})
    } catch (err) {
      console.error('[result] URL 下载失败', err)
      uni.showModal({
        title: '图片下载失败',
        content: '请在微信后台配置 downloadFile 域名白名单，或重新生成图片',
        showCancel: false,
      })
    } finally {
      preparing.value = false
    }
  } else {
    // Base64 模式：写入本地文件
    imageSrc.value = `data:image/png;base64,${raw}`
    try {
      const p = await base64ToTempFile(raw)
      tempFilePath.value = p
      generateShareCard(p, currentStyle.value?.name).then(p => shareCardPath.value = p).catch(() => {})
    } catch (err) {
      console.error('[result] base64 写入失败', err)
      uni.showToast({ title: '图片处理失败，请重试', icon: 'none' })
    } finally {
      preparing.value = false
    }
  }
})

async function saveImage() {
  if (!tempFilePath.value) {
    if (preparing.value) {
      uni.showLoading({ title: '图片准备中...' })
      const start = Date.now()
      while (!tempFilePath.value && Date.now() - start < 6000) {
        await new Promise(r => setTimeout(r, 300))
      }
      uni.hideLoading()
    }
    if (!tempFilePath.value) {
      uni.showToast({ title: '图片未就绪，请稍后重试', icon: 'none' })
      return
    }
  }
  if (saving.value) return
  saving.value = true

  // 加水印（有超时保护，不会挂死）
  let savePath = tempFilePath.value
  uni.showLoading({ title: '处理中...' })
  try {
    savePath = await addWatermark(tempFilePath.value, '风格头像助手')
  } catch (_) {
    // addWatermark 内部已有超时降级，这里作为最后兜底
  }
  uni.hideLoading()

  try {
    await saveToAlbum(savePath)
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (err) {
    console.error('[result] 保存失败', err)
    uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function retryAnother() {
  uni.reLaunch({ url: '/pages-ai/index/index' })
}

function retrySame() {
  if (!store.canGenerateFree) {
    uni.showToast({ title: '今日免费次数已用完', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages-ai/generate/generate' })
}

function goGenerateAll() {
  if (!tempFilePath.value) {
    uni.showToast({ title: '图片尚未准备就绪', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages-ai/generate-all/generate-all' })
}

// 分享给好友
onShareAppMessage(() => ({
  title: `我用AI生成了${currentStyle.value?.name || '超好看'}风格头像，你也来试试！`,
  path: `/pages-ai/index/index?styleId=${store.selectedStyleId}`,
  imageUrl: shareCardPath.value || tempFilePath.value,
}))

// 分享到朋友圈
onShareTimeline(() => ({
  title: `风格头像助手 · ${currentStyle.value?.name || ''}风格`,
  query: `styleId=${store.selectedStyleId}`,
  imageUrl: shareCardPath.value || tempFilePath.value,
}))
</script>

<style scoped>
.page-result {
  min-height: 100vh;
  background: #050010;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.result-showcase {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compare {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  position: relative;
}

.compare-label {
  font-size: 22rpx;
  color: #888;
}

.compare-img {
  border-radius: 16rpx;
}

.before .compare-img {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.6;
}

.after .compare-img {
  width: 340rpx;
  height: 340rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.15);
}

.compare-arrow {
  padding-bottom: 20rpx;
}

.arrow {
  font-size: 32rpx;
  color: #00d4ff;
  font-weight: 700;
}

.watermark-tag {
  display: none;
}

/* 历史记录模式：单图大图展示 */
.single-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  width: 100%;
}

.single-img {
  width: 560rpx;
  height: 560rpx;
  border-radius: 24rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.15);
}

.style-tag {
  border: 2rpx solid;
  border-radius: 30rpx;
  padding: 8rpx 28rpx;
}

.style-tag text {
  font-size: 24rpx;
  font-weight: 500;
}

.actions {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 28rpx;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
}

.action-card:active {
  background: rgba(255, 255, 255, 0.08);
}

.action-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon-wrap.done {
  background: rgba(0, 212, 255, 0.15);
}

.action-icon {
  font-size: 32rpx;
}

.action-info {
  flex: 1;
}

.action-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
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

/* 一键生成全部风格 */
.generate-all-section {
  padding: 0 32rpx;
  margin-bottom: 24rpx;
}

.action-card.highlight {
  background: rgba(108, 92, 231, 0.12);
  border: 1rpx solid rgba(108, 92, 231, 0.3);
}

.action-card.highlight:active {
  background: rgba(108, 92, 231, 0.2);
}

.highlight-arrow {
  color: #CF8BFF;
  font-weight: 700;
}

.save-share {
  padding: 0 32rpx;
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
  font-weight: 500;
}

.btn-save {
  background: linear-gradient(90deg, #9333EA 0%, #06B6D4 100%);
  color: #fff;
}

.btn-save.disabled {
  opacity: 0.5;
}

.btn-share {
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}
</style>
