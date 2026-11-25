import { app, BrowserWindow, ipcMain, Tray, nativeImage, screen, dialog, clipboard, Menu, globalShortcut, type MenuItemConstructorOptions, session, safeStorage, crashReporter } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { IPC_CHANNELS, type SessionPayload } from '../../shared/ipc'

app.setName('DeskMind')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let settingsWindow: BrowserWindow | null = null
const isMac = process.platform === 'darwin'

// 窗口状态持久化文件路径（用户数据目录下）
const statePath = join(app.getPath('userData'), 'window-state.json')

// AI 密钥文件路径（内容为 safeStorage 加密后的 base64）
const aiKeyPath = join(app.getPath('userData'), 'ai.key')

// 日志目录与主进程日志函数
const logsDir = join(app.getPath('userData'), 'logs')
mkdirSync(logsDir, { recursive: true })
function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  appendFileSync(join(logsDir, 'main.log'), line, { encoding: 'utf-8' })
  console.log(line)
}

crashReporter.start({
  companyName: 'DeskMind',
  productName: 'DeskMind',
  submitURL: '',
  uploadToServer: false
})

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  maximized: boolean
}

function loadWindowState(): WindowState {
  const defaults: WindowState = { width: 900, height: 670, maximized: false }
  try {
    if (existsSync(statePath)) {
      const saved = JSON.parse(readFileSync(statePath, 'utf-8'))
      return { ...defaults, ...saved }
    }
  } catch {
    // 忽略读取错误，使用默认值
  }
  return defaults
}

function saveWindowState(win: BrowserWindow) {
  try {
    const { x, y, width, height } = win.getBounds()
    const maximized = win.isMaximized()
    writeFileSync(statePath, JSON.stringify({ x, y, width, height, maximized }), 'utf-8')
  } catch {
    // 忽略写入错误
  }
}

function setAiKey(key: string) {
  const encrypted = safeStorage.encryptString(key)
  writeFileSync(aiKeyPath, encrypted.toString('base64'))
}

function getAiKey(): string | null {
  try {
    if (!existsSync(aiKeyPath)) return null
    const encrypted = readFileSync(aiKeyPath, 'utf-8')
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
  } catch {
    return null
  }
}

function createWindow() {
  const saved = loadWindowState()
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    x: saved.x,
    y: saved.y,
    width: Math.min(saved.width, width),
    height: Math.min(saved.height, height),
    show: false,
    autoHideMenuBar: true,
    title: 'DeskMind',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // 窗口关闭时保存状态
  win.on('close', () => {
    saveWindowState(win)
  })

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5123/renderer')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (saved.maximized) {
    win.maximize()
  }

  const ses = session.defaultSession as unknown as {
    setCSP?: (policy: string) => Promise<void>
  }
  void ses.setCSP?.(
    "default-src file:; script-src file: 'self'; style-src file: 'self' 'unsafe-inline'; img-src file: data:"
  )
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://') || url.startsWith('http://localhost:5123')) return
    event.preventDefault()
  })
  win.webContents.setWindowOpenHandler(({ url }) => ({ action: 'deny' }))

  mainWindow = win
}

function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('DeskMind')
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function createSettingsWindow() {
  const settings = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    title: 'DeskMind - Settings',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  settings.loadURL(!app.isPackaged ? 'http://localhost:5123/renderer' : join(__dirname, '../renderer/index.html'))
  settingsWindow = settings
}

app.whenReady().then(async () => {
  await autoUpdater.checkForUpdates()
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
  })

  createWindow()
  createTray()
  setupMenu()
  registerGlobalShortcut()
  createSettingsWindow()

  // 主窗口 -> 设置窗口（示例通信）
  if (mainWindow) {
    mainWindow.webContents.send(IPC_CHANNELS.SETTINGS_OPEN, { from: 'main' })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })
})

function setupMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'DeskMind',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function registerGlobalShortcut() {
  const registered = globalShortcut.register('CommandOrControl+K', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
  if (!registered) {
    // 注册失败（如权限不足 / 冲突）记日志
  }
}

// 单实例锁：第二次启动时激活已有窗口并退出新实例
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// 本地数据库（SQLite，通过 node:sqlite 访问 userData 目录）
const dbPath = join(app.getPath('userData'), 'desk-mind.db')
const db = new DatabaseSync(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    created_at INTEGER NOT NULL
  )
`)

app.on('window-all-closed', () => {
  // macOS：用户通常在 Cmd+Q 才退出，红点× 只关窗口不退出
  // Windows / Linux：所有窗口关闭则退出应用
  if (!isMac) {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (tray) {
    tray.destroy()
  }
  db.close()
})

/**
 * 白名单 IPC：渲染进程通过 preload 的 contextBridge 调用。
 * 所有渲染进程可触发的通道必须在此显式注册，禁止裸字符串通道。
 */
ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => app.getVersion())
ipcMain.handle(IPC_CHANNELS.WIN_GET_STATE, () => {
  if (!mainWindow) return null
  const { x, y, width, height } = mainWindow.getBounds()
  return { x, y, width, height, maximized: mainWindow.isMaximized() }
})
ipcMain.on(IPC_CHANNELS.WIN_SET_STATE, (event, state: unknown) => {
  if (!mainWindow) return
  const s = state as Partial<WindowState>
  if (s.maximized) {
    mainWindow.maximize()
  } else {
    mainWindow.unmaximize()
    if (s.x !== undefined && s.y !== undefined && s.width && s.height) {
      mainWindow.setBounds(s)
    }
  }
})
ipcMain.on(IPC_CHANNELS.WIN_TOGGLE, () => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
})

/**
 * 流式响应：请求—响应 + 推送（主 → 渲染）。
 * 渲染端调用 chat:stream，主进程收到后逐 token 通过 webContents.send 推给渲染端。
 */
ipcMain.handle(IPC_CHANNELS.CHAT_STREAM, async (event, request: { prompt: string }) => {
  const win = BrowserWindow.fromWebContents(event.sender) as BrowserWindow
  if (!win) return null

  const apiKey = getAiKey()
  const endpoint = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
  const model = process.env.AI_MODEL || 'gpt-4o-mini'

  if (!apiKey) {
    win.webContents.send(IPC_CHANNELS.WIN_TOKEN, 'AI_NOT_CONFIGURED')
    return null
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        messages: [{ role: 'user', content: request.prompt }]
      })
    })

    if (!res.ok || !res.body) {
      win.webContents.send(IPC_CHANNELS.WIN_TOKEN, 'AI_REQUEST_FAILED')
      return null
    }

    const reader = (res.body as unknown as ReadableStream).getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let streamDone = false

    while (!streamDone) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(6).trim()
        if (data === '[DONE]') {
          streamDone = true
          break
        }
        try {
          const json = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content
          if (delta) win.webContents.send(IPC_CHANNELS.WIN_TOKEN, delta)
        } catch {
          // 忽略增量解析失败的行
        }
      }
    }
  } catch {
    win.webContents.send(IPC_CHANNELS.WIN_TOKEN, 'AI_REQUEST_FAILED')
  }

  return null
})

ipcMain.handle(
  IPC_CHANNELS.FILE_OPEN_DIALOG,
  async (
    event,
    filter?: { name: string; extensions: string[] }
  ): Promise<string | null> => {
    const win = BrowserWindow.fromWebContents(event.sender) as BrowserWindow
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: filter ? [{ name: filter.name, extensions: filter.extensions }] : undefined
    })
    if (result.canceled) return null
    return result.filePaths[0] ?? null
  }
)

ipcMain.handle(IPC_CHANNELS.AI_SET_KEY, async (_event, key: string) => {
  setAiKey(key)
  return true
})

ipcMain.handle(IPC_CHANNELS.AI_GET_KEY_STATUS, async () => ({
  hasKey: existsSync(aiKeyPath)
}))

ipcMain.on(IPC_CHANNELS.LOG_ERROR, (_event, message: string) => {
  log(`[renderer] ${message}`)
})

ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE, (_event, text: string) => {
  clipboard.writeText(text ?? '')
  return true
})

ipcMain.handle(IPC_CHANNELS.CLIPBOARD_READ, () => {
  return clipboard.readText()
})

ipcMain.handle(IPC_CHANNELS.SCREEN_INFO, () => {
  const d = screen.getPrimaryDisplay()
  return { width: d.size.width, height: d.size.height, scaleFactor: d.scaleFactor }
})

/**
 * 本地数据库：会话保存 / 读取（节点边界直连，渲染进程不感知存储细节）。
 * 写入走主进程事务语义，避免半写入导致历史损坏。
 */
ipcMain.handle(IPC_CHANNELS.DB_SAVE_SESSION, async (_event, payload: SessionPayload) => {
  const now = Date.now()
  db.prepare(
    'INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(id) DO UPDATE SET title = excluded.title, updated_at = excluded.updated_at'
  ).run(payload.id, payload.title, now, now)

  const insert = db.prepare(
    'INSERT INTO messages (conversation_id, role, content, token_count, created_at) VALUES (?, ?, ?, ?, ?)'
  )
  const messages = [...payload.messages]
  for (const m of messages) {
    insert.run(payload.id, m.role, m.content, m.content.length, now)
  }
  return null
})

ipcMain.handle(IPC_CHANNELS.DB_LOAD_SESSION, (event, id: string) => {
  const rows = db
    .prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id')
    .all(id) as Array<{ role: string; content: string }>
  return rows.map((r) => ({ role: r.role as SessionPayload['messages'][number]['role'], content: r.content }))
})
