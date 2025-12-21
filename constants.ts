import { Category, Product, Review } from './types';

export const CATEGORIES: Category[] = [
  { id: 'intro', label: '導入・プレ', color: 'bg-pink-100 text-pink-700' },
  { id: 'reading', label: '読譜・音符', color: 'bg-blue-100 text-blue-700' },
  { id: 'rhythm', label: 'リズム', color: 'bg-orange-100 text-orange-700' },
  { id: 'technique', label: '指の形・テクニック', color: 'bg-green-100 text-green-700' },
  { id: 'seasonal', label: '季節・イベント', color: 'bg-purple-100 text-purple-700' },
];

export const REVIEWS: Review[] = [
  { id: 'r1', author: '佐藤 先生', role: 'ピアノ教室主宰（指導歴15年）', content: '生徒の目が輝き出しました。特に「魔法の音符カード」は、今まで読譜で泣いていた子が笑って取り組むようになり、感動しました。' },
  { id: 'r2', author: '田中 先生', role: 'リトミック講師', content: '準備が大変でしたが、この教材は印刷するだけですぐ使えるので助かっています。クオリティも高く、保護者の方からも好評です。' },
];