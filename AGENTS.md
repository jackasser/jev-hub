# Jev Hub — 作業メモ（Claude / エージェント向け）

TypeSafe AI の **Jev**（System One モデル）まわりのまとめサイト。姉妹プロジェクトの `fly-brain-hub`
と同じ作法で運用する。

- **仕様が正。** `docs/spec.md` の要件 R-xx と受け入れ条件 AC-xx-n を先に読む。仕様に無いものは作らない。
  変更するときは spec → テスト → 実装の順。
- **TDD。** 新機能は失敗するテストから。ユニット `tests/unit`（Vitest + Astro Container API）、
  ビルド成果物 `tests/dist`（`npm run build` 後）。
- **データの誠実さ。** `src/data/entries.json` の各エントリは一次ソースを開いて確認し、URL を `sourceRefs` に残す。
  説明文は自分の言葉で書く。README・記事・ポストを貼らない。
- **ベンダーの数値はベンダーの数値として書く。** 速度・価格・「ハルシネーションが無い」は TypeSafe の公表値。
  独立検証のように書かない。測定は `benchmark` カテゴリに分け、手順が公開されているものだけを載せる。
- **フォークは載せない。** `pi-*` 系のように同じ README のフォークが多数あるものは、上流だけを載せる。
- 開発サーバーはバックグラウンドで: `npx astro dev --background`（`astro dev stop` / `status` / `logs`）。

## 検証

```
npm run check      # astro sync && astro check && vitest run
npm run build
npm run test:dist  # dist/ を読むので build のあと
npm run verify     # 上の 3 つを通しで
```

## 踏んだ罠

- `<form>` 内の `name="category"` コントロールが `form.dataset` を隠す → data 属性は `getAttribute` で読む
  （`SearchEntries.astro` はそうしている）
- `.card { display: flex }` が `hidden` 属性を無効化 → `[hidden] { display: none !important }` を global.css に置いた
- Astro は `data-x={''}` を値なしの `data-x` として描画する。空文字を期待するテストは落ちるので、
  無い値は `undefined` を渡して属性ごと省く
- 404 の出力先は en が `dist/404.html`、ja が `dist/ja/404/index.html` で非対称
- `import.meta.url` からパスを作るときは `URL.pathname` ではなく `fileURLToPath` を使う
  （日本語を含むパスがエンコードされたままになる）
- 長いヒアドキュメントでシェル経由のファイル作成をすると壊れることがある。大きいファイルは書き込みツールで作る

Astro のドキュメント: https://docs.astro.build （content collections / i18n / Container API）
