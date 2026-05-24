import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { isAllowedCommand } from '../shared/commands'
import type { CommandResult, WorkspaceSummary } from '../shared/types'
import { createLocalPlan } from './planner'
import { scanWorkspace } from './security'

let mainWindow: BrowserWindow | null = null
let workspace: WorkspaceSummary | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1080,
    minHeight: 720,
    title: 'Aincarn Agent',
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('workspace:select', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Aincarn Agentで開くプロジェクトを選択',
    properties: ['openDirectory']
  })

  if (result.canceled || !result.filePaths[0]) return null
  workspace = await scanWorkspace(result.filePaths[0])
  return workspace
})

ipcMain.handle('workspace:get', async () => workspace)

ipcMain.handle('agent:plan', async (_event, task: string) => {
  if (!workspace) throw new Error('先にプロジェクトフォルダを開いてください。')
  if (!task.trim()) throw new Error('タスクを入力してください。')
  return createLocalPlan(task, workspace)
})

ipcMain.handle('command:run', async (_event, command: string, approved: boolean): Promise<CommandResult> => {
  if (!workspace) throw new Error('先にプロジェクトフォルダを開いてください。')
  if (!approved) throw new Error('コマンド実行には明示的な承認が必要です。')
  if (!isAllowedCommand(command)) throw new Error('許可されていないコマンドです。')

  return runAllowedCommand(command, workspace.root)
})

function runAllowedCommand(command: string, cwd: string): Promise<CommandResult> {
  const [base, ...args] = command.split(' ')
  const executable = process.platform === 'win32' && base === 'npm' ? 'npm.cmd' : base

  return new Promise((resolve) => {
    const child = spawn(executable, args, { cwd, shell: false, windowsHide: true })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
      if (stdout.length > 20_000) stdout = stdout.slice(-20_000)
    })

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
      if (stderr.length > 20_000) stderr = stderr.slice(-20_000)
    })

    child.on('close', (exitCode) => {
      resolve({ command, exitCode, stdout, stderr })
    })

    child.on('error', (error) => {
      resolve({ command, exitCode: null, stdout, stderr: error.message })
    })
  })
}
