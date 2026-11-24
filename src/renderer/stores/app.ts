import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const version = ref<string>('')
  const loading = ref(false)

  async function init() {
    version.value = (await window.electronAPI?.getVersion?.()) ?? 'unknown'
  }

  return {
    version,
    loading,
    init
  }
})
