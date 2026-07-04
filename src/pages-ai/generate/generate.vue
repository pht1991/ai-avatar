<template>
  <view class="page-generate">
    <!-- 漂浮粒子背景 -->
    <view class="particles">
      <view
        v-for="i in 10"
        :key="i"
        class="particle"
        :style="{
          left: `${20 + Math.random() * 710}rpx`,
          top: `${60 + Math.random() * 500}rpx`,
          animationDelay: `${Math.random() * 3}s`,
          backgroundColor: styleColor,
        }"
      />
    </view>

    <view class="generate-center">
      <!-- 主视觉 -->
      <view class="visual">
        <!-- A: 星轨 — 3 层同心轨道 -->
        <view class="orbit orbit-1" :style="{ borderColor: `rgba(${styleRgb}, 0.1)` }">
          <view class="orbit-dot" :style="{ backgroundColor: styleColor, boxShadow: `0 0 16rpx ${styleColor}` }" />
        </view>
        <view class="orbit orbit-2" :style="{ borderColor: `rgba(${styleRgb}, 0.08)`, borderStyle: 'dashed' }">
          <view class="orbit-dot orbit-dot-sm" :style="{ backgroundColor: styleColor, boxShadow: `0 0 12rpx ${styleColor}` }" />
        </view>
        <view class="orbit orbit-3" :style="{ borderColor: `rgba(${styleRgb}, 0.12)` }">
          <view class="orbit-dot orbit-dot-xs" :style="{ backgroundColor: styleColor, boxShadow: `0 0 10rpx ${styleColor}` }" />
        </view>

        <!-- C: 涡旋粒子 — 2 层反向旋转 -->
        <view class="vortex v-outer">
          <view
            v-for="(d, di) in vortexOuterDots"
            :key="'vo'+di"
            class="v-dot"
            :style="{ transform: d.transform, animationDelay: `${di*0.15}s`, backgroundColor: styleColor }"
          />
        </view>
        <view class="vortex v-inner">
          <view
            v-for="(d, di) in vortexInnerDots"
            :key="'vi'+di"
            class="v-dot v-dot-sub"
            :style="{ transform: d.transform, animationDelay: `${di*0.2}s`, backgroundColor: styleColor }"
          />
        </view>

        <!-- 中心图标 -->
        <view class="icon-wrap" :style="{ backgroundColor: `rgba(${styleRgb}, 0.12)`, borderColor: `rgba(${styleRgb}, 0.2)` }">
          <text class="icon">✨</text>
        </view>
      </view>

      <!-- 四步流程指示器 -->
      <view class="steps">
        <template v-for="(s, si) in stepsData" :key="si">
          <view
            class="step-item"
            :class="{ active: si === activeStep, done: si < activeStep }"
          >
            <view
              class="step-dot"
              :style="si <= activeStep ? { backgroundColor: styleColor, borderColor: styleColor } : {}"
            >
              <text v-if="si < activeStep" class="step-check">&#10003;</text>
              <text v-else class="step-num">{{ si + 1 }}</text>
            </view>
            <text class="step-label" :class="{ 'step-label-on': si <= activeStep }">{{ s.label }}</text>
          </view>
          <!-- 连线作为独立元素放在两个圆点之间 -->
          <view
            v-if="si < 3"
            class="step-connector"
            :class="{ 'step-connector-on': si < activeStep }"
            :style="si < activeStep ? { backgroundColor: styleColor } : {}"
          />
        </template>
      </view>

      <!-- 进度条 -->
      <view class="progress-wrap">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%', backgroundColor: styleColor }">
            <view class="progress-shimmer" />
          </view>
        </view>
      </view>

      <!-- 倒计时 -->
      <text class="countdown" v-if="countdown > 0">预计还需 {{ countdown }} 秒</text>
      <text class="countdown finish" v-else>即将完成!</text>

      <!-- 风格知识卡片 -->
      <view class="knowledge-card" :style="{ borderColor: `rgba(${styleRgb}, 0.15)`, backgroundColor: `rgba(${styleRgb}, 0.04)` }">
        <view class="knowledge-header">
          <text class="knowledge-tag" :style="{ color: styleColor }">{{ currentStyle?.name || '' }} · 小知识</text>
          <view class="knowledge-dots">
            <view
              v-for="(_, ki) in currentKnowledge"
              :key="ki"
              class="k-dot"
              :class="{ 'k-dot-on': ki === knowledgeIndex }"
              :style="ki === knowledgeIndex ? { backgroundColor: styleColor } : {}"
            />
          </view>
        </view>
        <text class="knowledge-text">{{ currentKnowledge[knowledgeIndex] }}</text>
      </view>
    </view>

    <!-- 失败重试 -->
    <view v-if="error" class="error-area">
      <text class="error-text">{{ error }}</text>
      <button class="btn-retry" @click="retry">重新生成</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getStyleById } from '@/config/styles.js'
