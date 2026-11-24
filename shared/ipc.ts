export const IPC_CHANNELS = {
  APP_GET_VERSION: 'app:getVersion',
  WIN_GET_STATE: 'win:getState',
  WIN_SET_STATE: 'win:setState',
  WIN_TOGGLE: 'win:toggle'
} as const

export type IPC_CHANNELS = typeof IPC_CHANNELS
