import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
  getWinState: () => ipcRenderer.invoke(IPC_CHANNELS.WIN_GET_STATE),
  setWinState: (state: unknown) => ipcRenderer.send(IPC_CHANNELS.WIN_SET_STATE, state),
  toggleWin: () => ipcRenderer.send(IPC_CHANNELS.WIN_TOGGLE),
  invoke: <T = unknown>(channel: string, ...args: unknown[]): Promise<T> =>
    ipcRenderer.invoke(channel, ...args)
})

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
