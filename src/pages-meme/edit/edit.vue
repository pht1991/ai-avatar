<template>
  <PageFrame mode="flex">
    <!-- 画布区域 -->
    <view class="canvas-wrap">
      <canvas
        type="2d"
        id="meme-canvas"
        class="meme-canvas"
        :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      />
    </view>

    <!-- 文字列表 -->
    <view class="text-list" v-if="textItems.length > 0">
      <view
        v-for="(item, idx) in textItems"
        :key="idx"
        class="text-item"
        :class="{ active: activeIdx === idx }"
        @click="selectText(idx)"
      >
        <!-- 编辑态：input -->
        <input
          v-if="editingIdx === idx"
          class="ti-input"
          :value="item.text"
          @input="e => onEditInput(e, idx)"
          @blur="onEditBlur(idx)"
          @confirm="onEditBlur(idx)"
          :focus="true"
          :hold-keyboard="true"
        />
        <!-- 展示态：纯文字 -->
        <text v-else class="ti-content">{{ item.text || '文字' }}</text>
        <view class="ti-actions">
          <text class="ti-btn" @click.stop="editText(idx)">✎</text>
          <text class="ti-btn ti-del" @click.stop="removeText(idx)">✕</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <template #footer>
    <view class="bottom-bar">
      <view class="bb-btn" @click="addText">
        <text class="bb-icon">T</text>
        <text class="bb-label">加文字</text>
      </view>
      <view class="bb-btn" @click="changeColor">
        <view class="bb-color" :style="{ background: currentColor }" />
        <text class="bb-label">颜色</text>
      </view>
      <view class="bb-btn" @click="toggleStroke">
        <text class="bb-icon">{{ hasStroke ? '☑' : '☐' }}</text>
        <text class="bb-label">描边</text>
      </view>
      <view class="bb-btn" @click="changeSize(-2)">
        <text class="bb-icon">A-</text>
        <text class="bb-label">缩小</text>
      </view>
      <view class="bb-btn" @click="changeSize(2)">
        <text class="bb-icon">A+</text>
        <text class="bb-label">放大</text>
      </view>
      <view class="bb-btn bb-export" @click="exportMeme">
        <text class="bb-icon">↗</text>
        <text class="bb-label">导出</text>
      </view>
    </view>
    </template>

  </PageFrame>

  <!-- 导出格式选择（根级 cover-view，覆盖原生 Canvas） -->
  <cover-view v-if="showExport" class="editor-overlay" @click.self="showExport = false">
    <cover-view class="editor-card">
      <cover-view class="ec-title-wrap">
        <cover-view class="ec-title">选择导出格式</cover-view>
      </cover-view>
      <cover-view class="format-options">
        <cover-view class="fmt-opt" @click="doExport('jpg')">
          <cover-view class="fmt-name">JPG</cover-view>
          <cover-view class="fmt-desc">体积小，适合分享</cover-view>
        </cover-view>
        <cover-view class="fmt-opt" @click="doExport('png')">
          <cover-view class="fmt-name">PNG</cover-view>
          <cover-view class="fmt-desc">无损质量，支持透明</cover-view>
        </cover-view>
        <cover-view class="fmt-opt" @click="doExport('gif')">
          <cover-view class="fmt-name">GIF</cover-view>
          <cover-view class="fmt-desc">逐帧动画，每条文字一帧</cover-view>
        </cover-view>
      </cover-view>
      <cover-view class="ec-btn cancel" @click="showExport = false" style="margin-top:20rpx">取消</cover-view>
    </cover-view>
  </cover-view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageFrame from '@/components/page-frame.vue'
import { encode as encodeGif, saveToFile as saveGifFile } from '../../utils/gif-encoder.js'

/* ===================== 状态 ===================== */
const textItems = ref([])   // { text, x, y, fontSize, color, stroke, strokeColor }
const activeIdx = ref(-1)
const currentColor = ref('#FFFFFF')
const hasStroke = ref(false)
const editingIdx = ref(-1)  // 当前内联编辑的文字索引
const editIdx = ref(-1)     // 保留兼容
const showExport = ref(false)
const pageQuery = ref({})   // 存储页面参数

const canvasW = ref(300)
const canvasH = ref(300)
let canvas = null
let ctx = null
let dpr = 1
let bgImage = null
let canvasRect = null   // 缓存 canvas 位置
let touchItemIdx = -1
let touchOffsetX = 0
let touchOffsetY = 0
let lastTapTime = 0
let lastTapIdx = -1
let touchStartX = 0
let touchStartY = 0
let hasMoved = false

