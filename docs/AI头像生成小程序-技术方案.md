# AI 头像生成小程序 — 完整技术方案

> 个人开发者可落地的一线实施指南。读完就能动手。

---

## 1. 产品定义

### 一句话描述

用户上传一张照片，AI 生成古风、动漫、赛博朋克等 10+ 种风格头像，免费版带水印，看广告去水印/解锁高清。

### 目标用户

- 18~35 岁微信用户，女性优先
- 频繁更换头像的社交活跃用户
- 对 AI 生成内容有好奇心的尝鲜者

### 核心指标（上线首月）

| 指标 | 目标 |
|------|------|
| DAU（日活） | 100~500 |
| 人均生成次数 | 2~3 次/天 |
| 广告收入 | 10~50 元/天 |
| 分享率 | 20%+ |

---

## 2. 技术栈

| 层 | 选型 | 原因 |
|----|------|------|
| 框架 | **uni-app** | 一套代码可同时编译微信/支付宝/百度小程序，未来扩展方便 |
| UI 库 | **uView UI 3.x** | uni-app 生态最佳 UI 库，小程序兼容性好 |
| 图片生成 | **硅基流动 SD API** | 免费额度充足，出图质量稳定 |
| 图片裁剪 | **we-cropper** | 小程序端图片裁剪组件，轻量好用 |
| 本地存储 | uni.setStorageSync | 10MB 空间，存用户历史记录绰绰有余 |
| Canvas | 原生 Canvas 2D | 水印合成、分享卡片生成 |
| 广告 | 微信小程序激励视频广告 | 去水印/高清下载解锁 |

### 为什么不选原生开发？

原生开发需要单独学 WXML/WXSS，上手慢。uni-app 用 Vue 语法，学习成本低，且一套代码未来可以编译成 App 甚至 H5。

---

## 3. 项目结构

```
ai-avatar/
├── pages/
│   ├── index/                  # 首页（风格选择 + 上传入口）
│   │   └── index.vue
│   ├── upload/                 # 上传裁剪页
│   │   └── upload.vue
│   ├── generate/               # 生成中（进度动画）
│   │   └── generate.vue
│   ├── result/                 # 结果展示 + 下载分享
│   │   └── result.vue
│   └── history/                # 历史记录
│       └── history.vue
├── components/
│   ├── StyleCard.vue           # 风格选择卡片
│   ├── ResultSwiper.vue        # 结果轮播
│   └── AdModal.vue             # 广告解锁弹窗
├── api/
│   └── siliconflow.js          # 硅基流动 API 封装
├── config/
│   ├── styles.js               # 风格配置（Prompt 模板）
│   └── ad.js                   # 广告单元配置
├── store/
│   └── index.js                # 全局状态（Vuex/Pinia）
├── utils/
│   ├── image.js                # 图片处理工具
│   ├── watermark.js            # 水印生成
│   └── share.js                # 分享卡片生成
├── static/
│   └── images/                 # 静态资源
└── manifest.json               # uni-app 配置
```

---

## 4. 页面流程

```
首页风格选择 → 上传照片 → 裁剪预览 → 点击生成 → 等待动画（3~8秒）
                                                 ↓
                                    重置/换风格 ← 结果展示 → 看广告去水印
                                                 ↓
                                             保存/分享
```

### 4.1 首页 — 风格选择

**布局**：
- 顶部 Banner：展示生成效果对比（原图 → AI 头像）
- 风格网格：3 列布局，每种风格一个卡片（预览图 + 风格名）
- 底部按钮：「上传照片」

**首批 8 种风格**：
| 序号 | 风格名称 | 关键词 |
|------|----------|--------|
| 1 | 古风汉服 | 汉服、飘逸发髻、古风背景 |
| 2 | 动漫二次元 | 动漫风格、大眼睛、赛璐璐上色 |
| 3 | 赛博朋克 | 霓虹灯、机械义体、未来都市 |
| 4 | 3D 可爱 Q版 | 3D渲染、大头小身体、可爱 |
| 5 | 水彩手绘 | 水彩风格、柔和色调、艺术感 |
| 6 | 复古胶片 | 胶片质感、90年代风格、柔光 |
| 7 | 极简插画 | 扁平矢量风格、极简线条 |
| 8 | 油画肖像 | 古典油画风格、厚涂质感 |

