# Jev Hub 仕様書

作成: 2026-09-26 / 状態: 初版（R-01〜R-10 の全 AC にテストあり・Green。ユニット 73 / dist 16 / E2E 9）

> **この文書が正。** 仕様に無いものは作らない。仕様を変えるときは先にここを直し、次にテスト、最後に実装。
> 各受け入れ条件（AC）は必ずテスト ID を持つ。`todo` はまだテストが無い条件。

## 0. このサイトは何か

TypeSafe AI の **Jev**（System One モデル）を中心とした情報をまとめる静的サイト。
公式ドキュメント・SDK・経由できるゲートウェイ・互換のオープン実装・解説記事・評価結果を
1 か所に集め、「Jev とは何で、どこから触れるか」を日本語と英語で読めるようにする。

## 0.1 編集方針（誠実さの契約）

1. **一次ソースを取得して確認した項目だけ掲載する。** 各エントリは `sourceRefs`（確認した URL）を 1 件以上持つ。
2. **説明文は自分の言葉で書く。** README・記事・ツイート本文を転載しない。
3. **ベンダーの主張はベンダーの主張として書く。** 速度・価格・「ハルシネーションが無い」などの数値は
   TypeSafe 社の公表値であることが分かる書き方にし、第三者が検証した事実のように書かない（R-03）。
4. **フォーク・ミラーは載せない。** 同じ実装が多数フォークされている場合は上流だけを載せる。
5. **API キー・認証情報・有料プランの代理購入を扱わない。** リンクと説明だけ。
6. 初版は 15〜25 エントリ。一次ソースを確認できたものだけを足す。

## 1. 用語

| 用語 | 意味 |
|---|---|
| エントリ | `src/data/entries.json` の 1 要素 |
| カテゴリ | 7 種の固定分類（R-02） |
| 公式 | `official: true`。TypeSafe AI 自身が公開・運用しているもの |
| ロケール | `en`（既定・URL 接頭なし）と `ja`（`/ja/` 接頭） |

## R-01 データ

エントリはひとつの JSON 配列で管理し、Astro content collection の `file()` ローダーと zod スキーマで検証する。

| 項目 | 型 | 必須 | 制約 |
|---|---|---|---|
| id | string | ✔ | `^[a-z0-9-]+$`、全体で一意 |
| name | string | ✔ | 2 文字以上 |
| url | URL | ✔ | 入口となる公式ページ。**http(s) のみ**（`javascript:` `data:` は拒否） |
| repoUrl | URL | | GitHub 等 |
| category | enum | ✔ | R-02 の slug |
| tags | string[] | | 既定 `[]` |
| org | string | ✔ | 提供元（企業・個人・プロジェクト名） |
| region | string | | 提供元の所在。`US` `JP` など。**不明なら省略する** |
| license | string | | SPDX 風。不明は `unknown`、ソフトでないものは省略 |
| language | string | | プログラミング言語 |
| date | string | ✔ | `YYYY` / `YYYY-MM` / `YYYY-MM-DD`。公開・改訂日。調査日で代用しない |
| addedAt | string | ✔ | `YYYY-MM-DD`。新着・RSS の基準 |
| stars | int ≥ 0 | | GitHub のスター数 |
| starsUpdatedAt | `YYYY-MM-DD` | | `refresh-stars` が書く |
| status | `active` \| `archived` | | 既定 `active` |
| official | boolean | | 既定 `false`。TypeSafe AI 自身の提供物だけ `true` |
| description_en | string | ✔ | 60〜600 文字 |
| description_ja | string | ✔ | 40〜600 文字 |
| featured | boolean | | 既定 `false` |
| sourceRefs | URL[] | ✔ | 1 件以上 |

