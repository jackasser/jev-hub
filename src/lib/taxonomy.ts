export type Locale = 'en' | 'ja';

export const CATEGORIES = [
  'model',
  'docs',
  'sdk',
  'gateway',
  'oss',
  'integration',
  'guide',
  'benchmark',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type JsonLdType = 'SoftwareApplication' | 'TechArticle' | 'SoftwareSourceCode' | 'WebAPI' | 'Dataset';

export interface CategoryMeta {
  label: Record<Locale, string>;
  blurb: Record<Locale, string>;
  jsonLdType: JsonLdType;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  model: {
    label: { en: 'Model & official', ja: 'モデル・公式情報' },
    blurb: {
      en: 'Jev itself: the model card, the launch announcement and what TypeSafe AI publishes about it.',
      ja: 'Jev そのもの。モデル仕様、発表、TypeSafe AI が公表している内容。',
    },
    jsonLdType: 'SoftwareApplication',
  },
  docs: {
    label: { en: 'Documentation', ja: 'ドキュメント' },
    blurb: {
      en: 'The official docs: quickstart, the question primitives, patterns, cookbooks and the HTTP API reference.',
      ja: '公式ドキュメント。クイックスタート、質問の型、設計パターン、クックブック、HTTP API リファレンス。',
    },
    jsonLdType: 'TechArticle',
  },
  sdk: {
    label: { en: 'SDKs & clients', ja: 'SDK・クライアント' },
    blurb: {
      en: 'Client libraries that wrap the decision endpoint so questions stay typed in your own language.',
      ja: '判定エンドポイントを包むクライアント。質問の型を言語側で保ったまま呼べる。',
    },
    jsonLdType: 'SoftwareSourceCode',
  },
  gateway: {
    label: { en: 'Gateways & access', ja: 'ゲートウェイ・経由先' },
    blurb: {
      en: 'Platforms that relay Jev, so you can reach it with a key you already have.',
      ja: 'Jev を中継するプラットフォーム。手元にあるキーのまま到達できる経路。',
    },
    jsonLdType: 'WebAPI',
  },
  oss: {
    label: { en: 'Open implementations', ja: '互換オープン実装' },
    blurb: {
      en: 'Servers that speak the same wire protocol on open models, locally or on your own hardware.',
      ja: '同じ通信形式をオープンモデルで実装したサーバー。手元や自前の機材で動かせる。',
    },
    jsonLdType: 'SoftwareSourceCode',
  },
  integration: {
    label: { en: 'Integrations & tools', ja: '連携・ツール' },
    blurb: {
      en: 'Agent frameworks and developer tools that call a decision model in the loop.',
      ja: '判定モデルをループの中で呼ぶ、エージェント枠組みや開発ツール。',
    },
    jsonLdType: 'SoftwareSourceCode',
  },
  guide: {
    label: { en: 'Guides & coverage', ja: '解説・記事' },
    blurb: {
      en: 'Third-party explainers, walkthroughs and news written after the September 2026 launch.',
      ja: '2026 年 9 月の公開後に書かれた、第三者による解説・手順・報道。',
    },
    jsonLdType: 'TechArticle',
  },
  benchmark: {
    label: { en: 'Evaluations', ja: '評価・ベンチマーク' },
    blurb: {
      en: 'Measurements with a published method you could rerun, rather than a headline number.',
      ja: '見出しの数字ではなく、再実行できる手順が公開されている測定。',
    },
    jsonLdType: 'Dataset',
  },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
