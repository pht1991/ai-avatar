// config/ad.js - 广告单元配置
// 在微信小程序后台创建广告单元后，替换以下 ID

export const AD_CONFIG = {
  // 激励视频广告 — 解锁去水印
  rewarded: {
    adUnitId: 'adunit-xxxxxxxxxxxxxxxxxx',
    description: '看完广告即可解锁无水印高清头像',
  },
  // 激励视频广告 — 解锁高清分辨率
  rewardedHd: {
    adUnitId: 'adunit-yyyyyyyyyyyyyyyyyy',
    description: '看完广告解锁 2K 高清分辨率',
  },
  // Banner 广告 — 结果页底部
  banner: {
    adUnitId: 'adunit-zzzzzzzzzzzzzzzzzz',
    slotId: 'banner-result',
  },
}

// 免费次数配置
export const FREE_CONFIG = {
  dailyMax: 5,            // 每日免费生成次数
  watermarkEnabled: true, // 免费版是否带水印
  freeResolution: 1024,   // 免费版分辨率
  hdResolution: 2048,     // 高清版分辨率
}