每个风格有独立的高亮色，用户选中后按钮变对应颜色。

### 4.2 上传裁剪页

**功能**：
- 调用 `wx.chooseMedia` 从相册选图或拍照
- 使用 `we-cropper` 组件做 1:1 方形裁剪
- 预览裁剪后的效果
- 「开始生成」按钮

**关键校验**：
- 图片格式：仅支持 jpg/png
- 图片大小：前端压缩到 1MB 以内再上传
- 必须是人脸照片：不做强制检测但建议提示

### 4.3 生成中页

**核心体验**：不能干等，要给用户可感知的进度。

方案：假进度条 + 风格化动画
- 0~30%：上传图片中
- 30~60%：AI 分析面部特征
- 60~90%：生成风格头像
- 90~100%：渲染处理中

实际上 API 调用是一次性的，3~8 秒返回。进度条让人感觉"AI 在努力工作"，比干等体验好得多。

另外：在底部随机展示一句有趣的文字，如"正在给你的脸添加魔法..."。

### 4.4 结果展示页

**布局**：
- 顶部：原图（小）vs AI 头像（大）对比
- 中部：生成的图片（带水印）
- 底部操作栏：
  - 「保存无水印版」（看广告解锁）
  - 「换个风格重试」
  - 「分享给朋友」（生成分享卡片）

**水印方案**：
- 默认输出右下角加半透明「AI生成」文字水印
- 看激励视频广告后去掉水印，同时提升分辨率

### 4.5 历史记录页

- 展示用户生成过的头像（存本地）
- 只存最近 20 条，自动淘汰最旧的
- 每条可重看、重新下载

---

## 5. 核心代码实现

### 5.1 硅基流动 API 封装

```javascript
// api/siliconflow.js

const API_BASE = 'https://api.siliconflow.cn/v1'
const API_KEY = 'sk-your-api-key-here' // 从硅基流动控制台获取

/**
 * 调用 SD 文生图
 * @param {string} prompt - 图片生成提示词
 * @param {string} initImage - Base64 编码的初始图片（图生图模式）
 */
export async function generateImage(prompt, initImage = null) {
  const endpoint = initImage
    ? `${API_BASE}/image/img2img`    // 图生图，保持人物特征
    : `${API_BASE}/image/text2img`

  const body = {
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    prompt: prompt,
    negative_prompt: 'nsfw, low quality, blurry, deformed, ugly',
    image_size: '1024x1024',
    num_images: 1,
    seed: Math.floor(Math.random() * 9999999999),
    ...(initImage && {
      init_image: initImage,
      image_strength: 0.35,  // 0.35 表示保留较多原图特征
    }),
  }

  const res = await uni.request({
    url: endpoint,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: body,
    timeout: 30000,
  })

  if (res.statusCode !== 200) {
    throw new Error(`API error: ${res.data?.message || 'unknown'}`)
  }

  // 返回生成的图片 base64
  return res.data.images[0]?.base64 || res.data.images[0]?.url
}
```

### 5.2 风格 Prompt 配置

