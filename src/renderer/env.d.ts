/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

export type ElectronAPI = {
  getVersion: () => Promise<string>
  getWinState: () => Promise<{
    x: number
    y: number
    width: number
    height: number
    maximized: boolean
  } | null>
  setWinState: (state: unknown) => void
  toggleWin: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
