/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { WinState, type SessionPayload } from '../../shared/ipc'

export type ElectronAPI = {
  getVersion: () => Promise<string>
  getWinState: () => Promise<WinState | null>
  setWinState: (state: WinState) => void
  toggleWin: () => void
  onWinToken: (cb: (token: string) => void) => void
  saveSession: (payload: SessionPayload) => Promise<void>
  loadSession: (id: string) => Promise<Array<{ role: string; content: string }>>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