未知のキーはエラー（`.strict()`）。`stars` があるのに `repoUrl` が無いエントリは拒否する。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-01-1 | 正しいエントリはスキーマを通る | `tests/unit/schema.test.ts` |
| AC-01-2 | `javascript:` / `data:` の `url` は拒否される | `tests/unit/schema.test.ts` |
| AC-01-3 | 未知のキーを足すと拒否される | `tests/unit/schema.test.ts` |
| AC-01-4 | `sourceRefs` が空だと拒否される | `tests/unit/schema.test.ts` |
| AC-01-5 | `stars` があって `repoUrl` が無いと拒否される | `tests/unit/schema.test.ts` |
| AC-01-6 | `src/data/entries.json` の全件がスキーマを通り、`id` が一意 | `tests/unit/data.test.ts` |
| AC-01-7 | `date` は `addedAt` 以前であり、未来日を持たない | `tests/unit/data.test.ts` |

## R-02 カテゴリ

固定の 8 分類。各カテゴリは日英のラベルと説明、JSON-LD の型を持つ。

| slug | ラベル（ja） | 中身 |
|---|---|---|
| `model` | モデル・公式情報 | Jev 本体、公式サイト、発表、モデル仕様 |
| `docs` | ドキュメント | 公式ドキュメント、API リファレンス、クックブック |
| `sdk` | SDK・クライアント | 公式 SDK と各言語のクライアント |
| `gateway` | ゲートウェイ・経由先 | Jev を中継して使えるプラットフォーム |
| `oss` | 互換オープン実装 | Jev 互換の API をローカル／オープンモデルで実装したもの |
| `integration` | 連携・ツール | エージェント枠組みや開発ツールへの組み込み |
| `guide` | 解説・記事 | 第三者による解説、チュートリアル、報道 |
| `benchmark` | 評価・ベンチマーク | 再現手順のある測定結果 |


| AC | Given / When / Then | テスト |
|---|---|---|
| AC-02-1 | 全カテゴリが日英のラベル・説明を持つ | `tests/unit/taxonomy.test.ts` |
| AC-02-2 | `entries.json` のカテゴリは全て定義済み slug | `tests/unit/data.test.ts` |
| AC-02-3 | 各カテゴリに 1 件以上のエントリがある | `tests/unit/data.test.ts` |

## R-03 ベンダー主張の表示

TypeSafe が公表する性能・価格の数値（例: 193.6x 速い、444.6x 安い、0.114 秒、$0.042 / 100 万入力トークン）は
**公表値であることを明示**する。サイトの各ページで数値を出す箇所には出典リンクを添え、
独立検証を主張しない旨の注記を 1 か所以上に置く。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-03-1 | 主張注記の文言が日英とも定義されている | `tests/unit/i18n.test.ts` |
| AC-03-2 | 主張注記コンポーネントが日英とも注記本文を描画する | `tests/unit/components.test.ts` |
| AC-03-3 | ビルド成果物のトップ・解説・About の日英 6 ページすべてに注記が含まれる | `tests/dist/dist.test.ts` |

## R-04 ページ

| パス（en） | 内容 |
|---|---|
| `/` | 導入、注目エントリ、カテゴリ一覧、新着 |
| `/entries` | 全エントリ一覧。検索・カテゴリ絞り込み・並べ替え |
| `/entries/<id>` | エントリ詳細 |
| `/category/<slug>` | カテゴリ単票（sitemap 用。一覧へ誘導する） |
| `/what-is-jev` | 解説: System One モデルとは何か、Choice / Score / Noul、どこから触るか |
| `/about` | このサイトについて、編集方針 |
| `/404` | 見つからないページ |

`ja` は同じ構成を `/ja/` 接頭で持つ。`/entries/<id>` と `/ja/entries/<id>` は同じ `id` を使う。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-04-1 | 全エントリの詳細ページが日英とも生成される | `tests/dist/dist.test.ts` |
| AC-04-2 | 各ページが `<title>` と meta description を持つ | `tests/dist/dist.test.ts` |
| AC-04-3 | カテゴリのリンクは一覧へ facet 付きで飛び、開いた先で絞り込みが選択済みになる | `tests/unit/i18n.test.ts` / `tests/e2e/entries.spec.ts` |
| AC-04-4 | 404 ページが日英とも生成され noindex を持つ（en は `404.html`、ja は `/ja/404`） | `tests/dist/dist.test.ts` |

