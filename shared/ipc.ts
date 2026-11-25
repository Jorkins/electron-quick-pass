export const IPC_CHANNELS = {
  APP_GET_VERSION: 'app:getVersion',
  WIN_GET_STATE: 'win:getState',
  WIN_SET_STATE: 'win:setState',
  WIN_TOGGLE: 'win:toggle',
  CHAT_STREAM: 'chat:stream',
  WIN_TOKEN: 'win:token',
  FILE_OPEN_DIALOG: 'file:openDialog',
  SETTINGS_OPEN: 'settings:open',
  DB_SAVE_SESSION: 'db:saveSession',
  DB_LOAD_SESSION: 'db:loadSession',
  AI_SET_KEY: 'ai:setKey',
  AI_GET_KEY_STATUS: 'ai:getKeyStatus',
  LOG_ERROR: 'log:error',
  CLIPBOARD_WRITE: 'clipboard:write',
  CLIPBOARD_READ: 'clipboard:read',
  SCREEN_INFO: 'screen:info'
} as const

export type IPC_CHANNELS = typeof IPC_CHANNELS

export interface WinState {
  x: number
  y: number
  width: number
  height: number
  maximized: boolean
}

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface SessionPayload {
  id: string
  title: string
  messages: ChatMessage[]
}
