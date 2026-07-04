<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useAppStore } from '@/store/index.js'

onLaunch(() => {
  console.log('AI Avatar App Launch')

  const store = useAppStore()
  store.loadHistory()

  // #ifdef MP-WEIXIN
  // 不注册 onNeedPrivacyAuthorization → 微信自动弹出官方隐私弹窗
  // 如果注册了回调但没调用 resolve()，API 会卡住导致 chooseMedia 无响应

  // 版本更新检测
  const updateManager = wx.getUpdateManager()
  updateManager.onCheckForUpdate((res) => {
    console.log('[update] 检查更新结果:', res.hasUpdate)
  })
  updateManager.onUpdateReady(() => {
    console.log('[update] 新版本已下载，提示重启')
    uni.showModal({
      title: '版本更新',
      content: '新版本已就绪，重启后生效。是否立即重启？',
      confirmText: '立即重启',
      cancelText: '稍后再说',
      success: (modalRes) => {
        if (modalRes.confirm) {
          updateManager.applyUpdate()
        }
      },
    })
  })
  updateManager.onUpdateFailed(() => {
    console.error('[update] 新版本下载失败')
  })
  // #endif
})
</script>

<style lang="scss">
page {
  background-color: #050010;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
