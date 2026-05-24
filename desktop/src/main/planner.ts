import type { AgentConnection, AgentPlan, WorkspaceSummary } from '../shared/types'

export async function createAgentPlan(task: string, workspace: WorkspaceSummary, connection: AgentConnection): Promise<AgentPlan> {
  const proxyToken = connection.token
  const proxyUrl = connection.proxyUrl
  const model = process.env.AINCARN_AGENT_MODEL || 'gpt-5-mini'

  if (!proxyToken) return createLocalPlan(task, workspace)

  try {
    return await createProxyPlan(task, workspace, connection, model)
  } catch (error) {
    const fallback = createLocalPlan(task, workspace)
    return {
      ...fallback,
      summary: `${fallback.summary} Vercel中継APIへの接続に失敗したため、ローカル計画へフォールバックしました。理由: ${error instanceof Error ? error.message : 'unknown error'}`
    }
  }
}

function createLocalPlan(task: string, workspace: WorkspaceSummary): AgentPlan {
  const normalizedTask = task.trim()
  const candidateFiles = pickCandidateFiles(normalizedTask, workspace)
  const suggestedCommands = buildSuggestedCommands(workspace)

  return {
    title: normalizedTask || 'Aincarn Agentの作業計画',
    mode: 'local',
    model: 'local-planner',
    summary: `${workspace.name} の構成をもとに、まず関連ファイルを絞り、差分を小さく作ってから検証します。APIトークンが未設定のため、安全なローカル計画のみを生成しています。`,
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

async function createProxyPlan(
  task: string,
  workspace: WorkspaceSummary,
  connection: AgentConnection,
  model: string
): Promise<AgentPlan> {
  const response = await fetch(connection.proxyUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${connection.token}`,
      'Content-Type': 'application/json',
      'X-Aincarn-Device-Id': connection.deviceId,
      'X-Aincarn-Device-Name': connection.deviceName
    },
    body: JSON.stringify({
      task,
      workspace: {
        name: workspace.name,
        files: workspace.files.slice(0, 200),
        ignoredCount: workspace.ignoredCount,
        packageScripts: workspace.packageScripts
      },
      model
    })
  })

  const data = await response.json().catch(() => null) as { plan?: AgentPlan; error?: string } | null
  if (!response.ok) {
    throw new Error(data?.error || `Proxy ${response.status}`)
  }
  if (!data?.plan) throw new Error('Proxy response did not include a plan')

  return {
    ...data.plan,
    suggestedCommands: Array.isArray(data.plan.suggestedCommands) && data.plan.suggestedCommands.length > 0
      ? data.plan.suggestedCommands
      : buildSuggestedCommands(workspace),
    candidateFiles: Array.isArray(data.plan.candidateFiles) ? data.plan.candidateFiles : pickCandidateFiles(task, workspace)
  }
}

function buildSuggestedCommands(workspace: WorkspaceSummary) {
  const commands = ['git status --short']
  if (workspace.packageScripts.includes('lint')) commands.push('npm run lint')
  if (workspace.packageScripts.includes('build')) commands.push('npm run build')
  if (workspace.packageScripts.includes('test')) commands.push('npm test')
  commands.push('git diff --')
  return commands
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
