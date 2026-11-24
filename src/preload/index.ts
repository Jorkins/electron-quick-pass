import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, WinState } from '../../shared/ipc'

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION) as Promise<string>,
  getWinState: (): Promise<WinState | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.WIN_GET_STATE) as Promise<WinState | null>,
  setWinState: (state: WinState) => ipcRenderer.send(IPC_CHANNELS.WIN_SET_STATE, state),
  toggleWin: () => ipcRenderer.send(IPC_CHANNELS.WIN_TOGGLE),
  onWinToken: (cb: (token: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.WIN_TOKEN, (_event, token: string) => cb(token))
  }
})

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
