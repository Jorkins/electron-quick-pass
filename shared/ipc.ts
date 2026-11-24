export const IPC_CHANNELS = {
  APP_GET_VERSION: 'app:getVersion',
  WIN_GET_STATE: 'win:getState',
  WIN_SET_STATE: 'win:setState',
  WIN_TOGGLE: 'win:toggle',
  CHAT_STREAM: 'chat:stream',
  WIN_TOKEN: 'win:token',
  FILE_OPEN_DIALOG: 'file:openDialog'
} as const

export type IPC_CHANNELS = typeof IPC_CHANNELS

export interface WinState {
  x: number
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}