```javascript
// config/styles.js

export const STYLES = [
  {
    id: 'gufeng',
    name: '古风汉服',
    color: '#C8553D',
    prompt: (gender = 'female') =>
      `portrait, ${gender}, traditional Chinese hanfu clothing, flowing silk robes,
      elegant updo hairstyle with hairpin, ancient Chinese palace background,
      soft diffused lighting, delicate makeup, photorealistic, high quality, 8k`,
  },
  {
    id: 'anime',
    name: '动漫二次元',
    color: '#FF6B9D',
    prompt: (gender = 'female') =>
      `anime style portrait, ${gender} character, large sparkling eyes,
      cel-shaded coloring, vibrant colors, clean line art,
      Makoto Shinkai style, high quality illustration`,
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    color: '#00D4FF',
    prompt: (gender = 'male') =>
      `cyberpunk portrait, ${gender}, neon lights reflecting on face,
      futuristic city background, mechanical augmentations subtle,
      rain-slicked streets, purple and cyan color palette,
      Blade Runner aesthetic, photorealistic, cinematic lighting`,
  },
  {
    id: 'q3d',
    name: '3D 可爱 Q版',
    color: '#FFD93D',
    prompt: () =>
      `cute chibi 3D character, big head small body, round face,
      soft lighting, Pixar style rendering, bright colors,
      adorable expression, clean background, high quality 3D render`,
  },
  {
    id: 'watercolor',
    name: '水彩手绘',
    color: '#6EC6FF',
    prompt: () =>
      `watercolor painting portrait, soft washes of color,
      artistic brushstrokes, delicate and dreamy atmosphere,
      white paper texture visible, elegant fine art style,
      wet-on-wet technique, beautiful soft edges`,
  },
  // ... 更多风格
]
```

### 5.3 上传裁剪页核心逻辑

```javascript
// pages/upload/upload.vue <script setup>
import { ref } from 'vue'
import { STYLES } from '@/config/styles.js'
import { generateImage } from '@/api/siliconflow.js'

const selectedStyle = ref(null)  // 从首页传入
const imagePath = ref('')
const isGenerating = ref(false)
const progress = ref(0)

// 选择图片
async function chooseImage() {
  const res = await uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sizeType: ['compressed'],
  })
  imagePath.value = res.tempFiles[0].tempFilePath
}

// 压缩图片到 1MB 以内
function compressImage(path) {
  return new Promise((resolve) => {
    uni.compressImage({
      src: path,
      quality: 80,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(path), // 压缩失败就用原图
    })
  })
}

// 图片转 Base64
function imageToBase64(path) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: (res) => resolve(res.data),
      fail: reject,
    })
  })
}

// 核心：触发生成
async function startGenerate() {
  if (!imagePath.value) return

  isGenerating.value = true
  startFakeProgress()  // 启动假进度条

  try {
    // 1. 压缩图片
    const compressed = await compressImage(imagePath.value)

    // 2. 转 Base64
    const base64 = await imageToBase64(compressed)

    // 3. 构建 Prompt
    const style = STYLES.find(s => s.id === selectedStyle.value)
    const prompt = style.prompt('female')

    // 4. 调用 API
    const resultImage = await generateImage(prompt, base64)

    // 5. 加本地水印
    const watermarked = await addWatermark(resultImage)

    // 6. 存本地历史
    saveToHistory(watermarked, selectedStyle.value)

    // 7. 跳转结果页
    uni.navigateTo({
      url: `/pages/result/result?image=${encodeURIComponent(watermarked)}&style=${selectedStyle.value}`,
    })
  } catch (err) {
    uni.showToast({ title: '生成失败，请重试', icon: 'none' })
    console.error(err)
  } finally {
    isGenerating.value = false
  }
}

// 假进度条，让等待体验更好
function startFakeProgress() {
  progress.value = 0
  const steps = [
    { to: 30, delay: 800 },
    { to: 60, delay: 1200 },
    { to: 90, delay: 2000 },
    { to: 100, delay: 500 },
  ]

  let i = 0
  function tick() {
    if (i >= steps.length || !isGenerating.value) return
    const timer = setTimeout(() => {
      progress.value = steps[i].to
      i++
      tick()
    }, steps[i]?.delay || 1000)
  }
  tick()
}
```

### 5.4 水印 & 分享卡片

