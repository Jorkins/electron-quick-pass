import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { isDev } from '@electron-toolkit/utils'

app.setName('DeskMind')

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
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

  if (isDev) {
    win.loadURL('http://localhost:5123/renderer')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 白名单 IPC：渲染进程通过 preload 的 contextBridge 调用。
 * 所有渲染进程可触发的通道必须在此显式注册，禁止裸字符串通道。
 */
ipcMain.handle('app:getVersion', () => app.getVersion())
