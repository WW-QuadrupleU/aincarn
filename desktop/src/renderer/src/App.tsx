import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { AgentPlan, CommandResult, WorkspaceSummary } from '../../shared/types'
import './styles.css'

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null)
  const [task, setTask] = useState('')
  const [plan, setPlan] = useState<AgentPlan | null>(null)
  const [approved, setApproved] = useState(false)
  const [selectedCommand, setSelectedCommand] = useState('git status --short')
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.aincarn.getWorkspace().then(setWorkspace).catch(() => undefined)
  }, [])

  const fileGroups = useMemo(() => {
    if (!workspace) return []
    return workspace.files.slice(0, 24)
  }, [workspace])

  async function selectWorkspace() {
    setError('')
    setPlan(null)
    const next = await window.aincarn.selectWorkspace()
    if (next) setWorkspace(next)
  }

  async function generatePlan() {
    setBusy(true)
    setError('')
    try {
      const next = await window.aincarn.generatePlan(task)
      setPlan(next)
      setSelectedCommand(next.suggestedCommands[0] || 'git status --short')
      setApproved(false)
      setCommandResult(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '計画生成に失敗しました。')
    } finally {
      setBusy(false)
    }
  }

  async function runCommand() {
    setBusy(true)
    setError('')
    try {
      const result = await window.aincarn.runCommand(selectedCommand, approved)
      setCommandResult(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'コマンド実行に失敗しました。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Aincarn Agent Desktop</p>
          <h1>ローカル開発を、最適AIへ渡す準備をする。</h1>
          <p className="lead">
            まずは安全なローカル接続、明示承認、差分前提の実行計画から始めます。AI APIはこの安全層が固まってから接続します。
          </p>
        </div>
        <button className="primary" type="button" onClick={selectWorkspace}>
          {workspace ? '別のフォルダを開く' : 'プロジェクトを開く'}
        </button>
      </section>

      <section className="grid">
        <aside className="panel workspace">
          <div className="panelHead">
            <p className="eyebrow">Workspace</p>
            <span>{workspace ? `${workspace.files.length} files` : 'not connected'}</span>
          </div>
          {workspace ? (
            <>
              <h2>{workspace.name}</h2>
              <p className="muted path">{workspace.root}</p>
              <div className="chips">
                {workspace.packageScripts.map((script) => (
                  <span key={script}>npm:{script}</span>
                ))}
                {workspace.ignoredCount > 0 && <span>{workspace.ignoredCount} ignored</span>}
              </div>
              <div className="fileList">
                {fileGroups.map((file) => (
                  <div key={file.path} className="fileRow">
                    <span>{file.path}</span>
                    <small>{Math.ceil(file.size / 1024)}KB</small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="empty">フォルダを選ぶと、秘密情報や巨大ファイルを避けながら構成だけを読み取ります。</p>
          )}
        </aside>

        <section className="panel planner">
          <div className="panelHead">
            <p className="eyebrow">Task</p>
            <span>local stub</span>
          </div>
          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="例: 料金比較ツールのUI崩れを直し、ビルドが通るか確認する"
          />
          <button className="primary wide" type="button" onClick={generatePlan} disabled={!workspace || busy}>
            {busy ? '処理中...' : '実行計画を作る'}
          </button>

          {error && <p className="error">{error}</p>}

          {plan && (
            <div className="plan">
              <p className="eyebrow">Plan</p>
              <h2>{plan.title}</h2>
              <p className="muted">{plan.summary}</p>
              <div className="steps">
                {plan.steps.map((step, index) => (
                  <article key={step.title}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                    <em className={`risk ${step.risk}`}>{step.risk}</em>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="panel command">
          <div className="panelHead">
            <p className="eyebrow">Verification</p>
            <span>approval required</span>
          </div>
          <select value={selectedCommand} onChange={(event) => setSelectedCommand(event.target.value)}>
            {(plan?.suggestedCommands || ['git status --short']).map((command) => (
              <option key={command} value={command}>{command}</option>
            ))}
          </select>
          <label className="approval">
            <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} />
            このコマンドを実行する
          </label>
          <button className="secondary wide" type="button" onClick={runCommand} disabled={!workspace || !approved || busy}>
            承認して実行
          </button>
          {commandResult && (
            <pre className="terminal">{`$ ${commandResult.command}
exit ${commandResult.exitCode ?? 'error'}

${commandResult.stdout}
${commandResult.stderr}`}</pre>
          )}
        </aside>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
