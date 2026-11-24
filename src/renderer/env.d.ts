/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { WinState } from '../../shared/ipc'

export type ElectronAPI = {
  getVersion: () => Promise<string>
  getWinState: () => Promise<WinState | null>
  setWinState: (state: WinState) => void
  toggleWin: () => void
  onWinToken: (cb: (token: string) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