## R-05 国際化

`en` を既定（接頭なし）、`ja` を `/ja/` とする。全ページに hreflang（en / ja / x-default）と canonical を出す。
言語切替は現在のページの対応するもう一方へ飛ぶ。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-05-1 | `localePath` / `stripLocale` / `otherLocalePath` が往復する | `tests/unit/i18n.test.ts` |
| AC-05-2 | 日英のメッセージキーが完全に一致する | `tests/unit/i18n.test.ts` |
| AC-05-3 | 生成 HTML に canonical と 3 本の hreflang がある | `tests/dist/dist.test.ts` |
| AC-05-4 | `<html lang>` がロケールと一致し、言語切替で対応するページへ移動する | `tests/dist/dist.test.ts` / `tests/e2e/entries.spec.ts` |

## R-06 検索・絞り込み・並べ替え

一覧ページはクライアント側で動く。Fuse.js による名前・説明・タグの曖昧検索、カテゴリ絞り込み、
`featured` / `stars` / `newest` の並べ替え。JavaScript 無効でも全件がサーバー描画済みで読める。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-06-1 | `sortRows` が 3 モードで安定に並べる。`stars` 不明は既知の 0 より下。実ブラウザでも検索・絞り込み・並べ替えが効く | `tests/unit/sort.test.ts` / `tests/e2e/entries.spec.ts` |
| AC-06-2 | `toSearchIndex` が全エントリを検索用の形に落とす | `tests/unit/entries.test.ts` |
| AC-06-3 | JS 無効時も全エントリのカードが HTML に存在する | `tests/dist/dist.test.ts` |
| AC-06-4 | `/search-index.json` が生成され、件数がデータと一致する | `tests/dist/dist.test.ts` |

## R-07 構造化データと配信

エントリ詳細に JSON-LD（カテゴリごとの型）を出す。`sitemap.xml`、`robots.txt`、日英それぞれの RSS を出す。
JSON-LD の埋め込みでは `<` をエスケープしてタグを閉じられないようにする。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-07-1 | `jsonLd` がカテゴリに応じた `@type` を返す | `tests/unit/seo.test.ts` |
| AC-07-2 | `serializeJsonLd` が `<` をエスケープする | `tests/unit/seo.test.ts` |
| AC-07-3 | `sitemap-index.xml` と `robots.txt` が生成される | `tests/dist/dist.test.ts` |
| AC-07-4 | 日英の `rss.xml` が生成され、新着順に並ぶ | `tests/dist/dist.test.ts` |

## R-08 外部リンクの安全性

外部リンクは `rel="noopener noreferrer"` を持つ。`http(s)` 以外は出力しない（スキーマで弾く）。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-08-1 | 生成 HTML の外部 `a[target=_blank]` が全て `rel` を持つ | `tests/dist/dist.test.ts` |
| AC-08-2 | 生成 HTML に `javascript:` の href が無い | `tests/dist/dist.test.ts` |

## R-09 表示

カードは 1 列（狭幅）〜3 列。ダークモード対応（`prefers-color-scheme`）。
`hidden` 属性が効くよう `[hidden] { display: none !important }` を置く。
`prefers-reduced-motion` で装飾的な動きを止める。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-09-1 | `[hidden]` の打ち消しが global.css にある | `tests/unit/components.test.ts` |
| AC-09-2 | 本文色と背景色のコントラストが日英・明暗とも 4.5:1 以上（補助色は 3:1 以上） | `tests/unit/contrast.test.ts` |

## R-10 スター更新

`npm run refresh-stars` が `repoUrl` が GitHub のエントリについて star 数を取り、
`stars` と `starsUpdatedAt` を更新する。ネットワークが無い環境では何も壊さずに終わる。

| AC | Given / When / Then | テスト |
|---|---|---|
| AC-10-1 | GitHub の URL から `owner/repo` を取り出す。非 GitHub は無視 | `tests/unit/refresh-stars.test.ts` |
| AC-10-2 | 取得に失敗したエントリは既存の値を保つ | `tests/unit/refresh-stars.test.ts` |
