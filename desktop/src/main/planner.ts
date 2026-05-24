import type { AgentPlan, WorkspaceSummary } from '../shared/types'

export async function createAgentPlan(task: string, workspace: WorkspaceSummary): Promise<AgentPlan> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.AINCARN_AGENT_MODEL || 'gpt-5-mini'

  if (!apiKey) return createLocalPlan(task, workspace)

  try {
    return await createOpenAiPlan(task, workspace, apiKey, model)
  } catch (error) {
    const fallback = createLocalPlan(task, workspace)
    return {
      ...fallback,
      summary: `${fallback.summary} API試験接続に失敗したため、ローカル計画へフォールバックしました。理由: ${error instanceof Error ? error.message : 'unknown error'}`
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
    summary: `${workspace.name} の構成をもとに、まず関連ファイルを絞り、差分を小さく作ってから検証します。現段階では安全なローカル計画のみを生成しています。`,
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

async function createOpenAiPlan(task: string, workspace: WorkspaceSummary, apiKey: string, model: string): Promise<AgentPlan> {
  const candidateFiles = pickCandidateFiles(task, workspace)
  const suggestedCommands = buildSuggestedCommands(workspace)
  const prompt = [
    'You are Aincarn Agent, a careful local development planning agent.',
    'Return only compact JSON with keys: title, summary, steps.',
    'steps must be an array of 3 items. Each step has title, detail, risk. risk is low, medium, or high.',
    'Do not suggest destructive commands. Do not ask to read secrets.',
    '',
    `Workspace: ${workspace.name}`,
    `Package scripts: ${workspace.packageScripts.join(', ') || 'none'}`,
    `Candidate files: ${candidateFiles.join(', ') || 'none'}`,
    `Task: ${task}`
  ].join('\n')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 900
    })
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`OpenAI ${response.status}: ${message.slice(0, 180)}`)
  }

  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((item) => item.text || '').join('\n') || ''
  const parsed = parsePlanJson(text)

  return {
    title: parsed.title || task,
    mode: 'ai',
    model,
    summary: parsed.summary || `${model} で生成した試験用の実行計画です。`,
    steps: sanitizeSteps(parsed.steps),
    suggestedCommands,
    candidateFiles
  }
}

function parsePlanJson(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  const json = start >= 0 && end >= start ? trimmed.slice(start, end + 1) : trimmed
  return JSON.parse(json) as Partial<Pick<AgentPlan, 'title' | 'summary' | 'steps'>>
}

function sanitizeSteps(steps: AgentPlan['steps'] | undefined): AgentPlan['steps'] {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [
      { title: '状況を確認する', detail: '関連ファイルと現在の差分を確認します。', risk: 'low' },
      { title: '小さく変更する', detail: '影響範囲を限定して実装します。', risk: 'medium' },
      { title: '検証する', detail: '許可されたコマンドで検証します。', risk: 'low' }
    ]
  }

  return steps.slice(0, 3).map((step) => ({
    title: String(step.title || 'Step'),
    detail: String(step.detail || ''),
    risk: step.risk === 'high' || step.risk === 'medium' || step.risk === 'low' ? step.risk : 'medium'
  }))
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