/* ===================== 模板绘制数据 ===================== */
const templateDraws = {
  panda: {
    label: '熊猫头', bgColor: '#F5F0E8', faceColor: '#E8DCC8',
    draw: (ctx, cx, cy, size) => {
      // 熊猫头轮廓（圆脸 + 黑眼圈 + 小耳朵）
      const r = size * 0.35
      // 耳朵
      ctx.fillStyle = '#333'
      ctx.beginPath(); ctx.arc(cx - r * 0.85, cy - r * 0.75, r * 0.32, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.85, cy - r * 0.75, r * 0.32, 0, Math.PI * 2); ctx.fill()
      // 脸
      ctx.fillStyle = '#F5EDE0'
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.05, r, 0, Math.PI * 2); ctx.fill()
      // 黑眼圈
      ctx.fillStyle = '#222'
      ctx.beginPath()
      ctx.ellipse(cx - r * 0.38, cy - r * 0.05, r * 0.26, r * 0.22, -0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx + r * 0.38, cy - r * 0.05, r * 0.26, r * 0.22, 0.15, 0, Math.PI * 2)
      ctx.fill()
      // 眼白
      ctx.fillStyle = '#FFF'
      ctx.beginPath(); ctx.ellipse(cx - r * 0.36, cy - r * 0.03, r * 0.14, r * 0.12, -0.1, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + r * 0.36, cy - r * 0.03, r * 0.14, r * 0.12, 0.1, 0, Math.PI * 2); ctx.fill()
      // 瞳孔
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(cx - r * 0.34, cy - r * 0.02, r * 0.06, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.34, cy - r * 0.02, r * 0.06, 0, Math.PI * 2); ctx.fill()
      // 鼻子
      ctx.fillStyle = '#333'
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.25, r * 0.12, r * 0.08, 0, 0, Math.PI * 2); ctx.fill()
      // 嘴（微笑线）
      ctx.strokeStyle = '#555'; ctx.lineWidth = r * 0.03; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.22, r * 0.18, 0.15, Math.PI - 0.4); ctx.stroke()
    },
  },
  golden: {
    label: '金馆长', bgColor: '#FFF3E0', faceColor: '#FFDDBB',
    draw: (ctx, cx, cy, size) => {
      // 金馆长经典笑脸脸
      const r = size * 0.33
      // 头型（略方）
      ctx.fillStyle = '#FFE0BD'
      roundRect(ctx, cx - r, cy - r * 0.9, r * 2, r * 1.9, r * 0.25)
      ctx.fill()
      // 头发
      ctx.fillStyle = '#111'
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.75, r * 0.7, Math.PI, 0); ctx.fill()
      // 眉毛（粗黑上扬）
      ctx.strokeStyle = '#000'; ctx.lineWidth = r * 0.05; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.6, cy - r * 0.25); ctx.lineTo(cx - r * 0.15, cy - r * 0.4); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.6, cy - r * 0.25); ctx.lineTo(cx + r * 0.15, cy - r * 0.4); ctx.stroke()
      // 眼睛（眯眼笑）
      ctx.lineWidth = r * 0.04
      ctx.beginPath(); ctx.moveTo(cx - r * 0.45, cy - r * 0.05); ctx.quadraticCurveTo(cx - r * 0.25, cy + r * 0.08, cx - r * 0.08, cy - r * 0.02); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.45, cy - r * 0.05); ctx.quadraticCurveTo(cx + r * 0.25, cy + r * 0.08, cx + r * 0.08, cy - r * 0.02); ctx.stroke()
      // 大嘴巴（张嘴笑）
      ctx.fillStyle = '#333'
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.42, r * 0.28, 0, Math.PI); ctx.fill()
      // 牙齿
      ctx.fillStyle = '#FFF'; ctx.fillRect(cx - r * 0.18, cy + r * 0.28, r * 0.36, r * 0.13)
    },
  },
  doge: {
    label: 'Doge', bgColor: '#F5F0E0', faceColor: '#E8C86A',
    draw: (ctx, cx, cy, size) => {
      // Doge / Shiba Inu
      const r = size * 0.32
      // 耳朵（三角）
      ctx.fillStyle = '#DAA520'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.65, cy - r * 0.5); ctx.lineTo(cx - r * 0.35, cy - r * 1.05); ctx.lineTo(cx - r * 0.15, cy - r * 0.55); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.65, cy - r * 0.5); ctx.lineTo(cx + r * 0.35, cy - r * 1.05); ctx.lineTo(cx + r * 0.15, cy - r * 0.55); ctx.fill()
      // 脸
      ctx.fillStyle = '#EDC967'
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.05, r * 0.95, r * 0.88, 0, 0, Math.PI * 2); ctx.fill()
      // 白色面部区域
      ctx.fillStyle = '#FAEBD7'
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.18, r * 0.62, r * 0.58, 0, 0, Math.PI * 2); ctx.fill()
      // 眼睛（大圆点，侧视感）
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(cx - r * 0.25, cy - r * 0.05, r * 0.11, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.25, cy - r * 0.05, r * 0.11, 0, Math.PI * 2); ctx.fill()
      // 高光
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(cx - r * 0.23, cy - r * 0.08, r * 0.04, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.23, cy - r * 0.08, r * 0.04, 0, Math.PI * 2); ctx.fill()
      // 嘴巴/鼻子
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.22, r * 0.09, r * 0.07, 0, 0, Math.PI * 2); ctx.fill()
      // 微笑
      ctx.strokeStyle = '#888'; ctx.lineWidth = r * 0.025; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.12, cy + r * 0.35); ctx.quadraticCurveTo(cx, cy + r * 0.44, cx + r * 0.12, cy + r * 0.35); ctx.stroke()
    },
  },
  blur: {
    label: '模糊图', bgColor: '#EEE8DD', faceColor: '#CCC0B0',
    blur: true,
    draw: (ctx, cx, cy, size) => {
      // 模糊效果的人形剪影
      const r = size * 0.3
      ctx.fillStyle = '#999'
      // 头
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.2, r * 0.5, 0, Math.PI * 2); ctx.fill()
      // 身体
      ctx.fillRect(cx - r * 0.6, cy + r * 0.2, r * 1.2, r * 0.9)
      // 问号
      ctx.font = `bold ${r}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('?', cx + r * 0.7, cy - r * 0.5)
    },
  },
  spongebob: {
    label: '海绵宝宝', bgColor: '#FFFBE6', faceColor: '#FCD000',
    draw: (ctx, cx, cy, size) => {
      // 海绵宝宝（方形黄脸）
      const r = size * 0.3
      const w = r * 1.7, h = r * 2
      // 身体
      ctx.fillStyle = '#FCD000'
      roundRect(ctx, cx - w / 2, cy - h * 0.48, w, h, r * 0.15)
      ctx.fill()
      // 孔（波点纹理）
      ctx.fillStyle = '#B8860B'
      for (let i = 0; i < 10; i++) {
        const ax = cx - w * 0.35 + (i % 3) * w * 0.32
        const ay = cy - h * 0.35 + Math.floor(i / 3) * h * 0.32
        if (Math.abs(ax - cx) > r * 0.2 || Math.abs(ay - cy) > r * 0.15) {
          ctx.beginPath(); ctx.arc(ax, ay, r * 0.06, 0, Math.PI * 2); ctx.fill()
        }
      }
      // 大眼睛
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(cx - r * 0.3, cy - r * 0.12, r * 0.28, r * 0.32, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + r * 0.3, cy - r * 0.12, r * 0.28, r * 0.32, 0, 0, Math.PI * 2); ctx.fill()
      // 瞳孔
      ctx.fillStyle = '#005AB5'
      ctx.beginPath(); ctx.ellipse(cx - r * 0.28, cy - r * 0.08, r * 0.1, r * 0.14, -0.1, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + r * 0.28, cy - r * 0.08, r * 0.1, r * 0.14, 0.1, 0, Math.PI * 2); ctx.fill()
      // 高光
      ctx.fillStyle = '#FFF'
      ctx.beginPath(); ctx.arc(cx - r * 0.24, cy - r * 0.16, r * 0.04, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.32, cy - r * 0.16, r * 0.04, 0, Math.PI * 2); ctx.fill()
      // 龅牙大嘴
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.52, r * 0.35, r * 0.22, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#FFF'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.18, cy + r * 0.4); ctx.lineTo(cx - r * 0.08, cy + r * 0.64); ctx.lineTo(cx + r * 0.04, cy + r * 0.4); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.18, cy + r * 0.4); ctx.lineTo(cx + r * 0.08, cy + r * 0.64); ctx.lineTo(cx - r * 0.04, cy + r * 0.4); ctx.fill()
      // 腮红
      ctx.fillStyle = 'rgba(255,100,100,0.35)'
      ctx.beginPath(); ctx.ellipse(cx - r * 0.55, cy + r * 0.15, r * 0.12, r * 0.08, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + r * 0.55, cy + r * 0.15, r * 0.12, r * 0.08, 0, 0, Math.PI * 2); ctx.fill()
    },
  },
  pepe: {
    label: 'Pepe', bgColor: '#E8F5E0', faceColor: '#90C070',
    draw: (ctx, cx, cy, size) => {
      // Pepe the frog
      const r = size * 0.3
      // 头型（宽扁椭圆）
      ctx.fillStyle = '#8BC34A'
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.1, r * 0.85, 0, 0, Math.PI * 2); ctx.fill()
      // 额头凸起
      ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.55, r * 0.45, r * 0.3, 0, 0, Math.PI * 2); ctx.fill()
      // 眼睛（突出的大眼睛，不同大小）
      ctx.fillStyle = '#FFF'
      ctx.beginPath(); ctx.ellipse(cx - r * 0.32, cy - r * 0.12, r * 0.28, r * 0.24, -0.15, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx + r * 0.32, cy - r * 0.12, r * 0.24, r * 0.20, 0.15, 0, Math.PI * 2); ctx.fill()
      // 瞳孔（看向不同方向）
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(cx - r * 0.27, cy - r * 0.1, r * 0.08, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.37, cy - r * 0.14, r * 0.07, 0, Math.PI * 2); ctx.fill()
      // 嘴唇
      ctx.fillStyle = '#558B2F'
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.42, r * 0.3, r * 0.15, 0, 0, Math.PI); ctx.fill()
    },
  },
  distracted: {
    label: '分心男', bgColor: '#FFF5E6', faceColor: '#FFD0A0',
    draw: (ctx, cx, cy, size) => {
      // 分心男（红衣女背景 + 回头男）- 简化版
      const r = size * 0.28
      // 背景：红衣女性（简化色块）
      ctx.fillStyle = '#E57373' // 红衣
      ctx.beginPath(); ctx.arc(cx + r * 0.5, cy, r * 0.55, 0, Math.PI * 2); ctx.fill() // 身体区域
      ctx.fillStyle = '#FFCC80' // 女脸
      ctx.beginPath(); ctx.arc(cx + r * 0.5, cy - r * 0.3, r * 0.35, 0, Math.PI * 2); ctx.fill()
      // 前景：分心男（蓝衬衫）
      ctx.fillStyle = '#1565C0' // 蓝衬衫
      roundRect(ctx, cx - r * 1.0, cy + r * 0.1, r * 1.4, r * 1.0, r * 0.1)
      ctx.fill()
      ctx.fillStyle = '#FFDAB9' // 男脸
      ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.1, r * 0.38, 0, Math.PI * 2); ctx.fill()
      // 男人的眼睛（看向右边=看女生）
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(cx - r * 0.22, cy - r * 0.15, r * 0.05, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - r * 0.5, cy - r * 0.15, r * 0.05, 0, Math.PI * 2); ctx.fill()
      // 女生的眼睛
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(cx + r * 0.4, cy - r * 0.4, r * 0.04, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.6, cy - r * 0.4, r * 0.04, 0, Math.PI * 2); ctx.fill()
    },
  },
  button: {
    label: '按钮猫', bgColor: '#FCE4EC', faceColor: '#F8BBD0',
    draw: (ctx, cx, cy, size) => {
      // 按钮猫（圆形猫头像）
      const r = size * 0.32
      // 外圈（按钮边框）
      ctx.fillStyle = '#F06292'
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      // 内脸
      ctx.fillStyle = '#FFF0F5'
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.fill()
      // 耳朵
      ctx.fillStyle = '#F06292'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.72, cy - r * 0.5); ctx.lineTo(cx - r * 0.45, cy - r * 1.05); ctx.lineTo(cx - r * 0.18, cy - r * 0.55); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.72, cy - r * 0.5); ctx.lineTo(cx + r * 0.45, cy - r * 1.05); ctx.lineTo(cx + r * 0.18, cy - r * 0.55); ctx.fill()
      // 内耳
      ctx.fillStyle = '#F8BBD0'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.63, cy - r * 0.5); ctx.lineTo(cx - r * 0.45, cy - r * 0.9); ctx.lineTo(cx - r * 0.26, cy - r * 0.53); ctx.fill()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.63, cy - r * 0.5); ctx.lineTo(cx + r * 0.45, cy - r * 0.9); ctx.lineTo(cx + r * 0.26, cy - r * 0.53); ctx.fill()
      // 眼睛（大圆）
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(cx - r * 0.26, cy - r * 0.05, r * 0.1, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.26, cy - r * 0.05, r * 0.1, 0, Math.PI * 2); ctx.fill()
      // 高光
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(cx - r * 0.23, cy - r * 0.09, r * 0.03, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + r * 0.29, cy - r * 0.09, r * 0.03, 0, Math.PI * 2); ctx.fill()
      // 鼻子小三角
      ctx.fillStyle = '#E91E63'
      ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.1); ctx.lineTo(cx - r * 0.07, cy + r * 0.2); ctx.lineTo(cx + r * 0.07, cy + r * 0.2); ctx.fill()
      // 嘴巴 w 形
      ctx.strokeStyle = '#666'; ctx.lineWidth = r * 0.025; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(cx - r * 0.12, cy + r * 0.3); ctx.quadraticCurveTo(cx - r * 0.06, cy + r * 0.38, cx, cy + r * 0.32); ctx.quadraticCurveTo(cx + r * 0.06, cy + r * 0.38, cx + r * 0.12, cy + r * 0.3); ctx.stroke()
      // 胡须
      ctx.strokeStyle = '#BBB'; ctx.lineWidth = r * 0.02
      ctx.beginPath(); ctx.moveTo(cx - r * 0.15, cy + r * 0.22); ctx.lineTo(cx - r * 0.5, cy + r * 0.12); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx - r * 0.15, cy + r * 0.28); ctx.lineTo(cx - r * 0.5, cy + r * 0.32); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.15, cy + r * 0.22); ctx.lineTo(cx + r * 0.5, cy + r * 0.12); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + r * 0.15, cy + r * 0.28); ctx.lineTo(cx + r * 0.5, cy + r * 0.32); ctx.stroke()
    },
  },
}

// 颜色列表
const colorList = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#8800FF']

/* ===================== 生命周期 ===================== */
onLoad((query) => {
  pageQuery.value = query || {}
  const sys = uni.getSystemInfoSync()
  dpr = sys.pixelRatio || 2
  canvasW.value = sys.windowWidth
  canvasH.value = sys.windowWidth

  nextTick(() => {
    initCanvas()
  })
})

/* ===================== Canvas 初始化 ===================== */
function initCanvas() {
  const query = uni.createSelectorQuery()
  query.select('#meme-canvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0]) return
      canvas = res[0].node
      ctx = canvas.getContext('2d')
      canvas.width = canvasW.value * dpr
      canvas.height = canvasH.value * dpr
      ctx.scale(dpr, dpr)
      // canvas 就绪后再加载背景，确保 createImage 可用
      loadBackground()
    })
}

/* ===================== 加载背景 ===================== */
function loadBackground() {
  const query = pageQuery.value

  if (query.tpl && query.tpl !== 'custom') {
    // 内置模板
    loadCustomImage()
  } else if (query.image) {
    // 用户自定义图片
    const path = decodeURIComponent(query.image)
    uni.getImageInfo({
      src: path,
      success(imgRes) {
        bgImage = canvas.createImage()
        bgImage.onload = () => {
          render()
        }
        bgImage.onerror = () => {
          console.error('Meme image load failed')
          uni.showToast({ title: '图片加载失败', icon: 'none' })
        }
        bgImage.src = imgRes.path
      },
      fail() {
        console.error('getImageInfo failed')
        uni.showToast({ title: '无法读取图片', icon: 'none' })
        render()
      },
    })
  } else {
    // 无参数，直接渲染默认背景
    render()
  }
}

function loadCustomImage() {
  // 模板模式：用纯色背景，文字由 render 绘制
  render()
}

/* ===================== 辅助函数 ===================== */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/* ===================== 渲染 ===================== */
function render() {
  if (!ctx) return
  const w = canvasW.value
  const h = canvasH.value

  // 清空
  ctx.clearRect(0, 0, w, h)

  // 背景色
  const query = pageQuery.value
  const bgMap = {
    panda: '#FFF8E1', golden: '#E8F5E9', doge: '#E3F2FD',
    blur: '#F3E5F5', spongebob: '#FFF9C4', pepe: '#E8F5E9',
    distracted: '#FFF3E0', button: '#FCE4EC',
  }
  const tplId = query.tpl
  const bgColor = (tplId && bgMap[tplId]) ? bgMap[tplId] : '#F5F5F5'
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)

  // 背景图（自定义图片模式）
  if (bgImage) {
    const imgW = bgImage.width
    const imgH = bgImage.height
    const scale = Math.max(w / imgW, h / imgH)
    const drawW = imgW * scale
    const drawH = imgH * scale
    ctx.drawImage(bgImage, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH)
  }

  // 绘制模板内容（内置模板）
  if (tplId && templateDraws[tplId] && !bgImage) {
    const tpl = templateDraws[tplId]
    const cx = w / 2
    const cy = h / 2

    // 模糊效果（整画布模糊）
    if (tpl.blur) {
      ctx.filter = 'blur(4px)'
    }

    // 背景
    ctx.fillStyle = tpl.bgColor || '#F5F5F5'
    ctx.fillRect(0, 0, w, h)

    // 调用模板自定义绘制函数
    if (typeof tpl.draw === 'function') {
      tpl.draw(ctx, cx, cy, Math.min(w, h))
    } else {
      // fallback: 简单圆形
      const faceR = Math.min(w, h) * 0.28
      ctx.beginPath(); ctx.arc(cx, cy, faceR, 0, Math.PI * 2)
      ctx.fillStyle = tpl.faceColor || '#FFF'; ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2; ctx.stroke()

      ctx.font = `${Math.round(faceR * 0.6)}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000'; ctx.fillText(tpl.label, cx, cy)
    }

    ctx.filter = 'none'

    // 底部提示
    const hintSize = Math.max(12, Math.round(w * 0.038))
    ctx.font = `${hintSize}px sans-serif`
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillText('点击下方「加文字」开始制作', cx, h - 20)
  }

  // 绘制文字
  textItems.value.forEach((item, idx) => {
    ctx.save()
    ctx.font = `bold ${item.fontSize || 32}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 描边
    if (item.stroke !== false) {
      ctx.strokeStyle = item.strokeColor || '#000000'
      ctx.lineWidth = (item.fontSize || 32) * 0.12
      ctx.lineJoin = 'round'
      ctx.strokeText(item.text, item.x, item.y)
    }

    // 填充
    ctx.fillStyle = item.color || '#FFFFFF'
    ctx.fillText(item.text, item.x, item.y)
    ctx.restore()
  })
}

/* ===================== 触摸事件 ===================== */
function getCanvasRect() {
  return new Promise((resolve) => {
    uni.createSelectorQuery().select('#meme-canvas').boundingClientRect((rect) => {
      canvasRect = rect
      resolve(rect)
    }).exec()
  })
}

async function onTouchStart(e) {
  // 每次触摸前刷新 canvas 位置，防止布局变化后坐标偏移
  await getCanvasRect()
  const touch = e.touches[0]
  const x = touch.clientX - canvasRect.left
  const y = touch.clientY - canvasRect.top
  touchStartX = x
  touchStartY = y
  hasMoved = false

  // 从后往前找，后绘制的在上层
  for (let i = textItems.value.length - 1; i >= 0; i--) {
    const item = textItems.value[i]
    // 用 ctx.measureText 精确测量文字宽度，而非粗略估算
    ctx.font = `bold ${item.fontSize || 32}px sans-serif`
    const metrics = ctx.measureText(item.text)
    const tw = metrics.width
    const th = item.fontSize || 32
    if (Math.abs(x - item.x) < tw / 2 + 16 && Math.abs(y - item.y) < th / 2 + 16) {
      touchItemIdx = i
      touchOffsetX = x - item.x
      touchOffsetY = y - item.y
      activeIdx.value = i
      render()
      return
    }
  }
  touchItemIdx = -1
}

async function onTouchMove(e) {
  if (touchItemIdx < 0) return
  if (!canvasRect) await getCanvasRect()
  const touch = e.touches[0]
  const x = touch.clientX - canvasRect.left
  const y = touch.clientY - canvasRect.top

  // 判断是否移动了超过阈值
  if (!hasMoved) {
    const dx = x - touchStartX
    const dy = y - touchStartY
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      hasMoved = true
    }
  }

  textItems.value[touchItemIdx].x = x - touchOffsetX
  textItems.value[touchItemIdx].y = y - touchOffsetY
  render()
}

function onTouchEnd() {
  touchItemIdx = -1
  hasMoved = false
}

/* ===================== 文字操作 ===================== */
function addText() {
  const newIdx = textItems.value.length
  textItems.value.push({
    text: '文字',
    x: canvasW.value / 2,
    y: canvasH.value / 2,
    fontSize: 32,
    color: currentColor.value,
    stroke: hasStroke.value,
    strokeColor: '#000000',
  })
  activeIdx.value = newIdx
  render()
  // 添加后立即弹出编辑框，方便用户输入内容
  editText(newIdx)
}

function selectText(idx) {
  activeIdx.value = idx
  render()
}

function editText(idx) {
  editingIdx.value = idx
  editIdx.value = idx
  activeIdx.value = idx
}

function onEditInput(e, idx) {
  // 实时更新文字内容并重绘
  textItems.value[idx].text = e.detail.value
  render()
}

function onEditBlur(idx) {
  // 失焦保存，空内容给默认值
  const item = textItems.value[idx]
  if (!item.text || item.text.trim() === '') {
    item.text = '文字'
  }
  // 只在当前仍是该条目编辑态时才清除（防止切换条目时覆盖新状态）
  if (editingIdx.value === idx) {
    editingIdx.value = -1
  }
  render()
}

function removeText(idx) {
  if (editingIdx.value === idx) {
    editingIdx.value = -1
  }
  textItems.value.splice(idx, 1)
  if (activeIdx.value >= textItems.value.length) {
    activeIdx.value = textItems.value.length - 1
  }
  render()
}

/* ===================== 样式操作 ===================== */
function changeColor() {
  const idx = colorList.indexOf(currentColor.value)
  currentColor.value = colorList[(idx + 1) % colorList.length]
  if (activeIdx.value >= 0) {
    textItems.value[activeIdx.value].color = currentColor.value
    render()
  }
}

function toggleStroke() {
  hasStroke.value = !hasStroke.value
  if (activeIdx.value >= 0) {
    textItems.value[activeIdx.value].stroke = hasStroke.value
    render()
  }
}

function changeSize(delta) {
  if (activeIdx.value < 0) return
  const item = textItems.value[activeIdx.value]
  item.fontSize = Math.max(16, Math.min(80, (item.fontSize || 32) + delta))
  render()
}

/* ===================== 导出 ===================== */
function exportMeme() {
  if (textItems.value.length === 0) {
    uni.showToast({ title: '请先添加文字', icon: 'none' })
    return
  }
  showExport.value = true
}

function doExport(format) {
  showExport.value = false

  if (format === 'gif') {
    doExportGif()
  } else {
    doExportImage(format)
  }
}

/** 静态图导出 (PNG/JPG) */
function doExportImage(format) {
  uni.showLoading({ title: '导出中...' })
  const fileType = format === 'jpg' ? 'jpg' : 'png'
  uni.canvasToTempFilePath({
    canvas: canvas,
    fileType: fileType,
    quality: 0.9,
    success(res) {
      uni.hideLoading()
      saveToAlbum(res.tempFilePath)
    },
    fail() {
      uni.hideLoading()
      uni.showToast({ title: '导出失败', icon: 'none' })
    },
  })
}

/** GIF 动图导出: 每个文字条目 = 一帧 */
async function doExportGif() {
  uni.showLoading({ title: '渲染帧...' })
  const w = canvasW.value
  const h = canvasH.value
  const items = textItems.value

  try {
    // 逐帧渲染 + 获取 ImageData
    const frames = []
    for (let i = 0; i < items.length; i++) {
      renderSingleFrame(items[i], i)
      await sleep(100)
      const imageData = ctx.getImageData(0, 0, w, h)
      frames.push(imageData)
    }

    // 恢复完整渲染
    render()

    uni.showLoading({ title: '编码 GIF...' })
    const gifBuf = encodeGif(frames, 600, 0)

    uni.showLoading({ title: '保存中...' })
    const filePath = saveGifFile(gifBuf)

    uni.hideLoading()
    // 尝试保存到相册（部分系统支持 GIF）
    uni.saveImageToPhotosAlbum({
      filePath: filePath,
      success() {
        uni.showToast({ title: 'GIF 已保存到相册', icon: 'success' })
      },
      fail() {
        // 不支持直接保存 GIF 到相册，引导预览/分享
        uni.showModal({
          title: '导出完成',
          content: 'GIF 已生成，是否预览？',
          confirmText: '预览',
          cancelText: '取消',
          success(mRes) {
            if (mRes.confirm) {
              // 使用预览图片方式查看
              uni.previewImage({
                urls: [filePath],
              })
            }
          },
        })
      },
    })
  } catch (err) {
    console.error('GIF export error:', err)
    render()
    uni.hideLoading()
    uni.showToast({ title: 'GIF 导出失败: ' + (err.message || ''), icon: 'none', duration: 3000 })
  }
}

/** 渲染单一帧：背景 + 模板 + 仅一个文字 */
function renderSingleFrame(item, frameIdx) {
  if (!ctx) return
  const w = canvasW.value
  const h = canvasH.value
  const query = pageQuery.value
  const tplId = query.tpl

  // 清空
  ctx.clearRect(0, 0, w, h)

  // 背景色
  const bgMap = {
    panda: '#FFF8E1', golden: '#E8F5E9', doge: '#E3F2FD',
    blur: '#F3E5F5', spongebob: '#FFF9C4', pepe: '#E8F5E9',
    distracted: '#FFF3E0', button: '#FCE4EC',
  }
  const bgColor = (tplId && bgMap[tplId]) ? bgMap[tplId] : '#F5F5F5'
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)

  // 背景图
  if (bgImage) {
    const imgW = bgImage.width
    const imgH = bgImage.height
    const scale = Math.max(w / imgW, h / imgH)
    const drawW = imgW * scale
    const drawH = imgH * scale
    ctx.drawImage(bgImage, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH)
  }

  // 模板绘制
  if (tplId && templateDraws[tplId] && !bgImage) {
    const tpl = templateDraws[tplId]
    const cx = w / 2
    const cy = h / 2

    if (tpl.blur) ctx.filter = 'blur(4px)'
    ctx.fillStyle = tpl.bgColor || '#F5F5F5'
    ctx.fillRect(0, 0, w, h)

    if (typeof tpl.draw === 'function') {
      tpl.draw(ctx, cx, cy, Math.min(w, h))
    } else {
      const faceR = Math.min(w, h) * 0.28
      ctx.beginPath(); ctx.arc(cx, cy, faceR, 0, Math.PI * 2)
      ctx.fillStyle = tpl.faceColor || '#FFF'; ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `${Math.round(faceR * 0.6)}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000'; ctx.fillText(tpl.label, cx, cy)
    }
    ctx.filter = 'none'
  }

  // 只绘制当前帧的文字
  ctx.save()
  ctx.font = `bold ${item.fontSize || 32}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (item.stroke) {
    ctx.strokeStyle = item.strokeColor || '#000000'
    ctx.lineWidth = (item.fontSize || 32) * 0.12
    ctx.lineJoin = 'round'
    ctx.strokeText(item.text, item.x, item.y)
  }

  ctx.fillStyle = item.color || '#FFFFFF'
  ctx.fillText(item.text, item.x, item.y)
  ctx.restore()

  // 帧号标记（可选，方便调试）
  // ctx.font = '12px sans-serif'; ctx.fillStyle = 'rgba(0,0,0,0.3)'
  // ctx.fillText(`${frameIdx + 1}/${textItems.value.length}`, w - 30, h - 10)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 保存到相册 */
function saveToAlbum(filePath) {
  uni.saveImageToPhotosAlbum({
    filePath: filePath,
    success() {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    },
    fail() {
      uni.showModal({
        title: '提示',
        content: '需要相册权限才能保存图片，请在设置中开启',
        confirmText: '去设置',
        success(mRes) {
          if (mRes.confirm) uni.openSetting()
        },
      })
    },
  })
}

/* ===================== 导航 ===================== */
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
/* ============ 画布 ============ */
.canvas-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: #0D0021;
  min-height: 50vh;
}

.meme-canvas {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 48rpx rgba(0, 0, 0, 0.5);
}

/* ============ 文字列表 ============ */
.text-list {
  padding: 16rpx 24rpx;
  max-height: 200rpx;
  overflow-y: auto;
}

.text-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 8rpx;
}

.text-item.active {
  background: rgba(147, 51, 234, 0.2);
  border: 1rpx solid rgba(147, 51, 234, 0.4);
}

.ti-content {
  font-size: 26rpx;
  color: #FFFFFF;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 40rpx;
}

.ti-input {
  flex: 1;
  font-size: 26rpx;
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.1);
  border: 1rpx solid rgba(147, 51, 234, 0.5);
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  height: 48rpx;
  line-height: 48rpx;
}

.ti-actions {
  display: flex;
  gap: 16rpx;
  flex-shrink: 0;
}

.ti-btn {
  font-size: 28rpx;
  color: #A8A8C2;
  padding: 4rpx 12rpx;
}

.ti-del {
  color: #FF4D6D;
}

/* ============ 底部操作栏 ============ */
.bottom-bar {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 12rpx;
  background: #050010;
  border-top: 1rpx solid rgba(255, 255, 255, 0.06);
}

.bb-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.bb-btn:active {
  background: rgba(255, 255, 255, 0.08);
}

.bb-icon {
  font-size: 32rpx;
  color: #CF8BFF;
  font-weight: 700;
}

.bb-label {
  font-size: 20rpx;
  color: #A8A8C2;
}

.bb-color {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.bb-export {
  background: rgba(147, 51, 234, 0.15);
  border-radius: 20rpx;
  border: 1rpx solid rgba(147, 51, 234, 0.3);
}

.bb-export .bb-icon {
  color: #CF8BFF;
}

/* ============ 格式选择（导出弹窗，仍用 cover-view） ============ */
.editor-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.editor-card {
  width: 600rpx;
  background: #1A0D33;
  border-radius: 32rpx;
  padding: 40rpx 36rpx;
  display: flex;
  flex-direction: column;
}

.ec-title-wrap {
  margin-bottom: 24rpx;
  text-align: center;
}

.ec-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
}

.ec-btn {
  width: 260rpx;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ec-btn.cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #A8A8C2;
}
.format-options {
  display: flex;
  flex-direction: column;
  margin-bottom: 8rpx;
}

.fmt-opt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 12rpx;
}

.fmt-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.fmt-desc {
  font-size: 22rpx;
  color: #A8A8C2;
}
</style>
