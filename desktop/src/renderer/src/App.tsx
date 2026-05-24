import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { AgentConnection, AgentDeviceLogin, AgentPlan, CommandResult, WorkspaceSummary } from '../../shared/types'
import './styles.css'

type ChatMessage = {
  id: string
  role: 'agent' | 'user'
  title?: string
  content: string
}

type ApprovalMode = 'blocked' | 'once' | 'always'

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null)
  const [connection, setConnection] = useState<AgentConnection | null>(null)
  const [login, setLogin] = useState<AgentDeviceLogin | null>(null)
  const [loginStatus, setLoginStatus] = useState('')
  const [task, setTask] = useState('')
  const [plan, setPlan] = useState<AgentPlan | null>(null)
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('blocked')
  const [selectedCommand, setSelectedCommand] = useState('git status --short')
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'agent',
      title: 'Aincarn Agent',
      content: 'プロジェクトを開いて、やりたい開発タスクを入力してください。Aincarnはアカウントのプランに応じたAI枠を使い、安全な実行計画を作ります。'
    }
  ])

  useEffect(() => {
    window.aincarn.getWorkspace().then(setWorkspace).catch(() => undefined)
    window.aincarn.getAgentConnection().then(setConnection).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!login?.deviceCode) return
    const id = window.setInterval(async () => {
      try {
        const result = await window.aincarn.pollDeviceLogin(login.deviceCode)
        if (result.status === 'approved') {
          const next = await window.aincarn.getAgentConnection()
          setConnection(next)
          setLogin(null)
          setLoginStatus('接続しました。以後はこのアカウントのプラン枠を消費します。')
        } else if (result.status === 'expired') {
          setLoginStatus('ログインコードの有効期限が切れました。もう一度開始してください。')
          setLogin(null)
        } else if (result.status === 'device_mismatch') {
          setLoginStatus('端末IDが一致しません。ログインをやり直してください。')
          setLogin(null)
        }
      } catch (error) {
        setLoginStatus(error instanceof Error ? error.message : 'ログイン確認に失敗しました。')
      }
    }, 2500)
    return () => window.clearInterval(id)
  }, [login])

  const visibleFiles = useMemo(() => workspace ? workspace.files.slice(0, 28) : [], [workspace])
  const canRunCommand = Boolean(workspace && plan && approvalMode !== 'blocked' && !busy)

  async function selectWorkspace() {
    setError('')
    setPlan(null)
    setApprovalMode('blocked')
    const next = await window.aincarn.selectWorkspace()
    if (!next) return
    setWorkspace(next)
    setMessages((current) => [...current, {
      id: `workspace-${Date.now()}`,
      role: 'agent',
      title: 'Workspace connected',
      content: `${next.name} を開きました。${next.files.length}件の候補ファイルを読み取り、${next.ignoredCount}件は安全のため除外しています。`
    }])
  }

  async function startLogin() {
    setError('')
    setLoginStatus('')
    const next = await window.aincarn.startDeviceLogin()
    setLogin(next)
    setLoginStatus('ブラウザでログイン承認してください。承認後、この画面は自動で接続状態になります。')
  }

  async function disconnect() {
    const next = await window.aincarn.saveAgentConnection({ token: '' })
    setConnection(next)
    setLogin(null)
    setLoginStatus('この端末からログアウトしました。')
  }

  async function generatePlan() {
    const nextTask = task.trim()
    if (!nextTask) return
    setBusy(true)
    setError('')
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content: nextTask }])
    try {
      const next = await window.aincarn.generatePlan(nextTask)
      setPlan(next)
      setSelectedCommand(next.suggestedCommands[0] || 'git status --short')
      setApprovalMode('blocked')
      setCommandResult(null)
      setTask('')
      setMessages((current) => [...current, {
        id: `agent-${Date.now()}`,
        role: 'agent',
        title: next.model ? `${next.title} / ${next.model}` : next.title,
        content: next.summary
      }])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '計画生成に失敗しました。')
    } finally {
      setBusy(false)
    }
  }

  async function runCommand() {
    if (approvalMode === 'blocked') return
    setBusy(true)
    setError('')
    setTerminalOpen(true)
    try {
      const result = await window.aincarn.runCommand(selectedCommand, true)
      setCommandResult(result)
      setMessages((current) => [...current, {
        id: `command-${Date.now()}`,
        role: 'agent',
        title: result.exitCode === 0 ? 'Verification passed' : 'Verification needs attention',
        content: `${result.command} を実行しました。終了コード: ${result.exitCode ?? 'error'}`
      }])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'コマンド実行に失敗しました。')
    } finally {
      setBusy(false)
      if (approvalMode === 'once') setApprovalMode('blocked')
    }
  }

  return (
    <main className={`appShell ${terminalOpen ? 'withTerminal' : ''}`}>
      <header className="topbar">
        <div className="brandMark">A</div>
        <div className="brandText">
          <strong>Aincarn Agent</strong>
          <span>{workspace ? workspace.name : 'No workspace'}</span>
        </div>
        <div className="topbarActions">
          <button type="button" className="ghostButton" onClick={() => setSettingsOpen((open) => !open)}>
            {connection?.token ? 'ログイン済み' : 'ログイン'}
          </button>
          <button type="button" className="ghostButton" onClick={selectWorkspace}>
            {workspace ? '別のフォルダを開く' : 'フォルダを開く'}
          </button>
          <button type="button" className={`ghostButton ${terminalOpen ? 'active' : ''}`} onClick={() => setTerminalOpen((open) => !open)}>
            Terminal
          </button>
        </div>
      </header>

      {settingsOpen && (
        <section className="settingsPanel">
          <div>
            <p>Desktop Login</p>
            <h2>Aincarnアカウントで接続</h2>
            <span>Device ID: {connection?.deviceId || 'loading'}</span>
            <span>Status: {connection?.token ? 'この端末はアカウントに接続済みです' : '未ログイン'}</span>
          </div>
          {login ? (
            <div className="loginCode">
              <strong>{login.userCode}</strong>
              <a href={login.verificationUrl} target="_blank" rel="noreferrer">{login.verificationUrl}</a>
            </div>
          ) : (
            <button type="button" className="primaryButton" onClick={startLogin}>
              ブラウザでログイン
            </button>
          )}
          {connection?.token && <button type="button" className="ghostButton" onClick={disconnect}>ログアウト</button>}
          {loginStatus && <span>{loginStatus}</span>}
        </section>
      )}

      <section className="agentLayout">
        <aside className="sidebar">
          <div className="sectionHead">
            <p>Workspace</p>
            <span>{workspace ? `${workspace.files.length} files` : 'offline'}</span>
          </div>
          {workspace ? (
            <>
              <h2>{workspace.name}</h2>
              <p className="muted path">{workspace.root}</p>
              <div className="chips">
                {workspace.packageScripts.slice(0, 8).map((script) => <span key={script}>npm:{script}</span>)}
                {workspace.ignoredCount > 0 && <span>{workspace.ignoredCount} ignored</span>}
              </div>
              <div className="fileList">
                {visibleFiles.map((file) => (
                  <div key={file.path} className="fileRow">
                    <span>{file.path}</span>
                    <small>{Math.ceil(file.size / 1024)}KB</small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="emptyState">
              <strong>ローカルプロジェクトを接続</strong>
              <p>フォルダを選ぶと、秘密情報や巨大ファイルを避けて構成だけを読み取ります。</p>
              <button type="button" className="primaryButton" onClick={selectWorkspace}>フォルダを開く</button>
            </div>
          )}
        </aside>

        <section className="conversation">
          <div className="conversationHeader">
            <div>
              <p>Conversation</p>
              <h1>開発タスクをAincarnに渡す</h1>
            </div>
            <span className="statusPill">{busy ? 'Working' : plan?.mode === 'ai' ? 'AI mode' : 'Ready'}</span>
          </div>

          <div className="messageList">
            {messages.map((message) => (
              <article key={message.id} className={`message ${message.role}`}>
                {message.title && <span>{message.title}</span>}
                <p>{message.content}</p>
              </article>
            ))}
            {error && <p className="error">{error}</p>}
          </div>

          {plan && (
            <div className="approvalBar">
              <div className="approvalMeta">
                <span>Pending command</span>
                <select value={selectedCommand} onChange={(event) => setSelectedCommand(event.target.value)}>
                  {plan.suggestedCommands.map((command) => <option key={command} value={command}>{command}</option>)}
                </select>
              </div>
              <div className="approvalActions" role="group" aria-label="コマンド承認">
                <button type="button" className={approvalMode === 'once' ? 'approvalChoice selected' : 'approvalChoice'} onClick={() => setApprovalMode('once')}>今回のみ</button>
                <button type="button" className={approvalMode === 'always' ? 'approvalChoice selected' : 'approvalChoice'} onClick={() => setApprovalMode('always')}>常に承認</button>
                <button type="button" className={approvalMode === 'blocked' ? 'approvalChoice danger selected' : 'approvalChoice danger'} onClick={() => setApprovalMode('blocked')}>拒否</button>
                <button type="button" className="runButton" onClick={runCommand} disabled={!canRunCommand}>実行</button>
              </div>
            </div>
          )}

          <form className="composer" onSubmit={(event) => { event.preventDefault(); generatePlan() }}>
            <textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="例: 料金比較ツールのUI崩れを直し、ビルドが通るか確認する" />
            <button className="sendButton" type="submit" disabled={!workspace || busy || !task.trim()}>{busy ? '...' : '送信'}</button>
          </form>
        </section>

        <aside className="planPanel">
          <div className="sectionHead">
            <p>Execution Plan</p>
            <span>{plan ? `${plan.steps.length} steps` : 'waiting'}</span>
          </div>
          {plan ? (
            <>
              <div className="planMode">
                <span>{plan.mode === 'ai' ? 'AI proxy' : 'Local planner'}</span>
                {plan.model && <strong>{plan.model}</strong>}
              </div>
              <h2>{plan.title}</h2>
              <p className="muted">{plan.summary}</p>
              <div className="todoList">
                {plan.steps.map((step, index) => (
                  <article key={`${step.title}-${index}`} className="todoItem">
                    <span className="todoIndex">{index + 1}</span>
                    <div><strong>{step.title}</strong><p>{step.detail}</p></div>
                    <em className={`risk ${step.risk}`}>{step.risk}</em>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="emptyState">
              <strong>実行計画はここに表示されます</strong>
              <p>会話欄からタスクを送ると、AIまたはローカルプランナーが計画、TODO、検証コマンドを整理します。</p>
            </div>
          )}
        </aside>
      </section>

      {terminalOpen && (
        <section className="terminalDock">
          <div className="terminalHeader"><strong>Terminal</strong><button type="button" onClick={() => setTerminalOpen(false)}>Hide</button></div>
          <pre>{commandResult ? `$ ${commandResult.command}
exit ${commandResult.exitCode ?? 'error'}

${commandResult.stdout}
${commandResult.stderr}` : '承認されたコマンドの出力がここに表示されます。'}</pre>
        </section>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
