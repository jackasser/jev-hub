import type { Locale } from '../lib/taxonomy';

export interface Localised {
  en: string;
  ja: string;
}

export interface QuestionType {
  /** The name used in the API and the SDKs. */
  name: string;
  returns: Localised;
  body: Localised;
  sourceRef: string;
}

export interface Step {
  heading: Localised;
  body: Localised;
}

/**
 * R-04 / AC-04-2. The explainer is data rather than markup so the same text can be
 * asserted in a unit test without rendering a page.
 */
export const INTRO: Localised = {
  en: 'A chat model answers by writing. That is useful when a person reads the answer, and awkward when a program has to act on it: the text has to be parsed, the parse can fail, and a value that was never one of your options can still come back. A System One model removes that step. You describe the decision as a typed question, and the model returns a value from inside that type.',
  ja: 'チャットモデルは文章を書いて答える。読むのが人間なら便利だが、答えを受けて動くのがプログラムだと具合が悪い。文字列を解析する必要があり、解析は失敗しうるし、自分が用意していない値が返ってくることもある。System One モデルはこの段を無くす。判断を型のある質問として書くと、モデルはその型の内側から値を返す。',
};

export const STEPS: Step[] = [
  {
    heading: {
      en: 'You send state, not a prompt',
      ja: '渡すのはプロンプトではなく状態',
    },
    body: {
      en: 'The request carries the thing being judged — a string, an object, a list — under its own field, separate from the questions. It is sent once, however many questions you attach to it.',
      ja: 'リクエストには、判定したいもの（文字列・オブジェクト・配列）を質問とは別のフィールドで載せる。質問を何個付けても、状態が送られるのは 1 回だけ。',
    },
  },
  {
    heading: {
      en: 'You attach named, typed questions',
      ja: '名前の付いた型付きの質問を添える',
    },
    body: {
      en: 'Each question has a name you choose, a type, and instructions. The answers come back under the same names, so there is no positional matching to get wrong.',
      ja: '質問には自分で付けた名前・型・指示がある。答えも同じ名前で返るので、順番を数えて取り違えることがない。',
    },
  },
  {
    heading: {
      en: 'Every question is answered in one pass',
      ja: 'すべての質問が 1 回で答えられる',
    },
    body: {
      en: 'Batching is not an optimisation you bolt on later; it is the normal shape of a call. Asking ten questions about one state costs roughly one state, not ten.',
      ja: 'まとめて聞くのは後から足す最適化ではなく、呼び出しの普通の形。1 つの状態に 10 個質問しても、かかるのは状態 1 個分に近い。',
    },
  },
  {
    heading: {
      en: 'The answer arrives with a probability',
      ja: '答えには確率が付いてくる',
    },
    body: {
      en: 'The value is what to do; the probability is how much to trust it. Thresholds live in your code, which means the risk you are willing to take is reviewable in a diff rather than buried in a prompt.',
      ja: '値は「何をするか」、確率は「どれだけ信じるか」。しきい値は自分のコードの中に置くので、どこまでのリスクを取るかがプロンプトの奥ではなく差分としてレビューできる。',
    },
  },
];

export const QUESTION_TYPES: QuestionType[] = [
  {
    name: 'choice',
    returns: { en: 'one option, plus the probability of each', ja: '選択肢 1 つと、各選択肢の確率' },
    body: {
      en: 'Pick one label from a set you defined. Use it for routing, categorising and any decision whose outcomes you can enumerate.',
      ja: '自分で定義した集合から 1 つ選ばせる。振り分け、分類、結果を列挙できる判断に使う。',
    },
    sourceRef: 'https://docs.typesafe.ai/primitives/choice',
  },
  {
    name: 'score',
    returns: { en: 'a probability-weighted level on your scale', ja: 'スケール上の、確率で重み付けされた値' },
    body: {
      en: 'Place the state on an ordered rubric. Use it when the levels have a direction — severity, quality, priority — rather than being unrelated buckets.',
      ja: '順序のある基準の上に状態を置く。深刻度・品質・優先度のように、水準に向きがある場合に使う。無関係な箱を並べるのには向かない。',
    },
    sourceRef: 'https://docs.typesafe.ai/primitives/score',
  },
  {
    name: 'noul',
    returns: { en: 'a single probability between 0 and 1', ja: '0 から 1 までの確率 1 つ' },
    body: {
      en: 'Ask whether something holds. There is no separate confidence field, because the value already is the confidence.',
      ja: 'それが成り立つかを聞く。confidence という別の欄は無い。値そのものが確からしさだから。',
    },
    sourceRef: 'https://docs.typesafe.ai/primitives/noul',
  },
];

export const CAVEAT: Localised = {
  en: 'The type is a guarantee about the shape of the answer, not about the answer. A schema stops a value that was never an option; it does not stop the wrong option. Two things follow: check the calibration on your own task rather than trusting a headline figure, and read the vendor’s own page on where the model is uneven before you put a threshold anywhere that matters.',
  ja: '型が保証するのは答えの「形」であって、答えそのものではない。スキーマは用意していない値をはじくが、用意した中の間違った値ははじかない。ここから 2 つ言える。見出しの数字を信じる前に自分のタスクで校正を確かめること。そして、重要な場所にしきい値を置く前に、ベンダー自身が書いている「モデルのムラ」のページを読むこと。',
};

export function pickText(value: Localised, locale: Locale): string {
  return value[locale];
}
