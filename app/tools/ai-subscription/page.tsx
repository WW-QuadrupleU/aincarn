import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

// `/tools/ai-subscription` も公開停止。サブスク管理本体（subscriptions）を
// 隠している間は、旧URLからも到達できないようにする。
export default function AiSubscriptionRedirectPage() {
  notFound()
}