```javascript
// utils/watermark.js

/**
 * 在图片右下角加半透明水印
 */
export function addWatermark(imageBase64) {
  return new Promise((resolve) => {
    const canvas = uni.createOffscreenCanvas({ type: '2d', width: 1024, height: 1024 })
    const ctx = canvas.getContext('2d')

    const img = canvas.createImage()
    img.src = 'data:image/png;base64,' + imageBase64
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 1024)

      // 水印文字
      ctx.font = '32px sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.textAlign = 'right'
      ctx.fillText('AI生成', 980, 980)

      canvas.toDataURL({
        success: (res) => resolve(res.data),
        format: 'png',
        quality: 0.9,
      })
    }
  })
}

// utils/share.js

/**
 * 生成分享卡片（用于转发小程序）
 */
export function generateShareCard(avatarUrl, styleName) {
  return new Promise((resolve) => {
    const canvas = uni.createOffscreenCanvas({ type: '2d', width: 500, height: 400 })
    const ctx = canvas.getContext('2d')

    // 背景
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 500, 400)

    // 头像（居中偏上）
    const img = canvas.createImage()
    img.src = avatarUrl
    img.onload = () => {
      ctx.drawImage(img, 90, 30, 320, 320)

      // 风格标签
      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(`${styleName}风格`, 250, 375)

      // 小程序名称
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText('扫码生成同款 AI 头像', 250, 395)

      canvas.toDataURL({
        success: (res) => resolve(res.data),
      })
    }
  })
}
```

### 5.5 广告解锁

```javascript
// components/AdModal.vue
// 使用微信小程序激励视频广告

export default {
  data() {
    return {
      adUnitId: 'adunit-xxxxxxxxxxxxx',  // 从微信后台获取
      rewardedVideoAd: null,
    }
  },
  mounted() {
    this.createAd()
  },
  methods: {
    createAd() {
      if (wx.createRewardedVideoAd) {
        this.rewardedVideoAd = wx.createRewardedVideoAd({
          adUnitId: this.adUnitId,
        })
        this.rewardedVideoAd.onClose((res) => {
          if (res && res.isEnded) {
            // 用户看完了广告 → 去水印
            this.$emit('unlock')
          } else {
            uni.showToast({ title: '看完广告才能解锁哦', icon: 'none' })
          }
        })
        this.rewardedVideoAd.onError((err) => {
          console.error('广告加载失败', err)
        })
      }
    },
    showAd() {
      this.rewardedVideoAd.show().catch(() => {
        // 广告未加载完成，重新加载
        this.rewardedVideoAd.load().then(() => this.rewardedVideoAd.show())
      })
    },
  },
}
```

---

## 6. 本地存储设计

```javascript
// store/index.js — 历史记录管理

const HISTORY_KEY = 'avatar_history'
const MAX_HISTORY = 20

// 保存到历史
export function saveToHistory(imageBase64, styleId, styleName) {
  const history = uni.getStorageSync(HISTORY_KEY) || []

  // 插入到最前面
  history.unshift({
    id: Date.now(),
    image: imageBase64,
    styleId,
    styleName,
    createdAt: new Date().toISOString(),
  })

  // 只保留最近 20 条
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY)
  }

  uni.setStorageSync(HISTORY_KEY, history)
}

// 读取历史
export function getHistory() {
  return uni.getStorageSync(HISTORY_KEY) || []
}

// 清除历史
export function clearHistory() {
  uni.removeStorageSync(HISTORY_KEY)
}
```

---

## 7. 变现方案

### 第一阶段（验证期）：纯广告

| 广告位 | 场景 | 预估 eCPM |
|--------|------|-----------|
| 激励视频广告 | 「保存无水印版」按钮 | 3~8 元/千次 |
| 激励视频广告 | 「高清 2K 分辨率」按钮 | 3~8 元/千次 |
| Banner 广告 | 首页底部 | 0.5~1 元/千次 |

**预估**：日活 100 用户，每人每天看 1~2 次广告，日收入约 5~15 元。虽然不多，但关键是不需要任何成本。

### 第二阶段（增长期）：增加付费

