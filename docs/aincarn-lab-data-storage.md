# Aincarn Lab データ保存方針

## 結論

Aincarn Labの公開データは、まずリポジトリ内の構造化データで管理する。
Notionは下書き、実測メモ、未整理ログの置き場として使う。

## 理由

- 公開ページの表示が安定する
- Gitで変更履歴を追える
- build時に静的ページとして生成しやすい
- AdSense審査やSEOに必要な本文をサイト内に残せる
- Notion APIの失敗や権限変更で公開ページが壊れにくい

## 推奨フロー

1. Notionに実測メモを保存する
2. モデル名、比較日、プロンプト、結果要約、評価を整理する
3. 公開できる形に要約する
4. `lib/aincarn-lab.ts` または将来的な `content/lab/*.json` に反映する
5. サイトに表示する

## 将来の拡張

ログが増えたら、`content/lab/` にJSONまたはMDXを分離する。

例:

```txt
content/lab/writing/2026-05.json
content/lab/coding/2026-05.json
content/lab/research/2026-05.json
```

Notion連携は、公開前の作業台として使うのが安全。
Notionを公開ページの唯一のデータソースにするのは、初期段階では避ける。