import { useAppStore } from '@/store/index.js'
import { generateAvatar } from '@/api/siliconflow.js'
import { compressImage, imageToBase64, imgSecurityCheck } from '@/utils/image.js'

const store = useAppStore()

const progress = ref(0)
const error = ref('')

// ---- 等待增强：四步流程 + 倒计时 ----
const stepsData = [
  { label: '图片上传' },
  { label: 'AI分析' },
  { label: '风格融合' },
  { label: '渲染输出' },
]
const activeStep = ref(0)
const countdown = ref(20)

// ---- 等待增强：风格知识轮播 ----
const knowledgeIndex = ref(0)

const STYLE_KNOWLEDGE = {
  gufeng: [
    '古风风格灵感源自唐宋工笔画与传统水墨，强调留白与意境而非写实细节',
    '"古风"一词本指古代风俗习惯，现多指带有古典韵味的东方视觉风格',
  ],
  anime: [
    '日系动漫风格以夸张的大眼睛和丰富的表情变化闻名，头身比通常在1:3到1:6之间',
    '动漫角色设计遵循"可爱即正义"法则，高光瞳孔是萌系画风的灵魂所在',
  ],
  cyberpunk: [
    '赛博朋克由"cybernetics"与"punk"合成，描绘"高科技、低生活"的反乌托邦世界',
    '经典配色为霓虹紫+青蓝，灵感来自1982年《银翼杀手》的雨天都市视觉语言',
  ],
  oil: [
    '油画技法于15世纪由尼德兰画家凡·艾克兄弟完善，使画面拥有前所未有的细节与光泽',
    '一幅经典油画常需数十层薄涂叠加，莫奈的《睡莲》系列投入了人生最后30年',
  ],
  pixel: [
    '像素艺术诞生于1970年代8-bit电子游戏时代，受限于当时极小的显存容量',
    '每个像素点都需精心摆放——1个像素的偏移就能改变表情，被戏称为"像素级强迫症"',
  ],
  ukiyoe: [
    '"浮世绘"意为"描绘浮华世界的画"，起源于江户时代，是日本最具代表性的传统艺术之一',
    '葛饰北斋的《神奈川冲浪里》影响了梵高、莫奈等印象派大师的作品风格',
  ],
  vangogh: [
    '梵高一生创作超900幅油画，生前仅卖出1幅；他标志性的漩涡笔触可能源自其视觉感知异常',
    '《星月夜》中的螺旋星云与湍流物理模型的数学结构惊人吻合',
  ],
  disney: [
    '迪士尼风格的核心是"挤压与拉伸"——赋予角色橡胶般的弹性，让动画"活"起来',
    '迪士尼九大元老在1930年代制定了12条动画原则，至今仍是所有动画师的必修课',
  ],
  sketch: [
    '素描是一切造型艺术的基础，达芬奇一生留下超过13000页手稿，绝大多数是素描',
    '一支2B铅笔的灰度足以表现从高光到深影的全部层次，这就是"少即是多"的极致',
  ],
  vaporwave: [
    '蒸汽波诞生于2010年代网络社区，融合80年代消费文化和古希腊雕塑，是"数字废墟美学"',
    '粉色+青色的经典配色致敬Windows 95和迈阿密海滩的夏日黄昏',
  ],
  japanese: [
    '日系和风追求"侘寂"美学——在不对称、简素、自然中找到宁静的美',
    '和风设计中常见的红色(朱赤)象征生命力，常用于神社鸟居和传统漆器',
  ],
  cybergufeng: [
    '赛博古风是近年兴起的独特风格，将中国传统元素与未来科幻美学融合',
    '想象一下：飞檐斗拱上镌刻着霓虹灯管，汉服袖口露出机械关节——这就是赛博古风',
  ],
  watercolor: [
    '水彩画的魅力在于"水的偶然"——颜料在水中自由扩散，诞生无法复制的偶然之美',
    '水彩留白胶技法让画家能先保护高光区域，层层渲染后再揭开，层次感极为丰富',
  ],
  retro: [
    '复古胶片质感源自60-70年代柯达胶卷的偏暖色调和自然的颗粒噪点',
    '一张好的复古风格照片，色彩饱和度降低约30%并添加轻微黄调，就能"穿越回过去"',
  ],
  flat: [
    '扁平插画哲学来自包豪斯学派——功能高于形式，用最简的视觉语言传递最清晰的信息',
    'Google的Material Design和苹果iOS 7的扁平化，彻底终结了拟物化设计时代',
  ],
  q3d: [
    '3D Q版风格将三维渲染技术与卡通化"萌系"比例结合，角色可爱又不失立体感',
    'Q版一词来自"cute"的日语发音kyūto，缩写成Q，代表这种可爱夸张的造型风格',
  ],
  all: [
    'AI图像生成的本质是"去噪扩散"——从纯噪点一步步还原出清晰图像，每次迭代约50-100步',
    '一张AI生成的图像背后，模型需要计算数百万个参数的神经网络推理，这也是需要等待的原因',
  ],
}

