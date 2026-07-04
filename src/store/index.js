// store/index.js - Pinia Store: 全局状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FREE_CONFIG } from '@/config/ad.js'

export const useAppStore = defineStore('app', () => {
  // ---- 状态 ----
  const selectedStyleId = ref('')
  const uploadedImagePath = ref('')
  const generatedImages = ref([])
  const currentResultImage = ref('')
  const isGenerating = ref(false)
  const generationProgress = ref(0)
  const dailyCount = ref(0)
  const countDate = ref('')

  // ---- 计算属性 ----
  const remainingFree = computed(() => Math.max(0, FREE_CONFIG.dailyMax - dailyCount.value))
  const canGenerateFree = computed(() => remainingFree.value > 0)

  // ---- 方法 ----
  function setStyle(id) {
    selectedStyleId.value = id
  }

  function setUploadedImage(path) {
    uploadedImagePath.value = path
  }

  function setCurrentResult(image) {
    currentResultImage.value = image
  }

  function startGeneration() {
    isGenerating.value = true
    generationProgress.value = 0
  }

  function updateProgress(progress) {
    generationProgress.value = Math.min(100, progress)
  }

  const HISTORY_KEY = 'avatar_history'
  const HISTORY_MAX = 10 // 最多保留 10 条，防止 base64 撑爆 Storage

  function finishGeneration(imageBase64) {
    const record = {
      id: Date.now(),
      image: imageBase64,
      styleId: selectedStyleId.value,
      createdAt: new Date().toISOString(),
    }
    generatedImages.value.unshift(record)
    // 限制历史记录条数，超出删最旧的
    if (generatedImages.value.length > HISTORY_MAX) {
      generatedImages.value.length = HISTORY_MAX
    }
    currentResultImage.value = imageBase64
    isGenerating.value = false
    generationProgress.value = 100

    // 持久化历史记录
    persistHistory()
    // 更新每日计数
    const today = new Date().toDateString()
    if (countDate.value !== today) {
      countDate.value = today
      dailyCount.value = 1
    } else {
      dailyCount.value++
    }
    persistCount()
  }

  function loadHistory() {
    try {
      const data = uni.getStorageSync(HISTORY_KEY)
      if (data && Array.isArray(data)) {
        generatedImages.value = data
      }
    } catch (_) {}
  }

  function persistHistory() {
    try {
      uni.setStorageSync(HISTORY_KEY, generatedImages.value)
    } catch (_) {}
  }

  function failGeneration() {
    isGenerating.value = false
    generationProgress.value = 0
  }

  function loadDailyCount() {
    const data = uni.getStorageSync('daily_count')
    const today = new Date().toDateString()
    if (data && data.date === today) {
      dailyCount.value = data.count
      countDate.value = data.date
    } else {
      dailyCount.value = 0
      countDate.value = today
    }
  }

  function persistCount() {
    uni.setStorageSync('daily_count', {
      date: countDate.value,
      count: dailyCount.value,
    })
  }

  // 批量增加计数（用于批量生成等场景）
  function incrementDailyCount(n = 1) {
    const today = new Date().toDateString()
    if (countDate.value !== today) {
      countDate.value = today
      dailyCount.value = n
    } else {
      dailyCount.value += n
    }
    persistCount()
  }

  return {
    selectedStyleId,
    uploadedImagePath,
    generatedImages,
    currentResultImage,
    isGenerating,
    generationProgress,
    dailyCount,
    countDate,
    remainingFree,
    canGenerateFree,
    setStyle,
    setUploadedImage,
    setCurrentResult,
    startGeneration,
    updateProgress,
    finishGeneration,
    failGeneration,
    loadDailyCount,
    loadHistory,
    persistHistory,
    incrementDailyCount,
  }
})
