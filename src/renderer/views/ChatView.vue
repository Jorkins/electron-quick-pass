<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'
import type { WinState } from '../../../shared/ipc'

const appStore = useAppStore()
const version = computed(() => appStore.version)
const loading = computed(() => appStore.loading)

const winState = ref<WinState | null>(null)
const streamText = ref<string>('')
const win = window as unknown as Window & typeof globalThis

onMounted(async () => {
  await appStore.init()
  winState.value = await win.electronAPI?.getWinState?.() ?? null
  win.electronAPI.onWinToken((token: string) => {
    streamText.value += token
  })

  win.addEventListener('resize', reportState)
  win.addEventListener('move', reportState)
})

function reportState() {
  if (!win.electronAPI) return
  const rect: WinState = {
    x: win.screenX,
    y: win.screenY,
    width: win.innerWidth,
    height: win.innerHeight,
    maximized: false
  }
  win.electronAPI.setWinState(rect)
  winState.value = rect
}

onUnmounted(() => {
  win.removeEventListener('resize', reportState)
  win.removeEventListener('move', reportState)
})
</script>

<template>
  <div class="app">
    <h1>DeskMind</h1>
    <p>Electron + Vue3 + TypeScript</p>
    <p v-if="loading">正在初始化……</p>
    <p v-else>应用版本：{{ version }}</p>
    <p v-if="streamText">{{ streamText }}</p>
    <div class="card" v-if="winState">
      <h3>窗口状态</h3>
      <p>位置：({{ winState.x }}, {{ winState.y }})</p>
      <p>大小：{{ winState.width }} × {{ winState.height }}</p>
      <p>{{ winState.maximized ? '已最大化' : '未最大化' }}</p>
    </div>
    <button @click="win.electronAPI?.toggleWin?.()">隐藏到托盘</button>
  </div>
</template>

<style scoped>
.app {
  font-family: 'Helvetica Neue', PingFang SC, 'Microsoft YaHei', sans-serif;
  padding: 2rem;
  max-width: 600px;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
p {
  color: #666;
  margin: 0.25rem 0;
}
.card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  background: #f8fafc;
}
.card h3 {
  margin-top: 0;
  font-size: 1rem;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