- 申请个体工商户（约 300 元）+ 开通微信支付
- 增加「无限生成」会员：¥12/月
- 增加「专属风格包」：¥3~6 每个
- 广告 + 付费双收益

---

## 8. 发布清单

### 上架前检查

- [ ] 小程序名称（建议：AI头像工厂 / 魔法头像 / 头像变变变）
- [ ] 小程序图标（1024x1024 px）
- [ ] 小程序简介（120 字内，描述功能）
- [ ] 类目选择：工具 > 图片（无需额外资质）
- [ ] 服务范围：工具 > 图片处理

### 审核关键点

- **不要出现「AI」「人工智能」等词过度宣传**，用「智能」「魔法」替代，降低审核风险
- **必须做图片内容审核**：调用 `wx.security.imgSecCheck` 过滤违规图片，否则必被拒
- **隐私协议必填**：在 `manifest.json` 中声明相册权限的使用目的
- **首次启动弹隐私协议**：微信要求

```javascript
// 隐私协议弹窗（首次启动）
// pages/index/index.vue

onShow() {
  const agreed = uni.getStorageSync('privacy_agreed')
  if (!agreed) {
    uni.showModal({
      title: '隐私协议',
      content: '本小程序需要使用您的相册权限来选择照片生成AI头像，我们不会存储您的原始照片...',
      confirmText: '同意',
      cancelText: '不同意',
      success: (res) => {
        if (res.confirm) {
          uni.setStorageSync('privacy_agreed', true)
        }
      },
    })
  }
}
```

### 内容安全

```javascript
// 在调用 API 前做图片安全检测
async function checkImageSafe(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      success: (res) => {
        wx.security.imgSecCheck({
          media: {
            contentType: 'image/png',
            value: res.data,
          },
          success: () => resolve(true),
          fail: () => {
            uni.showToast({ title: '图片不合规，请更换', icon: 'none' })
            reject(false)
          },
        })
      },
    })
  })
}
```

---

## 9. 成本预估

| 项目 | 前期 | 月运营 |
|------|------|--------|
| 小程序注册 | 0 元 | 0 元 |
| 硅基流动 API | 0 元（免费额度） | 0~50 元 |
| 服务器 | 0 元（不需要） | 0 元 |
| 域名 | 0 元（不需要） | 0 元 |
| CDN/OSS | 0 元（不需要） | 0 元 |
| **总计** | **0 元** | **0~50 元/月** |

硅基流动的免费额度足够支撑日均几百次生成。用户量增长后再考虑充值 API。

---

## 10. 迭代路线图

```
V1.0 — 第一周上线
  - 8 种风格
  - 上传裁剪生成
  - 水印 + 激励视频解锁
  - 历史记录

V1.1 — 第二周
  - 增加 4 种风格（用户反馈驱动）
  - 优化生成速度（缓存常见风格结果）
  - 分享卡片优化

V1.2 — 第三周
  - 增加「多人合照」风格（情侣/闺蜜头像）
  - 会员订阅（如已开通微信支付）
  - 邀请裂变（邀请 3 个好友解锁一种风格）

V2.0 — 第一个月后
  - AI 头像 + 个性化定制（改发型/眼镜/表情）
  - 接入更多 AI 模型（对比质量）
  - 数据看板（分析哪种风格最受欢迎）
```

---

## 11. 竞争策略

这赛道已经有竞品，你的差异化打法：

1. **小程序 vs App**：不需要下载，微信内即开即用，转化率高一个数量级
2. **设计感**：90% 的竞品 UI 很丑。花 2 天打磨设计就能脱颖而出
3. **速度**：优化 API 调用链路，目标 3 秒内出图
4. **社交裂变**：生成的图自带小程序码水印，每张图都是广告
5. **免费**：竞品大多收费，你用免费 + 广告的模式抢用户

---

## 12. 一句话总结

> 0 元启动，5~7 天上线。先用免费 API 做出一个能跑的、好看的头像生成工具，跑通「上传→AI 生成→广告变现→社交传播」完整闭环。然后根据数据决定下一步。