const currentStyle = computed(() => getStyleById(store.selectedStyleId))

const styleColor = computed(() => currentStyle.value?.color || '#6c5ce7')

const styleRgb = computed(() => {
  const hex = styleColor.value.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
})

const currentKnowledge = computed(() => {
  const id = currentStyle.value?.id || 'all'
  return STYLE_KNOWLEDGE[id] || STYLE_KNOWLEDGE.all
})

// 涡旋粒子预计算位置
function vPos(count, index, radius) {
  const angle = (360 / count) * index
  return `rotate(${angle}deg) translateY(-${radius}rpx)`
}

const vortexOuterDots = Array.from({ length: 8 }, (_, i) => ({
  transform: vPos(8, i, 105),
}))

const vortexInnerDots = Array.from({ length: 6 }, (_, i) => ({
  transform: vPos(6, i, 80),
}))

let progressTimer = null
let realProgress = 0

function startFakeProgress() {
  realProgress = 0
  progress.value = 0
  progressTimer = setInterval(() => {
    const inc = realProgress < 35 ? 1.5 : realProgress < 60 ? 0.5 : realProgress < 80 ? 0.25 : 0.12
    realProgress = Math.min(94, realProgress + inc)
    progress.value = Math.floor(realProgress)
  }, 100)
}

function stopFakeProgress() {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
  progress.value = 100
}

// ---- 等待增强：步骤推进 + 倒计时 + 知识轮播 ----
let stepTimer = null
let countdownTimer = null
let knowledgeTimer = null

function startWaitEnhancements() {
  // 重置状态
  activeStep.value = 0
  countdown.value = 20
  knowledgeIndex.value = 0

  // 倒计时：每秒减1
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
  }, 1000)

  // 步骤推进：每5秒点亮下一步
  stepTimer = setInterval(() => {
    if (activeStep.value < 3) {
      activeStep.value++
    }
  }, 5000)

  // 知识轮播：每5秒切换一条，与步骤同步
  knowledgeTimer = setInterval(() => {
    const tips = currentKnowledge.value
    if (tips.length > 1) {
      knowledgeIndex.value = (knowledgeIndex.value + 1) % tips.length
    }
  }, 5000)
}

