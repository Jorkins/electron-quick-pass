<script setup lang="ts">
import { ref, onMounted } from 'vue'

const version = ref<string>('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    version.value = await window.electronAPI?.getVersion?.() ?? 'unknown'
  } catch {
    version.value = 'n/a'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="app">
    <h1>DeskMind</h1>
    <p>Electron + Vue3 + TypeScript</p>
    <p v-if="loading">正在获取版本……</p>
    <p v-else>应用版本：{{ version }}</p>
  </div>
</template>

<style scoped>
.app {
  font-family: 'Helvetica Neue', PingFang SC, 'Microsoft YaHei', sans-serif;
  padding: 2rem;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
p {
  color: #666;
}
</style>
