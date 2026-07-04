// api/siliconflow.js - 硅基流动 API 封装

const API_BASE = 'https://api.siliconflow.cn/v1'
// 请在硅基流动控制台 https://siliconflow.cn 注册后获取
let API_KEY = 'sk-shndqhnkxutjwsakcgoeaknkimkyvhoebkbxvcyqhdhthoym'

export function setApiKey(key) {
  API_KEY = key
}

/**
 * 调用 AI 图片编辑 API（风格迁移 + 人脸保持）
 * 使用 Qwen/Qwen-Image-Edit-2509 模型，专为图片编辑设计，
 * 原生支持人脸 ID 保持——你给一张人脸 + 编辑指令，它保留面部特征只改风格
 *
 * 关键说明（来自硅基流动 API 文档）：
 *   - image 字段支持完整 data URI 或 URL
 *   - Edit 模型不支持 image_size 参数
 *   - Prompt 应为自然语言编辑指令（如"将照片转为古风风格"），而非文生图描述
 *   - 模型自动保留人脸特征，无需在 prompt 中重复强调
 */
export async function generateAvatar(prompt, _negativePrompt, initImageBase64) {
  const body = {
    model: 'Qwen/Qwen-Image-Edit-2509',
    prompt,
    num_images: 1,
    seed: Math.floor(Math.random() * 9999999999),
    response_format: 'b64_json',
  }

  // 传入参考照片（支持纯 base64 或完整 data URI）
  if (initImageBase64) {
    if (initImageBase64.startsWith('data:')) {
      body.image = initImageBase64
    } else {
      body.image = `data:image/jpeg;base64,${initImageBase64}`
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}/image/generations`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: body,
      timeout: 120000,
      success: (res) => {
        if (res.statusCode === 200 && res.data?.images?.length > 0) {
          const image = res.data.images[0]
          // 优先返回 base64（无需 downloadFile，真机不受域名白名单限制）
          resolve(image.b64_json || image.base64 || image.url)
        } else {
          reject(new Error(res.data?.message || `HTTP ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

/**
 * 调用 LLM API 优化 Prompt（可选增强功能）
 */
export async function enhancePrompt(userInput) {
  const body = {
    model: 'Qwen/Qwen2.5-7B-Instruct',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的 AI 绘画提示词优化师。请将用户描述优化为高质量的 Stable Diffusion 英文提示词，只返回优化后的提示词，不要有其他内容。',
      },
      {
        role: 'user',
        content: userInput,
      },
    ],
    max_tokens: 200,
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}/chat/completions`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: body,
      timeout: 15000,
      success: (res) => {
        if (res.statusCode === 200 && res.data?.choices?.length > 0) {
          resolve(res.data.choices[0].message.content)
        } else {
          resolve(userInput)
        }
      },
      fail: () => resolve(userInput),
    })
  })
}
