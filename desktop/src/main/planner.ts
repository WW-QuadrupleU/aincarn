import type { AgentPlan, WorkspaceSummary } from '../shared/types'

export function createLocalPlan(task: string, workspace: WorkspaceSummary): AgentPlan {
  const normalizedTask = task.trim()
  const candidateFiles = pickCandidateFiles(normalizedTask, workspace)
  const hasBuild = workspace.packageScripts.includes('build')
  const hasLint = workspace.packageScripts.includes('lint')
  const suggestedCommands = ['git status --short']

  if (hasLint) suggestedCommands.push('npm run lint')
  if (hasBuild) suggestedCommands.push('npm run build')
  suggestedCommands.push('git diff --')

  return {
    title: normalizedTask || 'Aincarn Agentの作業計画',
    summary: `${workspace.name} の構成をもとに、まず関連ファイルを絞り、差分を小さく作ってから検証します。現段階ではAI APIを呼ばず、安全なローカル計画のみを生成しています。`,
    steps: [
      {
        title: '関連範囲を限定する',
        detail: candidateFiles.length > 0
          ? `候補: ${candidateFiles.slice(0, 5).join(', ')}`
          : 'ファイル候補が薄いため、まずディレクトリ構成とpackage.jsonを確認します。',
        risk: 'low'
      },
      {
        title: '小さな差分で実装する',
        detail: '最初のMVPでは、AIが直接書き換える前にユーザー確認用の差分案を作る設計にします。',
        risk: 'medium'
      },
      {
        title: '承認付きで検証する',
        detail: 'build/lint/testなどのコマンドはallowlistと承認を通ったものだけ実行します。',
        risk: 'low'
      }
    ],
    suggestedCommands,
    candidateFiles
  }
}

function pickCandidateFiles(task: string, workspace: WorkspaceSummary) {
  const keywords = task
    .toLowerCase()
    .split(/[\s,./\\:;()[\]{}"'`]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3)

  const scored = workspace.files.map((file) => {
    const path = file.path.toLowerCase()
    const score = keywords.reduce((total, keyword) => total + (path.includes(keyword) ? 1 : 0), 0)
      + (path.endsWith('package.json') ? 0.4 : 0)
      + (path.includes('/components/') ? 0.2 : 0)
      + (path.includes('/src/') ? 0.2 : 0)
    return { file, score }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.file.path)
}
