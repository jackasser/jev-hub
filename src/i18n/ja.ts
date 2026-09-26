import type { MessageKey } from './en';

export const ja: Record<MessageKey, string> = {
  'site.name': 'Jev Hub',
  'site.tagline': 'TypeSafe AI の Jev に関する情報をまとめる',
  'site.description':
    'TypeSafe AI の System One モデル「Jev」のまとめ。公式ドキュメントと SDK、中継して使えるゲートウェイ、互換のオープン実装、連携ツール、手順が公開された評価を、一次ソースを確認したうえで集めている。',

  'nav.home': 'ホーム',
  'nav.entries': '一覧',
  'nav.explainer': 'Jev とは',
  'nav.about': 'このサイトについて',
  'nav.skip': '本文へ移動',

  'home.lead':
    'Jev は、文章を返す代わりに、プログラムの状態について型のある質問に答えるモデル。このサイトは、その周辺にあるものを集めている。ドキュメントの場所、到達できる SDK とゲートウェイ、同じ通信形式を話すオープン実装、そして実際に測った人の記録。',
  'home.featured': 'まずここから',
  'home.categories': 'カテゴリから探す',
  'home.latest': '最近公開されたもの',
  'home.viewAll': '一覧をすべて見る',
  'home.count.one': '件',
  'home.count.other': '件',

  'entries.title': '一覧',
  'entries.lead': '掲載しているものは、すべて実際に開いて読んでから載せている。確認した URL を各エントリに残している。',
  'entries.search.label': '検索',
  'entries.search.placeholder': '名前・タグ・提供元…',
  'entries.filter.category': 'カテゴリ',
  'entries.filter.all': 'すべて',
  'entries.sort.label': '並べ替え',
  'entries.sort.featured': 'おすすめ順',
  'entries.sort.stars': 'スター数',
  'entries.sort.newest': '新着順',
  'entries.showing': '表示中',
  'entries.of': '/',
  'entries.empty': '一致するものがない。短い語で試すか、カテゴリの絞り込みを外す。',
  'entries.reset': '解除',

  'card.official': '公式',
  'card.stars': 'スター',

  'detail.category': 'カテゴリ',
  'detail.org': '提供元',
  'detail.license': 'ライセンス',
  'detail.language': '言語',
  'detail.published': '公開',
  'detail.added': '掲載日',
  'detail.stars': 'GitHub スター',
  'detail.visit': '開く',
  'detail.repo': 'リポジトリ',
  'detail.sources': '確認したソース',
  'detail.back': '一覧へ戻る',
  'detail.related': '同じカテゴリの他のもの',

  'explainer.title': 'Jev とは',
  'explainer.lead': 'System One モデルとは何か、3 種類の質問、そしてモデルに到達する経路を、短く説明する。',

  'about.title': 'このサイトについて',
  'about.lead': '何を載せ、どう確認し、何をしないと決めているか。',

  'claims.title': 'このサイトに出てくる数値について',
  'claims.body':
    '速度・価格・「ハルシネーションが無い」といった数値は、TypeSafe AI 自身が公表している資料に基づくもので、同社の主張として、読んだ場所へのリンクとともに載せている。このサイト自体が独立に測定したものではない。「評価・ベンチマーク」に載せているのは手順が公開された第三者の測定で、一般化する前にそれぞれが書いている適用範囲を読んでほしい。',

  'footer.editorial': '一次ソースを読んでから載せている。説明文は転載ではなく自分の言葉で書いている。',
  'footer.notAffiliated': '独立したまとめサイトで、TypeSafe AI とは関係がない。',
  'footer.updated': '最終更新',

  'lang.switch': 'English',
  'lang.switchLabel': '言語を切り替える',

  '404.title': 'ページが見つからない',
  '404.body': 'その URL はここには無い。一覧から探すのが早い。',
};
