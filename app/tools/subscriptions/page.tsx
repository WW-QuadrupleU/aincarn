import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

// サブスク管理ツールは公開停止中。直URLでアクセスされても 404 を返す。
// 過去のリンクや検索結果からの流入をブロックする目的。再公開する場合は
// このファイルを差し戻し、Header と /tools のリンクも復活させる。
export default function SubscriptionsPage() {
  notFound()
}
