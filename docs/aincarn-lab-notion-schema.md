# Aincarn Lab × Notion 連携手順

`lib/aincarn-lab.ts` のモデル別出力 (`LabLog.outputs`) を Notion から差し替える仕組みです。Notion に書いたものが優先表示され、Notion 側でエラーが起きた場合はコード内の埋め込みデータにフォールバックします。

## 1. Notion の Integration を作成

1. <https://www.notion.so/profile/integrations> を開く
2. **+ New integration** をクリック
3. Name: `Aincarn Lab` など。Capabilities は **Read content** だけで良い (書き込み不要)
4. Submit すると Internal Integration Token が発行される (`secret_xxxxx`)。これを `NOTION_TOKEN` として控える

## 2. データベース「Aincarn Lab Outputs」を作る

Notion で新規ページを開き、**Database — Full page** を作成。以下のプロパティを設定します。

| プロパティ | 種類 | 必須 | 用途 |
|---|---|---|---|
| **Model** | Title | ✅ | モデル名 (例: `ChatGPT 5.5 Thinking拡張`) |
| **Category** | Select | ✅ | `writing` / `coding` / `research` のいずれか |
| **Order** | Number | 推奨 | カテゴリ内のタブ並び順 (小さいほど左) |
| **Brief** | Text (Rich text) | ✅ | カードの先頭に表示する 100〜200 字程度の要旨 |
| **LogDate** | Date | ✅ | 比較セッションの日付。**同じ日付 = 1 回の比較**。サイトでは Category ごとに最新の LogDate の行だけを表示する |
| **Status** | Select | 任意 | `draft` / `published` などお好みで（現状は表示で使っていない） |

### LogDate の使い方 (重要)

サイトは「Category × LogDate」の組を 1 つの比較セッションとして扱います。

- 同じ比較セッションのモデル群は **すべて同じ LogDate** にする (例: 2026-05-26)
- 新しい比較を追加するときは **新しい LogDate** で行を追加する (例: 2026-07-15)
- 過去の比較は Notion 側にスタックで残るので履歴として参照可能。サイト上では最新だけが見える

### Select オプションの整え方

`Category` プロパティを編集 → 以下の3つを追加:

- `writing` (色は何でも良い)
- `coding`
- `research`

## 3. データベースを Integration に共有

1. データベースのページ右上の **「・・・」 → Connections → Add connections**
2. ステップ1で作った `Aincarn Lab` Integration を選択

これをしないと API から見えないので必須。

## 4. データベース ID を取得

Notion で対象データベースを開いたときの URL:

```
https://www.notion.so/<workspace>/<database_id>?v=...
```

`?v=` の前の長い英数字が **データベース ID**。`NOTION_LAB_OUTPUTS_DB_ID` として控える。

## 5. Vercel に環境変数を登録

Vercel → Project Settings → Environment Variables (Production) に以下を追加し **Redeploy**:

```
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_LAB_OUTPUTS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

設定がなければ Notion フェッチはスキップされ、コード内データだけで動作するので **未設定のまま本番にデプロイしても安全** です。

## 6. データの書き方

データベースに 1 行 = 1 モデルの出力 を追加します。

### プロパティ

```
Model     = ChatGPT 5.5 Thinking拡張
Category  = writing
Order     = 1
LogDate   = 2026-05-26
Brief     = 「ChatGPT PlusとAPI利用はどちらが向いている？」 という記事タイトル案を提示...
```

### ページ本文 (= ブロック)

ページ本文を開いて、見出しと箇条書きで「セクション」を作ります。

```markdown
## 主な構成
- 結論: 多くの個人ユーザーはまず月額プラン、開発・自動化ならAPI
- ChatGPT Plus が向いている人 / API 利用が向いている人
- 比較表に入れるべき項目
- 料金比較で見るべきポイント
- 注意点 / まとめ / 読者が誤解しやすい点

## 比較表で挙げた項目
- 料金体系 / 主な使い方 / 初心者向け度
- コストの読みやすさ / 導入の手間
- モデル選択の自由度 / 自動化への向き不向き

## 注意点
- 料金は必ず公式ページで確認する
- ChatGPT Plus と API は別物として扱う
- API は初心者には費用管理が難しい

## 誤解されやすい点
- ChatGPT Plus に入れば API も使い放題になる
- API は必ず月額プランより安い
- Claude Pro や Gemini Advanced も ChatGPT Plus と同じものだと思ってしまう
```

ルール:

- **Heading 2 か Heading 3** がセクション区切り
- その下に **箇条書き (Bulleted list)** または通常のパラグラフ
- 段落とリストは混在 OK
- 見出しの無いまま箇条書きが続く場合、自動的に「メモ」セクションにまとめます

### 同じカテゴリに複数モデルを書く

同じ比較セッションの 3 モデルは **すべて同じ LogDate** にして、`Order = 1, 2, 3` を振り分けると、サイトのタブが 1→2→3 の順で並びます。

### 新しい比較セッションを追加するとき

例: 2026-07 に再比較する場合

1. 既存の `LogDate = 2026-05-26` の行はそのまま残しておく (Notion 側にアーカイブ)
2. 新しい行を 3 つ作り、すべて `LogDate = 2026-07-15` にする
3. サイトは自動的に最新の `2026-07-15` の方を表示する
4. もし「やっぱり 5 月版に戻したい」場合は 7 月の行を削除すれば 5 月版が再び表示される

## 7. 反映を確認

- 編集後、最長 **5 分** で `/lab/writing` などのページに反映される (ISR)
- 即時反映したい場合は Vercel の Deployments から再デプロイ、または `revalidate` パラメータ付きの再リクエスト
- もし反映されない場合は Vercel の Functions ログで `[lab-notion]` で検索 → エラー原因を確認

## 8. 失敗時の挙動

| 状況 | 動作 |
|---|---|
| `NOTION_TOKEN` / `NOTION_LAB_OUTPUTS_DB_ID` 未設定 | Notion フェッチをスキップ。コード内データを表示 |
| Notion API がエラー (401/404/タイムアウト等) | サーバーログに `[lab-notion] outputs fetch failed` を記録。コード内データを表示 |
| Notion DB に該当カテゴリのページが 0 件 | コード内データを表示 |

→ どのケースでもサイトは壊れないので安心して Notion を編集できます。
