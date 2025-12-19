import { Category, Product, Review } from './types';

export const CATEGORIES: Category[] = [
  { id: 'intro', label: '導入・プレ', color: 'bg-pink-100 text-pink-700' },
  { id: 'reading', label: '読譜・音符', color: 'bg-blue-100 text-blue-700' },
  { id: 'rhythm', label: 'リズム', color: 'bg-orange-100 text-orange-700' },
  { id: 'technique', label: '指の形・テクニック', color: 'bg-green-100 text-green-700' },
  { id: 'seasonal', label: '季節・イベント', color: 'bg-purple-100 text-purple-700' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: '3歳からの「絶対音感」育成カード',
    catchCopy: '遊び感覚で耳が育つ！',
    price: 1200,
    category: 'intro',
    isNew: true,
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A4', pages: 12 },
    targetAudience: ['集中力が続かない3歳児', '耳を育てたいプレコース'],
    benefits: ['ゲーム感覚で音が聴き分けられるようになる', 'レッスン前の導入がスムーズに'],
    description: '色とキャラクターを使って、楽しく音感を育てるカードセットです。印刷してラミネートすれば、長く使える教室の定番アイテムに。',
    howTo: '厚紙に印刷してカード化し、カルタ取りのように遊んでください。'
  },
  {
    id: 'p2',
    title: 'ドレミが読める！魔法の音符カード',
    catchCopy: '読譜嫌いな子が夢中になる',
    price: 1500,
    category: 'reading',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1621360841012-3f82086b970d?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A4', pages: 24 },
    targetAudience: ['五線譜を見ると固まる子', 'お家での練習が進まない子'],
    benefits: ['視覚的に音の高低が理解できる', '自分から進んで音読みをするようになる'],
    description: '大きなイラストと音符がセットになった画期的なカード。子供の視界に入りやすいサイズで設計されています。',
    howTo: '最初は絵を見せて、徐々に音符だけの面に切り替えていくフラッシュカード形式がおすすめです。'
  },
  {
    id: 'p3',
    title: 'リズム積み木プリント',
    catchCopy: '体で感じるリズム遊び',
    price: 980,
    category: 'rhythm',
    image: 'https://images.unsplash.com/photo-1519683109079-d5f539e1542f?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1519683109079-d5f539e1542f?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A4', pages: 8 },
    targetAudience: ['リズム感が不安定な子', '拍子が取れない子'],
    benefits: ['視覚と触覚でリズムを理解できる', '一定のテンポを保てるようになる'],
    description: '積み木の長さを音符の長さに例えたプリント教材。切って貼って工作しながらリズムを学べます。',
    howTo: '画用紙に印刷して切り取り、実際に並べてリズムを作ってみましょう。'
  },
  {
    id: 'p4',
    title: '指の形矯正！にぎにぎボール台紙',
    catchCopy: 'マムシ指が直る魔法のシート',
    price: 800,
    category: 'technique',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A5', pages: 1 },
    targetAudience: ['指が潰れてしまう子', '脱力ができない子'],
    benefits: ['自然と綺麗なハンドフォームが身につく', '力みが取れて良い音が出る'],
    description: '100円ショップのボールと組み合わせて使う台紙。子供の視界に入りやすいサイズで設計されています。',
    howTo: 'ボールを握らせた状態でこの台紙の上に手を置かせ、形を確認させます。'
  },
  {
    id: 'p5',
    title: '大譜表フロアマット素材',
    catchCopy: '全身で音の高さを体感',
    price: 2500,
    category: 'reading',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A3', pages: 10 },
    targetAudience: ['座学が苦手なアクティブな子', '音の方向性が分からない子'],
    benefits: ['体全体を使うので記憶に定着しやすい', 'レッスンに動きが出て活気が生まれる'],
    description: '床に並べて使う巨大な五線譜が作れる素材です。ジャンプしながら音を覚えられます。',
    howTo: 'A3で印刷し、ラミネートして床にテープで固定してください。'
  },
  {
    id: 'p6',
    title: '音程インターバルクイズ',
    catchCopy: '2度・3度が瞬時にわかる',
    price: 1100,
    category: 'reading',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A4', pages: 15 },
    targetAudience: ['譜読みが遅い生徒', '音程の感覚を掴ませたい時'],
    benefits: ['初見演奏力が飛躍的に上がる', '楽譜を読むスピードが倍になる'],
    description: '音符の距離（インターバル）を瞬時に判断するトレーニング教材。',
    howTo: 'クイズ形式でタイムアタックをすると盛り上がります。'
  },
  {
    id: 'p7',
    title: 'どうぶつリズムカード',
    catchCopy: '鳴き声で覚えるリズムパターン',
    price: 1300,
    category: 'rhythm',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=800'
    ],
    specs: { format: 'PDF', size: 'A4', pages: 16 },
    targetAudience: ['難しいリズムに躓く子', '感覚派の生徒'],
    benefits: ['言葉のリズムと結びつけて覚えられる', '複雑なリズムも楽しく克服'],
    description: '「ワンワン（二分音符）」「チュチュ（八分音符）」など、動物の鳴き声でリズムを覚えます。',
    howTo: 'カードを並べてリズム作文を作ってみましょう。'
  }
];

export const REVIEWS: Review[] = [
  { id: 'r1', author: '佐藤 先生', role: 'ピアノ教室主宰（指導歴15年）', content: '生徒の目が輝き出しました。特に「魔法の音符カード」は、今まで読譜で泣いていた子が笑って取り組むようになり、感動しました。' },
  { id: 'r2', author: '田中 先生', role: 'リトミック講師', content: '準備が大変でしたが、この教材は印刷するだけですぐ使えるので助かっています。クオリティも高く、保護者の方からも好評です。' },
];