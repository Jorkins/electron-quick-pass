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
  setAiKey: (key: string) => Promise<boolean>
  getAiKeyStatus: () => Promise<{ hasKey: boolean }>
  saveSession: (payload: SessionPayload) => Promise<void>
  loadSession: (id: string) => Promise<Array<{ role: string; content: string }>>
  logError: (message: string) => void
  clipboardWrite: (text: string) => Promise<boolean>
  clipboardRead: () => Promise<string>
  screenInfo: () => Promise<{ width: number; height: number; scaleFactor: number }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
