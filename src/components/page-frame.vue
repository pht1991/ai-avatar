<!--
  通用页面框架组件
  @mode  default: 自然滚动 | scroll: scroll-view 滚动 | flex: 固定高度 flex 布局
  @safeBottom  是否显示底部安全区域占位
  @bgColor     覆盖默认背景色
-->
<template>
  <view class="pf" :class="[`pf--${mode}`]" :style="containerStyle">
    <!-- 页头插槽 -->
    <slot name="header" />

    <!-- scroll 模式 -->
    <template v-if="mode === 'scroll'">
      <scroll-view class="pf-scroll" scroll-y enhanced :show-scrollbar="false">
        <slot />
        <view v-if="safeBottom" class="pf-safe" />
      </scroll-view>
    </template>

    <!-- flex 模式 -->
    <template v-else-if="mode === 'flex'">
      <slot />
      <view class="pf-footer">
        <slot name="footer" />
      </view>
      <view class="pf-safe" />
    </template>

    <!-- default 模式 -->
    <template v-else>
      <slot />
      <view v-if="safeBottom" class="pf-safe" />
    </template>
  </view>
</template>

<script>
export default {
  name: 'PageFrame',
  props: {
    mode:       { type: String,  default: 'default' },
    bgColor:    { type: String,  default: '' },
    safeBottom: { type: Boolean, default: false },
  },
  computed: {
    containerStyle() {
      const s = {}
      if (this.bgColor) s.backgroundColor = this.bgColor
      return s
    },
  },
}
</script>

<style scoped>
.pf {
  background: #050010;
  min-height: 100vh;
}

/* ---------- flex 模式：固定高度，纵向 flex，禁用滚动 ---------- */
.pf--flex {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pf-footer {
  flex-shrink: 0;
  width: 100%;
}

/* ---------- scroll 模式：全高 + scroll-view ---------- */
.pf--scroll {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pf--scroll .pf-scroll {
  flex: 1;
  height: 0;
}

/* ---------- 底部安全区域 ---------- */
/* flex 模式：仅占位 safe-area 高度，footer 自带 padding */
.pf--flex .pf-safe {
  height: env(safe-area-inset-bottom);
  background: #050010;
  width: 100%;
  flex-shrink: 0;
}

/* default / scroll 模式：额外 40rpx 间距 + safe-area */
.pf-safe {
  height: calc(40rpx + env(safe-area-inset-bottom));
  background: #050010;
  width: 100%;
}
</style>
