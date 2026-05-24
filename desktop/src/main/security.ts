import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, join, relative, resolve } from 'node:path'
import type { WorkspaceFile, WorkspaceSummary } from '../shared/types'

const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.vercel',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.cache'
])

const ignoredExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.mp4',
  '.mov',
  '.zip',
  '.7z',
  '.exe',
  '.dll',
  '.pdf'
])

export function assertInsideWorkspace(root: string, target: string) {
  const resolvedRoot = resolve(root)
  const resolvedTarget = resolve(root, target)
  const relation = relative(resolvedRoot, resolvedTarget)

  if (relation.startsWith('..') || relation === '..' || relation.includes('..\\') || relation.includes('../')) {
    throw new Error('Workspace外のパスにはアクセスできません。')
  }

  return resolvedTarget
}

export async function scanWorkspace(root: string): Promise<WorkspaceSummary> {
  const files: WorkspaceFile[] = []
  let ignoredCount = 0

  async function walk(current: string, depth: number) {
    if (files.length >= 180 || depth > 4) return

    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      if (files.length >= 180) return
      const fullPath = join(current, entry.name)
      const relPath = relative(root, fullPath).replace(/\\/g, '/')

      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) {
          ignoredCount += 1
          continue
        }
        await walk(fullPath, depth + 1)
        continue
      }

      if (!entry.isFile()) continue
      const extension = entry.name.includes('.') ? entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase() : ''
      if (ignoredExtensions.has(extension) || entry.name.startsWith('.env')) {
        ignoredCount += 1
        continue
      }

      const info = await stat(fullPath)
      if (info.size > 450_000) {
        ignoredCount += 1
        continue
      }

      files.push({
        path: relPath,
        size: info.size,
        modifiedAt: info.mtime.toISOString()
      })
    }
  }

  await walk(root, 0)

  return {
    root,
    name: basename(root),
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    ignoredCount,
    packageScripts: await readPackageScripts(root)
  }
}

async function readPackageScripts(root: string) {
  try {
    const packagePath = assertInsideWorkspace(root, 'package.json')
    const raw = await readFile(packagePath, 'utf8')
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> }
    return Object.keys(parsed.scripts || {})
  } catch {
    return []
  }
}
