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
  saveSession: (payload: SessionPayload) => ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_SESSION, payload),
  loadSession: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DB_LOAD_SESSION, id)
})

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
