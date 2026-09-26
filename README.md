# Jev Hub

TypeSafe AI の **Jev**（System One モデル）に関する情報をまとめる静的サイト。日本語と英語。

公式ドキュメント・SDK・中継して使えるゲートウェイ・互換のオープン実装・連携ツール・解説記事・
手順が公開された評価を、一次ソースを開いて確認したうえで 1 か所に集めている。

- 仕様: [`docs/spec.md`](docs/spec.md)
- データ: [`src/data/entries.json`](src/data/entries.json)（各エントリが `sourceRefs` に確認した URL を持つ）
- 作業メモ: [`AGENTS.md`](AGENTS.md)

## 方針

1. 実際に開いて読んだものだけを載せる。確認した URL はエントリに残す。
2. 説明文は自分の言葉で書く。転載しない。
3. ベンダーの数値はベンダーの数値として書く。このサイトは独立に測定していない。
4. フォーク・ミラーは載せない。上流だけを載せる。
5. 紹介リンク・API キー・データの再配布は扱わない。

## 開発

Node 22.12 以上。

```sh
npm install
npm run dev        # http://localhost:4321
npm run verify     # 型チェック + ユニット + ビルド + ビルド成果物テスト
```

| コマンド | 内容 |
|---|---|
| `npm run check` | `astro sync && astro check && vitest run` |
| `npm run build` | `dist/` に静的サイトを生成 |
| `npm run test:dist` | `dist/` を読むテスト（`build` のあとに実行） |
| `npm run refresh-stars` | `repoUrl` が GitHub のエントリの star 数を更新 |
| `npm run linkcheck` | `dist/` 内のリンク切れ確認 |

環境変数は [`.env.example`](.env.example) を参照。`PUBLIC_SITE_URL` は canonical と sitemap の基準になる。

## ライセンス

サイトのコードは MIT。掲載しているプロジェクト・記事の権利はそれぞれの権利者にある。
このサイトは TypeSafe AI とは関係がない独立したまとめ。
