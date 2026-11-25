import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, WinState, type SessionPayload } from '../../shared/ipc'

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION) as Promise<string>,
  getWinState: (): Promise<WinState | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.WIN_GET_STATE) as Promise<WinState | null>,
  setWinState: (state: WinState) => ipcRenderer.send(IPC_CHANNELS.WIN_SET_STATE, state),
  toggleWin: () => ipcRenderer.send(IPC_CHANNELS.WIN_TOGGLE),
  onWinToken: (cb: (token: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.WIN_TOKEN, (_event, token: string) => cb(token))
  },
  setAiKey: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.AI_SET_KEY, key),
  getAiKeyStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AI_GET_KEY_STATUS),
  saveSession: (payload: SessionPayload) => ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_SESSION, payload),
  loadSession: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DB_LOAD_SESSION, id),
  logError: (message: string) => ipcRenderer.send(IPC_CHANNELS.LOG_ERROR, message)
})

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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