function stopWaitEnhancements() {
  if (stepTimer) { clearInterval(stepTimer); stepTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
  if (knowledgeTimer) { clearInterval(knowledgeTimer); knowledgeTimer = null }
}

async function doGenerate() {
  try {
    console.log('[generate] v3 方案D已加载 — 四步流程 + 倒计时 + 知识轮播')
    startFakeProgress()
    startWaitEnhancements()
    const compressedPath = await compressImage(store.uploadedImagePath, 512)
    await imgSecurityCheck(compressedPath)
    const base64 = await imageToBase64(compressedPath)
    const style = currentStyle.value
    const prompt = `将这张照片中的人物转换为${style.name}风格。${style.description}。必须保留原人物的面部特征、性别和年龄。`
    const result = await generateAvatar(prompt, null, base64)
    stopFakeProgress()
    stopWaitEnhancements()
    store.finishGeneration(result)
    uni.redirectTo({ url: '/pages-ai/result/result' })
  } catch (err) {
    stopFakeProgress()
    stopWaitEnhancements()
    store.failGeneration()
    error.value = err.message || '生成失败，请检查网络后重试'
  }
}

function retry() {
  error.value = ''
  doGenerate()
}

onMounted(() => {
  if (!store.uploadedImagePath) {
    uni.showToast({ title: '请先选择照片', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }
  doGenerate()
})

onUnmounted(() => {
  stopFakeProgress()
  stopWaitEnhancements()
})
</script>

<style scoped>
.page-generate {
  min-height: 100vh;
  background: #050010;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  position: relative;
  overflow: hidden;
}

.generate-center {
  width: 100%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  position: relative;
  z-index: 2;
}

/* ---- 漂浮粒子背景 ---- */
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 750rpx;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  opacity: 0;
  animation: float-up 4s ease-in-out infinite;
}

@keyframes float-up {
  0% { opacity: 0; transform: translateY(0) scale(0); }
  20% { opacity: 0.5; }
  100% { opacity: 0; transform: translateY(-700rpx) scale(2); }
}

/* ---- 主视觉容器 ---- */
.visual {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- A: 星轨 ---- */
.orbit {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid;
}

.orbit-1 { width: 360rpx; height: 360rpx; animation: orbit-spin 12s linear infinite; }
.orbit-2 { width: 280rpx; height: 280rpx; animation: orbit-spin 8s linear infinite reverse; }
.orbit-3 { width: 200rpx; height: 200rpx; animation: orbit-spin 5s linear infinite; }

.orbit-dot {
  position: absolute;
  top: -7rpx;
  left: 50%;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  margin-left: -7rpx;
}
.orbit-dot-sm { width: 10rpx; height: 10rpx; top: -5rpx; margin-left: -5rpx; }
.orbit-dot-xs { width: 8rpx; height: 8rpx; top: -4rpx; margin-left: -4rpx; }

@keyframes orbit-spin {
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
}

/* ---- C: 涡旋粒子 ---- */
.vortex {
  position: absolute;
  border-radius: 50%;
}

.v-outer { width: 260rpx; height: 260rpx; animation: orbit-spin 4s linear infinite; }
.v-inner { width: 180rpx; height: 180rpx; animation: orbit-spin 2.5s linear infinite reverse; }

.v-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  margin: -4rpx 0 0 -4rpx;
  opacity: 0;
  animation: vortex-pulse 2s ease-in-out infinite;
}

.v-dot-sub {
  width: 5rpx;
  height: 5rpx;
  margin: -2rpx 0 0 -2rpx;
  animation-duration: 1.5s;
}

@keyframes vortex-pulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 1; }
}

/* ---- 中心图标 ---- */
.icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border: 1rpx solid;
}

.icon {
  font-size: 40rpx;
  animation: bounce 1.2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

/* ---- 四步流程指示器 ---- */
.steps {
  width: 100%;
  max-width: 520rpx;
  display: flex;
  align-items: center;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.step-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  margin-bottom: 8rpx;
  position: relative;
  z-index: 2;
}

.step-item.active .step-dot {
  animation: step-glow 1.5s ease-in-out infinite;
}

.step-item.done .step-dot {
  opacity: 0.55;
}

.step-check {
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
}

.step-num {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

.step-item.active .step-num {
  color: #fff;
}

.step-label {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.4s ease;
}

.step-label-on {
  color: rgba(255, 255, 255, 0.55);
}

.step-connector {
  flex: 1;
  min-width: 16rpx;
  height: 2rpx;
  align-self: center;
  margin-top: -14rpx;
  background: rgba(255, 255, 255, 0.06);
  transition: background 0.4s ease;
}

.step-connector-on {
  background: inherit;
}

@keyframes step-glow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* ---- 进度条 ---- */
.progress-wrap { width: 100%; max-width: 520rpx; }

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4rpx;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 4rpx;
  width: 0%;
  transition: width 0.2s linear;
  position: relative;
  overflow: hidden;
}

.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* ---- 倒计时 ---- */
.countdown {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  letter-spacing: 2rpx;
  transition: color 0.3s ease;
}

.countdown.finish {
  color: rgba(255, 255, 255, 0.55);
  animation: count-bounce 0.6s ease-in-out;
}

@keyframes count-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* ---- 风格知识卡片 ---- */
.knowledge-card {
  width: 100%;
  max-width: 520rpx;
  border-radius: 16rpx;
  border: 1rpx solid;
  padding: 24rpx 28rpx;
  transition: opacity 0.4s ease;
}

.knowledge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.knowledge-tag {
  font-size: 20rpx;
  font-weight: 500;
}

.knowledge-dots {
  display: flex;
  gap: 6rpx;
}

.k-dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;
}

.knowledge-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
}

/* ---- 错误 ---- */
.error-area {
  position: fixed;
  bottom: 200rpx;
  left: 40rpx;
  right: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  z-index: 20;
}

.error-text {
  font-size: 26rpx;
  color: #ff6b6b;
  text-align: center;
}

.btn-retry {
  width: 280rpx;
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
</style>
